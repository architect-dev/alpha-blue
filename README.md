# AlphaBlue: Cross-Chain Orderbook Exchange 🔄

AlphaBlue is a decentralized, cross-chain, orderbook exchange for ERC20 tokens and NFTs, leveraging Chainlink's CCIP for secure cross-chain communications.
This project is a submission to ETHGlobal Brussels 2024.

## Features

- Cross-chain trading of ERC20 tokens and NFTs
- Partial fills for token trades
- User-defined multi-chain trade options
- 1% staking mechanism for order integrity
- Orders are open untill filled or cancelled
- 24-hour trade execution window for filled orders
- Real-time order status monitoring

## Project Structure

1. **Foundry**: Smart contracts, tests, and deployment scripts.
2. **Next.js**: Frontend application with wagmi and DaisyUI.
3. **Server**: Database and off-chain components.

## Technologies Used

- Solidity, Chainlink CCIP for core protocol
- Next.js, wagmi, DaisyUI for dApp frontend
- Foundry for contract testing and deployment
- AWS Serverless, MySQL for data aggregation and frontend reactivity

## Smart Contracts

Key features in `contracts/AlphaBlue.sol`:
- Order creation and management
- Cross-chain fill processing
- Partial fill and NFT trade support
- Stake management

## Frontend

The Next.js frontend allows users to:
- View and create trades
- Participate in partial fills
- Approve token spending
- View available NFT and token balances
- Monitor trade statuses

## Backend

AWS serverless backend:
- Aggregates cross-chain data
- Provides real-time updates
- Manages order statuses

## Testing

Run Foundry tests:
  `forge test`

## Currently Supported Networks

- Arbitrum Sepolia
- Base Sepolia
- Polygon Amoy

