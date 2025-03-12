const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election - Test Script #2", function() {
    let Election;
    let election;
    let owner, accountA, accountB;

    beforeEach(async function() {
        // Get the ContractFactory and Signers
        Election = await ethers.getContractFactory("Election");
        [owner, accountA, accountB] = await ethers.getSigners();

        // Deploy the contract
        election = await Election.deploy();
    });

    describe("Candidate application/cancel, and invalid owner vote/cancel", function() {
        it("1. Account A applies as candidate.", async function() {
            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();
            const isCandidate = await election.isCandidate(accountA.address);
            expect(isCandidate).to.be.true;
            console.log("Test 1: Account A applied as candidate - PASSED");
        });

        it("2. Account A cancels as candidate.", async function() {
            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Account A cancels candidacy
            await election.connect(accountA).cancelCandidacy();
            const isCandidate = await election.isCandidate(accountA.address);
            expect(isCandidate).to.be.false;
            console.log("Test 2: Account A canceled candidacy - PASSED");
        });

        it("3. Account A applies as candidate again.", async function() {
            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();
            const isCandidate = await election.isCandidate(accountA.address);
            expect(isCandidate).to.be.true;
            console.log("Test 3: Account A applied as candidate again - PASSED");
        });

        it("4. Owner starts the election event with a duration between 15 to 30 minutes.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);
            const electionStatus = await election.electionStatus();
            expect(electionStatus).to.equal(1); // 1 = ElectionStatus.Started
            console.log("Test 4: Owner started election with duration - PASSED");
        });

        it("5. Account A cancels as candidate. This should expect error.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account A attempts to cancel candidacy
            await expect(election.connect(accountA).cancelCandidacy())
                .to.be.revertedWith("Action not allowed after election starts");
            console.log("Test 5: Account A cannot cancel candidacy after election starts - PASSED");
        });

        it("6. Account B applies as candidate. This should expect error.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account B attempts to apply as a candidate
            await expect(election.connect(accountB).applyAsCandidate())
                .to.be.revertedWith("Action not allowed after election starts");
            console.log("Test 6: Account B cannot apply as candidate after election starts - PASSED");
        });

        it("7. Owner votes for A. This should expect error as owner cannot vote.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Owner attempts to vote for Account A
            await expect(election.vote(accountA.address))
                .to.be.revertedWith("Owner cannot vote"); // Updated revert message
            console.log("Test 7: Owner cannot vote - PASSED");
        });

        it("8. Owner cancels the election event. This should expect error as the election has been voted.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Account B votes for Account A
            await election.connect(accountB).vote(accountA.address);

            // Owner attempts to cancel the election
            await expect(election.cancelElection())
                .to.be.revertedWith("Action not allowed after election starts");
            console.log("Test 8: Owner cannot cancel election after voting has started - PASSED");
        });
    });
});