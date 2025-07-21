#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Iniciando TRXGuardian - Modo Desarrollo   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Iniciar el backend
echo -e "${GREEN}Iniciando el backend...${NC}"
cd ../validador-wallets-trx-backend
npm install
npm start &
BACKEND_PID=$!

# Volver al directorio principal
cd ../verificadortrx

# Iniciar el frontend
echo -e "${GREEN}Iniciando el frontend...${NC}"
cd frontend
npm install
npm start &
FRONTEND_PID=$!

# Función para manejar la terminación
cleanup() {
    echo -e "${RED}Deteniendo servicios...${NC}"
    kill $BACKEND_PID
    kill $FRONTEND_PID
    exit 0
}

# Capturar señales de terminación
trap cleanup SIGINT SIGTERM

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   TRXGuardian está en ejecución   ${NC}"
echo -e "${BLUE}   Backend: http://localhost:3000   ${NC}"
echo -e "${BLUE}   Frontend: http://localhost:3000 o http://localhost:5173   ${NC}"
echo -e "${BLUE}   Wallet de administrador: TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm   ${NC}"
echo -e "${BLUE}=======================================${NC}"

# Mantener el script en ejecución
wait