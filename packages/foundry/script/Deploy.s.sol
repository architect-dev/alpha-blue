//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "../contracts/YourContract.sol";
import "../contracts/AlphaBlue.sol";
import "../contracts/BasicERC20.sol";
import "../contracts/BasicERC721.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    BasicERC20 public WETH;
    BasicERC20 public WBTC;
    BasicERC20 public USDC;
    BasicERC20 public BNB;
    BasicERC721 public MOCC;

    uint256 public nftWethDeposit = 0.01e18;

    uint256 public arbChainId = 421614;
    uint256 public baseChainId = 84532;
    uint256 public celoChainId = 44787;
    uint256 public polyChainId = 80002;
    AlphaBlue public alphaBlue;
    // AlphaBlue public alphaBlueArb;
    // AlphaBlue public alphaBlueCelo;

    function run() external {
        uint256 deployerPrivateKey = setupLocalhostEnv();
        if (deployerPrivateKey == 0) {
            revert InvalidPrivateKey(
                "You don't have a deployer account. Make sure you have set DEPLOYER_PRIVATE_KEY in .env or use `yarn generate` to generate a new random account"
            );
        }
        vm.startBroadcast(deployerPrivateKey);

        WETH = new BasicERC20("WETH", "WETH", 18);
        _markDeployment("WETH", address(WETH));
        WBTC = new BasicERC20("WBTC", "WBTC", 8);
        _markDeployment("WBTC", address(WBTC));
        USDC = new BasicERC20("USDC", "USDC", 6);
        _markDeployment("USDC", address(USDC));
        BNB = new BasicERC20("BNB", "BNB", 18);
        _markDeployment("BNB", address(BNB));

        MOCC = new BasicERC721(
            "MOCC",
            "MOCC",
            "https://tokenBaseURI",
            "https://contractURI"
        );
        _markDeployment("MOCC", address(MOCC));

        // BASE
        alphaBlue = new AlphaBlue(
            baseChainId,
            address(WETH),
            nftWethDeposit,
            0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93,
            0xE4aB69C077896252FAFBD49EFD26B5D171A32410
        );
        _markDeployment("alphaBlue", address(alphaBlue));

        // ARB
        // alphaBlue = new AlphaBlue(
        //     arbChainId,
        //     address(WETH),
        //     nftWethDeposit,
        //     0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93,
        //     0xE4aB69C077896252FAFBD49EFD26B5D171A32410
        // );
        // _markDeployment("alphaBlue", address(alphaBlue));

        // // POLYGON
        // alphaBlue = new AlphaBlue(
        //     polyChainId,
        //     address(WETH),
        //     nftWethDeposit,
        //     0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2,
        //     0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904
        // );
        // _markDeployment("alphaBlue", address(alphaBlue));

        // CELO
        alphaBlue = new AlphaBlue(
            celoChainId,
            address(WETH),
            nftWethDeposit,
            0xb00E95b773528E2Ea724DB06B75113F239D15Dca,
            0x32E08557B14FaD8908025619797221281D439071
        );
        _markDeployment("alphaBlue", address(alphaBlue));

        // _setUpAlphaBlueChains();

        console.log("alphaBlue-s initialized");

        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function _markDeployment(string memory name, address addr) internal {
        deployments.push(Deployment({name: name, addr: addr}));
        console.log("DEPLOYMENT:", name, addr);
    }

    function _setUpAlphaBlueChains() internal {
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

        alphaBlue.setChainAndTokens(
            baseChainId,
            true,
            address(alphaBlue),
            tokens,
            tokensValid
        );
        alphaBlue.setChainAndTokens(
            baseChainId,
            true,
            address(alphaBlue),
            tokens,
            tokensValid
        );
        // alphaBlueArb.setChainAndTokens(
        //     celoChainId,
        //     true,
        //     address(alphaBlueCelo),
        //     tokens,
        //     tokensValid
        // );

        // alphaBlueBase.setChainAndTokens(
        //     arbChainId,
        //     true,
        //     address(alphaBlueArb),
        //     tokens,
        //     tokensValid
        // );
        // alphaBlueBase.setChainAndTokens(
        //     baseChainId,
        //     true,
        //     address(alphaBlueBase),
        //     tokens,
        //     tokensValid
        // );
        // alphaBlueBase.setChainAndTokens(
        //     celoChainId,
        //     true,
        //     address(alphaBlueCelo),
        //     tokens,
        //     tokensValid
        // );

        // alphaBlueCelo.setChainAndTokens(
        //     arbChainId,
        //     true,
        //     address(alphaBlueArb),
        //     tokens,
        //     tokensValid
        // );
        // alphaBlueCelo.setChainAndTokens(
        //     baseChainId,
        //     true,
        //     address(alphaBlueBase),
        //     tokens,
        //     tokensValid
        // );
        // alphaBlueCelo.setChainAndTokens(
        //     celoChainId,
        //     true,
        //     address(alphaBlueCelo),
        //     tokens,
        //     tokensValid
        // );
    }
}
