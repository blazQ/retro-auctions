// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";

contract GameAuction is ReentrancyGuard {
    // Commit-reveal scheme
    using ECDSA for bytes32;

    struct Game {
        string name;
        string description;
        string imageHash; // IPFS hash
        uint minBid;
        address payable highestBidder;
        uint highestBid;
        bool active;
        address payable seller;
        uint endTime; // Duration for auction end
    }

    Game[] public games;
    mapping(uint => mapping(address => bytes32)) public commitHashes; // Every game has the its mapping of commits
    address public owner;
    uint256 public rewardAmount = 100 wei;
    mapping(address => uint256) public donations;
    uint256 public totalDonations;

    event GameAdded(uint gameId, string name, string imageHash);
    event NewBid(uint gameId, address bidder, uint bidAmount);
    event AuctionEnded(uint gameId, address winner, uint bidAmount);
    event Commit(address committer,  bytes32 commitHash);
    event DebugCommitHash(uint gameId, address committer, bytes32 mapCommitHash);
    event FundsDeposited(address donor, uint256 amount);

    constructor() {
        owner = msg.sender;
    }

    function addGame(
        string memory name,
        string memory description,
        string memory imageHash,
        uint minBid,
        uint duration
    ) public {
        games.push(Game({
            name: name,
            description: description,
            imageHash: imageHash,
            minBid: minBid,
            highestBidder: payable(address(0)),
            highestBid: 0,
            active: true,
            seller: payable(msg.sender),
            endTime: block.timestamp + duration
        }));

        uint gameId = games.length - 1;
        emit GameAdded(gameId, name, imageHash);
    }

    function commitBid(uint gameId, bytes32 commitHash) public {
        require(gameId < games.length, "Game does not exist");
        require(games[gameId].active, "Auction is not active");
        require(commitHashes[gameId][msg.sender] == 0 , "Already committed.");

        commitHashes[gameId][msg.sender] = commitHash;

        emit DebugCommitHash(gameId, msg.sender, commitHashes[gameId][msg.sender]);
        emit Commit(msg.sender, commitHash);
    }

    function getCommittedBid(uint gameId) public view returns(bytes32) {
        require(gameId < games.length, "Game does not exist");
        require(games[gameId].active, "Auction is not active");

        return commitHashes[gameId][msg.sender];
    }


    function revealBid(uint gameId, uint bidAmount, string memory secret) public payable nonReentrant {
        require(gameId < games.length, "Game does not exist");

        Game storage game = games[gameId];

        require(game.active, "Auction is not active");
        require(block.timestamp < game.endTime, "Auction has ended");

        bytes32 commitHash = keccak256(abi.encodePacked(msg.sender, bidAmount, secret));

        require(commitHashes[gameId][msg.sender] == commitHash, "Commit doesn't match!");

        require(bidAmount > game.highestBid && bidAmount >= game.minBid, "Bid too low");

        // Effects
        address previousHighestBidder = game.highestBidder;
        uint previousHighestBid = game.highestBid;

        game.highestBidder = payable(msg.sender);
        game.highestBid = bidAmount;

        // Interactions
        if (previousHighestBidder != address(0)) {
            // Refund previous highest bidder, call is okay to use since i'm using nonReentrant, but i'll still use CEI
            (bool success, ) = previousHighestBidder.call{value: previousHighestBid}("");
            require(success, "Refund failed");
        }

        emit NewBid(gameId, msg.sender, bidAmount);
    }


    function endAuction(uint gameId) public nonReentrant {
        require(gameId < games.length, "Game does not exist");
        Game storage game = games[gameId];
        require(msg.sender == game.seller || block.timestamp >= game.endTime, "Only seller or end time can end auction");
        require(game.active, "Auction is not active");

        game.active = false;
        if (game.highestBidder != address(0)) {
            (bool success, ) = game.seller.call{value: game.highestBid}("");
            require(success, "Payment to seller failed");

            if(msg.sender != game.seller) // Se sono il seller e ho interesse a chiuderla prima, non ho diritto al reward. Se sono un utente del sistema che vuole chiuderla perché voglio partecipare a mantenere pulito il sistema, ottengo la reward.
                payable(msg.sender).transfer(rewardAmount);
            emit AuctionEnded(gameId, game.highestBidder, game.highestBid);
        }
    }

    function depositFunds() external payable {
        require(msg.value > 0, "No ether sent");

        donations[msg.sender] += msg.value;
        totalDonations += msg.value;

        emit FundsDeposited(msg.sender, msg.value);
    }

    function setRewardAmount(uint256 amount) external {
        require(msg.sender == owner, "Only owner can set reward amount");
        rewardAmount = amount;
    }

    function gamesLength() public view returns (uint256) {
        return games.length;
    }
}
