const contractAddresses = require("./const/contractAddresses");
const buyPrice = 2000 * 100 // $2000 x 100 cents
task("get-all-buy-orders", "get all buy order of pair: weth-usdm").setAction(async (taskArgs, hre) => {
    const pair = await ethers.getContractFactory("Pair", {
        libraries: {
            LinkedList: contractAddresses.linked_list,
        }
    });
    const pairContract = await pair.attach(contractAddresses.weth_usdm);
    const orders = await pairContract.getAllBuyOrders(buyPrice);

    console.log("Buy Orders:", orders);

})