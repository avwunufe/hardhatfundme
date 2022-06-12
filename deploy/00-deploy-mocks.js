const { network } = require("hardhat");
const { developmentChains, DECIMALS, INITIAL_ANSWER } = require("../helper-hardhat-config")

// const DECIMALS = "8"
// const INITIAL_PRICE = "200000000000" // 2000
module.exports = async ({ getNamedAccounts, deployments }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId
    // If we are on a local develohelppment network, we need to deploy mocks!
    if(developmentChains.includes(network.name)){
        log("Deploying mocks")
        await deploy("MockV3Aggregator", {
            contract: "MockV3Aggregator",
                from: deployer,
                log: true,
                args: [DECIMALS, INITIAL_ANSWER]
        })
        log("_____________________________________________________")
    }
}
module.exports.tags = ["all", "mocks"]