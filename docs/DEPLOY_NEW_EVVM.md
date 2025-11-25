# 🚀 Guía: Desplegar una Nueva EVVM y Registrarla en el Explorador

Esta guía te ayudará a desplegar una nueva instancia de EVVM con el contrato optimizado (`EvvmWithEvents.sol`) y configurarla para que el explorador pueda indexar sus eventos.

## 📋 Prerrequisitos

1. **Variables de entorno configuradas** en `.env`:
   ```bash
   PRIVATE_KEY=tu_private_key_sin_0x
   SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
   BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
   BASE_RPC_URL=https://mainnet.base.org
   ```

2. **Amp configurado y corriendo** (ver [docs/SETUP.md](./SETUP.md))

3. **Dependencias instaladas**:
   ```bash
   pnpm install
   pnpm run forge:install-deps
   ```

## 🎯 Paso 1: Desplegar el Contrato EVVM

### 1.1 Elegir la Blockchain

Decide en qué blockchain quieres desplegar:
- **Sepolia** (testnet de Ethereum) - Chain ID: 11155111
- **Base Sepolia** (testnet de Base) - Chain ID: 84532
- **Base** (mainnet) - Chain ID: 8453

### 1.2 Configurar el Script de Deployment

Edita `scripts/DeployEvvmWithEvents.s.sol` y ajusta:

```solidity
// Para Sepolia (usa las direcciones existentes)
address constant STAKING_CONTRACT = address(0); // O la dirección real
address constant NAMESERVICE = address(0); // O la dirección real
address constant TREASURY = address(0); // O la dirección real
address constant MATE_TOKEN = address(0); // Token principal (o address(0) para ETH)

// El script detecta automáticamente la blockchain por chainId
// y asigna un evvmId por defecto:
// - Sepolia: 1000
// - Base Sepolia: 2000
// - Base: 3000
```

### 1.3 Ejecutar el Deployment

**Para Sepolia:**
```bash
source .env
forge script scripts/DeployEvvmWithEvents.s.sol:DeployEvvmWithEvents \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Para Base Sepolia:**
```bash
source .env
forge script scripts/DeployEvvmWithEvents.s.sol:DeployEvvmWithEvents \
  --rpc-url $BASE_SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Para Base Mainnet:**
```bash
source .env
forge script scripts/DeployEvvmWithEvents.s.sol:DeployEvvmWithEvents \
  --rpc-url $BASE_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

### 1.4 Guardar la Información del Deployment

**IMPORTANTE**: Guarda esta información del output:

```
EvvmWithEvents desplegado en: 0x...
EVVM ID: 1000 (o el que aparezca)
Admin: 0x...
```

## 🎯 Paso 2: Obtener el ABI

Copia el ABI del contrato desplegado:

```bash
cp out/EvvmWithEvents.sol/EvvmWithEvents.json abis/EvvmWithEvents.json
```

> **Nota**: Si ya tienes el ABI, puedes saltar este paso.

## 🎯 Paso 3: Configurar Amp para Indexar la Nueva EVVM

### 3.1 Actualizar el Config de Amp

Dependiendo de la blockchain donde desplegaste:

**Para Sepolia** - Edita `amp.config.ts`:
```typescript
// Si es la primera EVVM en Sepolia, ya está configurado
// Si quieres agregar otra EVVM, necesitarás modificar eventTables()
// para aceptar múltiples direcciones (ver documentación de Amp)
```

**Para Base Sepolia** - Edita `amp.config.base-sepolia.ts`:
```typescript
const EVVM_CONTRACT_ADDRESS = "0xTU_NUEVA_DIRECCION_AQUI"
```

**Para Base** - Edita `amp.config.base.ts`:
```typescript
const EVVM_CONTRACT_ADDRESS = "0xTU_NUEVA_DIRECCION_AQUI"
```

### 3.2 Reconstruir el Dataset de Amp

```bash
# Para Sepolia
pnpm run amp:build
ampctl dataset register evvm/evvm_explorer ./infra/amp/datasets/evvm_explorer.json
ampctl dataset deploy evvm/evvm_explorer@dev

# Para Base Sepolia
pnpm amp build -c amp.config.base-sepolia.ts -o ./infra/amp/datasets/evvm_explorer_base_sepolia.json
ampctl dataset register evvm/evvm_explorer_base_sepolia ./infra/amp/datasets/evvm_explorer_base_sepolia.json
ampctl dataset deploy evvm/evvm_explorer_base_sepolia@dev

# Para Base
pnpm amp build -c amp.config.base.ts -o ./infra/amp/datasets/evvm_explorer_base.json
ampctl dataset register evvm/evvm_explorer_base ./infra/amp/datasets/evvm_explorer_base.json
ampctl dataset deploy evvm/evvm_explorer_base@dev
```

## 🎯 Paso 4: Registrar la Nueva EVVM en el Sistema

### 4.1 Agregar al Registro

Edita `lib/evvm-registry.ts` y agrega tu nueva EVVM:

```typescript
export const EVVM_REGISTRY: EVVMInfo[] = [
  // ... EVVMs existentes ...
  
  // Tu nueva EVVM
  {
    evvmId: 2000, // El ID que obtuviste del deployment
    chainId: 84532, // Chain ID de la blockchain
    chain: "baseSepolia", // "sepolia", "base", o "baseSepolia"
    contractAddress: "0xTU_DIRECCION_DESPLIEGUE",
    name: "Mi Nueva EVVM",
    metadata: {
      principalTokenName: "MATE",
      principalTokenSymbol: "MATE",
    },
  },
]
```

### 4.2 Actualizar lib/config.ts (Opcional)

Si quieres que esta EVVM sea la predeterminada para esa blockchain, actualiza `lib/config.ts`:

```typescript
export const EVVM_CONTRACTS: Record<SupportedChain, Record<string, string>> = {
  // ...
  baseSepolia: {
    withEvents: "0xTU_NUEVA_DIRECCION",
    // O crea una nueva key:
    miNuevaEvvm: "0xTU_NUEVA_DIRECCION",
  },
}
```

## 🎯 Paso 5: Generar Transacciones de Prueba (Opcional)

Para verificar que todo funciona, genera algunas transacciones de prueba:

```bash
# Asegúrate de que el contrato esté configurado correctamente
# Luego ejecuta:
pnpm run forge:test-transactions
```

## 🎯 Paso 6: Verificar que Funciona

### 6.1 Verificar en Amp

Consulta directamente a Amp para ver si los eventos se están indexando:

```bash
# Ver eventos PayExecuted
curl -X POST http://localhost:1603 --data 'SELECT * FROM "evvm/evvm_explorer_base_sepolia@dev".pay_executed ORDER BY block_num DESC LIMIT 10'

# Verificar que el evvmId es correcto
curl -X POST http://localhost:1603 --data 'SELECT DISTINCT evvm_id FROM "evvm/evvm_explorer_base_sepolia@dev".pay_executed'
```

### 6.2 Verificar en el Frontend

1. Inicia el servidor de desarrollo:
   ```bash
   pnpm run dev
   ```

2. Navega a `http://localhost:3000`

3. Cambia la blockchain en el selector (si aplica)

4. Verifica que las transacciones aparecen correctamente

## 🔍 Troubleshooting

### Los eventos no aparecen en Amp

1. **Verifica que Amp está corriendo**:
   ```bash
   pnpm run amp:server
   ```

2. **Verifica que el dataset está desplegado**:
   ```bash
   ampctl dataset list
   ```

3. **Verifica que hay eventos en la blockchain**:
   - Usa un explorador de bloques (Etherscan, Basescan)
   - Busca la dirección del contrato
   - Verifica que hay eventos emitidos

### Las transacciones no aparecen en el frontend

1. **Verifica el registro de EVVMs**:
   - Asegúrate de que `lib/evvm-registry.ts` tiene tu EVVM
   - Verifica que el `evvmId` es correcto

2. **Verifica las queries SQL**:
   - Abre las DevTools del navegador
   - Revisa la consola para errores
   - Verifica que las queries SQL incluyen el filtro de `evvmId`

3. **Verifica la configuración de Amp**:
   - Asegúrate de que el namespace es correcto
   - Verifica que el dataset está desplegado para la blockchain correcta

## 📝 Notas Importantes

1. **Cada EVVM es independiente**: Cada instancia de EVVM tiene su propio estado, usuarios y transacciones.

2. **evvmId único**: Cada EVVM debe tener un `evvmId` único. El script de deployment asigna IDs por defecto, pero puedes cambiarlos llamando `setEvvmID()` en el contrato.

3. **Múltiples EVVMs en la misma blockchain**: Puedes desplegar múltiples EVVMs en la misma blockchain. Solo asegúrate de que cada una tenga un `evvmId` diferente.

4. **Categorización por blockchain**: El explorador categoriza automáticamente las transacciones por blockchain usando el `chainId` y el namespace de Amp.

## 🎉 ¡Listo!

Tu nueva EVVM debería estar funcionando y el explorador debería estar indexando sus eventos. Si tienes problemas, revisa la sección de Troubleshooting o consulta la documentación de Amp.



