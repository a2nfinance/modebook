// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "../libs/LinkedList.sol";
import "../libs/OrderNodeSet.sol";
import "../libs/BookNode.sol";

interface IPair {
  
  function getAllSellOrders(uint32 _price) external view returns (LinkedList.Order[] memory);

  function activeSellOrders() external view returns (OrderNodeSet.Node[] memory);

  function getAllBuyOrders(uint32 price) external view returns (LinkedList.Order[] memory);

  function activeBuyOrders() external view returns (OrderNodeSet.Node[] memory);

  function getBookNodes() external view returns (BookNode.Node[] memory, BookNode.Node[] memory);

  function initBookNode(uint32 _price) external returns (uint256);

  function getIndexOfPrice(uint32 _price) external view returns (uint256);

  function collectFees() external returns (bool);

  function changeFeeRate(uint16 _feeRate) external returns (bool);
}
