const contractAddresses = require("./const/contractAddresses");
const { networks } = require("../networks");
const feeRate = 999;
task("deploy-pair-factory", "deploy PairFactory.sol").setAction(async (taskArgs, hre) => {
    const [deployer, user, admin] = await hre.ethers.getSigners();
    console.log("\n__Compiling Contracts__")
    await run("compile")
    console.log(`\nDeploying PairFactory.sol to ${network.name}...`)
    const factory = await ethers.getContractFactory("PairFactory",
        {
            libraries: {
                LinkedList: contractAddresses.linked_list,
            }
        }
    )
    const factoryContract = await factory.deploy(networks[network.name].sfsAddress, admin.address, admin.address, feeRate);
    await factoryContract.deployTransaction.wait(1)

    console.log(`\nFactory contract is deployed at ${factoryContract.address}`)
})