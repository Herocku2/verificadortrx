# TRXGuardian — Diseño de la Aplicación

## Arquitectura General

La aplicación TRXGuardian sigue una arquitectura cliente-servidor con los siguientes componentes principales:

```
TRXGuardian
├── Frontend (React/Next.js)
│   ├── Páginas (Home, Scanner, Pricing, Results)
│   ├── Componentes (WalletInput, RiskDisplay, PricingCards)
│   └── Servicios (API, Payment)
│
├── Backend (Node.js/Express)
│   ├── API Routes
│   │   ├── Wallet Verification
│   │   ├── User Management
│   │   └── Payment Processing
│   │
│   ├── Services
│   │   ├── Forensic Analysis
│   │   ├── Token Management
│   │   └── Payment Integration
│   │
│   └── Data Storage
│       ├── Redis (Tokens, Sessions)
│       └── Future: PostgreSQL
│
└── External Services
    ├── TronGrid API
    └── NowPayments API
```

## Diseño del Frontend

### Tema y Estilo
- **Paleta de colores**: Azul oscuro (#0A1929), Azul claro (#0078FF), Negro (#000), Blanco (#FFF)
- **Indicadores de riesgo**: Verde (#00C853), Amarillo (#FFD600), Rojo (#FF3D00)
- **Fuente principal**: Inter, sistema sans-serif como fallback
- **Estilo general**: Minimalista, moderno, con elementos de neomorfismo y glassmorphism

### Páginas Principales

#### 1. Home / Landing
- Hero section con descripción del servicio
- Características principales con iconos
- Sección de conexión de wallet (TronLink o manual)
- Estadísticas de uso (wallets analizadas, precisión, etc.)

#### 2. Scanner
- Input grande para ingresar dirección de wallet
- Opciones de análisis (Instant, Comprehensive, Risk Assessment)
- Botón de análisis con indicador de costo (1 token)
- Sección para mostrar resultados

#### 3. Pricing
- Tarjetas de planes con precios
- Características detalladas por plan
- Botones de compra que conectan con NowPayments
- Indicador de plan más popular

#### 4. Results
- Indicador visual de riesgo (semáforo)
- Detalles del análisis forense
- Historial de eventos de blacklist
- Wallets conectadas (si aplica)
- Opción para descargar reporte (planes pagos)

### Componentes Clave

#### WalletInput
- Campo de texto con validación de formato TRX
- Botón de escaneo/análisis
- Integración con TronLink

#### RiskDisplay
- Indicador visual de nivel de riesgo
- Animación según resultado (verde, amarillo, rojo)
- Detalles expandibles

#### PricingCards
- Tarjetas con información de cada plan
- Indicador de características
- Botón de compra
- Badge para plan más popular

## Diseño del Backend

### API Endpoints

#### Wallet Verification
- `GET /api/verify/:wallet` - Verificación básica de wallet
- `GET /api/verify/:wallet/detailed` - Análisis detallado (requiere tokens)
- `GET /api/verify/:wallet/connections` - Análisis de conexiones (requiere plan pagado)

#### User Management
- `POST /api/users` - Crear nuevo usuario (solo con wallet)
- `GET /api/users/:wallet` - Obtener información de usuario
- `GET /api/users/:wallet/tokens` - Verificar tokens disponibles

#### Payment Processing
- `POST /api/payments/create` - Crear orden de pago
- `GET /api/payments/:id` - Verificar estado de pago
- `POST /api/payments/webhook` - Webhook para NowPayments

### Servicios

#### Forensic Analysis
- Verificación de blacklist
- Extracción de eventos de blockchain
- Análisis de conexiones entre wallets
- Cálculo de score de riesgo

#### Token Management
- Verificación de tokens disponibles
- Descuento de tokens por consulta
- Recarga de tokens por compra
- Bonificación automática

#### Payment Integration
- Creación de órdenes en NowPayments
- Verificación de pagos completados
- Activación de planes según pago

### Almacenamiento de Datos

#### Redis
- Almacenamiento de tokens por usuario
- Caché de resultados frecuentes
- Gestión de sesiones anónimas

#### Futuro: PostgreSQL
- Historial de análisis
- Estadísticas de uso
- Registro de pagos

## Flujo de Usuario

1. **Entrada a la aplicación**
   - Usuario llega a la landing page
   - Ve las características principales
   - Puede conectar wallet o navegar a scanner

2. **Escaneo de wallet**
   - Usuario ingresa dirección TRX
   - Sistema verifica si tiene tokens disponibles
   - Si no tiene tokens, se le invita a comprar un plan
   - Si tiene tokens, se procede con el análisis

3. **Análisis y resultados**
   - Backend realiza el análisis forense
   - Se descuenta 1 token
   - Se muestra el resultado con indicador visual
   - Se ofrecen opciones según el plan (descargar reporte, etc.)

4. **Compra de plan**
   - Usuario navega a la página de precios
   - Selecciona un plan
   - Es redirigido a NowPayments para el pago
   - Al completar el pago, se activa su plan automáticamente

## Consideraciones de Seguridad

- Todas las comunicaciones vía HTTPS
- No almacenamiento de datos personales
- Validación de inputs para prevenir inyecciones
- Rate limiting para prevenir abusos
- Tokens de acceso temporales para gestión de sesiones

## Escalabilidad

- Arquitectura modular para facilitar expansión
- Caché de resultados frecuentes para reducir carga
- Posibilidad de añadir más blockchains en el futuro
- API diseñada para integración con servicios externos