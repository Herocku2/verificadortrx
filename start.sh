#!/bin/bash

# Colores para mensajes
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   Iniciando TRXGuardian - Forensic Wallet Risk Scanner   ${NC}"
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

echo -e "${GREEN}Iniciando servicios con Docker Compose...${NC}"
docker-compose up -d

# Verificar si los contenedores se iniciaron correctamente
if [ $? -eq 0 ]; then
    echo -e "${GREEN}¡Servicios iniciados correctamente!${NC}"
    echo -e "${GREEN}Frontend: http://localhost:5173${NC}"
    echo -e "${GREEN}Backend: http://localhost:3000${NC}"
    echo -e "${BLUE}Wallet de administrador: TJF7BrGJREfNFjBoCVdSNQyLw1PV5s37hm${NC}"
    echo -e "${BLUE}Para acceder al panel de administración, conecta esta wallet y navega a /admin${NC}"
else
    echo -e "${RED}Error al iniciar los servicios. Revisa los logs para más detalles.${NC}"
    exit 1
fi

echo -e "${BLUE}=======================================${NC}"
echo -e "${BLUE}   TRXGuardian está en ejecución   ${NC}"
echo -e "${BLUE}=======================================${NC}"