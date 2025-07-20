const { expect } = require("chai");
const { ethers } = require("hardhat");
const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");

describe("Wallet", function () {
  async function deployWalletFixture() {
    const [owner, otherAccount] = await ethers.getSigners();
    const Wallet = await ethers.getContractFactory("Wallet");
    const wallet = await Wallet.deploy();
    await wallet.waitForDeployment(); // Wait for deployment to ensure address is available
    const ERC20Mock = await ethers.getContractFactory("ERC20Mock");
    const mockToken = await ERC20Mock.deploy(
      "MockToken", 
      "MOCK", 
      owner.address, 
      ethers.parseEther("1000")
    );
    // const mockToken = await ethers.deployContract("ERC20Mock", ["MockToken", "MOCK", owner.address, 1000]);
    return { wallet, mockToken, owner, otherAccount };
  }

  describe("Deposit and Withdrawal", function () {
    it("Should deposit and withdraw ERC20 tokens", async function () {
      const { wallet, mockToken, owner } = await loadFixture(deployWalletFixture);
      const walletAddress = await wallet.getAddress();
      // Deposit
      await mockToken.approve(walletAddress, 100);
      const tokenAddress = await mockToken.getAddress();
      await expect(wallet.depositToken(tokenAddress, 100))
        .to.emit(wallet, "Deposit")
        .withArgs(owner.address, 100);
      
      // Withdraw
      await expect(wallet.withdrawalToken(tokenAddress, 50))
        .to.emit(wallet, "TokensWithdrawn")
        .withArgs(tokenAddress, owner.address, 50);
    });

    it("Should revert if non-owner tries to withdraw", async function () {
      const { wallet, mockToken, otherAccount } = await loadFixture(deployWalletFixture);
      const tokenAddress = await mockToken.getAddress();

      await expect(wallet.connect(otherAccount).withdrawalToken(tokenAddress, 50))
        .to.be.revertedWith("not the owner");
    });

    it("Should revert if insufficient balance", async function () {
      const { wallet, mockToken } = await loadFixture(deployWalletFixture);
            const tokenAddress = await mockToken.getAddress();
      const tx = await expect(wallet.withdrawalToken(tokenAddress, 1000))
        .to.be.revertedWith("insufficient amount");
      const receipt = await tx.wait();
      console.log("Gas used for withdrawlToken():", receipt.gasUsed.toString());
    });
  });

  describe("ETH Handling", function () {
    it("Should receive ETH via receive()", async function () {
      const { wallet, owner } = await loadFixture(deployWalletFixture);
      const walletAddress = await wallet.getAddress();
      const tx = await owner.sendTransaction({ to: walletAddress, value: 100 });
      const receipt = await tx.wait();
      console.log("Gas used for receive():", receipt.gasUsed.toString());
      expect(await wallet.checkBalance()).to.equal(100);
    });

    it("Should increment count on fallback()", async function () {
      const { wallet, owner } = await loadFixture(deployWalletFixture);
      const walletAddress = await wallet.getAddress();
      const tx = await owner.sendTransaction({ to: walletAddress, data: "0x1234" }); // Invalid calldata triggers fallback
      expect(await wallet.count()).to.equal(1);
      console.log("Gas used for fallback:", receipt.gasUsed.toString());
      expect(await wallet.checkBalance()).to.equal(100);

    });
  });
});