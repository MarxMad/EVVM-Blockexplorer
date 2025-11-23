# 🚀 Despliegue Rápido de EvvmWithEvents

Guía rápida para desplegar tu contrato EVVM personalizado con eventos.

## ⚡ Quick Start

```bash
# 1. Instalar dependencias de Foundry
pnpm run forge:install-deps

# 2. Configurar .env
cp .env.example .env
# Editar .env con tus valores

# 3. Compilar
pnpm run forge:build

# 4. Desplegar
source .env
pnpm run forge:deploy
```

## 📋 Variables de Entorno Requeridas

Crea un archivo `.env` con:

```env
PRIVATE_KEY=tu_private_key_sin_0x
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/TU_KEY
ETHERSCAN_API_KEY=tu_etherscan_key  # Opcional
```

## 🎯 Después del Despliegue

1. **Guarda la dirección del contrato** que aparece en la salida
2. **Copia el ABI**:
   ```bash
   cp out/EvvmWithEvents.sol/EvvmWithEvents.json abis/EvvmWithEvents.json
   ```
3. **Actualiza `amp.config.ts`** para usar `eventTables(abi, "sepolia")`
4. **Actualiza `lib/config.ts`** con la nueva dirección
5. **Reconstruye el dataset**: `pnpm run amp:build && pnpm run amp:register && pnpm run amp:deploy`

## 📖 Guía Completa

Ver [docs/DEPLOY_SCRIPT_GUIDE.md](./docs/DEPLOY_SCRIPT_GUIDE.md) para instrucciones detalladas.

