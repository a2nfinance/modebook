const { BigNumber } = require("ethers");
const contractAddresses = require("./const/contractAddresses");
const buyPrice = 2000 * 100 // $2000 x 100 cents
task("new-buy-order", "new buy order of pair: weth-usdm").setAction(async (taskArgs, hre) => {

    const [deployer, user, admin] = await hre.ethers.getSigners();
    const usdm = await ethers.getContractFactory("USDM", {
        signer: user
    });
    const usdmContract = await usdm.attach(contractAddresses.usdm);

   

    const pair = await ethers.getContractFactory("Pair", {
        signer: user,
        libraries: {
            LinkedList: contractAddresses.linked_list,
        }
    });
    const pairContract = await pair.attach(contractAddresses.weth_usdm);
    const index = await pairContract.getIndexOfPrice(buyPrice);

    await usdmContract.approve(contractAddresses.weth_usdm, BigNumber.from(buyPrice / 100).mul(ethers.utils.parseUnits("0.1", 18)));

    const createBuyOrderTx = await pairContract.newBuyOrder(
        // price
        buyPrice,
        // buy amount
        ethers.utils.parseUnits("0.1", 18),
        // index
        index
    );

    await createBuyOrderTx.wait(1);

    console.log(`\nNew buy order at pair ${contractAddresses.weth_usdm} with transaction hash ${createBuyOrderTx.hash}`)

})