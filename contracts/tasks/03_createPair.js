const contractAddresses = require("./const/contractAddresses");

task("create-pair", "new pair weth-usdm").setAction(async (taskArgs, hre) => {

    const [deployer, user, admin] = await hre.ethers.getSigners();

    const factory = await ethers.getContractFactory("PairFactory", {
        signer: admin,
        libraries: {
            LinkedList: contractAddresses.linked_list,
        }
    });
    const factoryContract = await factory.attach(contractAddresses.factory);

    const createPairTx = await factoryContract.createPair(contractAddresses.weth, contractAddresses.usdm);

    await createPairTx.wait(1);

    console.log(`\nNew pair is deployed to ${network.name} with transaction hash ${createPairTx.hash}`)

})