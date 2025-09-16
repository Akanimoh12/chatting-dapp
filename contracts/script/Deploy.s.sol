// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {BoomerChatRegistry} from "../src/BoomerChatRegistry.sol";

contract DeployScript is Script {
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);

        // Deploy with initial registration fee (0.001 ETH)
        BoomerChatRegistry boomerChat = new BoomerChatRegistry(0.001 ether);
        
        console.log("BoomerChatRegistry deployed to:", address(boomerChat));
        console.log("Registration fee:", boomerChat.registrationFee());
        console.log("Owner:", boomerChat.owner());
        
        vm.stopBroadcast();
    }
}