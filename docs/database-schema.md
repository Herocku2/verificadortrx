# Esquema de Base de Datos para TRXGuardian

## Visión General

TRXGuardian utiliza una arquitectura de base de datos híbrida:
- **PostgreSQL**: Para datos estructurados y relaciones
- **Redis**: Para caché, tokens y datos de sesión

## Esquema PostgreSQL

### Tabla: users

```sql
CREATE TABLE users (
    wallet VARCHAR(50) PRIMARY KEY,
    email VARCHAR(255),
    telegram_id VARCHAR(50),
    plan VARCHAR(20) NOT NULL DEFAULT 'Free',
    tokens INTEGER NOT NULL DEFAULT 3,
    is_reseller BOOLEAN NOT NULL DEFAULT false,
    reseller_quota INTEGER DEFAULT 0,
    reseller_discount DECIMAL(5,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);
```

### Tabla: transactions

```sql
CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_wallet VARCHAR(50) REFERENCES users(wallet),
    type VARCHAR(20) NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    plan_type VARCHAR(20),
    payment_method VARCHAR(50),
    status VARCHAR(20) NOT NULL DEFAULT 'Pending',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);
```

### Tabla: reports

```sql
CREATE TABLE reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    wallet VARCHAR(50) NOT NULL,
    user_wallet VARCHAR(50) REFERENCES users(wallet),
    risk_score INTEGER NOT NULL,
    is_blacklisted BOOLEAN NOT NULL DEFAULT false,
    blacklist_date TIMESTAMP WITH TIME ZONE,
    connected_wallets JSONB,
    events JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### Tabla: p2p_trades

```sql
CREATE TABLE p2p_trades (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    seller_wallet VARCHAR(50) REFERENCES users(wallet),
    buyer_wallet VARCHAR(50) REFERENCES users(wallet),
    amount DECIMAL(12,2) NOT NULL,
    price DECIMAL(12,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    payment_method VARCHAR(50) NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'Created',
    contract_address VARCHAR(50),
    transaction_hash VARCHAR(100),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    metadata JSONB
);
```

### Tabla: disputes

```sql
CREATE TABLE disputes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES p2p_trades(id),
    initiator_wallet VARCHAR(50) REFERENCES users(wallet),
    reason TEXT NOT NULL,
    evidence JSONB,
    admin_notes TEXT,
    resolution VARCHAR(20) DEFAULT 'Pending',
    resolution_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    metadata JSONB
);
```

### Tabla: settings

```sql
CREATE TABLE settings (
    key VARCHAR(50) PRIMARY KEY,
    value JSONB NOT NULL,
    category VARCHAR(50) NOT NULL,
    description TEXT,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: chat_messages

```sql
CREATE TABLE chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trade_id UUID REFERENCES p2p_trades(id),
    sender_wallet VARCHAR(50) REFERENCES users(wallet),
    message TEXT NOT NULL,
    attachment_url TEXT,
    is_system_message BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### Tabla: telegram_auth

```sql
CREATE TABLE telegram_auth (
    id SERIAL PRIMARY KEY,
    user_wallet VARCHAR(50) REFERENCES users(wallet),
    telegram_id VARCHAR(50) NOT NULL,
    auth_code VARCHAR(50) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(user_wallet, telegram_id)
);
```

## Configuración de Redis

### Estructuras de Datos

1. **Tokens de Usuario**
   ```
   user:{wallet}:tokens -> Integer (cantidad de tokens)
   ```

2. **Sesiones**
   ```
   session:{sessionId} -> Hash (datos de sesión)
   ```

3. **Caché de Verificaciones**
   ```
   verify:{wallet} -> Hash (resultados de verificación)
   ```

4. **Bloqueo de Tareas**
   ```
   lock:{taskId} -> String (identificador de bloqueo)
   ```

5. **Estadísticas en Tiempo Real**
   ```
   stats:daily:{date} -> Hash (estadísticas diarias)
   stats:monthly:{month} -> Hash (estadísticas mensuales)
   ```

## Índices y Optimización

### PostgreSQL

```sql
-- Índice para búsquedas por plan
CREATE INDEX idx_users_plan ON users(plan);

-- Índice para búsquedas de transacciones por usuario
CREATE INDEX idx_transactions_user ON transactions(user_wallet);

-- Índice para búsquedas de transacciones por estado
CREATE INDEX idx_transactions_status ON transactions(status);

-- Índice para búsquedas de informes por wallet
CREATE INDEX idx_reports_wallet ON reports(wallet);

-- Índice para búsquedas de operaciones P2P por estado
CREATE INDEX idx_p2p_trades_status ON p2p_trades(status);

-- Índice para búsquedas de disputas por estado
CREATE INDEX idx_disputes_resolution ON disputes(resolution);
```

### Redis

- Configurar TTL (Time To Live) para entradas de caché
- Implementar política de expiración LRU (Least Recently Used)
- Configurar persistencia para datos críticos

## Migración y Respaldo

### Estrategia de Migración

1. **Migración Inicial**
   - Crear esquema de base de datos
   - Importar datos existentes (si los hay)
   - Verificar integridad de datos

2. **Migraciones Incrementales**
   - Usar herramientas como Flyway o Liquibase
   - Versionar cambios en esquema
   - Implementar rollback para cambios críticos

### Estrategia de Respaldo

1. **Respaldos Diarios**
   - Respaldo completo de PostgreSQL
   - Respaldo de configuración de Redis
   - Almacenamiento en ubicación segura

2. **Respaldos Incrementales**
   - Cada 6 horas
   - Retención de 7 días

3. **Pruebas de Restauración**
   - Verificación semanal de integridad de respaldos
   - Simulacro de restauración mensual