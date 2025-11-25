# 🎯 Comandos para Demostrar el Uso de Amp

Lista de comandos para demostrar a los jueces que estás usando The Graph's Amp para indexar eventos EVVM.

## 📊 1. Verificar que Amp está Corriendo

```bash
# Verificar que el servidor está activo
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT 1 as amp_running'
```

**Resultado esperado**: `{"amp_running":1}`

## 📦 2. Listar Datasets Desplegados

```bash
# Ver todos los datasets registrados
ampctl dataset list
```

**Resultado esperado**: Deberías ver `evvm/evvm_explorer@dev` y `sepolia/base@dev`

## 🗂️ 3. Ver Tablas Disponibles (EventTables de Amp)

```bash
# Ver todas las tablas creadas automáticamente por eventTables()
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SHOW TABLES' | grep -i "evvm/evvm_explorer"
```

**Resultado esperado**: Deberías ver tablas como:
- `balance_updated`
- `pay_executed`
- `staker_status_updated`
- `reward_given`
- etc.

## 📈 4. Verificar Eventos Indexados

```bash
# Contar eventos de BalanceUpdated
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated'

# Contar eventos de PayExecuted
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".pay_executed'

# Contar eventos de StakerStatusUpdated
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".staker_status_updated'
```

## 🔍 5. Ver Datos Indexados Recientes

```bash
# Últimos 5 eventos de BalanceUpdated
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT block_num, timestamp, account, new_balance FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 5'

# Últimos bloques EVVM indexados
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT block_num as block_number, MAX(timestamp) as timestamp, COUNT(*) as transaction_count FROM "evvm/evvm_explorer@dev".balance_updated GROUP BY block_num ORDER BY block_num DESC LIMIT 5'
```

## 🎨 6. Demostrar Uso de eventTables() de Amp

```bash
# Ver la estructura de una tabla generada automáticamente por eventTables()
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'DESCRIBE "evvm/evvm_explorer@dev".balance_updated'
```

**Punto clave**: Estas tablas fueron creadas automáticamente por Amp usando `eventTables(abi, "sepolia")` en `amp.config.ts`

## 📝 7. Ver Configuración de Amp

```bash
# Ver el archivo de configuración que usa eventTables()
cat amp.config.ts | grep -A 5 "eventTables"
```

**Resultado esperado**: Deberías ver:
```typescript
tables: eventTables(abi, "sepolia"),
```

## 🔗 8. Verificar Dependencias de Datasets

```bash
# Ver que el dataset EVVM depende del dataset base de Sepolia
cat infra/amp/datasets/evvm_explorer.json | grep -A 3 "dependencies"
```

**Punto clave**: Muestra que estás usando la arquitectura de dependencias de Amp

## 📊 9. Query Compleja Demostrando SQL en Amp

```bash
# Estadísticas agregadas usando SQL de Amp
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT 
    COUNT(DISTINCT block_num) as total_blocks,
    COUNT(*) as total_events,
    MIN(block_num) as first_block,
    MAX(block_num) as latest_block
  FROM "evvm/evvm_explorer@dev".balance_updated'
```

## 🚀 10. Verificar que el Frontend Usa Amp

```bash
# Ver la configuración del frontend que apunta a Amp
grep -r "AMP_ENDPOINT\|AMP_QUERY_URL" .env* lib/config.ts 2>/dev/null | head -5
```

## 📋 Script Completo para Demostración

Crea un archivo `demo-amp.sh` con todos los comandos:

```bash
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

echo ""
echo "4. 🔍 Últimos eventos indexados:"
curl -s -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT block_num, timestamp, account, new_balance FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 3' | python3 -m json.tool

echo ""
echo "5. 🎨 Configuración usando eventTables():"
cat amp.config.ts | grep -A 3 "eventTables"

echo ""
echo "✅ Demostración completa - Amp está indexando eventos EVVM correctamente"
```

## 🎯 Puntos Clave para los Jueces

1. **eventTables() automático**: Amp crea tablas automáticamente desde el ABI del contrato
2. **SQL nativo**: Queries SQL directas sobre datos de blockchain
3. **Indexación en tiempo real**: Los eventos se indexan automáticamente desde Sepolia
4. **Arquitectura de dependencias**: El dataset EVVM depende del dataset base de Sepolia
5. **Integración completa**: El frontend Next.js consulta Amp vía HTTP POST con SQL

## 📸 Screenshots Recomendados

1. Output de `ampctl dataset list` mostrando los datasets
2. Query SQL exitosa mostrando datos indexados
3. Código de `amp.config.ts` mostrando `eventTables()`
4. Frontend mostrando datos obtenidos de Amp

