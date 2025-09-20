// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title BoomerChatRegistry
 * @notice On-chain chat dApp with .boomer ENS domain registration and IPFS profile images
 * @dev Stores all messages on-chain, manages user profiles, and emits comprehensive events for real-time updates
 */
contract BoomerChatRegistry is Ownable {
    
    // Events for real-time frontend updates
    event BoomerUserRegistered(
        address indexed user,
        string boomerName,
        string ipfsImageHash,
        uint256 timestamp
    );

    event GroupMessageSent(
        address indexed sender,
        string message,
        uint256 timestamp,
        uint256 messageId
    );

    event DirectMessageSent(
        address indexed sender,
        address indexed recipient,
        string message,
        uint256 timestamp,
        uint256 messageId
    );

    event ProfileImageUpdated(
        address indexed user,
        string oldImageHash,
        string newImageHash,
        uint256 timestamp
    );

    event UserOnlineStatusChanged(
        address indexed user,
        bool isOnline,
        uint256 timestamp
    );

    // Structs
    struct BoomerProfile {
        string boomerName;
        string ipfsImageHash;
        uint256 registrationTime;
        bool isRegistered;
        bool isOnline;
    }

    struct Message {
        address sender;
        string content;
        uint256 timestamp;
        uint256 id;
    }

    struct DirectMessage {
        address sender;
        address recipient;
        string content;
        uint256 timestamp;
        uint256 id;
    }

    // State variables
    mapping(address => BoomerProfile) public profiles;
    mapping(string => address) public nameToAddress;
    mapping(address => bool) public registeredUsers;
    
    Message[] public groupMessages;
    DirectMessage[] public directMessages;
    
    address[] public allUsers;
    uint256 public registrationFee;
    uint256 private messageCounter;
    uint256 private dmCounter;

    // Modifiers
    modifier onlyRegistered() {
        require(registeredUsers[msg.sender], "Must be registered .boomer user");
        _;
    }

    modifier validBoomerName(string memory name) {
        require(bytes(name).length >= 3 && bytes(name).length <= 20, "Name must be 3-20 characters");
        require(isValidBoomerName(name), "Invalid .boomer name format");
        _;
    }

    constructor(uint256 _registrationFee) Ownable(msg.sender) {
        registrationFee = _registrationFee;
    }

    /**
     * @notice Register a new .boomer user with profile image
     * @param boomerName The desired .boomer name (without .boomer suffix)
     * @param ipfsImageHash IPFS hash of the profile image
     */
    function registerBoomerUser(
        string memory boomerName,
        string memory ipfsImageHash
    ) external payable validBoomerName(boomerName) {
        require(msg.value >= registrationFee, "Insufficient registration fee");
        require(!registeredUsers[msg.sender], "User already registered");
        require(nameToAddress[boomerName] == address(0), "Boomer name already taken");
        require(bytes(ipfsImageHash).length > 0, "IPFS image hash required");

        // Create full .boomer name with suffix
        string memory fullBoomerName = string(abi.encodePacked(boomerName, ".boomer"));

        // Register user with full .boomer name
        profiles[msg.sender] = BoomerProfile({
            boomerName: fullBoomerName,
            ipfsImageHash: ipfsImageHash,
            registrationTime: block.timestamp,
            isRegistered: true,
            isOnline: true
        });

        nameToAddress[boomerName] = msg.sender;
        registeredUsers[msg.sender] = true;
        allUsers.push(msg.sender);

        emit BoomerUserRegistered(msg.sender, fullBoomerName, ipfsImageHash, block.timestamp);
        emit UserOnlineStatusChanged(msg.sender, true, block.timestamp);
    }

    /**
     * @notice Send a message to the group chat
     * @param message The message content
     */
    function sendGroupMessage(string memory message) external onlyRegistered {
        require(bytes(message).length > 0, "Message cannot be empty");
        require(bytes(message).length <= 280, "Message too long");

        uint256 messageId = messageCounter++;
        groupMessages.push(Message({
            sender: msg.sender,
            content: message,
            timestamp: block.timestamp,
            id: messageId
        }));

        emit GroupMessageSent(msg.sender, message, block.timestamp, messageId);
    }

    /**
     * @notice Send a direct message to another user
     * @param recipient The recipient's address
     * @param message The message content
     */
    function sendDirectMessage(address recipient, string memory message) external onlyRegistered {
        require(registeredUsers[recipient], "Recipient must be registered");
        require(bytes(message).length > 0, "Message cannot be empty");
        require(bytes(message).length <= 280, "Message too long");
        require(recipient != msg.sender, "Cannot send message to yourself");

        uint256 messageId = dmCounter++;
        directMessages.push(DirectMessage({
            sender: msg.sender,
            recipient: recipient,
            content: message,
            timestamp: block.timestamp,
            id: messageId
        }));

        emit DirectMessageSent(msg.sender, recipient, message, block.timestamp, messageId);
    }

    /**
     * @notice Update user's profile image
     * @param newIpfsImageHash New IPFS hash for the profile image
     */
    function updateProfileImage(string memory newIpfsImageHash) external onlyRegistered {
        require(bytes(newIpfsImageHash).length > 0, "IPFS image hash required");
        
        string memory oldHash = profiles[msg.sender].ipfsImageHash;
        profiles[msg.sender].ipfsImageHash = newIpfsImageHash;

        emit ProfileImageUpdated(msg.sender, oldHash, newIpfsImageHash, block.timestamp);
    }

    /**
     * @notice Update user's online status
     * @param isOnline Whether the user is online
     */
    function updateOnlineStatus(bool isOnline) external onlyRegistered {
        profiles[msg.sender].isOnline = isOnline;
        emit UserOnlineStatusChanged(msg.sender, isOnline, block.timestamp);
    }

    // View functions

    /**
     * @notice Check if a user is registered
     */
    function isRegisteredBoomerUser(address user) external view returns (bool) {
        return registeredUsers[user];
    }

    /**
     * @notice Get user's boomer profile
     */
    function getBoomerProfile(address user) external view returns (
        string memory boomerName,
        string memory ipfsImageHash,
        uint256 registrationTime,
        bool isOnline
    ) {
        BoomerProfile memory profile = profiles[user];
        return (profile.boomerName, profile.ipfsImageHash, profile.registrationTime, profile.isOnline);
    }

    /**
     * @notice Get user address by boomer name
     */
    function getBoomerUserByName(string memory boomerName) external view returns (address) {
        return nameToAddress[boomerName];
    }

    /**
     * @notice Get group messages with pagination
     */
    function getGroupMessages(uint256 offset, uint256 limit) external view returns (
        address[] memory senders,
        string[] memory messages,
        uint256[] memory timestamps,
        uint256[] memory messageIds
    ) {
        uint256 total = groupMessages.length;
        if (offset >= total) {
            return (new address[](0), new string[](0), new uint256[](0), new uint256[](0));
        }

        uint256 end = offset + limit;
        if (end > total) {
            end = total;
        }

        uint256 length = end - offset;
        senders = new address[](length);
        messages = new string[](length);
        timestamps = new uint256[](length);
        messageIds = new uint256[](length);

        for (uint256 i = 0; i < length; i++) {
            Message storage message = groupMessages[offset + i];
            senders[i] = message.sender;
            messages[i] = message.content;
            timestamps[i] = message.timestamp;
            messageIds[i] = message.id;
        }
    }

    /**
     * @notice Get direct messages between two users
     */
    function getDirectMessages(
        address otherUser,
        uint256 offset,
        uint256 limit
    ) external view returns (
        address[] memory senders,
        string[] memory messages,
        uint256[] memory timestamps,
        uint256[] memory messageIds
    ) {
        // Count messages between the two users
        uint256 count = 0;
        for (uint256 i = 0; i < directMessages.length; i++) {
            DirectMessage storage dm = directMessages[i];
            if ((dm.sender == msg.sender && dm.recipient == otherUser) ||
                (dm.sender == otherUser && dm.recipient == msg.sender)) {
                count++;
            }
        }

        if (offset >= count) {
            return (new address[](0), new string[](0), new uint256[](0), new uint256[](0));
        }

        uint256 end = offset + limit;
        if (end > count) {
            end = count;
        }

        uint256 length = end - offset;
        senders = new address[](length);
        messages = new string[](length);
        timestamps = new uint256[](length);
        messageIds = new uint256[](length);

        uint256 found = 0;
        uint256 resultIndex = 0;

        for (uint256 i = 0; i < directMessages.length && resultIndex < length; i++) {
            DirectMessage storage dm = directMessages[i];
            if ((dm.sender == msg.sender && dm.recipient == otherUser) ||
                (dm.sender == otherUser && dm.recipient == msg.sender)) {
                
                if (found >= offset) {
                    senders[resultIndex] = dm.sender;
                    messages[resultIndex] = dm.content;
                    timestamps[resultIndex] = dm.timestamp;
                    messageIds[resultIndex] = dm.id;
                    resultIndex++;
                }
                found++;
            }
        }
    }

    /**
     * @notice Get all registered users
     */
    function getAllRegisteredUsers() external view returns (
        address[] memory users,
        string[] memory boomerNames,
        string[] memory imageHashes,
        bool[] memory onlineStatuses
    ) {
        uint256 length = allUsers.length;
        users = new address[](length);
        boomerNames = new string[](length);
        imageHashes = new string[](length);
        onlineStatuses = new bool[](length);

        for (uint256 i = 0; i < length; i++) {
            address user = allUsers[i];
            BoomerProfile storage profile = profiles[user];
            users[i] = user;
            boomerNames[i] = profile.boomerName;
            imageHashes[i] = profile.ipfsImageHash;
            onlineStatuses[i] = profile.isOnline;
        }
    }

    /**
     * @notice Get total user count
     */
    function getUserCount() external view returns (uint256) {
        return allUsers.length;
    }

    /**
     * @notice Check if a boomer name is available
     */
    function isBoomerNameAvailable(string memory boomerName) external view returns (bool) {
        return nameToAddress[boomerName] == address(0);
    }

    /**
     * @notice Get total group message count
     */
    function getGroupMessageCount() external view returns (uint256) {
        return groupMessages.length;
    }

    /**
     * @notice Get total direct message count
     */
    function getDirectMessageCount() external view returns (uint256) {
        return directMessages.length;
    }

    // Admin functions

    /**
     * @notice Set registration fee
     */
    function setRegistrationFee(uint256 newFee) external onlyOwner {
        registrationFee = newFee;
    }

    /**
     * @notice Withdraw accumulated fees
     */
    function withdrawFees() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No fees to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }

    // Internal functions

    /**
     * @notice Validate boomer name format
     */
    function isValidBoomerName(string memory name) internal pure returns (bool) {
        bytes memory nameBytes = bytes(name);
        
        // Check each character
        for (uint256 i = 0; i < nameBytes.length; i++) {
            bytes1 char = nameBytes[i];
            
            // Allow lowercase letters, numbers, and underscores
            if (!(char >= 0x61 && char <= 0x7A) && // a-z
                !(char >= 0x30 && char <= 0x39) && // 0-9
                char != 0x5F) { // underscore
                return false;
            }
        }
        
        return true;
    }
}