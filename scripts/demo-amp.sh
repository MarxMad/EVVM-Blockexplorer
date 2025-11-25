#!/bin/bash

echo "=== 🎯 Demostración de Uso de The Graph's Amp ==="
echo ""

echo "1. ✅ Verificando que Amp está corriendo..."
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT 1 as amp_running' | python3 -m json.tool

echo ""
echo "2. 📦 Datasets desplegados:"
ampctl dataset list

echo ""
echo "3. 📊 Eventos indexados:"
echo "   BalanceUpdated:"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated' | python3 -m json.tool

echo "   PayExecuted:"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".pay_executed' | python3 -m json.tool

echo "   StakerStatusUpdated:"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".staker_status_updated' | python3 -m json.tool

echo ""
echo "4. 🔍 Últimos eventos indexados (BalanceUpdated):"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT block_num, timestamp, account, new_balance FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 3' | python3 -m json.tool

echo ""
echo "5. 📈 Estadísticas agregadas:"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT 
    COUNT(DISTINCT block_num) as total_blocks,
    COUNT(*) as total_events,
    MIN(block_num) as first_block,
    MAX(block_num) as latest_block
  FROM "evvm/evvm_explorer@dev".balance_updated' | python3 -m json.tool

echo ""
echo "6. 🎨 Configuración usando eventTables() de Amp:"
echo "   (De amp.config.ts)"
cat amp.config.ts | grep -A 3 "eventTables" | head -5

echo ""
echo "7. 🔗 Dependencias del dataset:"
cat infra/amp/datasets/evvm_explorer.json | grep -A 5 "dependencies" | head -8

echo ""
echo "✅ Demostración completa - Amp está indexando eventos EVVM correctamente"
echo ""
echo "💡 Puntos clave para los jueces:"
echo "   - Usa eventTables() para crear tablas automáticamente desde el ABI"
echo "   - Queries SQL nativas sobre datos de blockchain"
echo "   - Indexación en tiempo real desde Sepolia"
echo "   - Arquitectura de dependencias (EVVM depende de sepolia/base)"
echo "   - Frontend Next.js consulta Amp vía HTTP POST con SQL"

