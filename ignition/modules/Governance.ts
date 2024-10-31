import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

// GovernanceModule#GovernanceToken - 0x3eDC3FF668D048EfB06E28B132bCEB88049a7C59
// GovernanceModule#Governance - 0x4f88e5E517a5661fc17A1278E86C6fF5fF3C8070

const governanceTokenAddr = "0x3eDC3FF668D048EfB06E28B132bCEB88049a7C59"
const period = 120;
const percentage = 51;

const GovernanceModule = buildModule("GovernanceModule", (m) => {
    const votingPeriod = m.getParameter("votingPeriod", period)
    const quorumPercentage = m.getParameter("quorumPercentage", percentage)

    const governance = m.contract("Governance", [governanceTokenAddr, votingPeriod, quorumPercentage]);

    return { governance };
});
export default GovernanceModule;
