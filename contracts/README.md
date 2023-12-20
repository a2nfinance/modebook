## Utilizing Mode SFS
- [PairFactory](./contracts/PairFactory.sol): The admin utilizes this contract to create all token pairs.
- [Pair](./contracts/Pair.sol): Users can place sell/buy orders or cancel their orders.

## Contract addresses

Main contracts:

- [PairFactory](https://sepolia.explorer.mode.network/address/0x9081Ae3005D4954Aa78B8016712D9c141a7141e5)
- [Pair](https://sepolia.explorer.mode.network/address/0xc21894d63fD796EdB2e78fA1d8F898DE7128B821)

FeeSharing token of the PairFactory contract: [FeeSharing](https://sepolia.explorer.mode.network/token/0xBBd707815a7F7eb6897C7686274AFabd7B579Ff6/instance/178)

FeeSharing token of the Pair contract: [FeeSharing](https://sepolia.explorer.mode.network/token/0xBBd707815a7F7eb6897C7686274AFabd7B579Ff6/instance/179)


Mock ERC-20 contracts:

- [WETH](https://sepolia.explorer.mode.network/address/0x268405343a9573339ECD30302078912cb8a902a0)
- [USDM](https://sepolia.explorer.mode.network/address/0x9259CDBA2059114a67ef10EF994B9A81E7cA14C4)

To receive test tokens, request funds [here](https://faucet.modebook.a2n.finance)

## How to deploy contracts from scratch

### Steps to deploy
- Deploy mock tokens:
    - Use: ```npx hardhat deploy-erc20  --network mode_sepolia --show-stack-traces ```
- Deploy LinkedList library:
    - Use: ```npx hardhat deploy-linked-list  --network mode_sepolia --show-stack-traces ```
- Deploy PairFactory contract:
    - Use: ```npx hardhat deploy-pair-factory  --network mode_sepolia--show-stack-traces```
- Update Pair contract:
    - Update settings: ```npx hardhat deploy-pair  --network mode_sepolia  --show-stack-traces```
- Verify contracts:
    - Use: ```npx hardhat verify --network mode_sepolia {contract address} [parameters]```

### Integrate SFS

To confirm that the PairFactory and Pair contracts are integrated with Mode SFS, check the 'contract creation' transaction, which is the first transaction in your smart contracts.
