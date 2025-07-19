const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("Counter", function () {
  it("Should increment the count", async function () {
    const Counter = await ethers.getContractFactory("Counter");
    const counter = await Counter.deploy();
    await counter.waitForDeployment();

    expect(await counter.count()).to.equal(0);
    
    await counter.increment();
    expect(await counter.count()).to.equal(1);
  });
});
