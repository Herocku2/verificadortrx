#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Desplegando TRXGuardian - Forensic Wallet Risk Scanner   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Verificar si Docker está instalado
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker no está instalado. Por favor, instala Docker antes de continuar.${NC}"
    exit 1
fi

# Verificar si Docker Compose está instalado
if ! command -v docker-compose &> /dev/null; then
    echo -e "${RED}Docker Compose no está instalado. Por favor, instala Docker Compose antes de continuar.${NC}"
    exit 1
fi

# Verificar si Git está instalado
if ! command -v git &> /dev/null; then
    echo -e "${RED}Git no está instalado. Por favor, instala Git antes de continuar.${NC}"
    exit 1
fi

# Crear directorio para variables de entorno si no existe
mkdir -p .env

# Solicitar variables de entorno
echo -e "${YELLOW}Configurando variables de entorno...${NC}"

# Variables para el backend
read -p "Puerto del backend (default: 3000): " BACKEND_PORT
BACKEND_PORT=${BACKEND_PORT:-3000}

read -p "URL de TronGrid API (default: https://api.trongrid.io): " TRON_NODE
TRON_NODE=${TRON_NODE:-https://api.trongrid.io}

read -p "Dirección del contrato USDT (default: TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t): " CONTRACT_USDT
CONTRACT_USDT=${CONTRACT_USDT:-TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t}

read -p "API Key de NowPayments: " NOWPAYMENTS_API_KEY

# Variables para el frontend
read -p "Puerto del frontend (default: 80): " FRONTEND_PORT
FRONTEND_PORT=${FRONTEND_PORT:-80}

read -p "URL del backend (default: http://localhost:${BACKEND_PORT}): " BACKEND_URL
BACKEND_URL=${BACKEND_URL:-http://localhost:${BACKEND_PORT}}

# Crear archivo .env para el backend
echo -e "${GREEN}Creando archivo .env para el backend...${NC}"
cat > validador-wallets-trx-backend/.env << EOF
PORT=${BACKEND_PORT}
TRON_NODE=${TRON_NODE}
CONTRACT_USDT=${CONTRACT_USDT}
NOWPAYMENTS_API_KEY=${NOWPAYMENTS_API_KEY}
FRONTEND_URL=http://localhost:${FRONTEND_PORT}
BACKEND_URL=${BACKEND_URL}
EOF

# Crear archivo .env para el frontend
echo -e "${GREEN}Creando archivo .env para el frontend...${NC}"
cat > verificadortrx/frontend/.env << EOF
REACT_APP_API_URL=${BACKEND_URL}/api
EOF

# Actualizar docker-compose.yml con los puertos configurados
echo -e "${GREEN}Actualizando docker-compose.yml...${NC}"
sed -i "s/- \"5173:5173\"/- \"${FRONTEND_PORT}:5173\"/g" docker-compose.yml
sed -i "s/- \"3000:3000\"/- \"${BACKEND_PORT}:3000\"/g" docker-compose.yml

# Construir y levantar los contenedores
echo -e "${GREEN}Construyendo y levantando contenedores Docker...${NC}"
docker-compose build
docker-compose up -d

# Verificar si los contenedores se iniciaron correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Servicios iniciados correctamente!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:${FRONTEND_PORT}${NC}"
    echo -e "${GREEN}Backend: ${BACKEND_URL}${NC}"
    echo -e "${BLUE}Wallet de administrador: TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm${NC}"
    echo -e "${BLUE}Para acceder al panel de administración, conecta esta wallet y navega a /admin${NC}"
else
    echo -e "${RED}Error al iniciar los servicios. Revisa los logs para más detalles.${NC}"
    docker-compose logs
    exit 1
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   TRXGuardian está en ejecución   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Mostrar información sobre cómo detener los servicios
echo -e "${YELLOW}Para detener los servicios, ejecuta:${NC}"
echo -e "${YELLOW}docker-compose down${NC}"

# Mostrar información sobre cómo ver los logs
echo -e "${YELLOW}Para ver los logs, ejecuta:${NC}"
echo -e "${YELLOW}docker-compose logs -f${NC}"