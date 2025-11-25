# 🌐 Desplegar EVVM en Múltiples Blockchains

Guía para desplegar la misma EVVM en diferentes blockchains (Sepolia, Base, Base Sepolia, etc.).

## 🎯 Concepto Clave

**El contrato `EvvmWithEvents.sol` es el MISMO para todas las blockchains.**

Solo cambia:
- El RPC URL donde lo despliegas
- La configuración de Amp para indexar eventos de esa blockchain

## 📋 Paso 1: Configurar Variables de Entorno

Agrega a tu `.env`:

```bash
# Sepolia
SEPOLIA_RPC_URL=https://ethereum-sepolia-rpc.publicnode.com
ETHERSCAN_API_KEY=tu_key_etherscan

# Base Sepolia (testnet recomendado)
BASE_SEPOLIA_RPC_URL=https://sepolia.base.org
BASESCAN_API_KEY=tu_key_basescan

# Base Mainnet (opcional)
BASE_RPC_URL=https://mainnet.base.org
```

## 🚀 Paso 2: Desplegar en Sepolia

```bash
# Desplegar
pnpm run forge:deploy

# O con verificación
pnpm run forge:deploy:verify
```

## 🚀 Paso 3: Desplegar en Base Sepolia

```bash
# Desplegar
pnpm run forge:deploy:base

# O con verificación
pnpm run forge:deploy:base:verify
```

## ⚙️ Paso 4: Configurar Amp para la Nueva Blockchain

### 4.1 Crear Dataset Base

Para Base Sepolia:
```bash
# Generar manifest base
ampctl manifest generate \
  --network base-sepolia \
  --kind evm-rpc \
  --out ./infra/amp/datasets/base_sepolia_base.json

# Registrar
ampctl dataset register base-sepolia/base -t 0.0.1 ./infra/amp/datasets/base_sepolia_base.json

# Desplegar
ampctl dataset deploy base-sepolia/base@dev
```

### 4.2 Crear Dataset EVVM

1. **Actualizar `amp.config.base-sepolia.ts`** con la dirección del contrato desplegado
2. **Construir el manifest:**
   ```bash
   pnpm amp build -c amp.config.base-sepolia.ts -o ./infra/amp/datasets/evvm_explorer_base_sepolia.json
   ```
3. **Registrar:**
   ```bash
   ampctl dataset register evvm/evvm_explorer_base_sepolia ./infra/amp/datasets/evvm_explorer_base_sepolia.json
   ```
4. **Desplegar:**
   ```bash
   ampctl dataset deploy evvm/evvm_explorer_base_sepolia@dev
   ```

## 🔄 Paso 5: Actualizar Configuración del Explorador

En `lib/config.ts`, agrega la dirección de tu EVVM desplegada:

```typescript
export const EVVM_CONTRACTS = {
  sepolia: {
    withEvents: "0xTU_EVVM_EN_SEPOLIA",
  },
  baseSepolia: {
    withEvents: "0xTU_EVVM_EN_BASE_SEPOLIA",
  },
}
```

## 🎯 Cambiar de Blockchain en el Frontend

Por ahora, cambia la variable de entorno:

```bash
NEXT_PUBLIC_CHAIN=baseSepolia pnpm dev
```

O edita `lib/config.ts`:
```typescript
export const CURRENT_CHAIN: SupportedChain = "baseSepolia"
```

## ✅ Resumen

1. **Mismo contrato** para todas las blockchains
2. **Mismo script de despliegue**, solo cambia `--rpc-url`
3. **Configuraciones de Amp diferentes** por blockchain
4. **El explorador filtra** por blockchain y dirección del contrato






