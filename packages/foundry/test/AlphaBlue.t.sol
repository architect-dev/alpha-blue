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

    // function test_createOffer() public {
    //     vm.prank(user1);
    //     WETH.approve(address(alphaBlueArb), type(uint256).max);

    //     _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 0.01e18);

    //     vm.expectEmit(true, true, true, true);
    //     emit OfferCreated(arbChainId, user1, 0);

    //     OfferData memory params = _createBaseOfferParams();

    //     vm.prank(user1);
    //     uint256 offerId = alphaBlueArb.createOffer(params);

    //     OfferData memory offer = alphaBlueArb.getOffer(offerId);

    //     assertEq(offer.owner, user1, "User1 owns offer");
    //     assertEq(offer.tokenAddress, address(WETH), "WETH");
    //     assertEq(offer.tokenAmount, 1e18, "1e18 WETH");
    //     assertEq(offer.nftAddress, address(0), "No NFT");
    //     assertEq(offer.nftId, 0, "No NFT ID");
    //     assertEq(offer.allowPartialFills, false, "No partials");
    //     assertEq(
    //         offer.expiration,
    //         block.timestamp + 30 days,
    //         "30 day default exp"
    //     );
    //     assertEq(offer.fillOptions.length, 6, "6 Fill options");
    //     assertEq(
    //         offer.depositTokenAddress,
    //         address(WETH),
    //         "WETH is token, so it is used as deposit"
    //     );
    //     assertEq(offer.depositAmount, 0.01e18, "1% of deposit amount");

        assertEq(alphaBlueArb.offersCount(), 1, "1 offer created");

        assertEq(
            offer.status == OfferStatus.OPEN,
            true,
            "Offer starts as open"
        );
    }

    // function test_createOffer_Reverts() public {
    //     vm.prank(user1);
    //     WETH.approve(address(alphaBlueArb), type(uint256).max);

    //     OfferData memory params = _createBaseOfferParams();

    //     // MISSING TOKEN AND NFT
    //     params.tokenAddress = address(0);
    //     vm.expectRevert(MissingOfferTokenOrNft.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.createOffer(params);

    //     // INVALID TOKEN
    //     params.tokenAddress = address(100);
    //     vm.expectRevert(InvalidChainToken.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.createOffer(params);

    //     // INVALID FILL CHAIN OPTION
    //     params.tokenAddress = address(WETH);
    //     params.fillOptions[0].chainId = 100;
    //     vm.expectRevert(InvalidChain.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.createOffer(params);

    //     // MISSING FILL OPTIONS
    //     params.fillOptions = new FillOption[](0);
    //     vm.expectRevert(MissingFillOptions.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.createOffer(params);
    // }

    // function test_cancelOffer() public {
    //     vm.prank(user1);
    //     WETH.approve(address(alphaBlueArb), type(uint256).max);

    //     OfferData memory params = _createBaseOfferParams();

    //     vm.prank(user1);
    //     uint256 offerId = alphaBlueArb.createOffer(params);

    //     _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);

    //     vm.expectEmit(true, true, true, true);
    //     emit OfferCancelled(arbChainId, user1, offerId);

    //     vm.prank(user1);
    //     alphaBlueArb.cancelOffer(offerId);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);

        assertEq(
            offer.status == OfferStatus.CANCELLED,
            true,
            "Offer cancelled"
        );
    }

    // function test_cancelOffer_Reverts() public {
    //     vm.prank(user1);
    //     WETH.approve(address(alphaBlueArb), type(uint256).max);

    //     OfferData memory params = _createBaseOfferParams();

    //     vm.prank(user1);
    //     uint256 offerId = alphaBlueArb.createOffer(params);

    //     vm.expectRevert(InvalidOfferId.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.cancelOffer(2);

    //     vm.expectRevert(NotOfferer.selector);
    //     vm.prank(user2);
    //     alphaBlueArb.cancelOffer(offerId);

    //     vm.prank(user1);
    //     alphaBlueArb.cancelOffer(offerId);

    //     vm.expectRevert(OfferStatusNotOpen.selector);
    //     vm.prank(user1);
    //     alphaBlueArb.cancelOffer(offerId);
    // }

    // function test_fillOffer() public {
    //     vm.prank(user1);
    //     WETH.approve(address(alphaBlueArb), type(uint256).max);

    //     OfferData memory offerParams = _createBaseOfferParams();

    //     vm.prank(user1);
    //     uint256 offerId = alphaBlueArb.createOffer(offerParams);

    //     vm.prank(user2);
    //     USDC.approve(address(alphaBlueArb), type(uint256).max);

    //     // Ada pays for fill
    //     _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);
    //     // Bob pays for offer
    //     _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 1e18);
    //     // Bob refunded deposit
    //     _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
    //     // Ada receives offer on other side of bridge
    //     _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 1e18);
    //     // Bob receives fill on other side of bridge
    //     _expectTokenTransfer(USDC, address(alphaBlueArb), user1, 3000e6);

    //     FillParams memory fillParams = _createBaseFillParams(
    //         arbChainId,
    //         offerId,
    //         address(USDC),
    //         3000e6,
    //         offerParams
    //     );

    //     vm.prank(user2);
    //     alphaBlueArb.createFill(fillParams);

    //     OfferStatus memory offerStatus = alphaBlueArb.getOfferStatus(offerId);
    //     assertEq(
    //         offerStatus.status == OfferStatusEnum.FILLED,
    //         true,
    //         "Offer filled"
    //     );
    // }

    function test_CCIP_OfferFill() public {
    // Setup
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

    function test_fillOffer_PseudoReverts() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);
        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            3000e6,
            offerParams
        );

        // == TOKEN_MISMATCH ==
        {
            uint256 snap = vm.snapshot();

            vm.prank(user2);
            WETH.approve(address(alphaBlueArb), type(uint256).max);

            // Ada pays for fill
            _expectTokenTransfer(WETH, user2, address(alphaBlueArb), 0.75e18);
            // Ada is refunded on revert
            _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 0.75e18);
            // Emit FillFailed
            vm.expectEmit(true, true, true, true);
            emit FillFailed(arbChainId, user2, 0);

            fillParams.fillTokenAddress = address(WETH);
            fillParams.fillTokenAmount = 0.75e18;

            vm.prank(user2);
            alphaBlueArb.createFill(fillParams);

            // Ada refunded (see above)

            // Ada error type set correctly
            // Ada fill status marked INVALID
            FillData memory fill = alphaBlueArb.getFill(0);
            assertEq(
                fill.errorType == ErrorType.INVALID__TOKEN_MISMATCH,
                true,
                "Error is INVALID__TOKEN_MISMATCH"
            );
            assertEq(
                fill.status == FillStatus.INVALID,
                true,
                "Ada fill marked INVALID"
            );

            // Emit FillFailed (see above)

            vm.revertTo(snap);

            // CLEANUP
            fillParams.fillTokenAddress = address(USDC);
            fillParams.fillTokenAmount = 3000e6;
        }

        //  == TOKEN_AMOUNT_MISMATCH ==
        {
            uint256 snap = vm.snapshot();

            // Ada pays for fill
            _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 2700e6);
            // Ada is refunded on revert
            _expectTokenTransfer(USDC, address(alphaBlueArb), user2, 2700e6);
            // Emit FillFailed
            vm.expectEmit(true, true, true, true);
            emit FillFailed(arbChainId, user2, 0);

            fillParams.fillTokenAmount = 2700e6;

            vm.prank(user2);
            alphaBlueArb.createFill(fillParams);

            // Ada refunded (see above)

            // Ada error type set correctly
            // Ada fill status marked INVALID
            FillData memory fill = alphaBlueArb.getFill(0);
            assertEq(
                fill.errorType == ErrorType.INVALID__TOKEN_AMOUNT_MISMATCH,
                true,
                "Error is INVALID__TOKEN_AMOUNT_MISMATCH"
            );
            assertEq(
                fill.status == FillStatus.INVALID,
                true,
                "Ada fill marked INVALID"
            );

            // Emit FillFailed (see above)

            vm.revertTo(snap);

            // Cleanup
            fillParams.fillTokenAmount = 3000e6;
        }

        //  == INVALID_TOKEN_MISMATCH ==
        {
            uint256 snap = vm.snapshot();

            // Ada pays for fill
            _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);
            // Ada is refunded on revert
            _expectTokenTransfer(USDC, address(alphaBlueArb), user2, 3000e6);
            // Emit FillFailed
            vm.expectEmit(true, true, true, true);
            emit FillFailed(arbChainId, user2, 0);

            fillParams.offerTokenAddress = address(WBTC);

            vm.prank(user2);
            alphaBlueArb.createFill(fillParams);

            // Ada refunded (see above)

            // Ada error type set correctly
            // Ada fill status marked INVALID
            FillData memory fill = alphaBlueArb.getFill(0);
            assertEq(
                fill.errorType == ErrorType.INVALID__TOKEN_MISMATCH,
                true,
                "Error is INVALID__TOKEN_MISMATCH"
            );
            assertEq(
                fill.status == FillStatus.INVALID,
                true,
                "Ada fill marked INVALID"
            );

            // Emit FillFailed (see above)

            vm.revertTo(snap);

            // Cleanup
            fillParams.offerTokenAddress = address(WETH);
        }

        //  == INVALID_NFT_MISMATCH ==
        //  == UNAVAILABLE__EXPIRED ==
        //  == UNAVAILABLE__DEADLINED ==
        //  == UNAVAILABLE__CANCELLED ==
        //  == INVALID__OFFER_ID ==
    }

    function test_fillOffer_HaltAndContinue() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);
        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            3000e6,
            offerParams
        );

        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), 0);

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.pendingBP, 10000, "BP Marked as pending");
        assertEq(offer.offerFills.length, 1, "Fill added to array");

        FillData memory fill = alphaBlueArb.getFill(0);
        assertEq(fill.status == FillStatus.PENDING, true, "Fill is pending");

        // REVERSIONS

        vm.expectRevert(InvalidOfferId.selector);
        vm.prank(user1);
        alphaBlueArb.nudgeOffer(10);

        vm.expectRevert(NotOfferer.selector);
        vm.prank(user2);
        alphaBlueArb.nudgeOffer(offerId);

        // CONTINUE

        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        // Bob pays for offer
        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 1e18);
        // Bob refunded deposit
        _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
        // Ada receives offer on other side of bridge
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 1e18);
        // Bob receives fill on other side of bridge
        _expectTokenTransfer(USDC, address(alphaBlueArb), user1, 3000e6);

        vm.prank(user1);
        alphaBlueArb.nudgeOffer(offerId);

        offer = alphaBlueArb.getOffer(offerId);
        fill = alphaBlueArb.getFill(0);
        assertEq(offer.status == OfferStatus.FILLED, true, "Offer filled");
        assertEq(fill.status == FillStatus.SUCCEEDED, true, "Fill succeeded");
    }

    function test_fillOffer_HaltAndDeadline() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);
        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            3000e6,
            offerParams
        );

        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), 0);

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.pendingBP, 10000, "BP Marked as pending");
        assertEq(offer.offerFills.length, 1, "Fill added to array");

        FillData memory fill = alphaBlueArb.getFill(0);
        assertEq(fill.status == FillStatus.PENDING, true, "Fill is pending");

        // REVERSIONS

        vm.expectRevert(InvalidFillId.selector);
        vm.prank(user2);
        alphaBlueArb.triggerDeadline(100);

        vm.expectRevert(NotFiller.selector);
        vm.prank(user3);
        alphaBlueArb.triggerDeadline(0);

        vm.expectRevert(NotPassedDeadline.selector);
        vm.prank(user2);
        alphaBlueArb.triggerDeadline(0);

        //  == UNAVAILABLE__FILL_BP ==
        {
            // Ada pays for fill
            _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 3000e6);
            // Ada is refunded on revert
            _expectTokenTransfer(USDC, address(alphaBlueArb), user2, 3000e6);
            // Emit FillFailed
            vm.expectEmit(true, true, true, true);
            emit FillFailed(arbChainId, user2, 1);

            vm.prank(user2);
            alphaBlueArb.createFill(fillParams);

            // Ada refunded (see above)

            // Ada error type set correctly
            // Ada fill status marked INVALID
            FillData memory secondFill = alphaBlueArb.getFill(1);
            assertEq(
                secondFill.errorType == ErrorType.UNAVAILABLE__FILL_BP,
                true,
                "2nd fill Error is UNAVAILABLE__FILL_BP"
            );
            assertEq(
                secondFill.status == FillStatus.INVALID,
                true,
                "Ada secondFill marked INVALID"
            );
        }

        // DEADLINE

        vm.warp(block.timestamp + 25 hours);

        // Ada receives refund
        _expectTokenTransfer(USDC, address(alphaBlueArb), user2, 3000e6);

        // Ada receives deposit on destChain
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 0.01e18);

        // Emit Offer Deadlined event
        vm.expectEmit(true, true, true, true);
        emit OfferDeadlined(arbChainId, user1, offerId);

        // Emit Fill Deadlined event
        vm.expectEmit(true, true, true, true);
        emit FillDeadlined(arbChainId, user2, 0);

        vm.prank(user2);
        alphaBlueArb.triggerDeadline(0);

        offer = alphaBlueArb.getOffer(offerId);
        fill = alphaBlueArb.getFill(0);
        assertEq(
            offer.status == OfferStatus.DEADLINED,
            true,
            "Offer deadlined out"
        );
        assertEq(
            fill.status == FillStatus.DEADLINED,
            true,
            "Fill deadlined out"
        );
    }

    function test_offer_partials() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();
        offerParams.allowPartialFills = true;

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        // HALF BP

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 1500e6);
        // Bob pays for offer
        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 0.5e18);
        // Bob NOT refunded deposit, not filled yet (see below for fill)
        // _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
        // Ada receives offer on other side of bridge
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 0.5e18);
        // Bob receives fill on other side of bridge
        _expectTokenTransfer(USDC, address(alphaBlueArb), user1, 1500e6);

        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            1500e6,
            offerParams
        );
        fillParams.partialBP = 5000;

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.filledBP, 5000, "Offer filled to 5000BP");

        // OTHER HALF BP

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), 1500e6);
        // Bob pays for offer
        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 0.5e18);
        // Bob refunded deposit, not filled yet (see below for fill)
        _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
        // Ada receives offer on other side of bridge
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 0.5e18);
        // Bob receives fill on other side of bridge
        _expectTokenTransfer(USDC, address(alphaBlueArb), user1, 1500e6);

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.filledBP, 10000, "Offer filled to 10000BP");
        assertEq(
            offer.status == OfferStatus.FILLED,
            true,
            "Offer marked as filled"
        );
    }

    function test_fillOffer_HaltAndPendingPartials() public {
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);
        vm.prank(user2);
        USDC.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();
        offerParams.allowPartialFills = true;

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        uint256 partialBP = 6000;
        uint256 partialAmount = (3000e6 * partialBP) / 10000;
        FillParams memory fillParams = _createBaseFillParams(
            arbChainId,
            offerId,
            address(USDC),
            partialAmount,
            offerParams
        );
        fillParams.partialBP = partialBP;

        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), 0);

        // Ada pays for fill
        _expectTokenTransfer(USDC, user2, address(alphaBlueArb), partialAmount);

        vm.prank(user2);
        alphaBlueArb.createFill(fillParams);

        OfferData memory offer = alphaBlueArb.getOffer(offerId);
        assertEq(offer.pendingBP, partialBP, "BP Marked as pending");
        assertEq(offer.offerFills.length, 1, "Fill added to array");

        FillData memory fill = alphaBlueArb.getFill(0);
        assertEq(fill.status == FillStatus.PENDING, true, "Fill is pending");

        //  == UNAVAILABLE__FILL_BP ==
        {
            // Ada pays for fill
            _expectTokenTransfer(
                USDC,
                user2,
                address(alphaBlueArb),
                partialAmount
            );
            // Ada is refunded on revert
            _expectTokenTransfer(
                USDC,
                address(alphaBlueArb),
                user2,
                partialAmount
            );
            // Emit FillFailed
            vm.expectEmit(true, true, true, true);
            emit FillFailed(arbChainId, user2, 1);

            vm.prank(user2);
            alphaBlueArb.createFill(fillParams);

            // Ada refunded (see above)

            // Ada error type set correctly
            // Ada fill status marked INVALID
            FillData memory secondFill = alphaBlueArb.getFill(1);
            assertEq(
                secondFill.errorType == ErrorType.UNAVAILABLE__FILL_BP,
                true,
                "2nd fill Error is UNAVAILABLE__FILL_BP"
            );
            assertEq(
                secondFill.status == FillStatus.INVALID,
                true,
                "Ada secondFill marked INVALID"
            );
        }
    }

    function test_CCIP_OfferFill() public {
        // Setup
        vm.prank(user1);
        WETH.approve(address(alphaBlueArb), type(uint256).max);

        OfferData memory offerParams = _createBaseOfferParams();

        vm.prank(user1);
        uint256 offerId = alphaBlueArb.createOffer(offerParams);

        // Prepare CCIP Message
        CCIPBlue memory ccipBlue = CCIPBlue({
            messageType: MessageType.CFILL,
            bobDestAddress: user1,
            adaDestAddress: user2,
            offerChain: arbChainId,
            offerId: offerId,
            fillChain: arbChainId,
            fillId: 0,
            offerTokenAddress: address(WETH),
            offerTokenAmount: 1e18,
            offerNftAddress: address(0),
            offerNftId: 0,
            fillTokenAddress: address(USDC),
            fillTokenAmount: 3000e6,
            partialBP: 10000,
            deadline: block.timestamp + 1 days,
            errorType: ErrorType.NONE
        });
        bytes memory ccipMessage = abi.encode(ccipBlue);

        // Initial balances
        uint256 initialUser1WETHBalance = WETH.balanceOf(user1);
        uint256 initialUser2WETHBalance = WETH.balanceOf(user2);
        uint256 initialContractWETHBalance = WETH.balanceOf(
            address(alphaBlueArb)
        );

        // We are not yet emmiting
        // vm.expectEmit(true, true, true, true);
        // emit OfferFilled(arbChainId, user1, offerId);

        // Bob pays for offer
        _expectTokenTransfer(WETH, user1, address(alphaBlueArb), 1e18);
        // Bob refunded deposit
        _expectTokenTransfer(WETH, address(alphaBlueArb), user1, 0.01e18);
        // Ada receives offer
        _expectTokenTransfer(WETH, address(alphaBlueArb), user2, 1e18);

        // Simulate CCIP message receiving
        vm.prank(address(router));
        alphaBlueArb.ccipReceive(
            Client.Any2EVMMessage({
                messageId: bytes32(0),
                sourceChainSelector: uint64(_getChainSelector(arbChainId)),
                sender: abi.encode(address(alphaBlueArb)),
                data: ccipMessage,
                destTokenAmounts: new Client.EVMTokenAmount[](0)
            })
        );

        // Verify offer status
        OfferStatus memory offerStatus = alphaBlueArb.getOfferStatus(offerId);
        assertEq(
            offerStatus.status == OfferStatusEnum.FILLED,
            true,
            "Offer should be filled"
        );
        assertEq(offerStatus.filledBP, 10000, "Offer should be 100% filled");

        // Verify balances
        assertEq(
            WETH.balanceOf(user1),
            initialUser1WETHBalance - 1e18 + 0.01e18,
            "User1 WETH balance incorrect"
        );
        assertEq(
            WETH.balanceOf(user2),
            initialUser2WETHBalance + 1e18,
            "User2 WETH balance incorrect"
        );
        assertEq(
            WETH.balanceOf(address(alphaBlueArb)),
            initialContractWETHBalance + 1e18 - 0.01e18 - 1e18,
            "Contract WETH balance incorrect"
        );

        // Verify offer fill data
        OfferFillData memory offerFillData = offerStatus.offerFills[0];
        assertEq(offerFillData.fillId, 0, "OfferFill fillId incorrect");
        assertEq(
            offerFillData.fillChain,
            arbChainId,
            "OfferFill fillChain incorrect"
        );
        assertEq(
            offerFillData.fillTokenAddress,
            address(USDC),
            "OfferFill token address incorrect"
        );
        assertEq(
            offerFillData.fillTokenAmount,
            3000e6,
            "OfferFill token amount incorrect"
        );
        assertEq(
            offerFillData.partialBP,
            10000,
            "OfferFill partialBP incorrect"
        );
        assertEq(
            offerFillData.adaDestAddress,
            user2,
            "OfferFill adaDestAddress incorrect"
        );
        assertEq(
            offerFillData.bobDestAddress,
            user1,
            "OfferFill bobDestAddress incorrect"
        );
        assertEq(
            offerFillData.pending,
            false,
            "OfferFill should not be pending"
        );
    }
}
