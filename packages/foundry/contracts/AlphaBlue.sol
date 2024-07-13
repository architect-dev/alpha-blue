//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// @TODO: Remove
import "forge-std/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// STRUCTS / EVENTS / ERRORS

struct ChainData {
    bool valid;
    uint256 chainId;
    address contractAddress;
}

struct FillOption {
    uint256 chainId;
    address tokenAddress;
    uint256 tokenAmount;
    address destAddress;
}

struct OfferData {
    address owner;
    // token offer
    address tokenAddress;
    uint256 tokenAmount;
    // nft offer
    address nftAddress;
    uint256 nftId;
    // settings
    bool allowPartialFills;
    uint256 expiration;
    FillOption[] fillOptions;
    address depositTokenAddress;
    uint256 depositAmount;
}

enum OfferStatusEnum {
    OPEN,
    DEADLINED,
    CANCELLED,
    FILLED
}
struct OfferStatus {
    uint256 offerId;
    uint256 filledBP;
    uint256 pendingBP;
    OfferStatusEnum status;
    OfferFillData[] offerFills;
}
struct OfferFillData {
    uint256 fillId;
    uint256 fillChain;
    address fillTokenAddress;
    uint256 fillTokenAmount;
    uint256 partialBP;
    uint256 deadline;
    address adaDestAddress;
    address bobDestAddress;
    bool pending;
}

enum FillStatus {
    PENDING,
    INVALID,
    SUCCEEDED,
    DEADLINED
}
struct FillData {
    address owner;
    uint256 offerChain;
    uint256 offerId;
    address fillTokenAddress;
    uint256 fillTokenAmount;
    uint256 deadline;
    address adaDestAddress;
    FillStatus status;
    ErrorType errorType;
}
struct FillParams {
    uint256 offerChain;
    uint256 offerId;
    address offerTokenAddress;
    uint256 offerTokenAmount;
    address offerNftAddress;
    uint256 offerNftId;
    address fillTokenAddress;
    uint256 fillTokenAmount;
    address adaDestAddress;
    uint256 partialBP;
}

// MESSAGE TYPES
// 0 = CFILL - Fill has been called, tell offer that fill is available, distribute offerToken / offerNft
// 1 = CXFILL - Offer has agreed to fill, tell fill that it can distribute fillToken
// 2 = CINVALID - data sent with fill doesn't match order
enum MessageType {
    CFILL,
    CXFILL,
    CINVALID,
    CDEADLINE
}
enum ErrorType {
    // No error
    NONE,
    // Params are good, but option no longer available
    UNAVAILABLE__FILL_BP,
    UNAVAILABLE__EXPIRED,
    UNAVAILABLE__DEADLINED,
    UNAVAILABLE__CANCELLED,
    // Params are invalid
    INVALID__FILL_CHAIN_MISMATCH,
    INVALID__OFFER_CHAIN_MISMATCH,
    INVALID__OFFER_ID,
    INVALID__TOKEN_MISMATCH,
    INVALID__NFT_MISMATCH,
    INVALID__PARTIAL_FILL_ON_NON_PARTIAL
}
struct CCIPBlue {
    MessageType messageType;
    // wallet addresses
    address bobDestAddress;
    address adaDestAddress;
    // Chains & ids
    uint256 offerChain;
    uint256 offerId;
    uint256 fillChain;
    uint256 fillId;
    // token offer
    address offerTokenAddress;
    uint256 offerTokenAmount;
    // nft offer
    address offerNftAddress;
    uint256 offerNftId;
    // token fill
    address fillTokenAddress;
    uint256 fillTokenAmount;
    uint256 partialBP;
    uint256 deadline;
    // custom
    ErrorType errorType;
}

error OfferOwnerMismatch();
error MissingOfferTokenOrNft();
error MissingFillOptions();
error InvalidFillId();
error InvalidFillChain();
error InvalidFillChainToken();
error ZeroAmount();
error InsufficientAllowanceOrBalance();
error InvalidApproval();
error ChainMismatch();
error InvalidOfferId();
error TokenMismatch();
error NftMismatch();
error InvalidPartialFill();
error FillUnavailable();
error InvalidNFTOrder();
error NotOfferer();
error AlreadyXFilled();
error NotFiller();
error NotPassedDeadline();
error AlreadyDeadlined();
error CannotCancelWithPending();
error OfferStatusNotOpen();

// LIBRARIES

library QuikMaff {
    function min(uint256 a, uint256 b) internal pure returns (uint256) {
        return a < b ? a : b;
    }
    function max(uint256 a, uint256 b) internal pure returns (uint256) {
        return a > b ? a : b;
    }
    function scaleByBP(
        uint256 amount,
        uint256 bp
    ) internal pure returns (uint256) {
        if (bp == 10000) return amount;
        return (amount * bp) / 10000;
    }
}

// MAIN CONTRACT

contract AlphaBlueOfferer is Ownable {
    using QuikMaff for uint256;
    using SafeERC20 for IERC20;

    // State Variables
    uint256 public immutable chainId;
    mapping(uint256 => ChainData) public chainData;
    mapping(uint256 => mapping(address => bool)) public chainTokens;

    OfferData[] public offers;
    mapping(uint256 => OfferStatus) public offerStatuses;

    address public weth;
    uint256 public nftWethDeposit;

    // EVENTS
    event OfferCreated(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferCancelled(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferDeadlined(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event OfferFilled(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );
    event FillFailed(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
    event FillXFilled(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );
    event FillDeadlined(
        uint256 indexed chainId,
        address indexed filler,
        uint256 indexed fillId
    );

    // ADMIN ACTIONS

    constructor(
        uint256 _chainId,
        address _weth,
        uint256 _nftWethDeposit
    ) Ownable(msg.sender) {
        chainId = _chainId;
        weth = _weth;
        nftWethDeposit = _nftWethDeposit;
    }

    function setChainsAndTokens() public onlyOwner {}

    //
    //
    //
    //
    //
    //
    //
    // === OFFERS ===
    //
    //
    //
    //
    //
    //
    //

    // USER ACTIONS

    function createOffer(OfferData calldata params) public {
        // @TEST offer owner mismatch -- revert OfferOwnerMismatch;
        if (msg.sender != params.owner) revert OfferOwnerMismatch();

        // Validate offer
        // @TEST if both token and nft are empty -- revert MissingOfferTokenOrNft();
        // @TEST if offer token doesn't exist on current chain - revert InvalidFillChainToken();
        if (
            params.tokenAddress == address(0) && params.nftAddress == address(0)
        ) revert MissingOfferTokenOrNft();
        if (params.tokenAddress != address(0)) {
            if (!chainTokens[chainId][params.tokenAddress])
                revert InvalidFillChainToken();
        } else {
            if (params.nftAddress == address(0)) revert InvalidNFTOrder();
        }

        // Validate offer fills
        // @TEST empty fill options -- revert MissingFillOptions;
        // @TEST fill option chain invalid -- revert InvalidFillChain;
        // @TEST fill option chain valid, but token invalid -- revert InvalidFillChainToken;
        // @TEST fill option chain & token valid, but value 0 -- revert ZeroAmount;
        if (params.fillOptions.length == 0) revert MissingFillOptions();
        for (uint256 i = 0; i < params.fillOptions.length; i++) {
            if (!chainData[params.fillOptions[i].chainId].valid)
                revert InvalidFillChain();
            if (
                !chainTokens[params.fillOptions[i].chainId][
                    params.fillOptions[i].tokenAddress
                ]
            ) revert InvalidFillChainToken();
            if (params.fillOptions[i].tokenAmount == 0) revert ZeroAmount();
        }

        // OFFER DATA

        uint256 offerId = offers.length;
        OfferData storage offer = offers[offerId];

        // @TEST ensure that all data is transferred correctly into the offer struct item
        offer.tokenAddress = params.tokenAddress;
        offer.tokenAmount = params.tokenAmount;
        offer.nftAddress = params.nftAddress;
        offer.nftId = params.nftId;

        offer.allowPartialFills = params.allowPartialFills;
        offer.expiration = params.expiration;

        offer.depositTokenAddress = params.tokenAddress != address(0)
            ? params.tokenAddress
            : weth;
        offer.depositAmount = params.tokenAddress != address(0)
            ? params.tokenAmount.scaleByBP(100)
            : nftWethDeposit;

        for (uint256 i = 0; i < params.fillOptions.length; i++) {
            offer.fillOptions.push(params.fillOptions[i]);
        }

        // OFFER STATUS DATA

        offerStatuses[offerId].status = OfferStatusEnum.OPEN;
        offerStatuses[offerId].offerId = offerId;

        // TAKE DEPOSIT

        if (
            !_checkAllowanceAndBalance(
                offer.depositTokenAddress,
                offer.depositAmount,
                msg.sender,
                address(this)
            )
        ) revert InsufficientAllowanceOrBalance();

        IERC20(offer.depositTokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            offer.depositAmount
        );

        emit OfferCreated(chainId, offer.owner, offerId);
    }

    function cancelOffer(uint256 offerId) public {
        if (offerId > offers.length) revert InvalidOfferId();

        OfferData storage offer = offers[offerId];
        OfferStatus storage offerStatus = offerStatuses[offerId];

        if (offer.owner != msg.sender) revert NotOfferer();
        if (offerStatus.pendingBP > 0) revert CannotCancelWithPending();
        if (offerStatus.status != OfferStatusEnum.OPEN)
            revert OfferStatusNotOpen();

        // Mark auction state as cancelled
        offerStatus.status = OfferStatusEnum.CANCELLED;

        // Return deposit
        IERC20(offer.depositTokenAddress).safeTransfer(
            offer.owner,
            offer.depositAmount
        );

        emit OfferCancelled(chainId, offer.owner, offerId);
    }

    function _handleCFILL(
        uint256 sourceChain,
        CCIPBlue memory ccipBlue
    ) internal {
        ErrorType err = _handleCFILLReturnErrorType(sourceChain, ccipBlue);
        if (err == ErrorType.NONE) return;

        ccipBlue.errorType = err;
        _sendCCIP(ccipBlue);
    }

    function _handleCFILLReturnErrorType(
        uint256 sourceChain,
        CCIPBlue memory ccipBlue
    ) internal returns (ErrorType) {
        // Validate CCIP chains
        if (sourceChain != ccipBlue.fillChain)
            return ErrorType.INVALID__FILL_CHAIN_MISMATCH;
        if (chainId != ccipBlue.offerChain)
            return ErrorType.INVALID__OFFER_CHAIN_MISMATCH;

        // Validate Order exists and matches
        if (ccipBlue.offerId > offers.length)
            return ErrorType.INVALID__OFFER_ID;
        OfferData storage offer = offers[ccipBlue.offerId];
        if (
            offer.tokenAddress != address(0) &&
            ccipBlue.offerTokenAddress != offer.tokenAddress
        ) return ErrorType.INVALID__TOKEN_MISMATCH;
        if (
            offer.nftAddress != address(0) &&
            (ccipBlue.offerNftAddress != offer.nftAddress ||
                ccipBlue.offerNftId != offer.nftId)
        ) return ErrorType.INVALID__NFT_MISMATCH;
        if (
            offer.nftAddress != address(0) &&
            ccipBlue.offerNftAddress != offer.nftAddress
        ) return ErrorType.INVALID__NFT_MISMATCH;

        // Validate expiration
        if (offer.expiration < block.timestamp)
            return ErrorType.UNAVAILABLE__EXPIRED;
        if (offerStatuses[ccipBlue.offerId].status == OfferStatusEnum.DEADLINED)
            return ErrorType.UNAVAILABLE__DEADLINED;
        if (offerStatuses[ccipBlue.offerId].status == OfferStatusEnum.CANCELLED)
            return ErrorType.UNAVAILABLE__CANCELLED;

        // Validate partials
        if (
            ccipBlue.partialBP == 0 ||
            (offer.allowPartialFills == false && ccipBlue.partialBP != 10000)
        ) return ErrorType.INVALID__PARTIAL_FILL_ON_NON_PARTIAL;
        if (
            ccipBlue.partialBP >
            (10000 -
                offerStatuses[ccipBlue.offerId].filledBP -
                offerStatuses[ccipBlue.offerId].pendingBP)
        ) return ErrorType.UNAVAILABLE__FILL_BP;

        // Fill token
        bool fillMatched;
        address fillBobAddress;
        for (uint256 i = 0; i < offer.fillOptions.length; i++) {
            if (fillMatched) continue;
            if (offer.fillOptions[i].chainId != ccipBlue.fillChain) continue;
            if (offer.fillOptions[i].tokenAddress != ccipBlue.fillTokenAddress)
                continue;

            fillMatched = true;
            fillBobAddress = offer.fillOptions[i].destAddress;

            // Validate token amount matches
            if (
                offer.fillOptions[i].tokenAmount.scaleByBP(
                    ccipBlue.partialBP
                ) != ccipBlue.fillTokenAmount
            ) return ErrorType.INVALID__TOKEN_MISMATCH;
        }
        if (!fillMatched) return ErrorType.INVALID__TOKEN_MISMATCH;

        // Add offerFillData to OfferStatus
        uint256 offerFillId = offerStatuses[ccipBlue.offerId].offerFills.length;
        offerStatuses[ccipBlue.offerId].offerFills.push(
            OfferFillData({
                fillId: ccipBlue.fillId,
                fillChain: ccipBlue.fillChain,
                fillTokenAddress: ccipBlue.fillTokenAddress,
                fillTokenAmount: ccipBlue.fillTokenAmount,
                partialBP: ccipBlue.partialBP,
                deadline: ccipBlue.deadline,
                adaDestAddress: ccipBlue.adaDestAddress,
                bobDestAddress: fillBobAddress,
                pending: true
            })
        );

        // ====
        // After this point, everything should go through
        // OR the token / nft isn't approved / available
        // and must be manually nudged by bob using `nudgeOffer`
        // ===

        offerStatuses[ccipBlue.offerId].pendingBP += ccipBlue.partialBP;
        offerStatuses[ccipBlue.offerId].offerFills[offerFillId].pending = true;
        _handleOfferFill(ccipBlue.offerId, offerFillId);

        return ErrorType.NONE;
    }
    function nudgeOffer(uint256 offerId) public {
        if (offerId >= offers.length) revert InvalidOfferId();
        if (offers[offerId].owner != msg.sender) revert NotOfferer();

        for (uint256 i = 0; i < offerStatuses[offerId].offerFills.length; i++) {
            _handleOfferFill(offerId, i);
        }
    }
    function _handleOfferFill(uint256 offerId, uint256 offerFillId) internal {
        OfferData storage offer = offers[offerId];
        OfferStatus storage offerStatus = offerStatuses[offerId];
        OfferFillData storage offerFill = offerStatus.offerFills[offerFillId];

        uint256 offerTokenPartialAmount = offer.tokenAmount.scaleByBP(
            offerFill.partialBP
        );

        // If offer is TOKEN
        if (offer.tokenAddress != address(0)) {
            if (
                _checkAllowanceAndBalance(
                    offer.tokenAddress,
                    offerTokenPartialAmount,
                    offer.owner,
                    address(this)
                )
            ) {
                // Transfer tokens from bob
                IERC20(offer.tokenAddress).safeTransferFrom(
                    offer.owner,
                    address(this),
                    offerTokenPartialAmount
                );

                // Switch from pending to completed
                offerFill.pending = false;
                offerStatus.pendingBP -= offerFill.partialBP;
                offerStatus.filledBP += offerFill.partialBP;

                if (offerStatus.filledBP == 10000) {
                    offerStatus.status = OfferStatusEnum.FILLED;
                }

                // Transfer tokens to ada
                IERC20(offer.tokenAddress).safeTransfer(
                    offerFill.adaDestAddress,
                    offerTokenPartialAmount
                );

                _sendCCIP(
                    CCIPBlue({
                        messageType: MessageType.CXFILL,
                        bobDestAddress: offerFill.bobDestAddress,
                        adaDestAddress: address(0),
                        offerId: offerId,
                        offerChain: chainId,
                        fillId: offerFill.fillId,
                        fillChain: offerFill.fillChain,
                        offerTokenAddress: address(0),
                        offerTokenAmount: 0,
                        offerNftAddress: address(0),
                        offerNftId: 0,
                        fillTokenAddress: address(0),
                        fillTokenAmount: 0,
                        partialBP: 0,
                        deadline: 0,
                        errorType: ErrorType.NONE
                    })
                );
            }
        }

        // If offer is NFT
        if (offer.nftAddress != address(0)) {
            // @TODO: send NFT to adaAddress, update state
        }

        emit OfferFilled(chainId, offer.owner, offerId);
    }
    function _checkAllowanceAndBalance(
        address token,
        uint256 amount,
        address from,
        address to
    ) internal view returns (bool) {
        return
            IERC20(token).allowance(from, to) >= amount &&
            IERC20(token).balanceOf(from) >= amount;
    }

    function _handleCDEADLINE(uint256, CCIPBlue memory ccipBlue) internal {
        OfferData storage offer = offers[ccipBlue.offerId];
        OfferStatus storage offerStatus = offerStatuses[ccipBlue.offerId];

        if (offerStatus.status == OfferStatusEnum.DEADLINED)
            revert AlreadyDeadlined();

        OfferFillData storage offerFill = offerStatus.offerFills[0];
        for (uint256 i = 0; i < offerStatus.offerFills.length; i++) {
            if (offerStatus.offerFills[i].fillId != ccipBlue.fillId) continue;
            offerFill = offerStatus.offerFills[i];
        }

        IERC20(offer.depositTokenAddress).safeTransfer(
            offerFill.adaDestAddress,
            offer.depositAmount
        );
        offerStatus.status = OfferStatusEnum.DEADLINED;

        emit OfferDeadlined(chainId, offer.owner, ccipBlue.offerId);
    }

    //
    //
    //
    //
    //
    //
    //
    // === FILLS ===
    //
    //
    //
    //
    //
    //
    //

    FillData[] public fills;

    function createFill(FillParams calldata params) public {
        // Validate fill token
        if (chainTokens[chainId][params.fillTokenAddress] != true)
            revert InvalidFillChainToken();

        // Pull fill token
        if (
            IERC20(params.fillTokenAddress).allowance(
                msg.sender,
                address(this)
            ) < params.fillTokenAmount
        ) revert InvalidApproval();
        IERC20(params.fillTokenAddress).safeTransferFrom(
            msg.sender,
            address(this),
            params.fillTokenAmount
        );

        // Create fill data
        uint256 fillId = fills.length;
        FillData storage fill = fills[fillId];

        fill.offerChain = params.offerChain;
        fill.offerId = params.offerId;
        fill.fillTokenAddress = params.fillTokenAddress;
        fill.fillTokenAmount = params.fillTokenAmount;
        fill.adaDestAddress = params.adaDestAddress;
        fill.deadline = block.timestamp + 1 days;

        _sendCCIP(
            CCIPBlue({
                messageType: MessageType.CFILL,
                bobDestAddress: address(0),
                adaDestAddress: params.adaDestAddress,
                offerChain: params.offerChain,
                offerId: params.offerId,
                fillChain: chainId,
                fillId: fillId,
                offerTokenAddress: params.offerTokenAddress,
                offerTokenAmount: params.offerTokenAmount,
                offerNftAddress: params.offerNftAddress,
                offerNftId: params.offerNftId,
                fillTokenAddress: params.fillTokenAddress,
                fillTokenAmount: params.fillTokenAmount,
                partialBP: params.partialBP,
                deadline: fill.deadline,
                errorType: ErrorType.NONE
            })
        );
    }
    function _handleCXFILL(
        uint256 offerChainId,
        CCIPBlue memory ccipBlue
    ) internal {
        if (offerChainId != ccipBlue.offerChain) revert ChainMismatch();

        FillData storage fill = fills[ccipBlue.fillId];
        if (fill.status != FillStatus.PENDING) revert AlreadyXFilled();

        IERC20(fill.fillTokenAddress).safeTransfer(
            ccipBlue.bobDestAddress,
            fill.fillTokenAmount
        );

        fill.status = FillStatus.SUCCEEDED;

        emit FillXFilled(chainId, fill.owner, ccipBlue.fillId);
    }
    function _handleCINVALID(
        uint256 offerChainId,
        CCIPBlue memory ccipBlue
    ) internal {
        if (offerChainId != ccipBlue.offerChain) revert ChainMismatch();

        FillData storage fill = fills[ccipBlue.fillId];
        if (fill.status != FillStatus.PENDING) revert AlreadyXFilled();

        // Return the funds to the filler
        IERC20(fill.fillTokenAddress).safeTransfer(
            fill.owner,
            fill.fillTokenAmount
        );

        fill.status = FillStatus.INVALID;
        fill.errorType = ccipBlue.errorType;

        emit FillFailed(chainId, fill.owner, ccipBlue.fillId);
    }

    function triggerDeadline(uint256 fillId) public {
        if (fillId >= fills.length) revert InvalidFillId();

        FillData storage fill = fills[fillId];
        if (fill.owner != msg.sender) revert NotFiller();

        if (fill.status != FillStatus.PENDING) revert AlreadyXFilled();

        if (block.timestamp < fill.deadline) revert NotPassedDeadline();

        // Return the funds to the filler
        IERC20(fill.fillTokenAddress).safeTransfer(
            fill.owner,
            fill.fillTokenAmount
        );

        fill.status = FillStatus.DEADLINED;

        _sendCCIP(
            CCIPBlue({
                messageType: MessageType.CDEADLINE,
                bobDestAddress: address(0),
                adaDestAddress: fill.adaDestAddress,
                offerId: fill.offerId,
                offerChain: fill.offerChain,
                fillId: fillId,
                fillChain: chainId,
                offerTokenAddress: address(0),
                offerTokenAmount: 0,
                offerNftAddress: address(0),
                offerNftId: 0,
                fillTokenAddress: address(0),
                fillTokenAmount: 0,
                partialBP: 0,
                deadline: 0,
                errorType: ErrorType.NONE
            })
        );

        emit FillDeadlined(chainId, fill.owner, fillId);
    }

    //
    //
    //
    //
    //
    //
    //
    // === SHARED ===
    //
    //
    //
    //
    //
    //
    //

    function _sendCCIP(CCIPBlue memory ccipBlue) internal {
        // Same chain swap
        if (ccipBlue.offerChain == ccipBlue.fillChain) {
            receiveCCIP(ccipBlue);
        }

        // Multi chain swap, mocking with simple contract call
        // @TODO
    }

    function receiveCCIP(CCIPBlue memory ccipBlue) public {
        if (ccipBlue.messageType == MessageType.CFILL) {
            _handleCFILL(chainId, ccipBlue);
        }
        if (ccipBlue.messageType == MessageType.CXFILL) {
            _handleCXFILL(chainId, ccipBlue);
        }
        if (ccipBlue.messageType == MessageType.CINVALID) {
            _handleCINVALID(chainId, ccipBlue);
        }
        if (ccipBlue.messageType == MessageType.CDEADLINE) {
            _handleCDEADLINE(chainId, ccipBlue);
        }
    }
}
