//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// @TODO: Remove
import "forge-std/console.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import {IERC20, SafeERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

// STRUCTS / EVENTS / ERRORS

struct FillOption {
    uint256 chainId;
    address token;
    uint256 amount;
    uint256 destinationWallet;
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

struct FillData {
    uint256 offerChain;
    uint256 offerId;
    address fillToken;
    uint256 fillAmount;
}

// MESSAGE TYPES
// 0 = CFILL - Fill has been called, tell offer that fill is available, distribute offerToken / offerNft
// 1 = CXFILL - Offer has agreed to fill, tell fill that it can distribute fillToken
// 2 = CINVALID - data sent with fill doesn't match order
// 3 = CUNAVAILABLE - offer no longer available
enum MessageType {
    CFILL,
    CXFILL,
    CINVALID,
    CUNAVAILABLE
}
struct CCIPBlue {
    uint8 messageType;
    uint256 offerId;
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
    // wallet addresses
    uint256 bobDestAddress;
    uint256 adaDestAddress;
}

error OfferOwnerMismatch();
error MissingOfferTokenOrNft();
error MissingFillOptions();
error InvalidFillChain();
error InvalidFillChainToken();
error ZeroAmount();

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
    mapping(uint256 => bool) public availableChains;
    mapping(uint256 => mapping(address => bool)) public availableChainTokens;
    // TODO: Set available chains function

    OfferData[] public offers;
    mapping(uint256 => OfferStatus) public offerStatus; // offerid -> offerStatus mapping

    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint256) public userGreetingCounter;

    // EVENTS
    event OfferCreated(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );

    // ADMIN ACTIONS

    constructor(uint256 _chainId) Ownable(msg.sender) {
        chainId = _chainId;
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
            // NFT
            // @TODO: VALIDATE THIS
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
                    params.fillOptions[i].token
                ] != true
            ) revert InvalidFillChainToken();
            if (params.fillOptions[i].amount == 0) revert ZeroAmount();
        }

        // Take deposit
        // @TODO: If offer is token offer (params.tokenAddress != address(0)) then take a 1% deposit
        // 	validate approval
        //  use ERC20.safeTransferFrom to transfer the tokens to this contract

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

        emit OfferCreated(chainId, offer.owner, offerId);
    }

    function cancelOffer(uint256 offerId) public {
        // Validate offer exists
        // Validate msg.sender = offer owner
        // Validate auction doesn't have anything pending
        // Mark auction state as cancelled
    }

    function _handleCFILL() internal {
        // Handle CFILL
        // Eventually if successful, send CXFILL
    }
    function resendCXFILL() public {
        // Owner of offer
        // Fill should have succeeded but didn't so can retry
        _sendCXFILL();
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

    function fill() public {
        // Validate stuff
        // Send CFILL
        _sendCFILL();
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
    function _handleCXFILL() internal {
        // _handleCXFILL
    }
    function _handleCINVALID() internal {
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

    function _receiveCCIP() internal {
        // Decode CCIP using CCPIBlue struct
        // Using message type, branch to functions

        uint256 messageType = 0;

        // 0 = CFILL - Fill has been called, tell offer that fill is available, distribute offerToken / offerNft
        // 1 = CXFILL - Offer has agreed to fill, tell fill that it can distribute fillToken
        // 2 = CINVALID - data sent with fill doesn't match order
        // 3 = CUNAVAILABLE - offer no longer available
        if (messageType == MessageType.CFILL) {
            // Route to offer function _handleCFILL()
        }
        if (messageType == MessageType.CXFILL) {
            // Route to fill function _handleCXFILL()
        }
        if (messageType == MessageType.CINVALID) {
            // Route to fill function _handleCINVALID()
        }
        if (messageType == MessageType.CUNAVAILABLE) {
            // Route to fill function _handleCUNAVAILABLE()
        }
    }
}
