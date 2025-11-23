#!/bin/bash

# Script para obtener el ABI del contrato EVVM desde Etherscan
# Uso: ./scripts/get-abi.sh [API_KEY]
# 
# Nota: Etherscan ahora requiere API key para la mayoría de endpoints
# Obtén una API key gratuita en: https://etherscan.io/apis

CONTRACT_ADDRESS="0x9902984d86059234c3B6e11D5eAEC55f9627dD0f"
NETWORK="sepolia"
OUTPUT_FILE="abis/EVVM.json"
API_KEY="${1:-}"

# Crear directorio si no existe
mkdir -p abis

echo "Obteniendo ABI del contrato EVVM desde Etherscan..."
echo "Contrato: $CONTRACT_ADDRESS"
echo "Red: $NETWORK"
echo ""

if [ -z "$API_KEY" ]; then
  echo "⚠️  No se proporcionó API key"
  echo ""
  echo "Opciones:"
  echo "1. Obtén una API key gratuita en: https://etherscan.io/apis"
  echo "2. Ejecuta: ./scripts/get-abi.sh TU_API_KEY"
  echo ""
  echo "O obtén el ABI manualmente:"
  echo "  1. Ve a: https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#code"
  echo "  2. Busca la sección 'Contract ABI'"
  echo "  3. Copia el JSON completo"
  echo "  4. Guárdalo en: $OUTPUT_FILE"
  exit 1
fi

# Obtener el ABI usando API v2 (requiere API key)
API_URL="https://api-sepolia.etherscan.io/v2/api"
RESPONSE=$(curl -s "${API_URL}?module=contract&action=getabi&address=${CONTRACT_ADDRESS}&apikey=${API_KEY}")

# Verificar si la respuesta es válida
if echo "$RESPONSE" | jq -e '.result' > /dev/null 2>&1; then
  echo "$RESPONSE" | jq -r '.result' > "$OUTPUT_FILE"
  
  if [ -s "$OUTPUT_FILE" ]; then
    echo "✓ ABI guardado en $OUTPUT_FILE"
    echo ""
    echo "Ahora puedes importarlo en amp.config.ts:"
    echo "  import EVVM_ABI from './abis/EVVM.json'"
  else
    echo "✗ Error: El ABI está vacío"
    echo "Respuesta de la API:"
    echo "$RESPONSE" | jq '.'
    exit 1
  fi
else
  echo "✗ Error al obtener el ABI"
  echo "Respuesta de la API:"
  echo "$RESPONSE" | jq '.' 2>/dev/null || echo "$RESPONSE"
  echo ""
  echo "Obtén el ABI manualmente desde:"
  echo "https://sepolia.etherscan.io/address/${CONTRACT_ADDRESS}#code"
  exit 1
fi

