//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// @TODO: Remove
import "forge-std/console.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import {IRouterClient} from "@chainlink/contracts-ccip/src/v0.8/ccip/interfaces/IRouterClient.sol"; // Allows us to send CCIP messages
import {Client} from "@chainlink/contracts-ccip/src/v0.8/ccip/libraries/Client.sol";
import {CCIPReceiver} from "@chainlink/contracts-ccip/src/v0.8/ccip/applications/CCIPReceiver.sol"; // Allows us to receive CCIP messages


// STRUCTS / EVENTS / ERRORS

// TODO: Send CMESSAGE to claim stake of pending tx that has passed the deadline, this will cancel the remainder of the offer if there are no other pendingBP

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
}

struct OfferStatus {
    uint256 offerId;
    uint256 filledBP;
    uint256 pendingBP;
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
    CREATED,
    INVALID,
    UNAVAILABLE,
    COMPLETED
}
struct FillData {
    uint256 offerChain;
    uint256 offerId;
    address fillTokenAddress;
    uint256 fillTokenAmount;
    uint256 deadline;
    address adaDestAddress;
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
// 3 = CUNAVAILABLE - offer no longer available
enum MessageType {
    CFILL,
    CXFILL,
    CINVALID
}
enum ErrorType {
    // No error
    NONE,
    // Params are good, but option no longer available
    UNAVAILABLE__FILL_BP,
    UNAVAILABLE__EXPIRED,
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

contract AlphaBlueOfferer is Ownable, CCIPReceiver {
    using QuikMaff for uint256;
    using SafeERC20 for IERC20;

    // State Variables
    uint256 public immutable chainId;
    IRouterClient public immutable router; // chainlink ccip router
    IERC20 public immutable linkToken;
    mapping(uint256 => bool) public availableChains;
    mapping(uint256 => mapping(address => bool)) public availableChainTokens;
    // TODO: Set available chains function

    OfferData[] public offers;
    mapping(uint256 => OfferStatus) public offerStatuses; // offerid -> offerStatus mapping

    // EVENTS
    event OfferCreated(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );

    // ADMIN ACTIONS

    constructor(uint256 _chainId, address _router, address _link) Ownable(msg.sender) CCIPReceiver(_router) {
        chainId = _chainId;
        router = IRouterClient(_router);
        linkToken = IERC20(_link);
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
            if (availableChainTokens[chainId][params.tokenAddress] != true)
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
            if (availableChains[params.fillOptions[i].chainId] != true)
                revert InvalidFillChain();
            if (
                availableChainTokens[params.fillOptions[i].chainId][
                    params.fillOptions[i].tokenAddress
                ] != true
            ) revert InvalidFillChainToken();
            if (params.fillOptions[i].tokenAmount == 0) revert ZeroAmount();
        }

        // Take initial stake for deposit
        // @TODO: If offer is token offer (params.tokenAddress != address(0)) then take a 1% deposit
        // 	validate approval
        //  use ERC20.safeTransferFrom to transfer the tokens to this contract

        if (params.tokenAddress != address(0)) {
            uint256 stakeAmount = params.tokenAmount.scaleByBP(100); // 1%

            // Check allowance
            if (
                !_checkAllowanceAndBalance(
                    params.tokenAddress,
                    stakeAmount,
                    msg.sender,
                    address(this)
                )
            ) revert InsufficientAllowanceOrBalance();

            IERC20(params.tokenAddress).safeTransferFrom(
                msg.sender,
                address(this),
                stakeAmount
            );
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

        for (uint256 i = 0; i < params.fillOptions.length; i++) {
            offer.fillOptions.push(params.fillOptions[i]);
        }

        // OFFER STATUS DATA
        offerStatuses[offerId].offerId = offerId;

        emit OfferCreated(chainId, offer.owner, offerId);
    }

    function cancelOffer(uint256 offerId) public {
        // Validate offer exists
        // Validate msg.sender = offer owner
        // Validate auction doesn't have anything pending
        // Mark auction state as cancelled
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
        // and must be manually retried by bob
        // @TODO: move this to a new function
        // ===

        offerStatuses[ccipBlue.offerId].pendingBP += ccipBlue.partialBP;
        offerStatuses[ccipBlue.offerId].offerFills[offerFillId].pending = true;
        _handleOfferFill(ccipBlue.offerId, offerFillId);

        return ErrorType.NONE;
    }
    function nudgeOffer(uint256 offerId) public {
        if (offerId >= offers.length) revert InvalidOfferId();
        if (offers[offerId].owner != msg.sender) revert NotOfferer();

        // Fill should have succeeded but didn't so can retry
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
            // If allowance and balance checks pass, pull from wallet, mark fill as succeeded, send CXFILL, add filledBP
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

                // Transfer tokens to ada
                IERC20(offer.tokenAddress).safeTransfer(
                    offerFill.adaDestAddress,
                    offerTokenPartialAmount
                );

                // @TODO: send CXFILL to allow bob to withdraw on ada's chain
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
    function _sendCXFILL() internal {
        // @TODO
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
        if (availableChainTokens[chainId][params.fillTokenAddress] != true)
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

        // Send CFILL
    }
    function resendCFILL() public {
        // Fill id exists
        // Fill id owner is msg.sender

        // Resend CFILL
        _sendCFILL();
    }
    function _sendCFILL() internal {
        // Encode and send CFILL
    }
    function _handleCXFILL(uint256 offerChainId, CCIPBlue memory ccipBlue) internal {
        // _handleCXFILL
    }
    function _handleCINVALID(uint256 offerChainId, CCIPBlue memory ccipBlue) internal {
        // _handleCINVALID
    }
    function _handleCUNAVAILABLE() internal {
        // _handleCUNAVAILABLE
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
            _ccipReceive(ccipBlue);
        }

        // Multi chain swap, mocking with simple contract call
        // @TODO
    }

    function _ccipReceive(Client.Any2EVMMessage memory any2EvmMessage) internal override {
        // Decode CCIP using CCPIBlue struct
        // Using message type, branch to functions
        CCIPBlue memory ccipBlue = abi.decode(any2EvmMessage.data, (CCIPBlue));

        // 0 = CFILL - Fill has been called, tell offer that fill is available, distribute offerToken / offerNft
        // 1 = CXFILL - Offer has agreed to fill, tell fill that it can distribute fillToken
        // 2 = CINVALID - data sent with fill doesn't match order
        // 3 = CUNAVAILABLE - offer no longer available
        if (ccipBlue.messageType == MessageType.CFILL) {
            _handleCFILL(any2EvmMessage.sourceChainSelector, ccipBlue);
        } else if (ccipBlue.messageType == MessageType.CXFILL) {
            _handleCXFILL(any2EvmMessage.sourceChainSelector, ccipBlue);
        } else (ccipBlue.messageType == MessageType.CINVALID) {
            _handleCINVALID(any2EvmMessage.sourceChainSelector, ccipBlue);
        }
    }
}
