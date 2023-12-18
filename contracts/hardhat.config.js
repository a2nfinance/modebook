require("@nomicfoundation/hardhat-toolbox")
require("hardhat-contract-sizer")
require("@openzeppelin/hardhat-upgrades")
require("./tasks")
require("dotenv").config()
const { networks } = require("./networks")

// Enable gas reporting (optional)
const REPORT_GAS = process.env.REPORT_GAS?.toLowerCase() === "true" ? true : false

const SOLC_SETTINGS = {
  optimizer: {
    enabled: true,
    runs: 1_000,
  },
}

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  defaultNetwork: "hardhat",
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.8.7",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.6.6",
        settings: SOLC_SETTINGS,
      },
      {
        version: "0.4.24",
        settings: SOLC_SETTINGS,
      },
    ],
  },
  networks: {
    hardhat: {
      allowUnlimitedContractSize: true,
      accounts: process.env.PRIVATE_KEY
        ? [
          {
            privateKey: process.env.PRIVATE_KEY,
            balance: "10000000000000000000000",
          },
        ]
        : [],
    },
    ...networks,
  },
  etherscan: {
    // npx hardhat verify --network <NETWORK> <CONTRACT_ADDRESS> <CONSTRUCTOR_PARAMETERS>
    // to get exact network names: npx hardhat verify --list-networks
    apiKey: {
      mode_sepolia: networks.mode_sepolia.verifyApiKey
    },
    customChains: [
      {
        network: "mode_sepolia",
        chainId: 919,
        urls: {
          apiURL: "https://sepolia.explorer.mode.network/api",
          browserURL: "https://sepolia.explorer.mode.network"
        }
      }
    ]
  },
  gasReporter: {
    enabled: REPORT_GAS,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
  },
  contractSizer: {
    runOnCompile: false,
    only: [],
  },
  paths: {
    sources: "./contracts",
    tests: "./test",
    cache: "./build/cache",
    artifacts: "./build/artifacts",
  }
}