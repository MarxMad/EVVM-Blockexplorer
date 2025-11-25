# 🚀 Desplegar una EVVM y Indexarla en el Explorador

Guía completa para desplegar tu propia EVVM y ver sus transacciones en el explorador.

## 📋 Prerequisitos

1. **Foundry instalado** - `forge --version`
2. **Node.js >= 18** - `node --version`
3. **Git** - `git --version`
4. **Tokens de testnet** - Sepolia ETH para gas fees

## 🎯 Paso 1: Clonar y Configurar Testnet Contracts

```bash
# Clonar el repositorio de EVVM Testnet Contracts
git clone https://github.com/EVVM-org/Testnet-Contracts
cd Testnet-Contracts

# Instalar dependencias
make install
```

## 🔧 Paso 2: Configurar Variables de Entorno

```bash
# Copiar el archivo de ejemplo
cp .env.example .env
```

Edita `.env` y agrega:

```bash
RPC_URL_ETH_SEPOLIA="https://ethereum-sepolia-rpc.publicnode.com"
RPC_URL_ARB_SEPOLIA="https://arbitrum-sepolia.therpc.io"
ETHERSCAN_API=tu_api_key_de_etherscan
```

**⚠️ IMPORTANTE:** No pongas tu private key en `.env`. Se manejará de forma segura en el siguiente paso.

## 🔐 Paso 3: Importar Private Key de Forma Segura

```bash
# Importar tu private key usando Foundry (se encripta localmente)
cast wallet import defaultKey --interactive
```

Esto te pedirá tu private key de forma segura y la guardará encriptada.

## 🧙 Paso 4: Ejecutar el Wizard de Despliegue

```bash
# Ejecutar el wizard interactivo
npm run wizard
```

El wizard te guiará a través de:

1. **Validación de prerequisitos** - Verifica que todo esté instalado
2. **Configuración de red** - Elige Ethereum Sepolia o Arbitrum Sepolia
3. **Direcciones de administradores:**
   - Admin address
   - Golden Fisher address
   - Activator address
4. **Metadata de EVVM:**
   - EVVM Name (ej: "Mi EVVM")
   - EVVM ID (se asignará automáticamente)
   - Principal Token Name (ej: "Mate token")
   - Principal Token Symbol (ej: "MATE")
5. **Configuración avanzada** (opcional):
   - Total Supply
   - Era Tokens
   - Reward per operation

## 📝 Paso 5: Obtener la Dirección del Contrato EVVM

Después del despliegue, el wizard mostrará las direcciones de los contratos. **Guarda la dirección del contrato EVVM** (Evvm.sol).

También puedes encontrarla en:

```bash
# Buscar la dirección del contrato EVVM en los archivos de despliegue
cd broadcast/DeployTestnet.s.sol/[CHAIN_ID]/
cat run-latest.json | grep -A 5 '"contractName": "Evvm"'
```

Busca el campo `contractAddress` - esa es tu dirección EVVM.

## 🔗 Paso 6: Registrar tu EVVM en el Registry

Para obtener un EVVM ID oficial:

1. **Obtén ETH Sepolia** (necesario para el gas):
   - https://ethglobal.com/faucet/
   - https://cloud.google.com/application/web3/faucet/ethereum/sepolia

2. **Registra en el Registry Contract:**
   - **Dirección del Registry:** `0x389dC8fb09211bbDA841D59f4a51160dA2377832`
   - **Red:** Ethereum Sepolia
   - **Función:** `registerEvvm(uint256 chainId, address evvmAddress)`
   - **Chain ID:** `11155111` (Sepolia) o `421614` (Arbitrum Sepolia)

3. **Configura el EVVM ID en tu contrato:**
   ```bash
   # Llamar setEvvmID() en tu contrato EVVM con el ID asignado
   cast send TU_EVVM_ADDRESS "setEvvmID(uint256)" TU_EVVM_ID \
     --rpc-url $RPC_URL_ETH_SEPOLIA \
     --account defaultKey
   ```

## 🔍 Paso 7: Configurar el Explorador para Indexar tu EVVM

Una vez que tengas tu EVVM desplegada, necesitas actualizar la configuración de Amp:

### 7.1 Actualizar `amp.config.ts`

Edita `amp.config.ts` y actualiza la dirección del contrato:

```typescript
// Cambia esta línea con la dirección de TU EVVM
const EVVM_CONTRACT_ADDRESS = "0xTU_EVVM_ADDRESS_AQUI"
```

### 7.2 Obtener el ABI del Contrato

Si desplegaste `EvvmWithEvents.sol`, el ABI estará en:
```
out/EvvmWithEvents.sol/EvvmWithEvents.json
```

Copia el ABI a:
```
abis/EvvmWithEvents.json
```

### 7.3 Reconstruir y Redesplegar el Dataset

```bash
# Reconstruir el dataset con la nueva dirección
pnpm run amp:build

# Registrar el nuevo dataset
pnpm run amp:register

# Desplegar el dataset
pnpm run amp:deploy
```

## ✅ Paso 8: Verificar que Funciona

1. **Genera algunas transacciones en tu EVVM:**
   ```bash
   # Usa el script de generación de transacciones
   # (actualiza la dirección del contrato en el script primero)
   pnpm run forge:test-transactions
   ```

2. **Verifica que los eventos se indexaron:**
   ```bash
   pnpm run amp:query 'SELECT COUNT(*) as total FROM "evvm/evvm_explorer@dev".balance_updated'
   ```

3. **Abre el explorador:**
   - http://localhost:3000
   - Deberías ver las transacciones de tu EVVM

## 🎯 Múltiples EVVMs

Si quieres indexar múltiples EVVMs, puedes:

1. **Crear múltiples datasets** (uno por EVVM):
   ```typescript
   // amp.config.evvm1.ts
   const EVVM_CONTRACT_ADDRESS = "0xEVVM1_ADDRESS"
   
   // amp.config.evvm2.ts
   const EVVM_CONTRACT_ADDRESS = "0xEVVM2_ADDRESS"
   ```

2. **O usar un dataset que indexe múltiples contratos** (más avanzado)

## 📚 Recursos

- **Testnet Contracts Repo:** https://github.com/EVVM-org/Testnet-Contracts
- **Documentación EVVM:** https://www.evvm.info/docs
- **Registry Contract:** 0x389dC8fb09211bbDA841D59f4a51160dA2377832 (Sepolia)

## 🔧 Troubleshooting

### El wizard falla al desplegar
- Verifica que tienes tokens de testnet suficientes
- Prueba con un RPC alternativo
- Revisa los logs del wizard para más detalles

### Los eventos no aparecen en el explorador
- Verifica que Amp está corriendo: `pnpm run amp:server`
- Verifica que el dataset está desplegado: `ampctl dataset list`
- Revisa los logs de Amp para errores

### No puedo registrar mi EVVM
- Asegúrate de tener ETH Sepolia (no importa dónde desplegaste tu EVVM)
- Verifica que la dirección del contrato es correcta
- El registro debe hacerse en Sepolia, aunque tu EVVM esté en otra red






