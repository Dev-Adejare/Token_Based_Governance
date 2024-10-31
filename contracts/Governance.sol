// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Governance {

    struct Proposal {
        uint256 id;
        address proposer;
        string description;
        uint256 forVotes;
        uint256 againstVotes;
        uint256 startTime;
        uint256 endTime;
        bool executed;
        mapping(address => bool) hasVoted;
    }

    IERC20 public governanceToken;
    uint256 public proposalCount;
    uint256 public votingPeriod;
    uint256 public quorumPercentage;

    mapping(uint256 => Proposal) public proposals;

    event ProposalCreated(uint256 indexed proposalId, address indexed proposer, string description);
    event Voted(uint256 indexed proposalId, address indexed voter, bool support, uint256 votes);
    event ProposalExecuted(uint256 indexed proposalId);

    constructor(address _governanceToken, uint256 _votingPeriod, uint256 _quorumPercentage) {
        governanceToken = IERC20(_governanceToken);
        votingPeriod = _votingPeriod;
        quorumPercentage = _quorumPercentage;
    }

    function createProposal(string memory _description) external {
        require(governanceToken.balanceOf(msg.sender) > 0, "Must hold governance tokens to create proposal");
        
        proposalCount++;
        Proposal storage newProposal = proposals[proposalCount];
        newProposal.id = proposalCount;
        newProposal.proposer = msg.sender;
        newProposal.description = _description;
        newProposal.startTime = block.timestamp;
        newProposal.endTime = block.timestamp + votingPeriod;

        emit ProposalCreated(proposalCount, msg.sender, _description);
    }

    function vote(uint256 _proposalId, bool _support) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp >= proposal.startTime && block.timestamp <= proposal.endTime, "Voting is not active");
        require(!proposal.hasVoted[msg.sender], "Already voted");

        uint256 votes = governanceToken.balanceOf(msg.sender);
        require(votes > 0, "Must hold governance tokens to vote");

        if (_support) {
            proposal.forVotes += votes;
        } else {
            proposal.againstVotes += votes;
        }

        proposal.hasVoted[msg.sender] = true;

        emit Voted(_proposalId, msg.sender, _support, votes);
    }

    function executeProposal(uint256 _proposalId) external {
        Proposal storage proposal = proposals[_proposalId];
        require(block.timestamp > proposal.endTime, "Voting period not ended");
        require(!proposal.executed, "Proposal already executed");

        uint256 totalVotes = proposal.forVotes + proposal.againstVotes;
        uint256 quorumVotes = (governanceToken.totalSupply() * quorumPercentage) / 100;

        require(totalVotes >= quorumVotes, "Quorum not reached");

        if (proposal.forVotes > proposal.againstVotes) {
            proposal.executed = true;
            emit ProposalExecuted(_proposalId);
        }
    }

    function getProposalDetails(uint256 _proposalId) external view returns (
        uint256 id,
        address proposer,
        string memory description,
        uint256 forVotes,
        uint256 againstVotes,
        uint256 startTime,
        uint256 endTime,
        bool executed
    ) {
        Proposal storage proposal = proposals[_proposalId];
        return (
            proposal.id,
            proposal.proposer,
            proposal.description,
            proposal.forVotes,
            proposal.againstVotes,
            proposal.startTime,
            proposal.endTime,
            proposal.executed
        );
    }
}