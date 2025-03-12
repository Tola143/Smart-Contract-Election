# Election Smart Contract

This repository contains a Solidity smart contract for managing a decentralized election. The contract allows candidates to apply, voters to vote, and the owner to start, end, or cancel the election. It also includes Hardhat test scripts to verify the functionality of the contract.

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Technologies Used](#technologies-used)
4. [Getting Started](#getting-started)
   - [Prerequisites](#prerequisites)
   - [Installation](#installation)
5. [Running the Tests](#running-the-tests)
6. [Contract Details](#contract-details)
   - [Election.sol](#electionsol)
   - [Test Scripts](#test-scripts)
7. [License](#license)

---

## Overview

The **Election Smart Contract** is a decentralized application (dApp) built on the Ethereum blockchain. It allows for the creation and management of an election, including candidate registration, voting, and result declaration. The contract is written in Solidity and tested using Hardhat.

---

## Features

- **Candidate Registration**: Candidates can apply to participate in the election.
- **Voting**: Voters can cast their votes for registered candidates.
- **Election Management**: The owner can start, end, or cancel the election.
- **Result Declaration**: The contract calculates and declares the winner of the election.
- **Security**: Modifiers ensure that only authorized users can perform specific actions (e.g., only the owner can start or end the election).

---

## Technologies Used

- **Solidity**: Smart contract programming language.
- **Hardhat**: Development environment for Ethereum smart contracts.
- **Ethers.js**: Library for interacting with the Ethereum blockchain.
- **Chai**: Assertion library for testing.

---

## Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v16 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [Hardhat](https://hardhat.org/)

### Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/your-username/election-smart-contract.git
   cd election-smart-contract
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Compile the smart contract:
   ```bash
   npx hardhat compile
   ```

---

## Running the Tests

To run the test scripts, use the following command:

```bash
npx hardhat test
```

### Test Scripts

The repository includes the following test scripts:

1. **Test Script #1**: Tests the initial setup of the election, including candidate registration and election start/cancel functionality.
2. **Test Script #2**: Tests candidate application/cancellation and invalid owner actions (e.g., voting or canceling after the election has started).
3. **Test Script #3**: Tests the voting functionality, including edge cases like voting before the election starts, voting for non-candidates, and double voting.
4. **Test Script #4**: Tests a complete election scenario, including candidate registration, voting, election end, and result declaration.

---

## Contract Details

### Election.sol

The `Election.sol` contract includes the following key components:

- **State Variables**:
  - `electionStatus`: Tracks the current status of the election (`NotStarted`, `Started`, `Ended`, `Canceled`).
  - `candidates`: Mapping of candidate addresses to their registration status.
  - `voters`: Mapping of voter addresses to their voting status.
  - `votes`: Mapping of voter addresses to the candidate they voted for.

- **Functions**:
  - `applyAsCandidate()`: Allows an account to register as a candidate.
  - `cancelCandidacy()`: Allows a candidate to cancel their registration.
  - `startElection()`: Allows the owner to start the election.
  - `endElection()`: Allows the owner to end the election and declare the winner.
  - `vote()`: Allows a voter to cast their vote for a candidate.
  - `getWinner()`: Returns the address of the winning candidate.

- **Modifiers**:
  - `onlyOwner`: Restricts access to the owner.
  - `onlyBeforeElectionStarts`: Ensures actions are performed before the election starts.
  - `onlyDuringElection`: Ensures actions are performed during the election.
  - `onlyVoter`: Ensures only eligible voters can vote.

### Test Scripts

The test scripts are located in the `test` directory. They cover various scenarios, including:

- Candidate registration and cancellation.
- Election start, end, and cancellation.
- Voting functionality and edge cases.
- Winner declaration.

---

## License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

---
