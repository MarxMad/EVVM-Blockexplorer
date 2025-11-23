#!/bin/bash
# Script para instalar dependencias de Foundry para el proyecto EVVM

set -e

echo "🔧 Instalando dependencias de Foundry..."

# Verificar que Foundry está instalado
if ! command -v forge &> /dev/null; then
    echo "❌ Foundry no está instalado. Instálalo primero:"
    echo "   curl -L https://foundry.paradigm.xyz | bash"
    echo "   foundryup"
    exit 1
fi

echo "✅ Foundry está instalado"

# Crear directorio lib si no existe
mkdir -p lib

# Instalar dependencias de EVVM
echo "📦 Instalando EVVM-org/Testnet-Contracts..."
if [ ! -d "lib/testnet-contracts" ]; then
    forge install EVVM-org/Testnet-Contracts
    echo "✅ EVVM-org/Testnet-Contracts instalado"
else
    echo "✅ EVVM-org/Testnet-Contracts ya está instalado"
fi

# Instalar OpenZeppelin
echo "📦 Instalando OpenZeppelin..."
if [ ! -d "lib/openzeppelin-contracts" ]; then
    forge install OpenZeppelin/openzeppelin-contracts
    echo "✅ OpenZeppelin instalado"
else
    echo "✅ OpenZeppelin ya está instalado"
fi

# Verificar que foundry.toml existe
if [ ! -f "foundry.toml" ]; then
    echo "⚠️  foundry.toml no existe, creándolo..."
    # El foundry.toml ya fue creado anteriormente
fi

echo ""
echo "✅ Todas las dependencias están instaladas"
echo ""
echo "📝 Próximos pasos:"
echo "1. Configura .env con tus variables de entorno"
echo "2. Compila: forge build"
echo "3. Despliega: forge script scripts/DeployEvvmWithEvents.s.sol --rpc-url \$SEPOLIA_RPC_URL --broadcast"

