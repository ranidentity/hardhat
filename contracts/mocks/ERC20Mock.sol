// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract ERC20Mock is ERC20 {
    constructor(
        string memory name,
        string memory symbol,
        address initialAccount,
        uint256 initialSupply
    ) ERC20(name, symbol) {
        _mint(initialAccount, initialSupply);
    }

    function mint(address to, uint256 amount) public {
        _mint(to, amount);
    }
}