//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// Useful for debugging. Remove when deploying to a live network.
import "forge-std/console.sol";

// Use openzeppelin to inherit battle-tested implementations (ERC20, ERC721, etc)
// import "@openzeppelin/contracts/access/Ownable.sol";

// STRUCTS / EVENTS / ERRORS

struct ChainWallet {
    uint256 chainId;
    address wallet;
}
struct FillOption {
    uint256 chainId;
    address token;
    uint256 amount;
    uint256 destinationWallet;
}

// Stretch goals

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
    uint256 chain;
    uint256 id;
    uint256 orderChain;
    uint256 orderId;
    address token;
    uint256 amount;
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

contract AlphaBlue {
    using QuikMaff for uint256;

    // State Variables
    address public immutable owner;
    uint256 public immutable chainId;
    mapping(uint256 => bool) public availableChains;
    mapping(uint256 => mapping(address => bool)) public availableChainTokens;
    // TODO: Set available chains

    OfferData[] public offers;

    string public greeting = "Building Unstoppable Apps!!!";
    bool public premium = false;
    uint256 public totalCounter = 0;
    mapping(address => uint256) public userGreetingCounter;

    // Events: a way to emit log statements from smart contract that can be listened to by external parties
    event GreetingChange(
        address indexed greetingSetter,
        string newGreeting,
        bool premium,
        uint256 value
    );

    event OfferCreated(
        uint256 indexed chainId,
        address indexed creator,
        uint256 indexed offerId
    );

    // Constructor: Called once on contract deployment
    // Check packages/foundry/deploy/Deploy.s.sol
    constructor(address _owner, uint256 _chainId) {
        owner = _owner;
        chainId = _chainId;
    }

    // Modifier: used to define a set of rules that must be met before or after a function is executed
    // Check the withdraw() function
    modifier isOwner() {
        // msg.sender: predefined variable that represents address of the account that called the current function
        require(msg.sender == owner, "Not the Owner");
        _;
    }

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

    /**
     * Function that allows anyone to change the state variable "greeting" of the contract and increase the counters
     *
     * @param _newGreeting (string memory) - new greeting to save on the contract
     */
    function setGreeting(string memory _newGreeting) public payable {
        // Print data to the anvil chain console. Remove when deploying to a live network.

        console.logString("Setting new greeting");
        console.logString(_newGreeting);

        greeting = _newGreeting;
        totalCounter += 1;
        userGreetingCounter[msg.sender] += 1;

        // msg.value: built-in global variable that represents the amount of ether sent with the transaction
        if (msg.value > 0) {
            premium = true;
        } else {
            premium = false;
        }

        // emit: keyword used to trigger an event
        emit GreetingChange(msg.sender, _newGreeting, msg.value > 0, msg.value);
    }

    /**
     * Function that allows the owner to withdraw all the Ether in the contract
     * The function can only be called by the owner of the contract as defined by the isOwner modifier
     */
    function withdraw() public isOwner {
        (bool success, ) = owner.call{value: address(this).balance}("");
        require(success, "Failed to send Ether");
    }

    /**
     * Function that allows the contract to receive ETH
     */
    receive() external payable {}
}
