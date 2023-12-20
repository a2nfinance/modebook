## Overview 

ModeBook - An OrderBook application on the Mode Blockchain

## Demo information

Frontend: [ModeBook](https://modebook.a2n.finance)

Smart contracts: [Github](https://github.com/a2nfinance/modebook/tree/master/contracts)

Test tokens (WETH & USDM): [Faucets](https://faucet.modebook.a2n.finance/)

## Mode technology
ModeBook has utilized SFS as for all smart contracts, [more details can be found here](./contracts/README.md).

## System architecture
![](./01_onemes_workflow.jpg)

## Prerequisites

To understand source code, you should have basic knowlege of:
- Sepolia.Mode testnet.
- Solidity
- Hardhat
- NodeJS
- React
- Next JS
- Wagmi
- Linux & docker commands.

## Installation steps
**Step 1: Install Dev environment**

- Install NodeJS (16+)
- Install VisualCode studio.
- Install Solidity & Hardhat addons for VisualCode.



**Step 2: Install libraries**
- Go to each folder
    - ```cd frontend ``` -> ```npm i```
    - ```cd contracts``` -> ```npm i```

**Step 3: Deploy smart contracts**

Read this file [README.md](./contracts/README.md) for more details.

**Step 4: Setup .env**

Setup ENV file in each folder: Frontend, Contracts. 

- ```cp .env.example .env``` and change variable values.


## Commands to start

- To run Backend and Frontend applications in Production mode, use this command: ```npm run build``` and ```pm2 run npm --name "your app name" -- run start```

## Test smart contracts

Read this file [README.md](./contracts/README.md) for more details.`

## Contribution
We welcome any ideas or suggestions to help us make ModeBook better. Please do not hesitate to contact us via email at levi@a2n.finance.

## License

This package is released under the BSL 1.1 License.
