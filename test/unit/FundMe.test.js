const { deployments, ethers, getNamedAccounts } = require("hardhat");
const {assert, expect} = require("chai")
const { developmentChains } = require("../../helper-hardhat-config.js")
!developmentChains.includes(network.name)
    ? describe.skip
    : describe("FundMe", () => {
    let fundMe;
    let deployer;
    let MockV3Aggregator;
    const sendValue = ethers.utils.parseEther("1")
    beforeEach(async()=>{
        deployer = (await getNamedAccounts()).deployer;
        await deployments.fixture(["all"]);
        fundMe = await ethers.getContract("FundMe", deployer);
        MockV3Aggregator = await ethers.getContract("MockV3Aggregator", deployer);
    })
    describe("constructor", ()=>{
        it("sets aggregator address", async ()=>{
          const response = await fundMe.s_priceFeed()
          assert.equal(response, MockV3Aggregator.address)
        })
        it("Fails when you dont send enough ETH", async()=>{
            await expect(fundMe.fund()).to.be.reverted
        })
        it("Updates s_addressToAmountFunded correctly", async()=>{
            console.log(sendValue);
            await fundMe.fund({value: sendValue})
            const response = await fundMe.s_addressToAmountFunded(
                deployer
            )
            assert(response.toString(), sendValue.toString())
        })
        it("Adds funder to array of s_funders", async () => {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.s_funders(0)
            assert.equal(response, deployer)
        })
    })
    describe("withdraw", async()=>{
        beforeEach(async()=>{
            await fundMe.fund({value: sendValue})
        })
        it("withdraws ETH from a single founder", async()=>{
            // Arrange
            const startingFundMeBalance =
            await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer)
            // Act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer) 

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
        it("withdraws ETH cheaper from a single founder", async()=>{
            // Arrange
            const startingFundMeBalance =
            await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer)
            // Act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer) 

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
        })
        it("Withdraws ETH from multiple s_funders", async()=>{
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                connectedAccount = await fundMe.connect(accounts[i])
                await connectedAccount.fund({ value: sendValue})
            }
            const startingFundMeBalance =
            await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer)
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer) 

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
            await expect(fundMe.s_funders(0)).to.be.reverted
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(
                        accounts[i].address
                    ),
                    0
                )
            }
        })
        it("Withdraws ETH cheaper from multiple s_funders", async()=>{
            const accounts = await ethers.getSigners()
            for (let i = 1; i < 6; i++) {
                connectedAccount = await fundMe.connect(accounts[i])
                await connectedAccount.fund({ value: sendValue})
            }
            const startingFundMeBalance =
            await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance =
            await fundMe.provider.getBalance(deployer)
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait()
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const gasCost = gasUsed.mul(effectiveGasPrice)
            const endingFundMeBalance = await fundMe.provider.getBalance(
                fundMe.address
            )
            const endingDeployerBalance =
                await fundMe.provider.getBalance(deployer) 

            // Assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(startingFundMeBalance.add(startingDeployerBalance).toString(), endingDeployerBalance.add(gasCost).toString())
            await expect(fundMe.s_funders(0)).to.be.reverted
            for (i = 1; i < 6; i++) {
                assert.equal(
                    await fundMe.s_addressToAmountFunded(
                        accounts[i].address
                    ),
                    0
                )
            }
        })
        it("Only allows the owner to withdraw", async function () {
            const accounts = await ethers.getSigners()
            const fundMeConnectedContract = await fundMe.connect(
                accounts[1]
            )
            await expect(
                fundMeConnectedContract.withdraw()
            ).to.be.revertedWith("FundMe__NotOwner")
        })
    })
})