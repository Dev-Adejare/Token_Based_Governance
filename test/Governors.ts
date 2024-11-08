
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Governance", function () {
  let Governance;
  let governance: {
    deployed: () => any;
    governanceToken: () => any;
    votingPeriod: () => any;
    quorumPercentage: () => any;
    connect: (arg0: any) => {
      (): any;
      new (): any;
      createProposal: { (arg0: string): any; new (): any };
      vote: { (arg0: number, arg1: boolean): any; new (): any };
    };
    executeProposal: (arg0: number) => any;
    getProposalDetails: (arg0: number) => any;
  };
  let GovernanceToken;
  let governanceToken: {
    deployed: () => any;
    getAddress: any;
    transfer: (arg0: any, arg1: any) => any;
  };
  let owner;
  let addr1: { address: any };
  let addr2: { address: any };
  let addrs: any[];

  beforeEach(async function () {
    
    // Deploy the GovernanceToken
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    GovernanceToken = await ethers.getContractFactory("GovernanceToken");
    governanceToken = await GovernanceToken.deploy(
      ethers.parseEther("1000000"),
      owner
    );

    const governanceAddr = await governanceToken.getAddress();
   

    // Deploy the Governance contract
    Governance = await ethers.getContractFactory("Governance");
    governance = await Governance.deploy(governanceAddr, 86400, 90); // 1 day voting period, 10% quorum
   

    // Distribute some tokens
    await governanceToken.transfer(addr1.address, ethers.parseEther("1000"));
    await governanceToken.transfer(addr2.address, ethers.parseEther("500"));
  });

  describe("Deployment", function () {
    it("Should set the correct governance token", async function () {
      expect(await governance.governanceToken()).to.equal(
        await governanceToken.getAddress()
      );
    });

    it("Should set the correct voting period", async function () {
      expect(await governance.votingPeriod()).to.equal(86400);
    });

    it("Should set the correct quorum percentage", async function () {
      expect(await governance.quorumPercentage()).to.equal(90);
    });
  });

  describe("Creating proposals", function () {
    it("Should allow token holders to create proposals", async function () {
      await expect(governance.connect(addr1).createProposal("Test Proposal"))
        .to.emit(governance, "ProposalCreated")
        .withArgs(1, addr1.address, "Test Proposal");
    });

    it("Should not allow non-token holders to create proposals", async function () {
      await expect(
        governance.connect(addrs[0]).createProposal("Test Proposal")
      ).to.be.revertedWith("Must hold governance tokens to create proposal");
    });
  });

  describe("Voting", function () {
    beforeEach(async function () {
      await governance.connect(addr1).createProposal("Test Proposal");
    });

    it("Should allow token holders to vote", async function () {
      await expect(governance.connect(addr1).vote(1, true))
        .to.emit(governance, "Voted")
        .withArgs(1, addr1.address, true, ethers.parseEther("1000"));
    });

    it("Should not allow non-token holders to vote", async function () {
      await expect(
        governance.connect(addrs[0]).vote(1, true)
      ).to.be.revertedWith("Must hold governance tokens to vote");
    });


    it("Should not allow double voting", async function () {
      await governance.connect(addr1).vote(1, true);
      await expect(governance.connect(addr1).vote(1, false)).to.be.revertedWith(
        "Already voted"
      );
    });

    it("Should not allow voting after the voting period", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]); 
      await ethers.provider.send("evm_mine");

      await expect(governance.connect(addr1).vote(1, true)).to.be.revertedWith(
        "Voting is not active"
      );
    });
  });

  describe("Executing proposals", function () {
    beforeEach(async function () {
      await governance.connect(addr1).createProposal("Test Proposal");
      await governance.connect(addr1).vote(1, true);
      await governance.connect(addr2).vote(1, true);
    });

    it("Should execute a proposal that passes", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]); 
      await ethers.provider.send("evm_mine");

      await expect(governance.executeProposal(1))
        .to.emit(governance, "ProposalExecuted")
        .withArgs(1);
    });

    it("Should not execute a proposal before voting period ends", async function () {
      await expect(governance.executeProposal(1)).to.be.revertedWith(
        "Voting period not ended"
      );
    });

    it("Should not execute a proposal that doesn't reach quorum", async function () {
      
      // Create a new proposal
      await governance
        .connect(addr1)
        .createProposal("Low Participation Proposal");

      
      await governance.connect(addr2).vote(2, true);
      await governance.connect(addr1).vote(2, false);

      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      await expect(governance.executeProposal(2)).to.be.revertedWith(
        "Quorum not reached"
      );
    });

    it("Should not execute a proposal twice", async function () {
      await ethers.provider.send("evm_increaseTime", [86401]);
      await ethers.provider.send("evm_mine");

      await governance.executeProposal(1);

      await expect(governance.executeProposal(1)).to.be.revertedWith(
        "Proposal already executed"
      );
    });
  });

  describe("Getting proposal details", function () {
    beforeEach(async function () {
      await governance.connect(addr1).createProposal("Test Proposal");
      await governance.connect(addr1).vote(1, true);
    });

    it("Should return correct proposal details", async function () {
      const proposal = await governance.getProposalDetails(1);

      expect(proposal.id).to.equal(1);
      expect(proposal.proposer).to.equal(addr1.address);
      expect(proposal.description).to.equal("Test Proposal");
      expect(proposal.forVotes).to.equal(ethers.parseEther("1000"));
      expect(proposal.againstVotes).to.equal(0);
      expect(proposal.executed).to.be.false;
    });
  });
});
