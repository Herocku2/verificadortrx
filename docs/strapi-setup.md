# Configuración de Strapi para TRXGuardian

Este documento describe los pasos necesarios para configurar Strapi como sistema de administración para TRXGuardian.

## Instalación de Strapi

### Requisitos previos
- Node.js (v14.x o superior)
- NPM o Yarn
- PostgreSQL (recomendado para producción)

### Pasos de instalación

1. Crear un nuevo proyecto Strapi:
```bash
npx create-strapi-app@latest trxguardian-admin --quickstart
```

2. Para producción con PostgreSQL:
```bash
npx create-strapi-app@latest trxguardian-admin --no-run
```

3. Configurar la base de datos en `./config/database.js`:
```javascript
module.exports = ({ env }) => ({
  defaultConnection: 'default',
  connections: {
    default: {
      connector: 'bookshelf',
      settings: {
        client: 'postgres',
        host: env('DATABASE_HOST', 'localhost'),
        port: env.int('DATABASE_PORT', 5432),
        database: env('DATABASE_NAME', 'trxguardian'),
        username: env('DATABASE_USERNAME', 'postgres'),
        password: env('DATABASE_PASSWORD', 'password'),
        ssl: env.bool('DATABASE_SSL', false),
      },
      options: {}
    },
  },
});
```

4. Iniciar Strapi:
```bash
cd trxguardian-admin
npm run develop
```

## Configuración de Modelos de Contenido

### Modelo: User

| Campo | Tipo | Descripción |
|-------|------|-------------|
| wallet | String (único) | Dirección de wallet TRON |
| email | Email (opcional) | Correo electrónico |
| telegramId | String (opcional) | ID de usuario en Telegram |
| plan | Enumeration | Free, Basic, Intermedio, Unlimited |
| tokens | Integer | Cantidad de tokens disponibles |
| isReseller | Boolean | Indica si es revendedor |
| resellerQuota | Integer | Cuota de membresías para revendedor |
| resellerDiscount | Decimal | Porcentaje de descuento (0-1) |
| createdAt | DateTime | Fecha de creación |
| lastLogin | DateTime | Último inicio de sesión |

### Modelo: Transaction

| Campo | Tipo | Descripción |
|-------|------|-------------|
| user | Relation (User) | Usuario relacionado |
| type | Enumeration | Scan, Payment, Refund |
| amount | Decimal | Monto de la transacción |
| planType | String | Tipo de plan adquirido |
| paymentMethod | String | Método de pago utilizado |
| status | Enumeration | Pending, Completed, Failed |
| transactionId | String | ID de transacción externo |
| createdAt | DateTime | Fecha de creación |

### Modelo: Report

| Campo | Tipo | Descripción |
|-------|------|-------------|
| wallet | String | Wallet analizada |
| user | Relation (User) | Usuario que solicitó el informe |
| riskScore | Integer | Puntuación de riesgo (0-100) |
| isBlacklisted | Boolean | Indica si está en blacklist |
| blacklistDate | DateTime | Fecha de inclusión en blacklist |
| connectedWallets | JSON | Wallets conectadas |
| events | JSON | Eventos detectados |
| createdAt | DateTime | Fecha de creación |

### Modelo: P2PTrade

| Campo | Tipo | Descripción |
|-------|------|-------------|
| seller | Relation (User) | Vendedor |
| buyer | Relation (User) | Comprador |
| amount | Decimal | Cantidad de USDT |
| price | Decimal | Precio en moneda local |
| currency | String | Moneda local (USD, EUR, etc.) |
| paymentMethod | String | Método de pago |
| status | Enumeration | Created, InProgress, Completed, Disputed, Cancelled |
| contractAddress | String | Dirección del contrato de custodia |
| transactionHash | String | Hash de la transacción en blockchain |
| createdAt | DateTime | Fecha de creación |
| completedAt | DateTime | Fecha de finalización |

### Modelo: Dispute

| Campo | Tipo | Descripción |
|-------|------|-------------|
| trade | Relation (P2PTrade) | Operación en disputa |
| initiator | Relation (User) | Usuario que inició la disputa |
| reason | Text | Motivo de la disputa |
| evidence | Media | Evidencias (imágenes, documentos) |
| adminNotes | Text | Notas del administrador |
| resolution | Enumeration | Pending, BuyerWin, SellerWin, Split |
| resolutionDate | DateTime | Fecha de resolución |
| createdAt | DateTime | Fecha de creación |

## Configuración de Roles y Permisos

### Roles

1. **Public** - Acceso sin autenticación
   - Verificación básica de wallets
   - Ver información pública

2. **Authenticated** - Usuario registrado
   - Verificación completa de wallets
   - Generación de informes
   - Participación en P2P
   - Gestión de su cuenta

3. **Reseller** - Revendedor autorizado
   - Todo lo de Authenticated
   - Creación de usuarios con descuento
   - Visualización de estadísticas de ventas

4. **Admin** - Administrador del sistema
   - Acceso completo al panel de administración
   - Gestión de usuarios y revendedores
   - Resolución de disputas
   - Configuración del sistema

## Personalización del Panel de Administración

### Dashboards Personalizados

1. **Dashboard Principal**
   - Estadísticas generales (usuarios, transacciones, ingresos)
   - Gráficos de actividad reciente
   - Alertas y notificaciones

2. **Dashboard de Usuarios**
   - Lista de usuarios activos
   - Distribución por planes
   - Consumo de tokens

3. **Dashboard de Transacciones**
   - Ingresos diarios/mensuales
   - Conversión por planes
   - Métodos de pago más utilizados

4. **Dashboard de P2P**
   - Volumen de operaciones
   - Disputas activas
   - Usuarios más activos

## Integración con el Backend Existente

### Endpoints de Comunicación

1. **Autenticación**
   ```
   POST /api/strapi/auth
   ```

2. **Sincronización de Usuarios**
   ```
   GET /api/strapi/users/sync
   POST /api/strapi/users/update
   ```

3. **Sincronización de Transacciones**
   ```
   POST /api/strapi/transactions/sync
   ```

4. **Webhooks**
   ```
   POST /api/strapi/webhooks/user
   POST /api/strapi/webhooks/transaction
   POST /api/strapi/webhooks/report
   ```

### Configuración de Webhooks en Strapi

1. Crear webhook para nuevos usuarios:
   - Evento: `user.create`
   - URL: `http://backend-api/api/strapi/webhooks/user`

2. Crear webhook para nuevas transacciones:
   - Evento: `transaction.create`
   - URL: `http://backend-api/api/strapi/webhooks/transaction`

3. Crear webhook para cambios en configuración:
   - Evento: `setting.update`
   - URL: `http://backend-api/api/strapi/webhooks/setting`

## Despliegue de Strapi

### Configuración para Producción

1. Variables de entorno:
```
DATABASE_HOST=your-db-host
DATABASE_PORT=5432
DATABASE_NAME=trxguardian
DATABASE_USERNAME=your-username
DATABASE_PASSWORD=your-password
DATABASE_SSL=true
JWT_SECRET=your-jwt-secret
ADMIN_JWT_SECRET=your-admin-jwt-secret
```

2. Configuración de PM2:
```json
{
  "apps": [
    {
      "name": "trxguardian-admin",
      "script": "npm",
      "args": "start",
      "env": {
        "NODE_ENV": "production"
      }
    }
  ]
}
```

3. Configuración de Nginx:
```nginx
server {
  listen 80;
  server_name admin.trxguardian.com;

  location / {
    proxy_pass http://localhost:1337;
    proxy_http_version 1.1;
    proxy_set_header X-Forwarded-Host $host;
    proxy_set_header X-Forwarded-Server $host;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header Host $http_host;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection "Upgrade";
    proxy_pass_request_headers on;
  }
}
```

## Seguridad

### Configuraciones Recomendadas

1. Habilitar autenticación de dos factores para administradores
2. Configurar límites de tasa para la API
3. Implementar CORS adecuadamente
4. Configurar CSP (Content Security Policy)
5. Realizar backups regulares de la base de datos

### Monitoreo

1. Configurar logs de acceso y errores
2. Implementar sistema de alertas para actividades sospechosas
3. Revisar regularmente los logs de auditoría
4. Configurar monitoreo de rendimiento