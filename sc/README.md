# SwipePredict Contracts

Foundry smart contracts for SwipePredict on Monad Testnet.

## Deployed Contracts

- MockUSDC: `0xF380657785bb52732DDA31A3cf14c248645594E5`
- PredictionMarket: `0x9FC2595F6493b939Db9E9116273129d650A55f86`

## Setup

Dependencies are intentionally not committed. Install them after cloning:

```bash
cd sc
forge install foundry-rs/forge-std OpenZeppelin/openzeppelin-contracts
forge build
forge test
```

## Deploy

Copy `.env.example` to `.env`, fill `PRIVATE_KEY`, then:

```bash
source .env
forge script script/DeployMarket.s.sol --rpc-url $MONAD_RPC_URL --broadcast --legacy
```
