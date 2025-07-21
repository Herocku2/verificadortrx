// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title TRXGuardianEscrow
 * @dev Contrato de custodia para operaciones P2P de USDT en la red TRON
 */
contract TRXGuardianEscrow is Ownable, ReentrancyGuard {
    // Dirección del token USDT en la red TRON
    IERC20 public usdtToken;
    
    // Comisión de la plataforma (en porcentaje, 100 = 1%)
    uint256 public feePercentage = 50; // 0.5% por defecto
    
    // Tiempo máximo de una operación antes de poder cancelarla (en segundos)
    uint256 public maxTradeTime = 86400; // 24 horas por defecto
    
    // Tiempo de espera para disputas (en segundos)
    uint256 public disputeWaitTime = 172800; // 48 horas por defecto
    
    // Enumeración para el estado de las operaciones
    enum TradeStatus { Created, Locked, Completed, Disputed, Cancelled }
    
    // Estructura para almacenar información de una operación
    struct Trade {
        address seller;
        address buyer;
        uint256 amount;
        uint256 fee;
        uint256 createdAt;
        uint256 lockedAt;
        uint256 completedAt;
        TradeStatus status;
        string paymentMethod;
        string tradeId;
        bool isDisputed;
    }
    
    // Mapeo de ID de operación a datos de la operación
    mapping(uint256 => Trade) public trades;
    
    // Contador de operaciones
    uint256 public tradeCount;
    
    // Mapeo de usuario a operaciones activas
    mapping(address => uint256[]) public userTrades;
    
    // Eventos
    event TradeCreated(uint256 indexed tradeId, address indexed seller, string externalTradeId, uint256 amount);
    event TradeLocked(uint256 indexed tradeId, address indexed buyer);
    event TradeCompleted(uint256 indexed tradeId);
    event TradeCancelled(uint256 indexed tradeId);
    event TradeDisputed(uint256 indexed tradeId, address indexed disputeInitiator);
    event DisputeResolved(uint256 indexed tradeId, address winner);
    event FeeUpdated(uint256 newFeePercentage);
    
    /**
     * @dev Constructor del contrato
     * @param _usdtToken Dirección del contrato USDT en la red TRON
     */
    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }
    
    /**
     * @dev Crea una nueva operación
     * @param _buyer Dirección del comprador (opcional, puede ser address(0))
     * @param _amount Cantidad de USDT
     * @param _paymentMethod Método de pago (ej. "Bank Transfer")
     * @param _tradeId ID externo de la operación
     */
    function createTrade(
        address _buyer,
        uint256 _amount,
        string memory _paymentMethod,
        string memory _tradeId
    ) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");
        
        // Calcular comisión
        uint256 fee = (_amount * feePercentage) / 10000;
        uint256 totalAmount = _amount + fee;
        
        // Transferir USDT al contrato
        require(usdtToken.transferFrom(msg.sender, address(this), totalAmount), "USDT transfer failed");
        
        // Crear nueva operación
        uint256 tradeId = tradeCount++;
        trades[tradeId] = Trade({
            seller: msg.sender,
            buyer: _buyer,
            amount: _amount,
            fee: fee,
            createdAt: block.timestamp,
            lockedAt: 0,
            completedAt: 0,
            status: TradeStatus.Created,
            paymentMethod: _paymentMethod,
            tradeId: _tradeId,
            isDisputed: false
        });
        
        // Añadir a operaciones del usuario
        userTrades[msg.sender].push(tradeId);
        
        emit TradeCreated(tradeId, msg.sender, _tradeId, _amount);
    }
    
    /**
     * @dev Bloquea fondos para una operación (comprador se une)
     * @param _tradeId ID de la operación
     */
    function lockFunds(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Created, "Trade is not in Created status");
        require(trade.buyer == address(0) || trade.buyer == msg.sender, "You are not the buyer");
        require(trade.seller != msg.sender, "Seller cannot be buyer");
        
        trade.buyer = msg.sender;
        trade.status = TradeStatus.Locked;
        trade.lockedAt = block.timestamp;
        
        // Añadir a operaciones del usuario
        userTrades[msg.sender].push(_tradeId);
        
        emit TradeLocked(_tradeId, msg.sender);
    }
    
    /**
     * @dev Libera fondos al comprador (vendedor confirma pago)
     * @param _tradeId ID de la operación
     */
    function releaseFunds(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Locked, "Trade is not in Locked status");
        require(trade.seller == msg.sender, "Only seller can release funds");
        
        _completeTrade(_tradeId);
    }
    
    /**
     * @dev Cancela una operación y devuelve los fondos al vendedor
     * @param _tradeId ID de la operación
     */
    function cancelTrade(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Created || trade.status == TradeStatus.Locked, "Trade cannot be cancelled");
        
        // Si está en estado Created, solo el vendedor puede cancelar
        if (trade.status == TradeStatus.Created) {
            require(trade.seller == msg.sender, "Only seller can cancel at this stage");
        }
        // Si está en estado Locked, verificar condiciones
        else {
            // El vendedor puede cancelar si no hay comprador asignado
            if (trade.seller == msg.sender) {
                require(trade.buyer == address(0), "Cannot cancel, buyer already assigned");
            }
            // El comprador puede cancelar en cualquier momento
            else if (trade.buyer == msg.sender) {
                // Permitido
            }
            // El administrador puede cancelar si ha pasado el tiempo máximo
            else if (msg.sender == owner()) {
                require(block.timestamp > trade.lockedAt + maxTradeTime, "Trade time not expired");
            }
            else {
                revert("Not authorized to cancel");
            }
        }
        
        trade.status = TradeStatus.Cancelled;
        
        // Devolver fondos al vendedor (incluida la comisión)
        uint256 totalAmount = trade.amount + trade.fee;
        require(usdtToken.transfer(trade.seller, totalAmount), "USDT transfer failed");
        
        emit TradeCancelled(_tradeId);
    }
    
    /**
     * @dev Inicia una disputa
     * @param _tradeId ID de la operación
     */
    function disputeTrade(uint256 _tradeId) external nonReentrant {
        Trade storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Locked, "Trade is not in Locked status");
        require(trade.seller == msg.sender || trade.buyer == msg.sender, "Only buyer or seller can dispute");
        require(!trade.isDisputed, "Trade is already disputed");
        
        trade.isDisputed = true;
        trade.status = TradeStatus.Disputed;
        
        emit TradeDisputed(_tradeId, msg.sender);
    }
    
    /**
     * @dev Resuelve una disputa (solo administrador)
     * @param _tradeId ID de la operación
     * @param _winner Dirección del ganador (vendedor o comprador)
     */
    function resolveDispute(uint256 _tradeId, address _winner) external onlyOwner nonReentrant {
        Trade storage trade = trades[_tradeId];
        
        require(trade.status == TradeStatus.Disputed, "Trade is not disputed");
        require(_winner == trade.seller || _winner == trade.buyer, "Winner must be buyer or seller");
        
        if (_winner == trade.buyer) {
            // El comprador gana, transferir fondos al comprador
            require(usdtToken.transfer(trade.buyer, trade.amount), "USDT transfer failed");
            // La comisión se queda en el contrato
        } else {
            // El vendedor gana, devolver todo al vendedor
            uint256 totalAmount = trade.amount + trade.fee;
            require(usdtToken.transfer(trade.seller, totalAmount), "USDT transfer failed");
        }
        
        trade.status = TradeStatus.Completed;
        trade.completedAt = block.timestamp;
        
        emit DisputeResolved(_tradeId, _winner);
    }
    
    /**
     * @dev Completa una operación
     * @param _tradeId ID de la operación
     */
    function _completeTrade(uint256 _tradeId) internal {
        Trade storage trade = trades[_tradeId];
        
        trade.status = TradeStatus.Completed;
        trade.completedAt = block.timestamp;
        
        // Transferir fondos al comprador
        require(usdtToken.transfer(trade.buyer, trade.amount), "USDT transfer failed");
        
        emit TradeCompleted(_tradeId);
    }
    
    /**
     * @dev Actualiza el porcentaje de comisión (solo administrador)
     * @param _feePercentage Nuevo porcentaje de comisión (100 = 1%)
     */
    function updateFeePercentage(uint256 _feePercentage) external onlyOwner {
        require(_feePercentage <= 1000, "Fee too high"); // Máximo 10%
        feePercentage = _feePercentage;
        emit FeeUpdated(_feePercentage);
    }
    
    /**
     * @dev Actualiza el tiempo máximo de una operación (solo administrador)
     * @param _maxTradeTime Nuevo tiempo máximo en segundos
     */
    function updateMaxTradeTime(uint256 _maxTradeTime) external onlyOwner {
        maxTradeTime = _maxTradeTime;
    }
    
    /**
     * @dev Actualiza el tiempo de espera para disputas (solo administrador)
     * @param _disputeWaitTime Nuevo tiempo de espera en segundos
     */
    function updateDisputeWaitTime(uint256 _disputeWaitTime) external onlyOwner {
        disputeWaitTime = _disputeWaitTime;
    }
    
    /**
     * @dev Retira comisiones acumuladas (solo administrador)
     * @param _amount Cantidad a retirar
     */
    function withdrawFees(uint256 _amount) external onlyOwner {
        require(usdtToken.transfer(owner(), _amount), "USDT transfer failed");
    }
    
    /**
     * @dev Obtiene las operaciones de un usuario
     * @param _user Dirección del usuario
     * @return Array de IDs de operaciones
     */
    function getUserTrades(address _user) external view returns (uint256[] memory) {
        return userTrades[_user];
    }
    
    /**
     * @dev Obtiene el saldo de comisiones en el contrato
     * @return Saldo de comisiones
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }
}