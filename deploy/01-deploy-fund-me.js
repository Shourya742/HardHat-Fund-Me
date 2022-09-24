//import
// main function
// calling of main function

const { network } = require("hardhat")
const { networkConfig, developmentChain } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// async function deployFunc() {
//     console.log("Hi!")
// }

// module.exports.default = deployFunc

module.exports = async ({ getNamedAccounts, deployments }) => {
    //const {getNamedAccounts,deployments} = hre;
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    // const now = await deployments.all()
    // console.log(now)
    const chainId = network.config.chainId
    let ethUsdPriceFeedAddress
    // if Chain Id is X use address Y
    if (developmentChain.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }
    // IF the contract doesnt exist , we deploy minimal version for our local testing

    // well what happens when we want to change chains?
    // When going to localhost ot hardhat network we want to use mocks
    const args = [ethUsdPriceFeedAddress]
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: args, //put price feed address,
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })
    if (
        !developmentChain.includes(network.name) &&
        process.env.ETHERSCAN_API_KEY
    ) {
        ///verify
        await verify(fundMe.address, args)
    }
    log("-------------------------------------")
}
module.exports.tags = ["all", "fundme"]
