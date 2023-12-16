// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IUser {
  function getDeposits(address _account, address _token) external view returns (uint256);

  function newSellOrder(uint32 _price, uint256 _sellAmount, uint256 _priceIdx) external returns (bool);

  function deleteSellOrder(uint32 _price, bytes32 _orderId, uint256 _priceIdx) external returns (bool);

  function newBuyOrder(uint32 _price, uint256 _buyAmount, uint256 _priceIdx) external returns (bool);

  function deleteBuyOrder(uint32 _price, bytes32 _orderId, uint256 _priceIdx) external returns (bool);
}
