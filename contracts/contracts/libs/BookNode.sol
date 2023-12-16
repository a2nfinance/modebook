// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

library BookNode {
  struct Node {
    uint32 price;
    uint256 volume;
  }

  function _addVolume(Node[] storage _book, uint256 _index, uint256 _volume) internal returns (bool) {
    _book[_index].volume += _volume;
    return true;
  }

  function _subVolume(Node[] storage _book, uint256 _index, uint256 _volume) internal returns (bool) {
    if (_book[_index].volume >= _volume) {
      _book[_index].volume -= _volume;
    } else {
      _book[_index].volume = 0;
    }

    return true;
  }
}
