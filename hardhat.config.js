require("dotenv").config();

require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */

 const COINMARKETCAP_API_KEY = process.env.COINMARKETCAP_API_KEY || ""
 const RINKEBY_RPC_URL =
     process.env.RINKEBY_RPC_URL ||
     "https://eth-mainnet.alchemyapi.io/v2/your-api-key"
 const PRIVATE_KEY =
     process.env.PRIVATE_KEY ||
     "0x11ee3108a03081fe260ecdc106554d09d9d1209bcafd46942b10e02943effc4a"
 const ETHERSCAN_API_KEY = process.env.ETHERSCAN_API_KEY || ""

module.exports = {
  // solidity: "0.8.8",
  solidity: {
    compilers: [{ version: "0.8.8"}, { version: "0.6.6"}]
  },
  defaultNetwork: "hardhat",
  networks: {
    rinkeby: {
      url: RINKEBY_RPC_URL || "",
      accounts:
        PRIVATE_KEY !== undefined ? [PRIVATE_KEY] : [],
        chainId: 4,
        blockConfirmations: 6,
        gas: 2100000,
        gasPrice: 8000000000
    },
  },
  gasReporter: {
    enabled: true,
    currency: "USD",
    outputFile: "gas-report.txt",
    noColors: true,
    coinmarketcap: COINMARKETCAP_API_KEY,
    token: "ETH"
},
  etherscan: {
    apiKey: ETHERSCAN_API_KEY,
  },
  namedAccounts: {
    deployer: {
      default: 0
    }
  }
};
