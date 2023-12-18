const contractAddresses = require("./const/contractAddresses");
const sellPrice = 2000 * 100;
task("new-sell-order", "new sell order of pair: weth-usdm").setAction(async (taskArgs, hre) => {

    const [deployer, user, admin] = await hre.ethers.getSigners();

    const usdm = await ethers.getContractFactory("WETH", {
        signer: deployer
    });

    const wethContract = await usdm.attach(contractAddresses.weth);

    const pair = await ethers.getContractFactory("Pair", {
        signer: deployer,
        libraries: {
            LinkedList: contractAddresses.linked_list,
        }
    });
    const pairContract = await pair.attach(contractAddresses.weth_usdm);
    const index = await pairContract.getIndexOfPrice(sellPrice);

    await wethContract.approve(contractAddresses.weth_usdm, ethers.utils.parseUnits("0.2", 18));

    const createSellOrderTx = await pairContract.newSellOrder(
        // price
        sellPrice,
        // sell amount
        ethers.utils.parseUnits("0.2", 18),
        // index
        index
    );

    await createSellOrderTx.wait(1);

    console.log(`\nNew sell order at pair ${contractAddresses.weth_usdm} with transaction hash ${createSellOrderTx.hash}`)

})