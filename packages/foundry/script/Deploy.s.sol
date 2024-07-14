//SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

// import "../contracts/YourContract.sol";
import "../contracts/AlphaBlue.sol";
import "../contracts/BasicERC20.sol";
import "../contracts/BasicERC721.sol";
import "./DeployHelpers.s.sol";

contract DeployScript is ScaffoldETHDeploy {
    error InvalidPrivateKey(string);

    // Sepolia
    // Polygon
    // Arbitrum
    // Celo
    // Base

    BasicERC20 public WETH;
    BasicERC20 public WBTC;
    BasicERC20 public USDC;
    BasicERC20 public BNB;
    BasicERC721 public MOCC;

    uint256 public nftWethDeposit = 0.01e18;

    uint256 public sepoliaChainId = 11155111;
    uint256 public arbChainId = 421614;
    uint256 public baseChainId = 84532;
    uint256 public polyChainId = 80002;
    uint256 public gnosisChainId = 10200;

    AlphaBlue public alphaBlue;

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
            sepoliaChainId,
            address(WETH),
            nftWethDeposit,
            0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59,
            0x779877A7B0D9E8603169DdbD7836e478b4624789
        );
        _markDeployment("alphaBlue", address(alphaBlue));

        // SEPOLIA
        // sepoliaChainId,
        // 0x0BF3dE8c5D3e8A2B34D2BEeB17ABfCeBaf363A59,
        // 0x779877A7B0D9E8603169DdbD7836e478b4624789

        // BASE
        // baseChainId,
        // 0xD3b06cEbF099CE7DA4AcCf578aaebFDBd6e88a93,
        // 0xE4aB69C077896252FAFBD49EFD26B5D171A32410

        // ARB
        // arbChainId,
        // 0x2a9C5afB0d0e4BAb2BCdaE109EC4b0c4Be15a165,
        // 0xb1D4538B4571d411F07960EF2838Ce337FE1E80E

        // POLYGON
        // polyChainId,
        // 0x9C32fCB86BF0f4a1A8921a9Fe46de3198bb884B2,
        // 0x0Fd9e8d3aF1aaee056EB9e802c3A762a667b1904

        // GNOSIS
        // gnosisChainId,
        // 0x19b1bac554111517831ACadc0FD119D23Bb14391,
        // 0xDCA67FD8324990792C0bfaE95903B8A64097754F

        console.log("alphaBlue-s initialized");

        injectSelectorData();

        vm.stopBroadcast();

        /**
         * This function generates the file containing the contracts Abi definitions.
         * These definitions are used to derive the types needed in the custom scaffold-eth hooks, for example.
         * This function should be called last.
         */
        exportDeployments();
    }

    function injectSelectorData() internal {
        ChainSelectorParam[] memory selectors = new ChainSelectorParam[](4);
        selectors[0] = ChainSelectorParam({
            chainId: sepoliaChainId,
            sourceSelector: 16015286601757825753,
            destSelector: 16015286601757825753
        });
        selectors[0] = ChainSelectorParam({
            chainId: arbChainId,
            sourceSelector: 3478487238524512106,
            destSelector: 3478487238524512106
        });
        selectors[1] = ChainSelectorParam({
            chainId: baseChainId,
            sourceSelector: 10344971235874465080,
            destSelector: 10344971235874465080
        });
        selectors[2] = ChainSelectorParam({
            chainId: polyChainId,
            sourceSelector: 16281711391670634445,
            destSelector: 16281711391670634445
        });
        selectors[3] = ChainSelectorParam({
            chainId: gnosisChainId,
            sourceSelector: 8871595565390010547,
            destSelector: 8871595565390010547
        });

        alphaBlue.setCcipSelectors(selectors);
    }

    function _markDeployment(string memory name, address addr) internal {
        deployments.push(Deployment({name: name, addr: addr}));
        console.log("DEPLOYMENT:", name, addr);
    }
}
