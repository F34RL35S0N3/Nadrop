// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {MockUSDC} from "../src/MockUSDC.sol";
import {TipStream} from "../src/TipStream.sol";

contract Deploy is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        MockUSDC mockUSDC = new MockUSDC();
        TipStream tipStream = new TipStream(deployer);

        vm.stopBroadcast();

        console.log("MockUSDC:", address(mockUSDC));
        console.log("TipStream:", address(tipStream));
    }
}
