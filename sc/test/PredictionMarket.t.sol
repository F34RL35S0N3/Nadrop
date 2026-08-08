// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Test} from "forge-std/Test.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract PredictionMarketTest is Test {
    PredictionMarket internal predictionMarket;
    MockUSDC internal usdc;

    address internal feeRecipient = address(0xFEE);
    address internal backend = address(0xBEEF);
    address internal alice = address(0xA11CE);
    address internal bob = address(0xB0B);

    uint256 internal constant ONE_USDC = 1_000_000;

    function setUp() public {
        usdc = new MockUSDC();
        predictionMarket = new PredictionMarket(feeRecipient, address(usdc));

        usdc.mint(100 * ONE_USDC);
        usdc.transfer(backend, 100 * ONE_USDC);

        vm.prank(backend);
        usdc.approve(address(predictionMarket), type(uint256).max);
    }

    function testStakeFlowUpdatesTotalsAndUserStake() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.prank(backend);
        predictionMarket.stakeFor(alice, marketId, true, ONE_USDC);

        PredictionMarket.Market memory market = predictionMarket.getMarket(marketId);
        (uint256 yesStake, uint256 noStake) = predictionMarket.getStake(marketId, alice);

        assertEq(market.totalYes, ONE_USDC);
        assertEq(market.totalNo, 0);
        assertEq(yesStake, ONE_USDC);
        assertEq(noStake, 0);
    }

    function testPariMutuelNinetyFiveFiveMathCorrectOnClaim() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.startPrank(backend);
        predictionMarket.stakeFor(alice, marketId, true, 2 * ONE_USDC);
        predictionMarket.stakeFor(bob, marketId, false, 3 * ONE_USDC);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 hours);
        predictionMarket.resolveMarket(marketId, true);

        uint256 aliceBefore = usdc.balanceOf(alice);
        uint256 feeRecipientBefore = usdc.balanceOf(feeRecipient);

        vm.prank(alice);
        predictionMarket.claim(marketId);

        assertEq(usdc.balanceOf(alice) - aliceBefore, 4_750_000);
        assertEq(usdc.balanceOf(feeRecipient) - feeRecipientBefore, 250_000);
    }

    function testDoubleClaimRevertsAlreadyClaimed() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.prank(backend);
        predictionMarket.stakeFor(alice, marketId, true, ONE_USDC);

        vm.warp(block.timestamp + 1 hours);
        predictionMarket.resolveMarket(marketId, true);

        vm.prank(alice);
        predictionMarket.claim(marketId);

        vm.prank(alice);
        vm.expectRevert(PredictionMarket.AlreadyClaimed.selector);
        predictionMarket.claim(marketId);
    }

    function testClaimBeforeResolveRevertsMarketNotResolved() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.prank(backend);
        predictionMarket.stakeFor(alice, marketId, true, ONE_USDC);

        vm.prank(alice);
        vm.expectRevert(PredictionMarket.MarketNotResolved.selector);
        predictionMarket.claim(marketId);
    }

    function testStakeAfterDeadlineRevertsMarketClosed() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.warp(block.timestamp + 1 hours);

        vm.prank(backend);
        vm.expectRevert(PredictionMarket.MarketClosed.selector);
        predictionMarket.stakeFor(alice, marketId, true, ONE_USDC);
    }

    function testLoserClaimRevertsNothingToClaim() public {
        uint256 marketId = predictionMarket.createMarket(uint64(block.timestamp + 1 hours));

        vm.startPrank(backend);
        predictionMarket.stakeFor(alice, marketId, true, ONE_USDC);
        predictionMarket.stakeFor(bob, marketId, false, ONE_USDC);
        vm.stopPrank();

        vm.warp(block.timestamp + 1 hours);
        predictionMarket.resolveMarket(marketId, true);

        vm.prank(bob);
        vm.expectRevert(PredictionMarket.NothingToClaim.selector);
        predictionMarket.claim(marketId);
    }
}
