#!/bin/bash

# Script de inicio rápido para la demo del EVVM Block Explorer

set -e

echo "🚀 Iniciando demo del EVVM Block Explorer..."
echo ""

# Colores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Verificar que PostgreSQL está corriendo
echo "📊 Verificando PostgreSQL..."
if pg_isready -q; then
  echo -e "${GREEN}✓ PostgreSQL está corriendo${NC}"
else
  echo -e "${RED}✗ Error: PostgreSQL no está corriendo${NC}"
  echo "   Inicia PostgreSQL con: brew services start postgresql@14"
  exit 1
fi

# 2. Verificar que Amp está instalado
echo "📊 Verificando Amp..."
if command -v ampd &> /dev/null && command -v ampctl &> /dev/null; then
  echo -e "${GREEN}✓ Amp está instalado${NC}"
else
  echo -e "${RED}✗ Error: Amp no está instalado${NC}"
  echo "   Instala Amp siguiendo: docs/QUICK_START.md"
  exit 1
fi

# 3. Detener procesos anteriores de Amp
echo "🛑 Deteniendo procesos anteriores de Amp..."
pkill -f "ampd.*config.toml" 2>/dev/null || true
sleep 2

# 4. Iniciar Amp
echo "📊 Iniciando servidor de Amp..."
cd "$(dirname "$0")/.."
pnpm run amp:server > /tmp/amp-server.log 2>&1 &
AMP_PID=$!
sleep 5

# 5. Verificar que Amp está respondiendo
echo "✅ Verificando que Amp está respondiendo..."
for i in {1..10}; do
  if curl -s -X POST http://localhost:1603 -H "Content-Type: text/plain" -d 'SELECT 1 as test' > /dev/null 2>&1; then
    echo -e "${GREEN}✓ Amp está corriendo${NC}"
    break
  fi
  if [ $i -eq 10 ]; then
    echo -e "${RED}✗ Error: Amp no está respondiendo después de 10 intentos${NC}"
    echo "   Revisa los logs: tail -f /tmp/amp-server.log"
    exit 1
  fi
  sleep 1
done

# 6. Verificar datos indexados
echo "📊 Verificando datos indexados..."
BALANCE_COUNT=$(pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated' 2>/dev/null | grep -o '"total":[0-9]*' | cut -d: -f2 || echo "0")
STAKER_COUNT=$(pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".staker_status_updated' 2>/dev/null | grep -o '"total":[0-9]*' | cut -d: -f2 || echo "0")

echo "  - Eventos BalanceUpdated: $BALANCE_COUNT"
echo "  - Eventos StakerStatusUpdated: $STAKER_COUNT"

if [ "$BALANCE_COUNT" = "0" ] && [ "$STAKER_COUNT" = "0" ]; then
  echo -e "${YELLOW}⚠ Advertencia: No hay datos indexados${NC}"
  echo "   Puedes generar transacciones de prueba con: pnpm run forge:test-transactions"
else
  echo -e "${GREEN}✓ Hay datos indexados${NC}"
fi

# 7. Verificar variables de entorno
echo "🔍 Verificando configuración..."
if [ -z "$NEXT_PUBLIC_AMP_QUERY_URL" ]; then
  echo -e "${YELLOW}⚠ NEXT_PUBLIC_AMP_QUERY_URL no está configurado${NC}"
  echo "   Usando valor por defecto: http://localhost:1603"
else
  echo -e "${GREEN}✓ NEXT_PUBLIC_AMP_QUERY_URL: $NEXT_PUBLIC_AMP_QUERY_URL${NC}"
fi

# 8. Resumen
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Todo listo para la demo!${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Amp está corriendo en: http://localhost:1603"
echo "🎨 Inicia el frontend con: pnpm run dev"
echo "🌐 El frontend estará en: http://localhost:3000"
echo ""
echo "📝 Comandos útiles:"
echo "   - Ver logs de Amp: tail -f /tmp/amp-server.log"
echo "   - Verificar datos: pnpm run amp:query 'SELECT COUNT(*) FROM \"evvm/evvm_explorer@dev\".balance_updated'"
echo "   - Detener Amp: pkill -f \"ampd.*config.toml\""
echo ""
echo "📖 Guía completa: docs/DEMO_COMMANDS.md"
echo ""
echo "Presiona Ctrl+C para detener Amp"
echo ""

# Mantener el script corriendo
wait $AMP_PID

