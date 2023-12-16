// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface ISFS {
  function changeReceiver(address _newReceiver) external returns (bool);

  function changeSFSAddress(address _newSFSAddress) external returns (bool);
}
