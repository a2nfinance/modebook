// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IPairFactory {
  event CreatePair(address pair);
  
  event RemovePair(uint256 index);

  function createPair(address _tokenA, address _tokenB) external returns (address);

  function countPairs() external view returns (uint256);

  function changeFeeRate(uint16 _feeRate) external returns (bool);

  function removePair(uint256 _index) external returns (uint256);

}
