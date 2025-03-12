const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election - Test Script #3", function() {
    let Election;
    let election;
    let owner, accountA, accountB, accountC, accountD, accountE;

    beforeEach(async function() {
        // Get the ContractFactory and Signers
        Election = await ethers.getContractFactory("Election");
        [owner, accountA, accountB, accountC, accountD, accountE] = await ethers.getSigners();

        // Deploy the contract
        election = await Election.deploy();
    });

    describe("Test voting", function() {
        it("1. Selected accounts apply as candidate.", async function() {
            // Account A, B, and C apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();
            await election.connect(accountC).applyAsCandidate();

            // Verify candidates
            expect(await election.isCandidate(accountA.address)).to.be.true;
            expect(await election.isCandidate(accountB.address)).to.be.true;
            expect(await election.isCandidate(accountC.address)).to.be.true;
            console.log("Test 1: Selected accounts applied as candidates - PASSED");
        });

        it("2. A voter of your choice makes a vote for any candidate. This should expect error. (Vote before election starts)", async function() {
            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Account D (voter) attempts to vote before the election starts
            await expect(election.connect(accountD).vote(accountA.address))
                .to.be.revertedWith("Action not allowed outside election period");
            console.log("Test 2: Voter cannot vote before election starts - PASSED");
        });

        it("3. Owner starts the election event with a duration between 15 to 30 minutes.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A, B, and C apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();
            await election.connect(accountC).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);
            const electionStatus = await election.electionStatus();
            expect(electionStatus).to.equal(1); // 1 = ElectionStatus.Started
            console.log("Test 3: Owner started election with duration - PASSED");
        });

        it("4. A voter of your choice makes a vote for a non-candidate. This should expect error.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A and B apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account D (voter) attempts to vote for a non-candidate (Account C)
            await expect(election.connect(accountD).vote(accountC.address))
                .to.be.revertedWith("Invalid candidate");
            console.log("Test 4: Voter cannot vote for a non-candidate - PASSED");
        });

        it("5. A voter of your choice makes a vote for any candidate.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A and B apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account D (voter) votes for Account A
            await election.connect(accountD).vote(accountA.address);

            // Verify the vote
            const votesForA = await election.getCandidateVotes(accountA.address);
            expect(votesForA).to.equal(1);
            console.log("Test 5: Voter voted for a candidate - PASSED");
        });

        it("6. The same voter in the previous step makes a vote again on any candidate. This should expect error (double vote).", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A and B apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account D (voter) votes for Account A
            await election.connect(accountD).vote(accountA.address);

            // Account D attempts to vote again
            await expect(election.connect(accountD).vote(accountB.address))
                .to.be.revertedWith("Voter already voted");
            console.log("Test 6: Voter cannot vote twice - PASSED");
        });

        it("7. A candidate of your choice votes on any candidate.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A and B apply as candidates
            await election.connect(accountA).applyAsCandidate();
            await election.connect(accountB).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account A (candidate) attempts to vote for Account B
            await expect(election.connect(accountA).vote(accountB.address))
                .to.be.revertedWith("Candidates cannot vote");
            console.log("Test 7: Candidate cannot vote - PASSED");
        });
    });
});