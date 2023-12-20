// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// OrderNodeSet stores a set of users' order
// and map orders to price indexes
library OrderNodeSet {
  struct Node {
    bytes32 orderId;
    uint32 price;
    uint256 volume;
  }

  struct Set {
    // UserAddress => Node[]
    mapping(address => Node[]) orders;
    // OrderId =>  Index
    mapping(bytes32 => uint256) indexes;
  }

  // Whether an order id existed.
  function _contains(Set storage _set, bytes32 _orderId) internal view returns (bool) {
    // 0 is a sentinel value
    return _set.indexes[_orderId] != 0;
  }

  // Get an order by index
  function _at(Set storage _set, address _user, uint256 _index) internal view returns (Node memory) {
    return _set.orders[_user][_index];
  }

  // New user order.
  function _add(
    Set storage _set,
    address _user,
    bytes32 _orderId,
    uint32 _price,
    uint256 _volume
  ) internal returns (bool) {
    if (!_contains(_set, _orderId)) {
      _set.orders[_user].push(Node(_orderId, _price, _volume));
      _set.indexes[_orderId] = _set.orders[_user].length;
      // The value is stored at length-1, but we add 1 to all indexes
      // and use 0 as a sentinel value
      return true;
    } else {
      return false;
    }
  }

  // Remove an user's an order.
  function _remove(Set storage _set, address _user, bytes32 _orderId) internal returns (bool) {
    uint256 orderIndex = _set.indexes[_orderId];

    if (orderIndex != 0) {
      uint256 toDeleteIndex = orderIndex - 1;
      uint256 lastIndex = _set.orders[_user].length - 1;

      if (lastIndex != toDeleteIndex) {
        Node memory lastNode = _set.orders[_user][lastIndex];

        // Move the last value to the index where the value to delete is
        _set.orders[_user][toDeleteIndex] = lastNode;
        // Update the index for the moved value
        _set.indexes[lastNode.orderId] = orderIndex; // Replace lastvalue's index to valueIndex
      }

      // Delete the slot where the moved value was stored
      _set.orders[_user].pop();

      // Delete the index for the deleted slot
      delete _set.indexes[_orderId];

      return true;
    } else {
      return false;
    }
  }

  // Change volume of an order
  function _addVolume(Set storage _set, address _user, bytes32 _orderId, uint256 _volume) internal returns (bool) {
    uint256 orderIndex = _set.indexes[_orderId];

    if (orderIndex != 0) {
      _set.orders[_user][orderIndex - 1].volume += _volume;
      return true;
    } else {
      return false;
    }
  }

  // Change volume of an order
  function _subVolume(Set storage _set, address _user, bytes32 _orderId, uint256 _volume) internal returns (bool) {
    uint256 orderIndex = _set.indexes[_orderId];

    if (orderIndex != 0) {
      if (_set.orders[_user][orderIndex - 1].volume >= _volume) {
        _set.orders[_user][orderIndex - 1].volume -= _volume;
      } else {
        _set.orders[_user][orderIndex - 1].volume = 0;
      }

      return true;
    } else {
      return false;
    }
  }
}
