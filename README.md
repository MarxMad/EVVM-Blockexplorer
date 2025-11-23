# EVVM Block Explorer

Un explorador de bloques para la EVVM (MATE Metaprotocol) construido con Next.js y Amp de The Graph.

## 🎯 Descripción

Este explorador de bloques permite visualizar y explorar la actividad de la EVVM, una cadena de bloques virtual que existe como contratos inteligentes en Sepolia. Utiliza **Amp de The Graph** para indexar eventos del contrato EVVM personalizado con eventos.

**✨ Características principales:**
- Indexación automática de eventos usando `eventTables()` de Amp
- Visualización de transacciones, balances y recompensas
- Tracking de múltiples tipos de eventos (pagos, recompensas, cambios de balance, etc.)

## 🚀 Características

- **Página Principal**: Muestra los últimos bloques y transacciones EVVM, junto con estadísticas generales
- **Detalle de Bloque**: Visualiza información completa de cada bloque virtual EVVM y sus transacciones
- **Detalle de Transacción**: Muestra todos los detalles de una transacción EVVM, incluyendo enlaces a la transacción L1
- **Detalle de Dirección**: Historial de transacciones para direcciones EVVM
- **Eventos Indexados**: 
  - `PayExecuted` - Pagos individuales
  - `PayMultipleExecuted` - Pagos múltiples
  - `DispersePayExecuted` - Distribución de pagos
  - `BalanceUpdated` - Cambios de balance
  - `RewardGiven` - Recompensas otorgadas
  - `RewardRecalculated` - Recalculo de recompensas
  - `TreasuryAmountAdded/Removed` - Operaciones del treasury
  - `StakerStatusUpdated` - Cambios de estado de staker

## 📋 Prerrequisitos

- Node.js 22+ y pnpm 10+ (este proyecto usa pnpm como el [demo oficial de Amp](https://github.com/edgeandnode/amp-demo))
- [Amp](https://github.com/edgeandnode/amp) instalado y ejecutándose
- PostgreSQL (para la base de datos de metadatos de Amp)
- Foundry (para compilar y desplegar contratos)

## 🛠️ Configuración Rápida

### 1. Instalar dependencias

```bash
# Instalar pnpm si no lo tienes
npm install -g pnpm

# Instalar dependencias del proyecto
pnpm install

# Instalar dependencias de Foundry
pnpm run forge:install-deps
```

### 2. Configurar y Ejecutar Amp

**🚀 Quick Start**: Consulta [docs/QUICK_START.md](./docs/QUICK_START.md) para una guía paso a paso simplificada.

**📖 Guía Completa**: Consulta [docs/SETUP.md](./docs/SETUP.md) para instrucciones detalladas.

**Resumen rápido:**

1. **Instalar PostgreSQL**:
   ```bash
   brew install postgresql@16
   brew services start postgresql@16
   ```

2. **Instalar Amp**:
   ```bash
   curl -fsSL https://ampup.sh/install.sh | sh
   ```

3. **Configurar Amp**: La configuración está en `infra/amp/config.toml` y `infra/amp/providers/sepolia.toml`

4. **Iniciar Amp**:
   ```bash
   pnpm run amp:server
   # O: ampd --config infra/amp/config.toml dev
   ```

5. **Construir y desplegar datasets**:
   ```bash
   pnpm run amp:setup
   ```

6. **Iniciar el frontend**:
   ```bash
   pnpm run dev
   ```

Para más detalles, ver [docs/SETUP.md](./docs/SETUP.md).

### 3. Desplegar Contrato EVVM con Eventos

El proyecto incluye un contrato personalizado `EvvmWithEvents.sol` con eventos para mejor integración con Amp.

**Desplegar el contrato:**

```bash
# 1. Configurar variables de entorno en .env
PRIVATE_KEY=tu_private_key_sin_0x
SEPOLIA_RPC_URL=https://rpc.sepolia.org
ETHERSCAN_API_KEY=tu_key_opcional

# 2. Compilar contratos
pnpm run forge:build

# 3. Desplegar
export PRIVATE_KEY=$(grep "^PRIVATE_KEY=" .env | cut -d= -f2)
export SEPOLIA_RPC_URL=$(grep "^SEPOLIA_RPC_URL=" .env | cut -d= -f2 | xargs)
export ETHERSCAN_API_KEY=""
pnpm run forge:deploy
```

**Después del despliegue:**

1. Guarda la dirección del contrato desplegado
2. Copia el ABI: `cp out/EvvmWithEvents.sol/EvvmWithEvents.json abis/EvvmWithEvents.json`
3. Actualiza `amp.config.ts` con la nueva dirección (ya está configurado para usar `eventTables()`)
4. Reconstruye el dataset: `pnpm run amp:build && pnpm run amp:register && pnpm run amp:deploy`

Ver [docs/DEPLOY_EVVM_WITH_EVENTS.md](./docs/DEPLOY_EVVM_WITH_EVENTS.md) para más detalles.

### 4. Generar Transacciones de Prueba

Para generar eventos y probar el sistema:

```bash
# Usar el script de Foundry para generar transacciones
pnpm run forge:test-transactions
```

O manualmente usando `addBalance` (función de faucet):

```bash
# Agregar balance a una cuenta (emite BalanceUpdated)
cast send 0x4Db514984aAE6A24A05f07c30310050c245b0256 \
  "addBalance(address,address,uint256)" \
  0xTU_DIRECCION \
  0x0000000000000000000000000000000000000000 \
  1000000000000000000 \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

Ver [docs/GENERATE_TEST_TRANSACTIONS.md](./docs/GENERATE_TEST_TRANSACTIONS.md) para más opciones.

### 5. Configurar Variables de Entorno

Crea un archivo `.env.local` en la raíz del proyecto:

```env
# Endpoint HTTP de Amp (por defecto: http://localhost:1603)
NEXT_PUBLIC_AMP_ENDPOINT=http://localhost:1603

# Namespace donde están tus tablas EVVM (ajusta según tu configuración)
NEXT_PUBLIC_AMP_NAMESPACE=evvm

# RPC de Sepolia (opcional, para consultas directas como fallback)
NEXT_PUBLIC_SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_KEY
```

### 6. Ejecutar en desarrollo

```bash
pnpm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## 📊 Contrato Desplegado

**Contrato EVVM con Eventos en Sepolia:**
- Dirección: `0x4Db514984aAE6A24A05f07c30310050c245b0256`
- EVVM ID: `1000`
- Ver en Etherscan: [Sepolia Explorer](https://sepolia.etherscan.io/address/0x4Db514984aAE6A24A05f07c30310050c245b0256)

## 📋 Plan de Implementación

Para implementar el block scanner completo que trackee múltiples contratos EVVM:

- **Resumen Ejecutivo**: [docs/IMPLEMENTATION_SUMMARY.md](./docs/IMPLEMENTATION_SUMMARY.md)
- **Plan Completo**: [docs/IMPLEMENTATION_PLAN.md](./docs/IMPLEMENTATION_PLAN.md)

El plan incluye:
- Arquitectura de datos con Amp
- Estructura de tablas para múltiples EVVM
- Tracking de transacciones y bloques virtuales
- Decodificación de funciones
- Frontend completo del block scanner

## 📁 Estructura del Proyecto

```
EVVM-Blockexplorer/
├── app/                    # Páginas de Next.js
│   ├── page.tsx           # Página principal
│   ├── block/[id]/        # Detalle de bloque
│   ├── tx/[id]/           # Detalle de transacción
│   └── address/[id]/      # Detalle de dirección
├── components/            # Componentes React
├── contracts/             # Contratos Solidity
│   ├── EvvmWithEvents.sol # Contrato EVVM con eventos
│   └── RegistryEvvmWithEvents.sol
├── scripts/              # Scripts de Foundry
│   ├── DeployEvvmWithEvents.s.sol
│   └── GenerateTestTransactions.s.sol
├── abis/                 # ABIs de contratos
├── lib/
│   ├── api/
│   │   └── amp.ts         # Funciones para consultar Amp
│   ├── types/
│   │   └── evvm.ts        # Tipos TypeScript para datos EVVM
│   ├── utils/
│   │   └── format.ts      # Funciones de formateo
│   └── config.ts          # Configuración del proyecto
├── infra/amp/            # Configuración de Amp
│   ├── config.toml
│   └── providers/
└── public/                # Archivos estáticos
```

## 🔧 Uso

### Consultar Datos de Amp

El proyecto incluye funciones predefinidas para consultar datos de Amp usando SQL:

```typescript
import { queryAmpSQL } from "@/lib/api/amp"

// Obtener últimos pagos
const payments = await queryAmpSQL(`
  SELECT * FROM "evvm/evvm_explorer@dev".pay_executed 
  ORDER BY block_num DESC LIMIT 10
`)

// Obtener cambios de balance
const balances = await queryAmpSQL(`
  SELECT * FROM "evvm/evvm_explorer@dev".balance_updated 
  WHERE account = '0x...' 
  ORDER BY block_num DESC
`)
```

### Personalizar Consultas SQL

Puedes modificar las consultas SQL en `lib/api/amp.ts` para ajustarlas a tu schema. Amp acepta SQL estándar:

```typescript
// Ejemplo de consulta directa
const sql = `SELECT * FROM "evvm/evvm_explorer@dev".pay_executed ORDER BY block_num DESC LIMIT 10`
const response = await fetch('http://localhost:1603', {
  method: 'POST',
  body: sql
})
```

Amp devuelve resultados en formato JSON Lines (una línea JSON por fila).

## 🎨 Personalización

- **Estilos**: Modifica `app/globals.css` para cambiar los estilos globales
- **Componentes UI**: Los componentes están en `components/ui/` usando shadcn/ui
- **Tema**: El proyecto usa `next-themes` para soporte de tema claro/oscuro

## 🚢 Despliegue

### Vercel (Recomendado)

1. Conecta tu repositorio a Vercel
2. Configura las variables de entorno en el dashboard de Vercel
3. Despliega

### Otros proveedores

El proyecto es compatible con cualquier plataforma que soporte Next.js:
- Netlify
- Railway
- AWS Amplify
- etc.

## 📝 Notas Importantes

- **Eventos del Contrato**: El contrato `EvvmWithEvents` emite eventos que Amp indexa automáticamente usando `eventTables()`
- **Rendimiento**: Las consultas SQL a Amp son rápidas, pero considera implementar caché si tienes mucho tráfico
- **Namespaces**: Amp organiza los datos en namespaces. Ajusta `NEXT_PUBLIC_AMP_NAMESPACE` según cómo hayas configurado tu dataset
- **Formato de Respuesta**: Amp devuelve datos en formato JSON Lines (una línea JSON por fila), que el código parsea automáticamente
- **Datos Vacíos**: Si las tablas están vacías, es porque aún no hay transacciones que emitan eventos. Genera transacciones de prueba para ver datos

## 🤝 Contribuir

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto está bajo la licencia MIT.

## 🔗 Enlaces Útiles

- [Amp GitHub Repository](https://github.com/edgeandnode/amp) - Repositorio oficial de Amp
- [Amp Documentation](https://ampup.sh/docs) - Documentación y ejemplos
- [Next.js Documentation](https://nextjs.org/docs)
- [EVVM Contract on Sepolia](https://sepolia.etherscan.io/address/0x4Db514984aAE6A24A05f07c30310050c245b0256)
- [Foundry Documentation](https://book.getfoundry.sh/)

## 🎯 Hackathon Track

Este proyecto se alinea con la pista **🔊 Best Use of Amp Datasets** de The Graph Hackathon, ya que utiliza completamente Amp para indexar eventos del contrato EVVM y consultarlos vía SQL, construyendo un explorador de bloques completo.

## 🧪 Generar Transacciones de Prueba

Para probar el sistema y generar eventos:

1. **Usar `addBalance`** (más simple, no requiere firma):
   ```bash
   cast send 0x4Db514984aAE6A24A05f07c30310050c245b0256 \
     "addBalance(address,address,uint256)" \
     0xTU_DIRECCION \
     0x0000000000000000000000000000000000000000 \
     1000000000000000000 \
     --rpc-url $SEPOLIA_RPC_URL \
     --private-key $PRIVATE_KEY
   ```

2. **Usar script de Foundry** (requiere firmas):
   ```bash
   pnpm run forge:test-transactions
   ```

3. **Desplegar un contrato helper** que use `caPay` (contract-to-address payment)

Ver [docs/GENERATE_TEST_TRANSACTIONS.md](./docs/GENERATE_TEST_TRANSACTIONS.md) para más detalles.
