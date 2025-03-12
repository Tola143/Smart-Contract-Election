const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election", function() {
    let Election;
    let election;
    let owner, accountA, accountB;

    beforeEach(async function() {
        // Get the ContractFactory and Signers
        Election = await ethers.getContractFactory("Election");
        [owner, accountA, accountB] = await ethers.getSigners();

        // Deploy the contract
        election = await Election.deploy(); // No need to call .deployed()
    });

    describe("Test at the beginning of an election", function() {
        it("1. Owner cancels the election event. This should expect error as the election has not started.", async function() {
            // Attempt to cancel the election
            await expect(election.cancelElection())
                .to.be.revertedWith("Election already started"); // Expect revert with this message
            console.log("Test 1: Owner cannot cancel election before it starts - PASSED");
        });

        it("2. Owner starts the election event with a duration between 15 to 30 minutes. This should expect error as there is no candidate.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Attempt to start the election
            await expect(election.startElection(duration))
                .to.be.revertedWith("No candidates available"); // Expect revert with this message
            console.log("Test 2: Owner cannot start election without candidates - PASSED");
        });

        it("3. Account A applies as candidate.", async function() {
            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();
            const isCandidate = await election.isCandidate(accountA.address);
            expect(isCandidate).to.be.true;
            console.log("Test 3: Account A applied as candidate - PASSED");
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

        it("5. Owner cancels the election event.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Account A applies as a candidate
            await election.connect(accountA).applyAsCandidate();

            // Owner starts the election
            await election.startElection(duration);

            // Owner cancels the election
            await expect(election.cancelElection())
                .to.be.revertedWith("Action not allowed after election starts"); // Expect revert with this message
            console.log("Test 5: Owner cannot cancel election after it starts - PASSED");
        });
    });
});