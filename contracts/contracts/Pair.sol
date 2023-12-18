// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";

import "./interfaces/IPair.sol";
import "./interfaces/IUser.sol";
import "./interfaces/ISFS.sol";

import "./libs/LinkedList.sol";
import "./libs/OrderNodeSet.sol";
import "./libs/BookNode.sol";

import "./SFSRegister.sol";

contract Pair is IPair, IUser, ISFS, Ownable {
  address public sfsAddress;
  address public feeReceiver;
  address public factory;
  address public tokenA;
  address public tokenB;
  uint16 public feeRate;
  uint256 public tokenAaccumulatedFee;
  uint256 public tokenBaccumulatedFee;

  // userAddress => (tokenAddress => tokenAmount)
  mapping(address => mapping(address => uint256)) deposits;
  // tokenAddress => price => orders[seller, amount]
  mapping(address => mapping(uint256 => LinkedList.List)) public orderBook;

  // OrderNodeSet.Node[]
  OrderNodeSet.Set private _sellOrders;
  OrderNodeSet.Set private _buyOrders;

  // BookNode.Node: [price, volume]
  BookNode.Node[] private _sellOB;
  BookNode.Node[] private _buyOB;

  // Modifiers
  modifier onlyTokenInPool(address _tokenAddress) {
    require(_tokenAddress == tokenA || _tokenAddress == tokenB, "NotInPool");
    _;
  }

  modifier priceMatchIndex(uint256 _priceIdx, uint32 _price) {
    require(_buyOB[_priceIdx].price == _price && _sellOB[_priceIdx].price == _price, "Price does not match the index");
    _;
  }

  constructor(
    address _tokenA,
    address _tokenB,
    address _admin,
    address _sfsAddress,
    address _feeReceiver,
    uint16 _feeRate
  ) {
    tokenA = _tokenA;
    tokenB = _tokenB;
    factory = msg.sender;
    feeRate = _feeRate; // 999 is 0.1% = (1000 - 999)/1000
    sfsAddress = _sfsAddress;
    feeReceiver = _feeReceiver;

    SFSRegister sfsContract = SFSRegister(_sfsAddress);
    sfsContract.register(_feeReceiver);
    _transferOwnership(_admin);
  }

  function changeReceiver(address _newReceiver) external override onlyOwner returns (bool) {
    require(feeReceiver != _newReceiver, "feeReceiver==_newReceiver");
    require(_newReceiver != address(0), "address(0)");
    feeReceiver = _newReceiver;
    SFSRegister sfsContract = SFSRegister(sfsAddress);
    sfsContract.register(_newReceiver);
    return true;
  }

  function changeSFSAddress(address _newSFSAddress) external override onlyOwner returns (bool) {
    require(sfsAddress != _newSFSAddress, "sfsAddress==_newSFSAddress");
    require(_newSFSAddress != address(0), "address(0)");
    sfsAddress = _newSFSAddress;
    SFSRegister sfsContract = SFSRegister(_newSFSAddress);
    sfsContract.register(feeReceiver);
    return true;
  }

  function changeFeeRate(uint16 _feeRate) external override onlyOwner returns (bool) {
    require(feeRate != _feeRate, "feeRate==_feeRate");
    feeRate = _feeRate;
    return true;
  }

  function _deposit(address _tokenAddress, uint256 _amount) private onlyTokenInPool(_tokenAddress) returns (bool) {
    IERC20(_tokenAddress).transferFrom(msg.sender, address(this), _amount);
    deposits[msg.sender][_tokenAddress] += _amount;
    return true;
  }

  function _withdraw(address _tokenAddress, uint256 _amount) private onlyTokenInPool(_tokenAddress) returns (bool) {
    require(deposits[msg.sender][_tokenAddress] >= _amount, "ExceedsAmount");
    IERC20(_tokenAddress).transfer(msg.sender, _amount);
    deposits[msg.sender][_tokenAddress] -= _amount;
    return true;
  }

  function getDeposits(
    address _account,
    address _token
  ) external view override onlyTokenInPool(_token) returns (uint256) {
    return deposits[_account][_token];
  }

  function newSellOrder(
    uint32 _price,
    uint256 _sellAmount,
    uint256 _priceIdx
  ) external override priceMatchIndex(_priceIdx, _price) returns (bool) {
    _deposit(tokenA, _sellAmount);
    // Calculate fee and adjust
    uint256 currentFee = (_sellAmount * (1000 - feeRate)) / 1000;
    tokenAaccumulatedFee += currentFee;
    deposits[msg.sender][tokenA] -= currentFee;
    _sellAmount -= currentFee;
    if (_sellAmount == 0) {
      return true;
    }
    uint256 len = orderBook[tokenB][_price].length;
    for (uint8 i = 0; i < len; i++) {
      bytes32 head_ = orderBook[tokenB][_price].head;
      LinkedList.Order memory o = orderBook[tokenB][_price].nodes[head_].order;
      uint256 buyAmount = o.amount;

      if (o.seller == msg.sender) {
        continue;
      } else if ((_price * _sellAmount) >= (buyAmount * 100)) {
        // sell amount >= buy amount, notes: price = origin price with decimals 2 * 100
        LinkedList.popHead(orderBook[tokenB][_price]);
        OrderNodeSet._remove(_buyOrders, o.seller, head_);
        BookNode._subVolume(_buyOB, _priceIdx, o.amount);

        deposits[o.seller][tokenB] -= o.amount;
        deposits[msg.sender][tokenA] -= (o.amount / _price) * 100;
        IERC20(tokenB).transfer(msg.sender, o.amount);
        IERC20(tokenA).transfer(o.seller, (o.amount / _price) * 100);
        _sellAmount -= (o.amount / _price) * 100;
      } else if (buyAmount * 100 > (_price * _sellAmount)) {
        uint256 amount = (_price * _sellAmount) / 100;
        orderBook[tokenB][_price].nodes[head_].order.amount -= amount;
        OrderNodeSet._subVolume(_buyOrders, o.seller, head_, amount);
        BookNode._subVolume(_buyOB, _priceIdx, amount);

        deposits[o.seller][tokenB] -= amount;
        deposits[msg.sender][tokenA] -= _sellAmount;
        IERC20(tokenB).transfer(msg.sender, amount);
        IERC20(tokenA).transfer(o.seller, _sellAmount);
        _sellAmount = 0;
      }
    }
    // new sell order
    if (_sellAmount > 0) {
      bytes32 orderId = 0;
      if (orderBook[tokenA][_price].length == 0) {
        orderId = LinkedList.initHead(orderBook[tokenA][_price], msg.sender, _sellAmount);
      } else {
        orderId = LinkedList.addNode(orderBook[tokenA][_price], msg.sender, _sellAmount);
      }

      OrderNodeSet._add(_sellOrders, msg.sender, orderId, _price, _sellAmount);
      BookNode._addVolume(_sellOB, _priceIdx, _sellAmount);
    }

    return true;
  }

  function getAllSellOrders(uint32 _price) external view override returns (LinkedList.Order[] memory) {
    LinkedList.Order[] memory orders = new LinkedList.Order[](orderBook[tokenA][_price].length);

    bytes32 currId = orderBook[tokenA][_price].head;

    for (uint256 i = 0; i < orderBook[tokenA][_price].length; i++) {
      orders[i] = orderBook[tokenA][_price].nodes[currId].order;
      currId = orderBook[tokenA][_price].nodes[currId].next;
    }
    return orders;
  }

  function activeSellOrders() external view override returns (OrderNodeSet.Node[] memory) {
    OrderNodeSet.Node[] memory sellOrders = new OrderNodeSet.Node[](_sellOrders.orders[msg.sender].length);

    for (uint256 i = 0; i < _sellOrders.orders[msg.sender].length; i++) {
      sellOrders[i] = _sellOrders.orders[msg.sender][i];
    }
    return sellOrders;
  }

  function deleteSellOrder(
    uint32 _price,
    bytes32 _orderId,
    uint256 _priceIdx
  ) external override priceMatchIndex(_priceIdx, _price) returns (bool) {
    LinkedList.Order memory o = orderBook[tokenA][_price].nodes[_orderId].order;
    require(msg.sender == o.seller, "Seller does not match the caller");

    _withdraw(tokenA, o.amount);

    LinkedList.deleteNode(orderBook[tokenA][_price], _orderId);
    OrderNodeSet._remove(_sellOrders, msg.sender, _orderId);
    BookNode._subVolume(_sellOB, _priceIdx, o.amount);

    return true;
  }

  function newBuyOrder(
    uint32 _price,
    uint256 _buyAmount,
    uint256 _priceIdx
  ) external override priceMatchIndex(_priceIdx, _price) returns (bool) {
    // no fee under 1000
    _deposit(tokenB, (_price * _buyAmount) / 100);
    uint256 currentFee = ((_price * (_buyAmount * (1000 - feeRate))) / 1000) / 100;
    tokenBaccumulatedFee += currentFee;
    deposits[msg.sender][tokenB] -= currentFee;
    _buyAmount -= (_buyAmount * (1000 - feeRate)) / 1000;
    if (_buyAmount == 0) {
      return true;
    }
    uint256 len = orderBook[tokenA][_price].length;
    for (uint8 i = 0; i < len; i++) {
      bytes32 head_ = orderBook[tokenA][_price].head;
      LinkedList.Order memory o = orderBook[tokenA][_price].nodes[head_].order;
      uint256 sellAmount = o.amount;

      if (o.seller == msg.sender) {
        continue;
      } else if (_buyAmount >= sellAmount) {
        // buy amount >= sell amount
        LinkedList.popHead(orderBook[tokenA][_price]);
        OrderNodeSet._remove(_sellOrders, o.seller, head_);
        BookNode._subVolume(_sellOB, _priceIdx, o.amount);
        uint256 amount = (_price * o.amount) / 100;
        deposits[o.seller][tokenA] -= o.amount;
        deposits[msg.sender][tokenB] -= amount;
        IERC20(tokenA).transfer(msg.sender, o.amount);
        IERC20(tokenB).transfer(o.seller, amount);
        _buyAmount -= o.amount;
      } else if (sellAmount > _buyAmount) {
        orderBook[tokenA][_price].nodes[head_].order.amount -= _buyAmount;
        OrderNodeSet._subVolume(_sellOrders, o.seller, head_, _buyAmount);
        BookNode._subVolume(_sellOB, _priceIdx, _buyAmount);
        uint256 amount = (_price * _buyAmount) / 100;
        deposits[o.seller][tokenA] -= _buyAmount;
        deposits[msg.sender][tokenB] -= amount;
        IERC20(tokenA).transfer(msg.sender, _buyAmount);
        IERC20(tokenB).transfer(o.seller, amount);
        _buyAmount = 0;
      }
    }
    // new buy order
    if (_buyAmount > 0) {
      bytes32 orderId = 0;
      if (orderBook[tokenB][_price].length == 0) {
        orderId = LinkedList.initHead(orderBook[tokenB][_price], msg.sender, (_price * _buyAmount) / 100);
      } else {
        orderId = LinkedList.addNode(orderBook[tokenB][_price], msg.sender, (_price * _buyAmount) / 100);
      }

      OrderNodeSet._add(_buyOrders, msg.sender, orderId, _price, (_price * _buyAmount) / 100);
      BookNode._addVolume(_buyOB, _priceIdx, (_price * _buyAmount) / 100);
    }

    return true;
  }

  function deleteBuyOrder(
    uint32 _price,
    bytes32 _orderId,
    uint256 _priceIdx
  ) external override priceMatchIndex(_priceIdx, _price) returns (bool) {
    LinkedList.Order memory o = orderBook[tokenB][_price].nodes[_orderId].order;
    require(msg.sender == o.seller, "Seller does not match the caller");

    _withdraw(tokenB, o.amount);

    LinkedList.deleteNode(orderBook[tokenB][_price], _orderId);
    OrderNodeSet._remove(_buyOrders, msg.sender, _orderId);
    BookNode._subVolume(_buyOB, _priceIdx, o.amount);

    return true;
  }

  function getAllBuyOrders(uint32 _price) external view override returns (LinkedList.Order[] memory) {
    LinkedList.Order[] memory orders = new LinkedList.Order[](orderBook[tokenB][_price].length);

    bytes32 currId = orderBook[tokenB][_price].head;

    for (uint256 i = 0; i < orderBook[tokenB][_price].length; i++) {
      orders[i] = orderBook[tokenB][_price].nodes[currId].order;
      currId = orderBook[tokenB][_price].nodes[currId].next;
    }
    return orders;
  }

  function activeBuyOrders() external view override returns (OrderNodeSet.Node[] memory) {
    OrderNodeSet.Node[] memory buyOrders = new OrderNodeSet.Node[](_buyOrders.orders[msg.sender].length);

    for (uint256 i = 0; i < _buyOrders.orders[msg.sender].length; i++) {
      buyOrders[i] = _buyOrders.orders[msg.sender][i];
    }
    return buyOrders;
  }

  function getBookNodes() external view override returns (BookNode.Node[] memory, BookNode.Node[] memory) {
    return (_sellOB, _buyOB);
  }

  function initBookNode(uint32 _price) external override returns (uint256) {
    if (orderBook[tokenA][_price].tail == "" && orderBook[tokenB][_price].tail == "") {
      orderBook[tokenA][_price].tail = "1"; // placeholder
      _sellOB.push(BookNode.Node(_price, 0));
      _buyOB.push(BookNode.Node(_price, 0));
      return _buyOB.length - 1;
    }
    revert("Price already exist in orderbook");
  }

  function getIndexOfPrice(uint32 _price) external view override returns (uint256) {
    for (uint256 i = 0; i < _sellOB.length; i++) {
      if (_sellOB[i].price == _price) {
        return i;
      }
    }
    revert("Price is not in the array");
  }

  function collectFees() external override returns (bool) {
    IERC20(tokenA).transfer(msg.sender, tokenAaccumulatedFee);
    IERC20(tokenB).transfer(msg.sender, tokenBaccumulatedFee);
    tokenAaccumulatedFee = 0;
    tokenBaccumulatedFee = 0;
    return true;
  }
}
