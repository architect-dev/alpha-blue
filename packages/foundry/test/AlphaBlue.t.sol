// SPDX-License-Identifier: GPL-3.0-only
pragma solidity ^0.8.20;

import "forge-std/Test.sol";
import {AlphaBlueBase} from "./AlphaBlue.base.t.sol";
import {SafeERC20, IERC20} from "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";

contract AlphaBlueTest is AlphaBlueBase {
    using SafeERC20 for IERC20;

    function setUp() public override {
        super.setUp();
    }

    

    // function test_setAlias_RevertWhen_InvalidAlias() public {
    //     // Length < 3
    //     vm.expectRevert(InvalidAlias.selector);
    //     auctioneer.setAlias("AA");

    //     // Length > 9
    //     vm.expectRevert(InvalidAlias.selector);
    //     auctioneer.setAlias("AAAAAAAAAA");
    // }

    // function test_setAlias_ExpectEmit_UpdatedAlias() public {
    //     vm.expectEmit(true, true, true, true);
    //     emit UpdatedAlias(user1, "TEST");

    //     _setUserAlias(user1, "TEST");
    // }

    // function test_setAlias_RevertWhen_AliasTaken() public {
    //     auctioneer.setAlias("XXXX");

    //     vm.expectRevert(AliasTaken.selector);
    //     _setUserAlias(user1, "XXXX");
    // }

    // function test_setAlias_ClearPreviouslyUsedAlias() public {
    //     _setUserAlias(user1, "XXXX");

    //     vm.expectRevert(AliasTaken.selector);
    //     _setUserAlias(user2, "XXXX");

    //     assertEq(
    //         auctioneer.aliasUser("XXXX"),
    //         user1,
    //         "Alias should point to correct user"
    //     );
    //     assertEq(
    //         auctioneer.userAlias(user1),
    //         "XXXX",
    //         "User should point to correct alias"
    //     );

    //     _setUserAlias(user1, "YYYY");

    //     assertEq(
    //         auctioneer.aliasUser("XXXX"),
    //         address(0),
    //         "Alias should point to address(0)"
    //     );
    //     assertEq(
    //         auctioneer.userAlias(user1),
    //         "YYYY",
    //         "User should point to new alias"
    //     );

    //     vm.expectEmit(true, true, true, true);
    //     emit UpdatedAlias(user2, "XXXX");
    //     _setUserAlias(user2, "XXXX");
    // }
}
