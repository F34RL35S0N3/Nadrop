// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {TipStream} from "../src/TipStream.sol";

contract TipStreamTest is Test {
    TipStream internal tipStream;

    address internal feeRecipient = address(0xFEE);
    address internal creator = address(0xC0FFEE);
    address internal tipper = address(0xA11CE);
    address internal unlocker = address(0xB0B);

    function setUp() public {
        tipStream = new TipStream(feeRecipient);

        vm.deal(creator, 10 ether);
        vm.deal(tipper, 10 ether);
        vm.deal(unlocker, 10 ether);
        vm.deal(feeRecipient, 0);
    }

    function testTipSplitsPaymentNinetyFiveFive() public {
        uint256 postId = 1;
        uint256 amount = 1 ether;

        vm.prank(creator);
        tipStream.createPost(postId, false, 0);

        uint256 creatorBefore = creator.balance;
        uint256 feeRecipientBefore = feeRecipient.balance;

        vm.prank(tipper);
        tipStream.tip{value: amount}(creator, postId);

        assertEq(creator.balance - creatorBefore, 0.95 ether);
        assertEq(feeRecipient.balance - feeRecipientBefore, 0.05 ether);

        (,,, uint256 totalTips) = tipStream.posts(postId);
        assertEq(totalTips, amount);
    }

    function testUnlockSetsStateAndSplitsPaymentNinetyFiveFive() public {
        uint256 postId = 2;
        uint256 unlockPrice = 2 ether;

        vm.prank(creator);
        tipStream.createPost(postId, true, unlockPrice);

        uint256 creatorBefore = creator.balance;
        uint256 feeRecipientBefore = feeRecipient.balance;

        vm.prank(unlocker);
        tipStream.unlock{value: unlockPrice}(postId);

        assertTrue(tipStream.unlockedPosts(postId, unlocker));
        assertEq(creator.balance - creatorBefore, 1.9 ether);
        assertEq(feeRecipient.balance - feeRecipientBefore, 0.1 ether);

        (,,, uint256 totalTips) = tipStream.posts(postId);
        assertEq(totalTips, unlockPrice);
    }

    function testUnlockRevertsWhenAlreadyUnlocked() public {
        uint256 postId = 3;
        uint256 unlockPrice = 1 ether;

        vm.prank(creator);
        tipStream.createPost(postId, true, unlockPrice);

        vm.prank(unlocker);
        tipStream.unlock{value: unlockPrice}(postId);

        vm.prank(unlocker);
        vm.expectRevert(TipStream.AlreadyUnlocked.selector);
        tipStream.unlock{value: unlockPrice}(postId);
    }

    function testUnlockRevertsWhenInsufficientPayment() public {
        uint256 postId = 4;
        uint256 unlockPrice = 1 ether;

        vm.prank(creator);
        tipStream.createPost(postId, true, unlockPrice);

        vm.prank(unlocker);
        vm.expectRevert(TipStream.InsufficientPayment.selector);
        tipStream.unlock{value: unlockPrice - 1}(postId);
    }
}
