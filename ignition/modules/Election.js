// This setup uses Hardhat Ignition to manage smart contract deployments.
// Learn more about it at https://hardhat.org/ignition

const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

module.exports = buildModule("ElectionModule", (m) => {
    // Removed the parameters: period, brand, serialNumber
    const myElection = m.contract("Election", []); // No constructor parameters

    return { myElection };
});