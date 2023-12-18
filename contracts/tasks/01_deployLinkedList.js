const { networks } = require("../networks");

task("deploy-linked-list", "deploy  LinkedList.sol").setAction(async (taskArgs, hre) => {
    console.log("\n__Compiling Contracts__")
    await run("compile")

    const LinkedList = await ethers.getContractFactory("LinkedList");
    const LinkedListContract = await LinkedList.deploy();

    await LinkedListContract.deployTransaction.wait(1)
    console.log(`\nLinked List contract is deployed to at ${LinkedListContract.address}`)

})