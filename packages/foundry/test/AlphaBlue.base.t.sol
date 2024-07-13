// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AlphaBlue.sol";
import "../contracts/BasicERC20.sol";
import "../contracts/BasicERC721.sol";

import {IRouterClient, LinkToken} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";
import {CCIPLocalSimulator} from "@chainlink/local/src/ccip/CCIPLocalSimulator.sol";

abstract contract AlphaBlueBase is Test, AlphaBlueEvents {
    using QuikMaff for uint256;
    using SafeERC20 for IERC20;

    BasicERC20 public WETH;
    BasicERC20 public WBTC;
    BasicERC20 public USDC;
    BasicERC20 public BNB;
    BasicERC721 public mockNFT1;

    uint256 public nftWethDeposit = 0.01e18;

    CCIPLocalSimulator public ccipLocalSimulator;

    // DATA

    address public deployer = 0xb4c79daB8f259C7Aee6E5b2Aa729821864227e84;
    address public sender = 0x7FA9385bE102ac3EAc297483Dd6233D62b3e1496;
    address public dead = 0x000000000000000000000000000000000000dEaD;

    address payable public user1;
    uint256 public user1PK;
    address payable public user2;
    uint256 public user2PK;
    address payable public user3 = payable(address(102));
    address payable public user4 = payable(address(103));
    address payable[4] public users;

    uint256 public arbChainId = 421614;
    uint256 public baseChainId = 84532;
    uint256 public celoChainId = 44787;

    AlphaBlue public alphaBlueArb;
    AlphaBlue public alphaBlueBase;
    AlphaBlue public alphaBlueCelo;

    uint64 public mockChainSelector;
    IRouterClient public router;

    // SETUP

    function setLabels() public {
        vm.label(deployer, "deployer");
        vm.label(sender, "sender");
        vm.label(dead, "dead");
        vm.label(user1, "user1");
        vm.label(user2, "user2");
        vm.label(user3, "user3");
        vm.label(user4, "user4");
        vm.label(address(alphaBlueArb), "alphaBlueArb");
        vm.label(address(alphaBlueBase), "alphaBlueBase");
        vm.label(address(alphaBlueCelo), "alphaBlueCelo");
        vm.label(address(WETH), "WETH");
        vm.label(address(WBTC), "WBTC");
        vm.label(address(USDC), "USDC");
        vm.label(address(BNB), "BNB");
        vm.label(address(mockNFT1), "mockNFT1");
    }

    function setUp() public virtual {
        (address user1Temp, uint256 user1PKTemp) = makeAddrAndKey("user1");
        (address user2Temp, uint256 user2PKTemp) = makeAddrAndKey("user2");
        user1 = payable(user1Temp);
        user1PK = user1PKTemp;
        user2 = payable(user2Temp);
        user2PK = user2PKTemp;
        users = [user1, user2, user3, user4];

        WETH = new BasicERC20("WETH", "WETH", 18);
        WBTC = new BasicERC20("WBTC", "WBTC", 8);
        USDC = new BasicERC20("USDC", "USDC", 6);
        BNB = new BasicERC20("BNB", "BNB", 18);

        ccipLocalSimulator = new CCIPLocalSimulator();

        (
            uint64 chainSelector_,
            IRouterClient sourceRouter, // IRouterClient destinationRouter_
            ,
            ,
            // WETH9 wrappedNative_
            LinkToken linkToken, // BurnMintERC677Helper ccipBnM_
            // BurnMintERC677Helper ccipLnM_
            ,

        ) = ccipLocalSimulator.configuration();

        mockChainSelector = chainSelector_;
        router = sourceRouter;

        alphaBlueArb = new AlphaBlue(
            arbChainId,
            address(WETH),
            nftWethDeposit,
            address(router),
            address(linkToken)
        );
        alphaBlueBase = new AlphaBlue(
            baseChainId,
            address(WETH),
            nftWethDeposit,
            address(router),
            address(linkToken)
        );
        alphaBlueCelo = new AlphaBlue(
            celoChainId,
            address(WETH),
            nftWethDeposit,
            address(router),
            address(linkToken)
        );

        _setUpAlphaBlueChains();
        _giveTokens(user1);
        _giveTokens(user2);
        _giveTokens(user3);
        _giveTokens(user4);

        setLabels();

        uint256 linkAmount = 5 ether;
        ccipLocalSimulator.requestLinkFromFaucet(
            address(alphaBlueArb),
            linkAmount
        );
        ccipLocalSimulator.requestLinkFromFaucet(
            address(alphaBlueBase),
            linkAmount
        );
        ccipLocalSimulator.requestLinkFromFaucet(
            address(alphaBlueCelo),
            linkAmount
        );
    }

    function _setUpAlphaBlueChains() internal {
        uint256[] memory chainsId = new uint256[](3);
        chainsId[0] = arbChainId;
        chainsId[1] = baseChainId;
        chainsId[2] = celoChainId;

        bool[] memory chainsValid = new bool[](3);
        chainsValid[0] = true;
        chainsValid[1] = true;
        chainsValid[2] = true;

        address[] memory chainsContract = new address[](3);
        chainsContract[0] = address(alphaBlueArb);
        chainsContract[1] = address(alphaBlueBase);
        chainsContract[2] = address(alphaBlueCelo);

        address[] memory tokens = new address[](4);
        tokens[0] = address(WETH);
        tokens[1] = address(WBTC);
        tokens[2] = address(USDC);
        tokens[3] = address(BNB);

        bool[] memory tokensValid = new bool[](4);
        tokensValid[0] = true;
        tokensValid[1] = true;
        tokensValid[2] = true;
        tokensValid[3] = true;

        alphaBlueArb.setChainAndTokens(
            arbChainId,
            true,
            address(alphaBlueArb),
            tokens,
            tokensValid
        );
        alphaBlueArb.setChainAndTokens(
            baseChainId,
            true,
            address(alphaBlueBase),
            tokens,
            tokensValid
        );
        alphaBlueArb.setChainAndTokens(
            celoChainId,
            true,
            address(alphaBlueCelo),
            tokens,
            tokensValid
        );

        alphaBlueBase.setChainAndTokens(
            arbChainId,
            true,
            address(alphaBlueArb),
            tokens,
            tokensValid
        );
        alphaBlueBase.setChainAndTokens(
            baseChainId,
            true,
            address(alphaBlueBase),
            tokens,
            tokensValid
        );
        alphaBlueBase.setChainAndTokens(
            celoChainId,
            true,
            address(alphaBlueCelo),
            tokens,
            tokensValid
        );

        alphaBlueCelo.setChainAndTokens(
            arbChainId,
            true,
            address(alphaBlueArb),
            tokens,
            tokensValid
        );
        alphaBlueCelo.setChainAndTokens(
            baseChainId,
            true,
            address(alphaBlueBase),
            tokens,
            tokensValid
        );
        alphaBlueCelo.setChainAndTokens(
            celoChainId,
            true,
            address(alphaBlueCelo),
            tokens,
            tokensValid
        );
    }

    // TOKEN UTILS

    function _giveETH(address user, uint256 amount) public {
        vm.deal(user, amount);
    }

    // NFT utils

    function _createAndMintNFTs() public {
        // Create NFTs
        mockNFT1 = new BasicERC721(
            "MOCK_NFT_1",
            "MOCK_NFT_1",
            "https://tokenBaseURI",
            "https://contractURI"
        );

        // Mint nft1
        mockNFT1.safeMint(user1);
        mockNFT1.safeMint(user1);
        mockNFT1.safeMint(user1);
        mockNFT1.safeMint(user1);
    }

    function _user1ApproveNFTs() public {
        vm.startPrank(user1);

        // Approve nft1
        // Leaving in as example
        // mockNFT1.approve(address(auctioneerAuction), 1);
        // mockNFT1.approve(address(auctioneerAuction), 2);
        // mockNFT1.approve(address(auctioneerAuction), 3);
        // mockNFT1.approve(address(auctioneerAuction), 4);

        vm.stopPrank();
    }

    // UTILS

    // function _warpToUnlockTimestamp(uint256 lot) public {
    //     vm.warp(auctioneerAuction.getAuction(lot).unlockTimestamp);
    // }
    // function _warpToAuctionEndTimestamp(uint256 lot) public {
    //     vm.warp(auctioneerAuction.getAuction(lot).bidData.nextBidBy + 1);
    // }

    function _giveTokens(address user) public {
        WETH.mint(user, 100e18);
        WBTC.mint(user, 1e8);
        USDC.mint(user, 10000e6);
        BNB.mint(user, 100e18);
    }

    // TOKEN / ETH MOVEMENT HELPERS

    mapping(uint256 => mapping(address => uint256)) private ethBalances;

    function _prepExpectETHBalChange(uint256 id, address add) public {
        ethBalances[id][add] = add.balance;
    }
    function _expectETHBalChange(
        uint256 id,
        address add,
        int256 value
    ) public view {
        _expectETHBalChange(id, add, value, "");
    }
    function _expectETHBalChange(
        uint256 id,
        address add,
        int256 value,
        string memory label
    ) public view {
        assertEq(
            add.balance,
            uint256(int256(ethBalances[id][add]) + value),
            string.concat("ETH value changed ", label)
        );
    }

    function _prepExpectETHTransfer(
        uint256 id,
        address from,
        address to
    ) public {
        ethBalances[id][from] = from.balance;
        ethBalances[id][to] = to.balance;
    }
    function _expectETHTransfer(
        uint256 id,
        address from,
        address to,
        uint256 value
    ) public view {
        assertEq(
            from.balance,
            ethBalances[id][from] - value,
            "ETH transferred from"
        );
        assertEq(to.balance, ethBalances[id][to] + value, "ETH transferred to");
    }

    event Transfer(address indexed from, address indexed to, uint256 value);

    function _expectTokenTransfer(
        IERC20 token,
        address from,
        address to,
        uint256 value
    ) public {
        vm.expectEmit(true, true, false, true, address(token));
        emit Transfer(from, to, value);
    }

    // REUSABLES

    function _createBaseOfferParams()
        internal
        view
        returns (OfferData memory params)
    {
        params.tokenAddress = address(WETH);
        params.tokenAmount = 1e18;
        params.allowPartialFills = false;
        params.expiration = block.timestamp + 30 days;
        params.fillOptions = new FillOption[](6);
        params.fillOptions[0] = FillOption({
            chainId: arbChainId,
            tokenAddress: address(USDC),
            tokenAmount: 3000e6,
            destAddress: address(0)
        });
        params.fillOptions[1] = FillOption({
            chainId: arbChainId,
            tokenAddress: address(USDC),
            tokenAmount: 3000e6,
            destAddress: address(0)
        });
        params.fillOptions[2] = FillOption({
            chainId: baseChainId,
            tokenAddress: address(BNB),
            tokenAmount: 10e18,
            destAddress: address(0)
        });
        params.fillOptions[3] = FillOption({
            chainId: baseChainId,
            tokenAddress: address(USDC),
            tokenAmount: 3000e6,
            destAddress: address(0)
        });
        params.fillOptions[4] = FillOption({
            chainId: celoChainId,
            tokenAddress: address(WBTC),
            tokenAmount: 0.1e8,
            destAddress: address(0)
        });
        params.fillOptions[5] = FillOption({
            chainId: celoChainId,
            tokenAddress: address(USDC),
            tokenAmount: 3000e6,
            destAddress: address(0)
        });
    }

    function _createBaseFillParams(
        uint256 offerChain,
        uint256 offerId,
        address fillTokenAddress,
        uint256 fillTokenAmount,
        OfferData memory offerParams
    ) internal pure returns (FillParams memory fillParams) {
        fillParams.offerChain = offerChain;
        fillParams.offerId = offerId;
        fillParams.offerTokenAddress = offerParams.tokenAddress;
        fillParams.offerTokenAmount = offerParams.tokenAmount;
        fillParams.offerNftAddress = offerParams.nftAddress;
        fillParams.offerNftId = offerParams.nftId;
        fillParams.fillTokenAddress = fillTokenAddress;
        fillParams.fillTokenAmount = fillTokenAmount;
        fillParams.adaDestAddress = address(0);
        fillParams.partialBP = 10000;
    }

    function _getChainSelector(
        uint256 _chainId
    ) internal pure returns (uint64) {
        if (_chainId == 5) return 16015286601757825753; // Ethereum Sepolia
        if (_chainId == 84532) return 10344971235874465080; // Base Sepolia
        if (_chainId == 44787) return 3552045678561919002; // Celo Alfajores
        if (_chainId == 80002) return 16281711391670634445; // Polygon Amoy
        if (_chainId == 43113) return 14767482510784806043; // Avalanche Fuji
        if (_chainId == 421614) return 3478487238524512106; // Arbitrum Sepolia

        revert UnsupportedChainId();
    }
}
