#!/bin/bash

# Script para generar transacciones de prueba manualmente
# Uso: ./scripts/generate-transactions.sh

set -e

echo "🚀 Generando transacciones de prueba..."
echo ""

# Cargar variables de entorno desde .env si existe
if [ -f .env ]; then
  echo "📄 Cargando variables desde .env..."
  # Cargar variables de forma segura (sin exportar comentarios)
  set -a
  source .env
  set +a
  echo "✅ Variables cargadas desde .env"
else
  echo "⚠️  Archivo .env no encontrado, usando variables del entorno actual"
fi

# ETHERSCAN_API_KEY es opcional (solo necesario para verificar contratos)
if [ -z "$ETHERSCAN_API_KEY" ]; then
  export ETHERSCAN_API_KEY=""
  echo "ℹ️  ETHERSCAN_API_KEY no configurada (opcional, solo para verificación)"
fi

# Verificar que las variables estén configuradas
if [ -z "$SEPOLIA_RPC_URL" ]; then
  echo "❌ Error: SEPOLIA_RPC_URL no está configurada"
  echo "   Configúrala en .env o con: export SEPOLIA_RPC_URL='https://ethereum-sepolia-rpc.publicnode.com'"
  exit 1
fi

if [ -z "$PRIVATE_KEY" ]; then
  echo "❌ Error: PRIVATE_KEY no está configurada"
  echo "   Configúrala en .env o con: export PRIVATE_KEY='tu_private_key'"
  exit 1
fi

echo "✅ Variables de entorno configuradas:"
echo "   SEPOLIA_RPC_URL: ${SEPOLIA_RPC_URL}"
echo "   PRIVATE_KEY: ${PRIVATE_KEY:0:10}... (${#PRIVATE_KEY} caracteres)"
echo ""

# Ejecutar el script de Foundry
echo "📤 Ejecutando script de Foundry..."
echo ""

forge script scripts/GenerateTestTransactions.s.sol:GenerateTestTransactions \
  --rpc-url "$SEPOLIA_RPC_URL" \
  --broadcast \
  --private-key "$PRIVATE_KEY" \
  -vvv

echo ""
echo "✅ Script ejecutado. Verifica los eventos en Amp con:"
echo "   pnpm run amp:query 'SELECT COUNT(*) FROM \"evvm/evvm_explorer@dev\".balance_updated'"

