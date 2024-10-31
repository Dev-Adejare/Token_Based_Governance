import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import hre from "hardhat"

//  0x3eDC3FF668D048EfB06E28B132bCEB88049a7C59

const toMint = hre.ethers.parseUnits("1000", 18)

const GovernanceModule = buildModule("GovernanceModule", (m) => {
  const supply = m.getParameter("initialSupply", toMint);

  const governance = m.contract("GovernanceToken", [supply]);

  return { governance };
});

export default GovernanceModule;
