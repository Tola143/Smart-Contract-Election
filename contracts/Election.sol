// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract Election {

    enum ElectionStatus { NotStarted, Started, Ended, Canceled }
    ElectionStatus public electionStatus;
    uint public electionEndTime;
    uint public electionStartTime;
    uint public totalVotes;

    address public owner;
    address[] public candidateList;
    mapping(address => bool) public isCandidate;
    mapping(address => bool) public voters;
    mapping(address => uint) public candidateVotes;

    event ElectionStarted(uint duration);
    event ElectionEnded(address winner, uint totalVotes, uint winningVotes);
    event ElectionCanceled();
    event Voted(address voter, address candidate);
    event CandidateApplied(address candidate);
    event CandidateCanceled(address candidate);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can perform this action");
        _;
    }

    modifier onlyBeforeElectionStarts() {
        require(electionStatus == ElectionStatus.NotStarted, "Action not allowed after election starts");
        _;
    }

    modifier onlyDuringElection() {
        require(electionStatus == ElectionStatus.Started, "Action not allowed outside election period");
        _;
    }

    modifier onlyAfterElectionStarted() {
        require(block.timestamp >= electionStartTime, "Cannot perform action before election starts");
        _;
    }

    modifier onlyVoter() {
        require(!isCandidate[msg.sender], "Candidates cannot vote");
        require(!voters[msg.sender], "Voter already voted");
        _;
    }

    constructor() {
        owner = msg.sender;
        electionStatus = ElectionStatus.NotStarted;
    }

    function applyAsCandidate() external onlyBeforeElectionStarts {
        require(!isCandidate[msg.sender], "Already a candidate");
        isCandidate[msg.sender] = true;
        candidateList.push(msg.sender);
        emit CandidateApplied(msg.sender);
    }

    function cancelCandidacy() external onlyBeforeElectionStarts {
        require(isCandidate[msg.sender], "Not a candidate");
        isCandidate[msg.sender] = false;
        // Remove from candidateList (optional, requires additional logic)
        emit CandidateCanceled(msg.sender);
    }

    function startElection(uint duration) external onlyOwner onlyBeforeElectionStarts {
        require(electionStatus != ElectionStatus.Canceled, "Election is canceled");
        require(candidateList.length > 0, "No candidates available");
        electionStatus = ElectionStatus.Started;
        electionStartTime = block.timestamp;
        electionEndTime = electionStartTime + duration;
        emit ElectionStarted(duration);
    }

    function cancelElection() external onlyOwner onlyBeforeElectionStarts {
        require(block.timestamp < electionStartTime, "Election already started");
        electionStatus = ElectionStatus.Canceled;
        emit ElectionCanceled();
    }

    function vote(address _candidate) external onlyVoter onlyDuringElection {
        require(msg.sender != owner, "Owner cannot vote"); // Add this line
        require(isCandidate[_candidate], "Invalid candidate");
        voters[msg.sender] = true;
        candidateVotes[_candidate]++;
        totalVotes++;
        emit Voted(msg.sender, _candidate);
    }

    function endElection() external onlyOwner onlyDuringElection {
        require(block.timestamp >= electionEndTime, "Election duration has not passed");
        electionStatus = ElectionStatus.Ended;
        address winner = getWinner();
        uint winningVotes = candidateVotes[winner];
        emit ElectionEnded(winner, totalVotes, winningVotes);
    }

    function getWinner() public view returns (address) {
        address winner;
        uint highestVotes = 0;
        bool isTie = false;
        for (uint i = 0; i < candidateList.length; i++) {
            address candidate = candidateList[i];
            if (candidateVotes[candidate] > highestVotes) {
                highestVotes = candidateVotes[candidate];
                winner = candidate;
                isTie = false;
            } else if (candidateVotes[candidate] == highestVotes) {
                isTie = true;
            }
        }
        return isTie ? address(0) : winner; // Return address(0) in case of a tie
    }

    function getCandidates() public view returns (address[] memory) {
        return candidateList;
    }

    function getCandidateVotes(address _candidate) public view returns (uint) {
        require(isCandidate[_candidate], "Not a candidate");
        return candidateVotes[_candidate];
    }

    function hasVoted(address _voter) public view returns (bool) {
        return voters[_voter];
    }

    function resetElection() external onlyOwner {
        require(electionStatus == ElectionStatus.Ended || electionStatus == ElectionStatus.Canceled, "Election is still ongoing");
        electionStatus = ElectionStatus.NotStarted;
        electionStartTime = 0;
        electionEndTime = 0;
        totalVotes = 0;

        // Reset candidates
        for (uint i = 0; i < candidateList.length; i++) {
            isCandidate[candidateList[i]] = false;
        }
        delete candidateList;

        // Reset voters (optional, requires additional logic)
    }
}