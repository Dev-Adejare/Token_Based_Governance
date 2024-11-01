# Token-Based-Governance

## Project Overview
This project implements a decentralized governance system on the Ethereum blockchain, allowing users holding a custom ERC20 token to participate in decision-making by voting on proposals.

## Features
- **Custom ERC20 Token**: Only holders of this token can participate in governance.
- **Proposal Creation**: Token holders can create proposals on which other token holders can vote.
- **Voting Mechanism**: Users can vote "Yes" or "No" on proposals.
- **Quorum Enforcement**: Requires a minimum number of votes to validate proposals.
- **Result Tally System**: Automatically counts votes and determines whether a proposal passed or failed.

## Contract Details
The governance system is comprised of the following contracts:

1. **Governance Token** - An ERC20 contract representing the governance token.
2. **Governance Contract** - Manages proposals, voting, and quorum enforcement.

### Governance Token
- **Token Symbol**: `GOVT`
- **Decimals**: 18
- **Total Supply**: Fixed upon deployment

### Governance Contract
The governance contract allows for:
- **Proposal Creation**: Token holders can create proposals with a description and a voting period.
- **Voting**: Each token holder can cast one vote per proposal. 
- **Quorum Enforcement**: Only proposals meeting a minimum number of votes are considered valid.
- **Tallying**: Votes are counted to determine the outcome.

## Project Structure
- `contracts/`: Contains all Solidity contract files.
  - `GovernanceToken.sol`: The ERC20 token contract.
  - `Governance.sol`: The main governance contract managing proposals and votes.
- `scripts/`: Deployment and interaction scripts.
- `test/`: Unit tests for each contract using Hardhat and Chai.

## Getting Started

### Prerequisites
Ensure you have the following installed:
- [Node.js and npm](https://nodejs.org/)
- [Hardhat](https://hardhat.org/)
- [Solidity](https://docs.soliditylang.org/)

### Installation
Clone the repository and install dependencies:

```bash
git clone <repository-url>
cd token-based-governance
npm install
```

### Compile Contracts
Compile the Solidity contracts using Hardhat:

```bash
npx hardhat compile
```

### Deployment
Deploy contracts to a local Hardhat network:

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

**Deploy on a test network** (e.g., Rinkeby) by configuring `.env` with network credentials and running:

```bash
npx hardhat run scripts/deploy.js --network rinkeby
```

## Usage
Once deployed, you can interact with the governance system using Hardhat, a frontend, or web3 tools.

### Voting Process
1. **Create a Proposal**: Call `createProposal` with a description and duration.
2. **Vote**: Token holders can call `voteOnProposal` with a proposal ID and their vote (1 for "Yes", 0 for "No").
3. **Check Proposal Status**: Call `tallyVotes` after the voting period has ended to view the outcome.

## Testing
Run tests to verify functionality:

```bash
npx hardhat test
```

## Security Considerations
This contract assumes participants will act in good faith, and it has not undergone formal audits. Be cautious when deploying on a live network and consider conducting a professional audit.

## License
This project is licensed under the MIT License.
