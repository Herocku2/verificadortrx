# TRXGuardian - Diseño de Fase 2

## Visión General

La segunda fase del proyecto TRXGuardian se enfoca en expandir las funcionalidades del sistema para incluir un panel de administración basado en Strapi, un sistema de autenticación mediante Telegram, y una plataforma P2P para la compra y venta de USDT en la red TRON.

## 1. Integración con Strapi CMS

### Arquitectura

```
TRXGuardian + Strapi
├── Frontend (React)
│   ├── Interfaz de usuario pública
│   └── Integración con Strapi API
│
├── Backend (Node.js/Express)
│   ├── API para verificación de wallets
│   ├── Servicios de tokens y pagos
│   └── Middleware de comunicación con Strapi
│
├── Strapi CMS
│   ├── Modelos de datos
│   │   ├── Users (usuarios y wallets)
│   │   ├── Transactions (transacciones y pagos)
│   │   ├── Reports (informes y análisis)
│   │   └── Settings (configuración del sistema)
│   │
│   ├── API RESTful
│   ├── Panel de administración personalizado
│   └── Sistema de roles y permisos
│
└── Base de datos
    ├── PostgreSQL (datos principales)
    └── Redis (caché y tokens)
```

### Modelos de Datos en Strapi

#### User
- `wallet`: String (dirección TRX, clave primaria)
- `email`: String (opcional)
- `telegramId`: String (opcional)
- `plan`: Enum (Free, Basic, Intermedio, Unlimited)
- `tokens`: Number
- `isReseller`: Boolean
- `resellerQuota`: Number
- `resellerDiscount`: Number
- `createdAt`: DateTime
- `lastLogin`: DateTime

#### Transaction
- `id`: UUID
- `user`: Relation (User)
- `type`: Enum (Scan, Payment, Refund)
- `amount`: Number
- `planType`: String
- `paymentMethod`: String
- `status`: Enum (Pending, Completed, Failed)
- `createdAt`: DateTime

#### Report
- `id`: UUID
- `wallet`: String
- `user`: Relation (User)
- `riskScore`: Number
- `isBlacklisted`: Boolean
- `blacklistDate`: DateTime
- `connectedWallets`: JSON
- `createdAt`: DateTime

#### Setting
- `key`: String
- `value`: JSON
- `category`: String
- `description`: String

### Endpoints para Strapi

```
# Autenticación
POST /api/auth/local
POST /api/auth/telegram

# Usuarios
GET /api/users
GET /api/users/:wallet
PUT /api/users/:wallet
DELETE /api/users/:wallet

# Transacciones
GET /api/transactions
GET /api/transactions/:id
POST /api/transactions

# Informes
GET /api/reports
GET /api/reports/:id
POST /api/reports

# Configuración
GET /api/settings
PUT /api/settings/:key
```

## 2. Sistema de Autenticación con Telegram

### Flujo de Autenticación

1. **Inicio de Sesión**:
   - Usuario selecciona "Iniciar sesión con Telegram"
   - Se genera un código único de autenticación
   - Se muestra un botón para abrir Telegram

2. **Verificación en Telegram**:
   - Usuario envía el código al bot de Telegram
   - Bot verifica el código y asocia el ID de Telegram con el usuario
   - Bot envía confirmación al backend

3. **Finalización**:
   - Backend genera un token JWT
   - Usuario es redirigido a la aplicación con sesión iniciada
   - Se establece la asociación entre wallet y cuenta de Telegram

### Estructura del Bot de Telegram

```
TRXGuardian Bot
├── Comandos
│   ├── /start - Bienvenida e instrucciones
│   ├── /login - Iniciar proceso de autenticación
│   ├── /verify - Verificar wallet
│   ├── /balance - Consultar tokens disponibles
│   ├── /report - Generar informe de wallet
│   └── /help - Mostrar ayuda
│
├── Funciones
│   ├── Autenticación de usuarios
│   ├── Verificación de wallets
│   ├── Notificaciones de eventos
│   └── Generación de informes
│
└── Integraciones
    ├── API de TRXGuardian
    ├── Mini-app de Telegram
    └── Sistema de alertas
```

## 3. Sistema P2P para Compra/Venta de USDT

### Arquitectura del Sistema P2P

```
Sistema P2P
├── Contrato Inteligente (TRON)
│   ├── Funciones de depósito
│   ├── Funciones de liberación
│   ├── Sistema de arbitraje
│   └── Gestión de comisiones
│
├── Backend
│   ├── API para gestión de ofertas
│   ├── Sistema de matching
│   ├── Gestión de disputas
│   └── Integración con contrato inteligente
│
├── Frontend
│   ├── Creación y gestión de ofertas
│   ├── Sistema de chat
│   ├── Subida de comprobantes
│   └── Interfaz de disputas
│
└── Bot de Telegram
    ├── Notificaciones de ofertas
    ├── Alertas de operaciones
    ├── Chat integrado
    └── Mini-app para operaciones
```

### Flujo de Operación P2P

1. **Creación de Oferta**:
   - Vendedor crea oferta especificando cantidad, precio y métodos de pago
   - Vendedor deposita USDT en contrato inteligente
   - Oferta se publica en el marketplace

2. **Matching y Negociación**:
   - Comprador encuentra oferta y solicita compra
   - Se crea una sala de chat entre comprador y vendedor
   - Ambos acuerdan detalles de la transacción

3. **Proceso de Compra**:
   - Comprador realiza pago según método acordado
   - Comprador sube comprobante de pago al sistema
   - Vendedor recibe notificación y verifica el pago

4. **Finalización**:
   - Vendedor confirma recepción del pago
   - Contrato inteligente libera USDT al comprador
   - Sistema registra transacción exitosa
   - Se actualiza reputación de ambos usuarios

5. **Proceso de Disputa** (si es necesario):
   - Parte afectada abre disputa
   - Ambas partes presentan evidencias
   - Administrador revisa el caso
   - Administrador decide y ejecuta resolución en el contrato

### Contrato Inteligente

```solidity
// Estructura simplificada del contrato inteligente
contract TRXGuardianEscrow {
    struct Trade {
        address seller;
        address buyer;
        uint256 amount;
        uint256 fee;
        uint256 timestamp;
        TradeStatus status;
    }
    
    enum TradeStatus { Created, Locked, Completed, Disputed, Cancelled }
    
    mapping(uint256 => Trade) public trades;
    address public admin;
    uint256 public feePercentage;
    
    // Funciones principales
    function createTrade(address _buyer, uint256 _amount) external;
    function lockFunds(uint256 _tradeId) external;
    function releaseFunds(uint256 _tradeId) external;
    function disputeTrade(uint256 _tradeId) external;
    function resolveDispute(uint256 _tradeId, address _winner) external onlyAdmin;
    function cancelTrade(uint256 _tradeId) external;
}
```

## 4. Integración con Telegram Mini-App

### Características de la Mini-App

- Diseño 100% responsive optimizado para Telegram
- Interfaz simplificada para operaciones rápidas
- Acceso directo a funcionalidades principales
- Notificaciones en tiempo real
- Integración con chat de Telegram

### Flujo de Usuario en Telegram

1. Usuario accede al bot de TRXGuardian
2. Bot presenta opciones principales:
   - Verificar wallet
   - Ver ofertas P2P
   - Gestionar cuenta
   - Soporte
3. Usuario selecciona opción y se abre la mini-app correspondiente
4. Mini-app permite realizar operaciones sin salir de Telegram
5. Notificaciones se envían directamente al chat

## 5. Consideraciones de Seguridad

### Protección de Datos
- Implementación de cifrado end-to-end para comunicaciones
- Almacenamiento seguro de claves y tokens
- Validación estricta de inputs
- Protección contra ataques comunes (XSS, CSRF, inyección)

### Seguridad del Contrato Inteligente
- Auditoría de seguridad por terceros
- Implementación de patrones de seguridad (Checks-Effects-Interactions)
- Límites de operación y mecanismos anti-fraude
- Funciones de emergencia para casos críticos

### Cumplimiento Normativo
- KYC básico para operaciones de mayor volumen
- Registro de transacciones para cumplimiento regulatorio
- Políticas claras de privacidad y términos de uso
- Mecanismos de prevención de lavado de dinero

## 6. Escalabilidad y Mantenimiento

### Infraestructura
- Arquitectura de microservicios para facilitar escalado
- Balanceo de carga para alta disponibilidad
- Sistemas de monitoreo y alertas
- Backups automáticos de datos críticos

### Actualizaciones y Mantenimiento
- CI/CD para despliegues continuos
- Entornos de desarrollo, pruebas y producción
- Documentación técnica completa
- Plan de respuesta a incidentes