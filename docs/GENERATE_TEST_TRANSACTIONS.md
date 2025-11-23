# 🧪 Generar Transacciones de Prueba

Este documento explica cómo generar transacciones de prueba para el contrato EVVM con eventos.

## 📋 Opciones Disponibles

### 1. **addBalance** (Más Simple) ⭐ Recomendado

La función `addBalance` es la más simple porque:
- ✅ No requiere firmas
- ✅ Puede ser llamada por cualquiera (función pública)
- ✅ Emite el evento `BalanceUpdated`
- ✅ Perfecta para testing

**Uso con `cast` (Foundry):**

```bash
# Agregar 1 ETH (en wei) a una dirección
cast send 0x4Db514984aAE6A24A05f07c30310050c245b0256 \
  "addBalance(address,address,uint256)" \
  0xTU_DIRECCION \
  0x0000000000000000000000000000000000000000 \
  1000000000000000000 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

**Parámetros:**
- `0x4Db514984aAE6A24A05f07c30310050c245b0256` - Dirección del contrato
- `0xTU_DIRECCION` - Dirección que recibirá el balance
- `0x0000000000000000000000000000000000000000` - Token (address(0) = ETH)
- `1000000000000000000` - Cantidad en wei (1 ETH = 10^18 wei)

### 2. **pay** (Requiere Firma)

La función `pay` requiere:
- ✅ Firma EIP-191 del usuario que envía
- ✅ Balance previo en el contrato
- ✅ Emite `PayExecuted`

**Requisitos:**
- El usuario debe tener balance (usar `addBalance` primero)
- Necesitas generar una firma EIP-191
- El mensaje a firmar incluye: evvmID, from, to, token, amount, priorityFee, nonce, priorityFlag, executor

**Uso con script de Foundry** (ver `scripts/GenerateTestTransactions.s.sol`)

### 3. **setPointStaker** (Cambiar Estado de Staker)

La función `setPointStaker`:
- ✅ No requiere firma
- ✅ Emite `StakerStatusUpdated`
- ✅ Útil para probar eventos de staking

**Uso:**

```bash
cast send 0x4Db514984aAE6A24A05f07c30310050c245b0256 \
  "setPointStaker(address,bytes1)" \
  0xTU_DIRECCION \
  0x01 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 4. **caPay** (Desde Contrato)

La función `caPay` solo puede ser llamada desde un contrato:
- ✅ No requiere firma
- ✅ Emite eventos de balance
- ❌ Requiere desplegar un contrato helper

## 🚀 Script de Foundry para Generar Transacciones

El proyecto incluye un script de Foundry que genera transacciones de prueba:

```bash
# Ejecutar el script
forge script scripts/GenerateTestTransactions.s.sol:GenerateTestTransactions \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  -vvv
```

Este script:
1. Agrega balance a varias cuentas de prueba
2. Cambia el estado de staker para algunas cuentas
3. Genera eventos que Amp indexará automáticamente

## 📊 Eventos que se Generan

Cada tipo de transacción genera diferentes eventos:

| Función | Evento Emitido | Tabla en Amp |
|---------|---------------|--------------|
| `addBalance` | `BalanceUpdated` | `balance_updated` |
| `setPointStaker` | `StakerStatusUpdated` | `staker_status_updated` |
| `pay` | `PayExecuted` | `pay_executed` |
| `payMultiple` | `PayMultipleExecuted` | `pay_multiple_executed` |
| `dispersePay` | `DispersePayExecuted` | `disperse_pay_executed` |

## 🔍 Verificar Eventos en Amp

Después de generar transacciones, verifica que se indexaron:

```bash
# Ver cambios de balance
pnpm run amp:query 'SELECT * FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 10'

# Ver cambios de staker
pnpm run amp:query 'SELECT * FROM "evvm/evvm_explorer@dev".staker_status_updated ORDER BY block_num DESC LIMIT 10'
```

## 💡 Recomendación

Para empezar rápido, usa `addBalance` varias veces con diferentes direcciones:

```bash
# Generar 5 transacciones de prueba
for i in {1..5}; do
  cast send 0x4Db514984aAE6A24A05f07c30310050c245b0256 \
    "addBalance(address,address,uint256)" \
    0xC6080a5871Dd8aa694a4Cc3aACEEBC2292e54f02 \
    0x0000000000000000000000000000000000000000 \
    $((i * 1000000000000000000)) \
    --rpc-url $SEPOLIA_RPC_URL \
    --private-key $PRIVATE_KEY
  sleep 2
done
```

Esto generará 5 eventos `BalanceUpdated` que Amp indexará automáticamente.

