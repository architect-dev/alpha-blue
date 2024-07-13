// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import "../contracts/AlphaBlue.sol";
import {AlphaBlueBase} from "./AlphaBlue.base.t.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AlphaBlueTest is AlphaBlueBase {
    using SafeERC20 for IERC20;

    function setUp() public override {
        super.setUp();
    }

    function test_createOffer() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 0.01e18);

        vm.expectEmit(true, true, true, true);
        emit OfferCreated(arbChainId, user1, 0);

        OfferData memory params = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(params);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);

        assertEq(offer.owner, user1, "User1 owns offer");
        assertEq(offer.tokenAddress, address(WETH), "WETH");
        assertEq(offer.tokenAmount, 1e18, "1e18 WETH");
        assertEq(offer.nftAddress, address(0), "No NFT");
        assertEq(offer.nftId, 0, "No NFT ID");
        assertEq(offer.allowPartialFills, false, "No partials");
        assertEq(
            offer.expiration,
            block.timestamp + 30 days,
            "30 day default exp"
        );
        assertEq(offer.fillOptions.length, 6, "6 Fill options");
        assertEq(
            offer.depositTokenAddress,
            address(WETH),
            "WETH is token, so it is used as deposit"
        );
        assertEq(offer.depositAmount, 0.01e18, "1% of deposit amount");

        assertEq(alphaBlueArb.offersCount(), 1, "1 offer created");

        assertEq(
            offer.status == OfferStatus.OPEN,
            true,
            "Offer starts as open"
        );
    }

    function test_createOffer_Reverts() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory params = _createBaseOfferParams();

        // MISSING TOKEN AND NFT
        params.tokenAddress = address(0);
        vm.expectRevert(MissingOfferTokenOrNft.selector);
        vm.prank(user1);
        alphaBlueArb.createOffer(params);

        // INVALID TOKEN
        params.tokenAddress = address(100);
        vm.expectRevert(InvalidChainToken.selector);
        vm.prank(user1);
        alphaBlueArb.createOffer(params);

        // INVALID FILL CHAIN OPTION
        params.tokenAddress = address(WETH);
        params.fillOptions[0].chainId = 100;
        vm.expectRevert(InvalidChain.selector);
        vm.prank(user1);
        alphaBlueArb.createOffer(params);

        // MISSING FILL OPTIONS
        params.fillOptions = new FillOption[](0);
        vm.expectRevert(MissingFillOptions.selector);
        vm.prank(user1);
        alphaBlueArb.createOffer(params);
    }

    function test_cancelOffer() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory params = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(params);

        _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);

        vm.expectEmit(true, true, true, true);
        emit OfferCancelled(arbChainId, user1, offerId);

        vm.prank(user1);
        alphaBlueArb.cancelOffer(offerId);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);

        assertEq(
            offer.status == OfferStatus.CANCELLED,
            true,
            "Offer cancelled"
        );
    }

    function test_cancelOffer_Reverts() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory params = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(params);

        vm.expectRevert(InvalidOfferId.selector);
        vm.prank(user1);
        alphaBlueArb.cancelOffer(2);

        vm.expectRevert(NotOfferer.selector);
        vm.prank(user2);
        alphaBlueArb.cancelOffer(offerId);

        vm.prank(user1);
        alphaBlueArb.cancelOffer(offerId);

        vm.expectRevert(OfferStatusNotOpen.selector);
        vm.prank(user1);
        alphaBlueArb.cancelOffer(offerId);
    }

    function test_fillOffer() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);
        // Bob pays for offer
        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 1e18);
        // Bob refunded deposit
        _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
        // Ada receives offer on other side of bridge
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 1e18);
        // Bob receives fill on other side of bridge
        _expectTokenTransfer(USDC, address(alphaBlueArb), user1, 3000e6);

        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            3000e6,
            offerParams
        );

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.status == OfferStatus.FILLED, true, "Offer filled");
    }
}
