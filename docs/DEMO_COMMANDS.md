# 🎯 Comandos para la Demo - EVVM Block Explorer

Guía paso a paso con todos los comandos necesarios para hacer la demo a los jueces.

## 📋 Prerequisitos

Asegúrate de tener:
- ✅ PostgreSQL corriendo
- ✅ Amp instalado (`ampd` y `ampctl` en PATH)
- ✅ Node.js y pnpm instalados
- ✅ Variables de entorno configuradas (`.env.local`)

---

## 🚀 Paso 1: Iniciar el Servidor de Amp

Amp debe estar corriendo para que el frontend pueda consultar los datos.

```bash
# Iniciar Amp en segundo plano
pnpm run amp:server

# O manualmente:
ampd --config infra/amp/config.toml dev > /tmp/amp-server.log 2>&1 &

# Verificar que está corriendo
tail -f /tmp/amp-server.log
```

**Verificar que Amp está corriendo:**
```bash
# Probar una query simple
pnpm run amp:query 'SELECT 1 as test'

# O verificar el endpoint
curl -X POST http://localhost:1603 -H "Content-Type: text/plain" -d 'SELECT 1 as test'
```

---

## 📊 Paso 2: Verificar que los Datos Están Indexados

Antes de la demo, verifica que hay datos disponibles:

```bash
# Ver cuántos eventos BalanceUpdated hay
pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated'

# Ver cuántos eventos StakerStatusUpdated hay
pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".staker_status_updated'

# Ver cuántos eventos PayExecuted hay (si hay pagos)
pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".pay_executed'

# Ver algunos eventos BalanceUpdated
pnpm run amp:query 'SELECT * FROM "evvm/evvm_explorer@dev".balance_updated LIMIT 5'

# Ver transacciones del dataset base
pnpm run amp:query 'SELECT COUNT(*) as total FROM "sepolia/base@dev".transactions'
```

**Si no hay datos suficientes, puedes generar más transacciones de prueba:**
```bash
# Generar transacciones de prueba
pnpm run forge:test-transactions

# O manualmente:
forge script scripts/GenerateTestTransactions.s.sol:GenerateTestTransactions \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --private-key $PRIVATE_KEY
```

---

## 🎨 Paso 3: Iniciar el Frontend

```bash
# Instalar dependencias (si es necesario)
pnpm install

# Iniciar el servidor de desarrollo
pnpm run dev

# El frontend estará disponible en:
# http://localhost:3000
```

**En otra terminal, puedes verificar que el frontend puede consultar Amp:**
```bash
# Verificar que el endpoint de Amp está configurado
echo $NEXT_PUBLIC_AMP_QUERY_URL

# Debería ser: http://localhost:1603
```

---

## 🔍 Paso 4: Verificar que Todo Funciona

### Verificar en el Navegador:
1. Abre http://localhost:3000
2. Deberías ver:
   - Estadísticas (Total Blocks, Latest Block, etc.)
   - Últimos bloques
   - Últimas transacciones

### Verificar desde la Terminal:

```bash
# Ver logs de Amp en tiempo real
tail -f /tmp/amp-server.log

# Ver logs del frontend (si hay errores)
# Los logs aparecen en la terminal donde corriste `pnpm run dev`
```

---

## 📝 Comandos Útiles Durante la Demo

### Ver Datos en Tiempo Real:

```bash
# Ver últimos eventos BalanceUpdated
pnpm run amp:query 'SELECT account, token, new_balance, block_num, timestamp FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 10'

# Ver últimos eventos StakerStatusUpdated
pnpm run amp:query 'SELECT user, is_staker, block_num, timestamp FROM "evvm/evvm_explorer@dev".staker_status_updated ORDER BY block_num DESC LIMIT 10'

# Ver estadísticas generales
pnpm run amp:query 'SELECT COUNT(DISTINCT block_num) as total_blocks, COUNT(*) as total_events FROM "evvm/evvm_explorer@dev".balance_updated'
```

### Verificar Estado de Indexación:

```bash
# Ver progreso del dataset base
tail -20 /tmp/amp-server.log | grep -E "(progress|blocks|sepolia)"

# Ver cuántas transacciones se han indexado
pnpm run amp:query 'SELECT COUNT(*) as total FROM "sepolia/base@dev".transactions'
```

---

## 🛠️ Solución de Problemas

### Si Amp no está corriendo:

```bash
# Detener procesos anteriores
pkill -f "ampd.*config.toml"

# Reiniciar Amp
pnpm run amp:server
```

### Si no hay datos:

```bash
# Verificar que el dataset está desplegado
ampctl dataset list

# Verificar que el dataset base está indexando
tail -50 /tmp/amp-server.log | grep "sepolia/base"

# Si es necesario, redesplegar el dataset
pnpm run amp:build
pnpm run amp:register
pnpm run amp:deploy
```

### Si el frontend no muestra datos:

```bash
# Verificar que Amp está respondiendo
curl -X POST http://localhost:1603 \
  -H "Content-Type: text/plain" \
  -d 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated'

# Verificar la variable de entorno
echo $NEXT_PUBLIC_AMP_QUERY_URL

# Debería ser: http://localhost:1603
```

---

## 🎬 Script de Inicio Rápido (Todo en Uno)

Crea un script `demo-start.sh`:

```bash
#!/bin/bash

echo "🚀 Iniciando demo del EVVM Block Explorer..."

# 1. Iniciar Amp
echo "📊 Iniciando servidor de Amp..."
pnpm run amp:server
sleep 3

# 2. Verificar que Amp está corriendo
echo "✅ Verificando Amp..."
pnpm run amp:query 'SELECT 1 as test' > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✓ Amp está corriendo"
else
  echo "✗ Error: Amp no está respondiendo"
  exit 1
fi

# 3. Verificar datos
echo "📊 Verificando datos indexados..."
BALANCE_COUNT=$(pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated' 2>/dev/null | grep -o '"total":[0-9]*' | cut -d: -f2)
echo "  - Eventos BalanceUpdated: $BALANCE_COUNT"

# 4. Iniciar frontend
echo "🎨 Iniciando frontend..."
echo ""
echo "✅ Todo listo!"
echo ""
echo "📊 Amp: http://localhost:1603"
echo "🎨 Frontend: http://localhost:3000"
echo ""
echo "Presiona Ctrl+C para detener todo"
echo ""

pnpm run dev
```

**Hacer ejecutable:**
```bash
chmod +x demo-start.sh
./demo-start.sh
```

---

## 📋 Checklist Pre-Demo

Antes de la demo, verifica:

- [ ] PostgreSQL está corriendo
- [ ] Amp está corriendo (`pnpm run amp:query 'SELECT 1'` funciona)
- [ ] Hay datos indexados (al menos algunos eventos)
- [ ] El frontend puede conectarse a Amp
- [ ] El frontend muestra datos en http://localhost:3000
- [ ] Tienes transacciones de prueba generadas (opcional)

---

## 🎯 Puntos Clave para la Demo

1. **Mostrar que los datos vienen de eventos reales del contrato**
   - Explicar que `eventTables()` indexa automáticamente todos los eventos
   - Mostrar que cuando se llama `pay()`, el evento aparece automáticamente

2. **Mostrar la arquitectura**
   - Amp indexa eventos de Sepolia
   - Frontend consulta Amp vía SQL sobre HTTP
   - Todo es automático y en tiempo real

3. **Mostrar funcionalidades**
   - Explorador de bloques
   - Explorador de transacciones
   - Explorador de direcciones
   - Estadísticas en tiempo real

---

## 🔗 URLs Importantes

- **Frontend**: http://localhost:3000
- **Amp Endpoint**: http://localhost:1603
- **Amp Logs**: `/tmp/amp-server.log`
- **Sepolia Explorer**: https://sepolia.etherscan.io

---

## 📚 Documentación Adicional

- `docs/QUICK_START.md` - Guía de inicio rápido
- `docs/HOW_TO_VIEW_DATABASES.md` - Cómo ver las bases de datos
- `docs/DEPLOY_EVVM_WITH_EVENTS.md` - Cómo desplegar el contrato

---

¡Buena suerte con la demo! 🚀

