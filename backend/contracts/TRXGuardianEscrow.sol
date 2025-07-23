// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract TRXGuardianEscrow {
    address public owner;
    address public admin;
    IERC20 public usdtToken;
    
    uint256 public commissionRate = 500; // 0.5% = 500 / 100000
    uint256 public constant COMMISSION_DENOMINATOR = 100000;
    
    enum OrderStatus { Active, Locked, Completed, Disputed, Cancelled }
    
    struct EscrowOrder {
        string orderId;
        address buyer;
        address seller;
        uint256 amount;
        uint256 commission;
        OrderStatus status;
        uint256 createdAt;
        uint256 expiresAt;
        bool buyerConfirmed;
        bool sellerConfirmed;
        string disputeReason;
    }
    
    mapping(string => EscrowOrder) public orders;
    mapping(address => uint256) public userReputation;
    mapping(address => uint256) public totalTrades;
    mapping(address => bool) public authorizedArbitrators;
    
    event OrderCreated(string indexed orderId, address indexed buyer, address indexed seller, uint256 amount);
    event OrderLocked(string indexed orderId);
    event OrderCompleted(string indexed orderId);
    event OrderDisputed(string indexed orderId, string reason);
    event OrderCancelled(string indexed orderId);
    event CommissionUpdated(uint256 newRate);
    event ArbitratorAdded(address arbitrator);
    event ArbitratorRemoved(address arbitrator);
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }
    
    modifier onlyAdmin() {
        require(msg.sender == admin || msg.sender == owner, "Only admin can call this function");
        _;
    }
    
    modifier onlyArbitrator() {
        require(authorizedArbitrators[msg.sender] || msg.sender == owner, "Only arbitrator can call this function");
        _;
    }
    
    modifier orderExists(string memory orderId) {
        require(bytes(orders[orderId].orderId).length > 0, "Order does not exist");
        _;
    }
    
    constructor(address _usdtToken, address _admin) {
        owner = msg.sender;
        admin = _admin;
        usdtToken = IERC20(_usdtToken);
        authorizedArbitrators[owner] = true;
        authorizedArbitrators[_admin] = true;
    }
    
    function createOrder(
        string memory orderId,
        address buyer,
        address seller,
        uint256 amount,
        uint256 expirationHours
    ) external onlyAdmin {
        require(bytes(orders[orderId].orderId).length == 0, "Order already exists");
        require(buyer != seller, "Buyer and seller cannot be the same");
        require(amount > 0, "Amount must be greater than 0");
        
        uint256 commission = (amount * commissionRate) / COMMISSION_DENOMINATOR;
        
        orders[orderId] = EscrowOrder({
            orderId: orderId,
            buyer: buyer,
            seller: seller,
            amount: amount,
            commission: commission,
            status: OrderStatus.Active,
            createdAt: block.timestamp,
            expiresAt: block.timestamp + (expirationHours * 1 hours),
            buyerConfirmed: false,
            sellerConfirmed: false,
            disputeReason: ""
        });
        
        emit OrderCreated(orderId, buyer, seller, amount);
    }
    
    function lockFunds(string memory orderId) external orderExists(orderId) {
        EscrowOrder storage order = orders[orderId];
        require(msg.sender == order.seller, "Only seller can lock funds");
        require(order.status == OrderStatus.Active, "Order is not active");
        require(block.timestamp < order.expiresAt, "Order has expired");
        
        // Transfer USDT from seller to contract
        require(
            usdtToken.transferFrom(msg.sender, address(this), order.amount),
            "USDT transfer failed"
        );
        
        order.status = OrderStatus.Locked;
        emit OrderLocked(orderId);
    }
    
    function confirmPayment(string memory orderId) external orderExists(orderId) {
        EscrowOrder storage order = orders[orderId];
        require(order.status == OrderStatus.Locked, "Order is not locked");
        require(msg.sender == order.buyer || msg.sender == order.seller, "Not authorized");
        
        if (msg.sender == order.buyer) {
            order.buyerConfirmed = true;
        } else {
            order.sellerConfirmed = true;
        }
        
        // If both parties confirmed, complete the order
        if (order.buyerConfirmed && order.sellerConfirmed) {
            _completeOrder(orderId);
        }
    }
    
    function _completeOrder(string memory orderId) internal {
        EscrowOrder storage order = orders[orderId];
        
        uint256 sellerAmount = order.amount - order.commission;
        uint256 commissionAmount = order.commission;
        
        // Transfer USDT to buyer
        require(usdtToken.transfer(order.buyer, sellerAmount), "Transfer to buyer failed");
        
        // Transfer commission to owner
        if (commissionAmount > 0) {
            require(usdtToken.transfer(owner, commissionAmount), "Commission transfer failed");
        }
        
        order.status = OrderStatus.Completed;
        
        // Update reputation scores
        userReputation[order.buyer] += 1;
        userReputation[order.seller] += 1;
        totalTrades[order.buyer] += 1;
        totalTrades[order.seller] += 1;
        
        emit OrderCompleted(orderId);
    }
    
    function disputeOrder(string memory orderId, string memory reason) external orderExists(orderId) {
        EscrowOrder storage order = orders[orderId];
        require(order.status == OrderStatus.Locked, "Order is not locked");
        require(msg.sender == order.buyer || msg.sender == order.seller, "Not authorized");
        
        order.status = OrderStatus.Disputed;
        order.disputeReason = reason;
        
        emit OrderDisputed(orderId, reason);
    }
    
    function resolveDispute(
        string memory orderId,
        bool favorBuyer,
        uint256 buyerAmount,
        uint256 sellerAmount
    ) external onlyArbitrator orderExists(orderId) {
        EscrowOrder storage order = orders[orderId];
        require(order.status == OrderStatus.Disputed, "Order is not disputed");
        require(buyerAmount + sellerAmount <= order.amount, "Amounts exceed order total");
        
        if (buyerAmount > 0) {
            require(usdtToken.transfer(order.buyer, buyerAmount), "Transfer to buyer failed");
        }
        
        if (sellerAmount > 0) {
            require(usdtToken.transfer(order.seller, sellerAmount), "Transfer to seller failed");
        }
        
        // Remaining amount goes to commission
        uint256 remaining = order.amount - buyerAmount - sellerAmount;
        if (remaining > 0) {
            require(usdtToken.transfer(owner, remaining), "Commission transfer failed");
        }
        
        order.status = OrderStatus.Completed;
        
        // Update reputation based on dispute resolution
        if (favorBuyer) {
            userReputation[order.buyer] += 1;
            if (userReputation[order.seller] > 0) {
                userReputation[order.seller] -= 1;
            }
        } else {
            userReputation[order.seller] += 1;
            if (userReputation[order.buyer] > 0) {
                userReputation[order.buyer] -= 1;
            }
        }
        
        totalTrades[order.buyer] += 1;
        totalTrades[order.seller] += 1;
        
        emit OrderCompleted(orderId);
    }
    
    function cancelOrder(string memory orderId) external orderExists(orderId) {
        EscrowOrder storage order = orders[orderId];
        require(
            msg.sender == order.buyer || 
            msg.sender == order.seller || 
            msg.sender == owner ||
            block.timestamp > order.expiresAt,
            "Not authorized to cancel"
        );
        require(order.status == OrderStatus.Active || order.status == OrderStatus.Locked, "Cannot cancel order");
        
        // If funds are locked, return them to seller
        if (order.status == OrderStatus.Locked) {
            require(usdtToken.transfer(order.seller, order.amount), "Refund failed");
        }
        
        order.status = OrderStatus.Cancelled;
        emit OrderCancelled(orderId);
    }
    
    function getOrder(string memory orderId) external view returns (
        address buyer,
        address seller,
        uint256 amount,
        uint256 commission,
        OrderStatus status,
        uint256 createdAt,
        uint256 expiresAt,
        bool buyerConfirmed,
        bool sellerConfirmed
    ) {
        EscrowOrder memory order = orders[orderId];
        return (
            order.buyer,
            order.seller,
            order.amount,
            order.commission,
            order.status,
            order.createdAt,
            order.expiresAt,
            order.buyerConfirmed,
            order.sellerConfirmed
        );
    }
    
    function getUserReputation(address user) external view returns (uint256 reputation, uint256 trades) {
        return (userReputation[user], totalTrades[user]);
    }
    
    function updateCommissionRate(uint256 newRate) external onlyOwner {
        require(newRate <= 10000, "Commission rate too high"); // Max 10%
        commissionRate = newRate;
        emit CommissionUpdated(newRate);
    }
    
    function addArbitrator(address arbitrator) external onlyOwner {
        authorizedArbitrators[arbitrator] = true;
        emit ArbitratorAdded(arbitrator);
    }
    
    function removeArbitrator(address arbitrator) external onlyOwner {
        require(arbitrator != owner, "Cannot remove owner");
        authorizedArbitrators[arbitrator] = false;
        emit ArbitratorRemoved(arbitrator);
    }
    
    function emergencyWithdraw(address token, uint256 amount) external onlyOwner {
        if (token == address(0)) {
            payable(owner).transfer(amount);
        } else {
            IERC20(token).transfer(owner, amount);
        }
    }
    
    function updateAdmin(address newAdmin) external onlyOwner {
        admin = newAdmin;
        authorizedArbitrators[newAdmin] = true;
    }
    
    receive() external payable {}
}