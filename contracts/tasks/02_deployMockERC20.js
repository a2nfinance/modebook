const { networks } = require("../networks");

const feeRate = 999;

task("deploy-erc20", "deploy ERC20 contracts").setAction(async (taskArgs, hre) => {

    console.log(`\nDeploying USDM.sol to ${network.name}...`)
    const usdm = await ethers.getContractFactory("USDM");
    const usdmContract = await usdm.deploy("USDM MB", "USDM");
    await usdmContract.deployTransaction.wait(1)
    console.log(`\nUSDM contract is deployed to at ${usdmContract.address}`)

    console.log(`\nDeploying WETH.sol to ${network.name}...`)
    const weth = await ethers.getContractFactory("WETH");
    const wethContract = await weth.deploy("WETH MB", "WETH");
    await wethContract.deployTransaction.wait(1)
    console.log(`\nWETH contract is deployed to at ${wethContract.address}`)

})