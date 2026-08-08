// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {PredictionMarket} from "../src/PredictionMarket.sol";

contract DeployMarket is Script {
    address internal constant MOCK_USDC = 0xF380657785bb52732DDA31A3cf14c248645594E5;

    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);

        vm.startBroadcast(deployerPrivateKey);

        PredictionMarket predictionMarket = new PredictionMarket(deployer, MOCK_USDC);

        vm.stopBroadcast();

        console.log("PredictionMarket:", address(predictionMarket));
    }
}
