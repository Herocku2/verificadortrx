# TRXGuardian — Plan de Tareas

## Sprint 1: Configuración y Backend Básico

### Configuración del Proyecto
- [x] Clonar repositorio base del backend
- [x] Configurar estructura de carpetas para frontend y backend
- [x] Inicializar repositorio Git
- [x] Configurar entorno de desarrollo

### Backend: Funcionalidades Básicas
- [x] Instalar dependencias necesarias
- [x] Configurar Express y middleware
- [x] Implementar sistema de tokens en memoria
- [x] Crear endpoints para verificación de wallets
- [x] Integrar script forense existente
- [x] Añadir validación de inputs
- [x] Implementar manejo de errores

### Backend: Sistema de Tokens
- [x] Diseñar modelo de datos para usuarios y tokens
- [x] Implementar almacenamiento en memoria (pendiente Redis)
- [x] Crear endpoints para gestión de tokens
- [x] Añadir lógica de descuento de tokens por consulta

## Sprint 2: Frontend Básico

### Configuración del Frontend
- [x] Inicializar proyecto React
- [x] Configurar rutas y navegación
- [x] Instalar dependencias (UI, animaciones, etc.)
- [x] Configurar tema y estilos globales

### Componentes Principales
- [x] Crear componente de entrada de wallet
- [x] Implementar validación de formato TRX
- [x] Crear componente de visualización de riesgo
- [x] Diseñar animaciones para resultados
- [x] Implementar tarjetas de planes y precios

### Páginas Principales
- [x] Desarrollar página de inicio
- [x] Crear página de scanner
- [x] Implementar página de resultados
- [x] Diseñar página de precios

## Sprint 3: Panel de Administración

### Configuración de Acceso Administrativo
- [x] Implementar verificación de wallet de administrador (TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm)
- [x] Crear rutas protegidas para administración
- [x] Diseñar estructura del panel de administración

### Páginas de Administración
- [x] Desarrollar dashboard administrativo
- [x] Crear página de gestión de usuarios
- [x] Implementar página de gestión de pagos
- [x] Diseñar página de configuración del sistema

### Funcionalidades Administrativas
- [ ] Implementar estadísticas en tiempo real
- [ ] Crear sistema de filtrado y búsqueda
- [ ] Añadir funcionalidad de exportación de datos
- [ ] Implementar gestión de configuración del sistema

## Sprint 4: Integración de Pagos y Mejoras

### Integración con NowPayments
- [ ] Crear cuenta en NowPayments
- [x] Configurar API keys
- [x] Implementar endpoints para creación de órdenes
- [x] Configurar webhook para confirmación de pagos
- [ ] Integrar flujo de compra en frontend

### Sistema de Bonificación
- [x] Implementar lógica de bonificación automática
- [x] Añadir tokens extra en compras nuevas
- [ ] Crear notificaciones de bonificación

### Mejoras de UX
- [ ] Implementar indicadores de carga
- [ ] Añadir notificaciones de éxito/error
- [ ] Mejorar animaciones y transiciones
- [ ] Optimizar para dispositivos móviles

## Sprint 5: Pruebas y Despliegue

### Pruebas
- [ ] Realizar pruebas de integración
- [ ] Verificar flujo completo de usuario
- [ ] Probar diferentes escenarios de pago
- [ ] Validar seguridad y manejo de errores

### Despliegue
- [x] Configurar Docker para frontend y backend
- [x] Preparar docker-compose para desarrollo
- [ ] Configurar variables de entorno para producción
- [ ] Desplegar en servidor de producción

### Documentación
- [x] Crear README del proyecto
- [ ] Documentar API para desarrolladores
- [ ] Crear guía de usuario
- [ ] Documentar proceso de despliegue

## Backlog (Futuras Mejoras)

### Funcionalidades Avanzadas
- [ ] Implementar análisis por lotes de wallets
- [x] Añadir reportes detallados en PDF
- [x] Implementar sistema de notificaciones
- [ ] Añadir integración con TronLink

### Escalabilidad
- [ ] Migrar a base de datos PostgreSQL
- [ ] Implementar Redis para caché y tokens
- [ ] Optimizar consultas a blockchain
- [ ] Añadir soporte para más blockchains

# Fase 2: Expansión y Nuevas Funcionalidades

## Sprint 6: Integración con Strapi CMS

### Configuración de Strapi
- [ ] Instalar y configurar Strapi como sistema de administración
- [ ] Crear modelos de datos para usuarios, wallets, transacciones y tokens
- [ ] Configurar roles y permisos para administradores y usuarios
- [ ] Implementar autenticación segura para el panel de administración

### Integración con Backend
- [ ] Crear endpoints para comunicación entre el backend y Strapi
- [ ] Implementar sincronización de datos entre sistemas
- [ ] Configurar webhooks para actualizaciones en tiempo real
- [ ] Migrar lógica de administración al sistema Strapi

### Personalización del Panel de Administración
- [ ] Personalizar la interfaz de Strapi según la identidad de TRXGuardian
- [ ] Crear dashboards personalizados para monitoreo
- [ ] Implementar vistas para gestión de usuarios y tokens
- [ ] Añadir herramientas de análisis y reportes

## Sprint 7: Sistema de Autenticación con Telegram

### Integración con Telegram
- [ ] Crear bot de Telegram para autenticación
- [ ] Implementar sistema de login mediante Telegram
- [ ] Desarrollar mecanismo de verificación de identidad
- [ ] Configurar notificaciones vía Telegram

### Validación de Wallets
- [ ] Implementar sistema de verificación de wallets TRON
- [ ] Crear proceso de validación antes del uso de la plataforma
- [ ] Desarrollar notificaciones de estado de wallet (ok/blacklist)
- [ ] Implementar historial de verificaciones

## Sprint 8: Sistema P2P para Compra/Venta de USDT

### Contrato Inteligente de Custodia
- [ ] Desarrollar contrato inteligente en TRON para retención de USDT
- [ ] Implementar funciones de depósito, liberación y arbitraje
- [ ] Crear sistema de comisiones para la plataforma
- [ ] Configurar mecanismos de seguridad y prevención de fraudes

### Plataforma de Trading P2P
- [ ] Diseñar interfaz para creación de ofertas de compra/venta
- [ ] Implementar sistema de matching entre compradores y vendedores
- [ ] Desarrollar chat integrado para comunicación entre partes
- [ ] Crear sistema de reputación y feedback

### Sistema de Disputas y Arbitraje
- [ ] Implementar proceso de apertura de disputas
- [ ] Crear panel de administración para resolución de conflictos
- [ ] Desarrollar sistema de evidencias (subida de comprobantes)
- [ ] Configurar reglas automáticas para casos comunes

### Integración con Telegram
- [ ] Diseñar interfaz responsiva optimizada para Telegram
- [ ] Implementar notificaciones en tiempo real
- [ ] Crear comandos de Telegram para gestión de operaciones
- [ ] Desarrollar mini-app de Telegram para experiencia nativa

### Seguridad y Cumplimiento
- [ ] Implementar KYC básico para usuarios
- [ ] Crear sistema de límites por nivel de verificación
- [ ] Desarrollar herramientas anti-fraude y detección de patrones sospechosos
- [ ] Configurar políticas de cumplimiento normativo