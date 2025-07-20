// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

contract Wallet{
    using SafeERC20 for IERC20;
    uint public count = 0;
    address public immutable owner;
    
    event Deposit(address from, uint amount);
    event TokensWithdrawn(address indexed token, address indexed to, uint256 amount);

    constructor(){
        owner=msg.sender;
    }

    receive() external payable{}
    fallback() external payable{
        count++;
    }

    function checkBalance() public view returns(uint){
        return address(this).balance;
    }

    function depositToken(address _tokenAddress, uint amount) public{
        require(amount > 0,"amount must be more than 0");
        IERC20(_tokenAddress).safeTransferFrom(msg.sender, address(this), amount);
        emit Deposit(msg.sender, amount);
    }
    
    // involve 3 variables:  token type(address), requester, amount
    function withdrawalToken(address _tokenAddress, uint amount) public{
        require(msg.sender == owner, "not the owner");
        require(IERC20(_tokenAddress).balanceOf(address(this))>= amount,"insufficient amount");
        IERC20(_tokenAddress).safeTransfer(msg.sender,amount);
        emit TokensWithdrawn(_tokenAddress,msg.sender,amount);
    }


}