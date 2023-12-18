const contractAddresses = require("./const/contractAddresses");

task("init-book-node", "init a book node with price: weth-usdm").setAction(async (taskArgs, hre) => {

    const [deployer, user, admin] = await hre.ethers.getSigners();

    const pair = await ethers.getContractFactory("Pair", {
        signer: admin,
        libraries: {
            LinkedList: contractAddresses.linked_list,
        }
    });
    const pairContract = await pair.attach(contractAddresses.weth_usdm);
    // $2000 * 100 cents
    const initPriceIndexTx = await pairContract.initBookNode(2000 * 100);

    await initPriceIndexTx.wait(1);

    console.log(`\nInit price index to ${pairContract.address} with transaction hash ${initPriceIndexTx.hash}`)

})