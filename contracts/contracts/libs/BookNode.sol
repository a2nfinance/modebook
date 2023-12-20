// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// A booknode stores a price index and it's volume
library BookNode {
  struct Node {
    uint32 price;
    uint256 volume;
  }

  // Add volume
  function _addVolume(Node[] storage _book, uint256 _index, uint256 _volume) internal returns (bool) {
    _book[_index].volume += _volume;
    return true;
  }

  // Reduce volume
  function _subVolume(Node[] storage _book, uint256 _index, uint256 _volume) internal returns (bool) {
    if (_book[_index].volume >= _volume) {
      _book[_index].volume -= _volume;
    } else {
      _book[_index].volume = 0;
    }

    return true;
  }
}
