const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Election - Test Script #4", function() {
    let Election;
    let election;
    let owner, candidates, voters, lastAccount;

    beforeEach(async function() {
        // Get the ContractFactory and Signers
        Election = await ethers.getContractFactory("Election");
        [owner, ...accounts] = await ethers.getSigners();

        // Select 3 candidates (accounts[0], accounts[1], accounts[2])
        candidates = accounts.slice(0, 3);

        // Select 17 voters (accounts[3] to accounts[19])
        voters = accounts.slice(3, 20);

        // Last account (accounts[19]) will attempt to vote after the election ends
        lastAccount = accounts[19];

        // Deploy the contract
        election = await Election.deploy();
    });

    describe("Complete scenario", function() {
        it("1. Selected accounts apply as candidate.", async function() {
            // Candidates apply
            for (const candidate of candidates) {
                await election.connect(candidate).applyAsCandidate();
                expect(await election.isCandidate(candidate.address)).to.be.true;
            }
            console.log("Test 1: Selected accounts applied as candidates - PASSED");
        });

        it("2. Owner starts the election event with a duration between 15 to 30 minutes.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Candidates apply
            for (const candidate of candidates) {
                await election.connect(candidate).applyAsCandidate();
            }

            // Owner starts the election
            await election.startElection(duration);
            const electionStatus = await election.electionStatus();
            expect(electionStatus).to.equal(1); // 1 = ElectionStatus.Started
            console.log("Test 2: Owner started election with duration - PASSED");
        });

        it("3. 17 accounts (that are not owner and not the last account) make a vote.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Candidates apply
            for (const candidate of candidates) {
                await election.connect(candidate).applyAsCandidate();
            }

            // Owner starts the election
            await election.startElection(duration);

            // Voters vote for candidates
            for (let i = 0; i < voters.length; i++) {
                const voter = voters[i];
                const candidate = candidates[i % candidates.length]; // Distribute votes evenly
                await election.connect(voter).vote(candidate.address);
            }

            // Verify votes
            for (const candidate of candidates) {
                const votes = await election.getCandidateVotes(candidate.address);
                expect(votes).to.equal(Math.floor(voters.length / candidates.length));
            }
            console.log("Test 3: 17 accounts voted - PASSED");
        });

        it("4. Owner ends the election, showing the winner with vote count.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Candidates apply
            for (const candidate of candidates) {
                await election.connect(candidate).applyAsCandidate();
            }

            // Owner starts the election
            await election.startElection(duration);

            // Voters vote for candidates
            for (let i = 0; i < voters.length; i++) {
                const voter = voters[i];
                const candidate = candidates[i % candidates.length]; // Distribute votes evenly
                await election.connect(voter).vote(candidate.address);
            }

            // Fast-forward time to simulate the election duration passing
            await ethers.provider.send("evm_increaseTime", [duration + 1]); // Add 1 second to ensure the election has ended
            await ethers.provider.send("evm_mine"); // Mine a new block to apply the time change

            // Owner ends the election
            await election.endElection();

            // Verify election status
            const electionStatus = await election.electionStatus();
            expect(electionStatus).to.equal(2); // 2 = ElectionStatus.Ended

            // Get the winner
            const winner = await election.getWinner();
            const winnerVotes = await election.getCandidateVotes(winner);

            console.log(`Winner: ${winner} with ${winnerVotes} votes`);
            console.log("Test 4: Owner ended the election and showed the winner - PASSED");
        });

        it("5. The last account votes for any candidate. This should expect error.", async function() {
            const duration = 20 * 60; // 20 minutes in seconds

            // Candidates apply
            for (const candidate of candidates) {
                await election.connect(candidate).applyAsCandidate();
            }

            // Owner starts the election
            await election.startElection(duration);

            // Voters vote for candidates
            for (let i = 0; i < voters.length; i++) {
                const voter = voters[i];
                const candidate = candidates[i % candidates.length]; // Distribute votes evenly
                await election.connect(voter).vote(candidate.address);
            }

            // Fast-forward time to simulate the election duration passing
            await ethers.provider.send("evm_increaseTime", [duration + 1]); // Add 1 second to ensure the election has ended
            await ethers.provider.send("evm_mine"); // Mine a new block to apply the time change

            // Owner ends the election
            await election.endElection();

            // Last account attempts to vote
            await expect(election.connect(lastAccount).vote(candidates[0].address))
                .to.be.revertedWith("Action not allowed outside election period");
            console.log("Test 5: Last account cannot vote after election ends - PASSED");
        });
    });
});