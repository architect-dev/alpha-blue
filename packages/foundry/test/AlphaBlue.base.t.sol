// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AlphaBlue.sol";
import "../contracts/BasicERC20.sol";
import "../contracts/BasicERC721.sol";

abstract contract AlphaBlueBase is Test {
    using QuikMaff for uint256;
    using SafeERC20 for IERC20;

    BasicERC20 public WETH;
    BasicERC20 public WBTC;
    BasicERC20 public USDC;
    BasicERC20 public BNB;
    BasicERC721 public mockNFT1;

    uint256 public nftWethDeposit = 0.01e18;

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

    uint256 public arbChainId = 1;
    uint256 public baseChainId = 2;
    uint256 public celoChainId = 3;
    AlphaBlue public alphaBlueArb;
    AlphaBlue public alphaBlueBase;
    AlphaBlue public alphaBlueCelo;

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

        WETH = new BasicERC20("WETH", "WETH");
        WBTC = new BasicERC20("WBTC", "WBTC");
        USDC = new BasicERC20("USDC", "USDC");
        BNB = new BasicERC20("BNB", "BNB");

        alphaBlueArb = new AlphaBlue(arbChainId, address(WETH), nftWethDeposit);
        alphaBlueBase = new AlphaBlue(
            baseChainId,
            address(WETH),
            nftWethDeposit
        );
        alphaBlueCelo = new AlphaBlue(
            celoChainId,
            address(WETH),
            nftWethDeposit
        );

        _setUpAlphaBlueChains();

        setLabels();
    }

    function _setUpAlphaBlueChains() internal {
        uint256[] memory chainsId = new uint256[](3);
        chainsId[0] = arbChainId;
        chainsId[1] = baseChainId;
        chainsId[2] = celoChainId;

        bool[] memory chainsValid = new bool[](3);

        address[] memory chainsContract = new address[](3);
        chainsContract[0] = address(alphaBlueArb);
        chainsContract[1] = address(alphaBlueBase);
        chainsContract[2] = address(alphaBlueCelo);

        address[][] memory tokens = new address[][](3 * 4);
        bool[][] memory tokensValid = new bool[][](3 * 4);

        for (uint256 i = 0; i < 3 * 4; i += 4) {
            chainsValid[i] = true;

            tokens[i][0] = address(WETH);
            tokens[i][1] = address(WBTC);
            tokens[i][2] = address(USDC);
            tokens[i][3] = address(BNB);

            tokensValid[i][0] = true;
            tokensValid[i][1] = true;
            tokensValid[i][2] = true;
            tokensValid[i][3] = true;
        }

        alphaBlueArb.setChainsAndTokens(
            chainsId,
            chainsValid,
            chainsContract,
            tokens,
            tokensValid
        );
        alphaBlueBase.setChainsAndTokens(
            chainsId,
            chainsValid,
            chainsContract,
            tokens,
            tokensValid
        );
        alphaBlueCelo.setChainsAndTokens(
            chainsId,
            chainsValid,
            chainsContract,
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
}
