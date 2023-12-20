// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IPairFactory.sol";
import "./interfaces/ISFS.sol";
import "./Pair.sol";
import "./SFSRegister.sol";

/**
 * @title PairFactory contract
 * @author levia2n
 * @notice to manage token pairs.
 */
contract PairFactory is IPairFactory, ISFS, Ownable {
  address public sfsAddress;
  address public feeReceiver;
  uint16 public feeRate;
  mapping(address => mapping(address => address)) public pairMap;
  address[] public allPairs;

  /**
   *
   * @param _sfsAddress Mode SFS contract address
   * @param _admin admin account
   * @param _receiver fee receiver address
   * @param _feeRate fee rate
   */
  constructor(address _sfsAddress, address _admin, address _receiver, uint16 _feeRate) {
    sfsAddress = _sfsAddress;
    feeRate = _feeRate;
    feeReceiver = _receiver;
    SFSRegister sfsContract = SFSRegister(_sfsAddress);
    sfsContract.register(_receiver);
    _transferOwnership(_admin);
  }

  // Only the admin can change
  function changeReceiver(address _newReceiver) external override onlyOwner returns (bool) {
    require(feeReceiver != _newReceiver, "feeReceiver==_newReceiver");
    require(_newReceiver != address(0), "address(0)");
    feeReceiver = _newReceiver;
    SFSRegister sfsContract = SFSRegister(sfsAddress);
    sfsContract.register(_newReceiver);
    return true;
  }

  // Only the admin can change
  function changeSFSAddress(address _newSFSAddress) external override onlyOwner returns (bool) {
    require(sfsAddress != _newSFSAddress, "sfsAddress==_newSFSAddress");
    require(_newSFSAddress != address(0), "address(0)");
    sfsAddress = _newSFSAddress;
    SFSRegister sfsContract = SFSRegister(_newSFSAddress);
    sfsContract.register(feeReceiver);
    return true;
  }

  // Only the admin can change
  function changeFeeRate(uint16 _feeRate) external override onlyOwner returns (bool) {
    require(feeRate != _feeRate, "feeRate==_feeRate");
    feeRate = _feeRate;
    return true;
  }

  // Create a new token pair
  function createPair(address _tokenA, address _tokenB) external override onlyOwner returns (address pair) {
    require(_tokenA != _tokenB, "tokenA==tokenB");
    require(_tokenA != address(0), "TokenA:0x0");
    require(pairMap[_tokenA][_tokenB] == address(0), "Existed");

    pair = address(new Pair(_tokenA, _tokenB, owner(), sfsAddress, feeReceiver, feeRate));

    pairMap[_tokenA][_tokenB] = pair;
    pairMap[_tokenB][_tokenA] = pair;
    allPairs.push(pair);

    emit CreatePair(pair);
    return pair;
  }

  function countPairs() external view override returns (uint256) {
    return allPairs.length;
  }

  // Remove pair
  // Not implemented
  function removePair(uint256 _index) external override onlyOwner returns (uint256) {}
}
