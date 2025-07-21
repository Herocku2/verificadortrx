# TRXGuardian — Forensic Wallet Risk Scanner

## Requisitos del Proyecto

### Descripción General
TRXGuardian es una aplicación web avanzada centrada en la verificación forense y análisis de riesgo de wallets en la red TRON. La aplicación permite a los usuarios verificar el estado de una wallet TRX, obteniendo información sobre su estado en listas negras, fechas clave de inclusión/exclusión, relaciones con otras wallets sospechosas y un diagnóstico de riesgo.

### Objetivos Principales
- Permitir a cualquier persona verificar en segundos el estado forense de una wallet TRX
- Proporcionar un análisis de riesgo claro y visual
- Mantener un sistema de tokens para limitar y monetizar las consultas
- Garantizar la privacidad y anonimato de los usuarios
- Integrar un sistema de pagos para la compra de planes

### Funcionalidades Principales

#### 1. Validación Forense de Wallets
- El usuario ingresa una wallet TRX en la interfaz
- El backend ejecuta un script en Node.js que:
  - Consulta si está en la blacklist
  - Extrae eventos AddedBlackList / RemovedBlackList
  - Identifica wallets asociadas o conectadas
  - Genera y devuelve un diagnóstico de riesgo

#### 2. Motor de Análisis Inteligente
- Devuelve diagnóstico con semáforo de riesgo: 🟢 Bajo, 🟡 Medio, 🔴 Alto
- Se muestra al usuario con animaciones visuales según el riesgo

#### 3. Sistema de Tokens por Consulta
- Cada análisis cuesta 1 token
- Los tokens dependen del plan comprado:
  - Free: 3 tokens iniciales
  - Básico: 25 tokens ($9.99)
  - Intermedio: 75 tokens ($19.99)
  - Ilimitado: Tokens ilimitados ($49.99)
- Sistema en memoria o Redis para gestionar los tokens

#### 4. Bonificación Automática
- Cada compra de paquete otorga +5 tokens extra una sola vez por compra

#### 5. Seguridad y Anonimato
- No se recolectan correos ni contraseñas
- No se usa Google Analytics ni cookies
- Solo se usa la dirección TRX + token de acceso para gestionar usuarios
- Total privacidad y trazabilidad mínima

#### 6. Integración de Pagos con NowPayments
- El usuario puede comprar paquetes directamente desde la app
- Se implementa conexión a NowPayments API
- Cuando se confirma el pago:
  - Se activa el plan
  - Se recargan tokens automáticamente
  - Se entrega recibo digital de la compra

### Requerimientos Técnicos

#### Frontend
- React o Next.js
- Estilo moderno con animaciones visuales tipo semáforo de riesgo
- Integración con sistema de pagos
- Indicador de tokens restantes
- Componentes: Input wallet, botón analizar, sección de resultados

#### Backend
- Node.js con Express
- Script de análisis forense
- Middleware para manejo de tokens por wallet
- Validación de IP y throttling básico (prevención de abuso)

#### Base de Datos
- Redis (temporal para tokens y sesiones)
- Opción futura: PostgreSQL para estadísticas e historiales

#### API Externas
- Integración con Trongrid o Tronscan APIs para eventos
- NowPayments API para cobros

### Planes y Precios
1. **Free**
   - 3 tokens
   - Verificación básica de blacklist
   - Soporte limitado

2. **Basic ($9.99)**
   - 25 tokens + 5 bonus
   - Verificación completa de blacklist
   - Análisis de wallets conectadas
   - Soporte por email

3. **Intermedio ($19.99)**
   - 75 tokens + 5 bonus
   - Análisis avanzado de riesgo
   - Reporte forense completo
   - Análisis de historial de transacciones
   - Soporte prioritario
   - Acceso API (beta)

4. **Ilimitado ($49.99)**
   - Tokens ilimitados + 5 bonus
   - Análisis de riesgo premium
   - Escaneo por lotes de wallets
   - Acceso API avanzado
   - Reportes personalizados
   - Soporte 24/7
   - Opción white-label