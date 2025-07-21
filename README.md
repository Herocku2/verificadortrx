# TRXGuardian - Forensic Wallet Risk Scanner

TRXGuardian es una aplicación web avanzada centrada en la verificación forense y análisis de riesgo de wallets en la red TRON. La aplicación permite a los usuarios verificar el estado de una wallet TRX, obteniendo información sobre su estado en listas negras, fechas clave de inclusión/exclusión, relaciones con otras wallets sospechosas y un diagnóstico de riesgo.

## Estructura del Proyecto

```
TRXGuardian
├── backend (Node.js/Express)
│   ├── src
│   │   ├── routes
│   │   │   ├── verificar.js
│   │   │   ├── users.js
│   │   │   └── payments.js
│   │   ├── services
│   │   │   ├── validadorDirecto.js
│   │   │   ├── tokenService.js
│   │   │   └── paymentService.js
│   │   └── index.js
│   ├── .env
│   └── package.json
│
├── frontend (React)
│   ├── src
│   │   ├── components
│   │   │   ├── Navbar.js
│   │   │   ├── Footer.js
│   │   │   └── WalletInput.js
│   │   ├── pages
│   │   │   ├── HomePage.js
│   │   │   ├── ScannerPage.js
│   │   │   ├── PricingPage.js
│   │   │   └── admin/...
│   │   ├── services
│   │   │   └── api.js
│   │   ├── context
│   │   │   └── UserContext.js
│   │   └── App.js
│   └── package.json
│
└── docs
    ├── requirements.md
    ├── design.md
    └── tasks.md
```

## Características Principales

- **Validación Forense de Wallets**: Verifica si una wallet está en blacklist, extrae eventos y analiza conexiones.
- **Motor de Análisis Inteligente**: Proporciona diagnóstico con semáforo de riesgo (bajo, medio, alto).
- **Sistema de Tokens**: Cada análisis cuesta 1 token, con diferentes planes disponibles.
- **Bonificación Automática**: Cada compra de plan otorga 5 tokens extra.
- **Seguridad y Anonimato**: No se recolectan datos personales, todo se maneja por dirección TRX.
- **Integración con NowPayments**: Para la compra de planes y tokens.
- **Panel de Administración**: Exclusivo para la wallet TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm.
- **Informes Detallados**: Generación de informes completos en múltiples formatos (texto, HTML, PDF).
- **Compartir en Telegram**: Funcionalidad para compartir informes directamente en Telegram.
- **Sistema de Revendedores**: Permite a administradores crear revendedores que pueden ofrecer membresías con descuento.

## Planes Disponibles

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

## Instalación y Configuración

### Backend

1. Clonar el repositorio:
   ```
   git clone https://github.com/tu-usuario/validador-wallets-trx-backend.git
   cd validador-wallets-trx-backend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Configurar variables de entorno:
   ```
   cp .env.example .env
   ```
   Editar el archivo `.env` con tus propias claves API.

4. Iniciar el servidor:
   ```
   npm start
   ```

### Frontend

1. Navegar a la carpeta del frontend:
   ```
   cd verificadortrx/frontend
   ```

2. Instalar dependencias:
   ```
   npm install
   ```

3. Iniciar el servidor de desarrollo:
   ```
   npm start
   ```

## Acceso al Panel de Administración

El panel de administración está disponible solo para la wallet TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm. Para acceder:

1. Conecta tu wallet TronLink o ingresa manualmente la dirección TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm.
2. Navega a la ruta `/admin` para acceder al dashboard de administración.

## Tecnologías Utilizadas

- **Backend**: Node.js, Express, TronWeb
- **Frontend**: React, Styled Components, Framer Motion
- **APIs Externas**: TronGrid, NowPayments
- **Almacenamiento**: Redis (para tokens y sesiones)

## Contribución

Si deseas contribuir al proyecto, por favor:

1. Haz un fork del repositorio
2. Crea una rama para tu característica (`git checkout -b feature/amazing-feature`)
3. Haz commit de tus cambios (`git commit -m 'Add some amazing feature'`)
4. Push a la rama (`git push origin feature/amazing-feature`)
5. Abre un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo LICENSE para más detalles.