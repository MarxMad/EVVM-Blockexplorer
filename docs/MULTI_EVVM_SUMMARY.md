# 📋 Resumen: Soporte para Múltiples EVVMs

## 🎯 Objetivo

Extender el sistema EVVM-Blockexplorer para soportar múltiples instancias de EVVM desplegadas en diferentes blockchains, categorizándolas automáticamente y permitiendo consultar transacciones de todas ellas desde un solo lugar.

## ✅ Cambios Implementados

### 1. Sistema de Registro de EVVMs (`lib/evvm-registry.ts`)

**Nuevo archivo** que mantiene un registro centralizado de todas las EVVMs desplegadas:

- **Estructura de datos**: `EVVMInfo` con `evvmId`, `chainId`, `chain`, `contractAddress`, y metadata
- **Funciones helper**:
  - `getEVVMsByChain()` - Obtiene todas las EVVMs de una blockchain
  - `getEVVMById()` - Busca una EVVM por su ID
  - `getEVVMByAddress()` - Busca una EVVM por su dirección de contrato
  - `getEvvmIdsByChain()` - Obtiene los IDs de todas las EVVMs de una blockchain

**Uso**:
```typescript
import { EVVM_REGISTRY, getEVVMsByChain } from "@/lib/evvm-registry"

// Obtener todas las EVVMs de Sepolia
const sepoliaEVVMs = getEVVMsByChain("sepolia")

// Buscar una EVVM específica
const evvm = getEVVMById(1000)
```

### 2. Actualización de Configuración (`lib/config.ts`)

**Exportaciones agregadas**:
- Exporta tipos y funciones del registro de EVVMs
- Permite acceso fácil desde otras partes del código

### 3. Queries SQL Mejoradas (`lib/api/amp.ts`)

**Nuevas funcionalidades**:

1. **Función `buildEvvmIdFilter()`**:
   - Genera condiciones WHERE para filtrar por `evvmId(s)`
   - Si no se especifica, incluye todas las EVVMs de la blockchain actual
   - Soporta un solo `evvmId` o múltiples

2. **Funciones actualizadas** (ahora aceptan parámetro opcional `evvmIds`):
   - `getLatestEVVMBlocks(limit, evvmIds?)`
   - `getEVVMBlockById(blockId, evvmIds?)`
   - `getEVVMBlockTransactions(blockId, evvmIds?)`
   - `getLatestEVVMTransactions(limit, evvmIds?)`

**Ejemplo de uso**:
```typescript
// Obtener bloques de todas las EVVMs en la blockchain actual
const blocks = await getLatestEVVMBlocks(10)

// Obtener bloques solo de una EVVM específica
const blocks = await getLatestEVVMBlocks(10, [1000])

// Obtener bloques de múltiples EVVMs
const blocks = await getLatestEVVMBlocks(10, [1000, 2000])
```

### 4. Guía de Deployment (`docs/DEPLOY_NEW_EVVM.md`)

**Nueva documentación completa** que incluye:

- Prerrequisitos y configuración
- Paso a paso para desplegar una nueva EVVM
- Configuración de Amp para indexar eventos
- Registro de la nueva EVVM en el sistema
- Troubleshooting común

## 🏗️ Arquitectura

### Flujo de Datos

```
┌─────────────────────────────────────────────────────────┐
│  Blockchain (Sepolia/Base/Base Sepolia)                │
│                                                          │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐ │
│  │  EVVM #1000  │  │  EVVM #2000  │  │  EVVM #3000  │ │
│  │  (Sepolia)   │  │  (Base Sep)  │  │  (Base)      │ │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘ │
│         │                 │                 │          │
│         └─────────────────┴─────────────────┘          │
│                    │                                    │
│                    ▼                                    │
│              Emiten Eventos                             │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  Amp (Indexación)                                        │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Dataset por Blockchain                          │  │
│  │  - evvm/evvm_explorer@dev (Sepolia)             │  │
│  │  - evvm/evvm_explorer_base_sepolia@dev          │  │
│  │  - evvm/evvm_explorer_base@dev (Base)           │  │
│  └──────────────────────────────────────────────────┘  │
│                                                          │
│  Tablas: pay_executed, balance_updated, etc.            │
│  Cada tabla incluye: evvm_id, block_num, timestamp, ... │
└────────────────────┬────────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────────┐
│  EVVM-Blockexplorer (Frontend)                         │
│                                                          │
│  ┌──────────────────────────────────────────────────┐  │
│  │  lib/evvm-registry.ts                            │  │
│  │  - Registro de todas las EVVMs                  │  │
│  └──────────────────────────────────────────────────┘  │
│                    │                                    │
│                    ▼                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  lib/api/amp.ts                                   │  │
│  │  - Queries SQL con filtro por evvmId             │  │
│  │  - Categorización por blockchain                 │  │
│  └──────────────────────────────────────────────────┘  │
│                    │                                    │
│                    ▼                                    │
│  ┌──────────────────────────────────────────────────┐  │
│  │  Frontend (Next.js)                               │  │
│  │  - Muestra transacciones de todas las EVVMs     │  │
│  │  - Filtra por blockchain                         │  │
│  │  - Filtra por EVVM específica (futuro)          │  │
│  └──────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

## 🔑 Conceptos Clave

### EVVM ID

Cada instancia de EVVM tiene un **`evvmId` único** que se establece durante el deployment:
- Sepolia: IDs típicamente 1000+
- Base Sepolia: IDs típicamente 2000+
- Base: IDs típicamente 3000+

Este ID se incluye en **todos los eventos** emitidos por el contrato, permitiendo filtrar transacciones por EVVM.

### Categorización por Blockchain

El sistema categoriza automáticamente las transacciones por blockchain usando:
1. **Chain ID**: Identifica la blockchain (11155111 = Sepolia, 84532 = Base Sepolia, 8453 = Base)
2. **Namespace de Amp**: Cada blockchain tiene su propio dataset (`evvm/evvm_explorer@dev`, `evvm/evvm_explorer_base_sepolia@dev`, etc.)
3. **Registro de EVVMs**: `lib/evvm-registry.ts` mapea cada EVVM a su blockchain

### Filtrado por EVVM

Las queries SQL ahora pueden filtrar por `evvmId`:
- **Sin filtro**: Muestra todas las EVVMs de la blockchain actual
- **Con filtro**: Muestra solo las EVVMs especificadas

## 📝 Próximos Pasos (Opcional)

1. **UI para seleccionar EVVM**: Agregar un selector en el frontend para filtrar por EVVM específica
2. **Dashboard multi-EVVM**: Vista agregada mostrando estadísticas de todas las EVVMs
3. **Soporte para más blockchains**: Agregar soporte para Polygon, Arbitrum, Optimism, etc.
4. **API REST**: Exponer endpoints para consultar transacciones por EVVM
5. **Webhooks**: Notificaciones cuando se despliega una nueva EVVM

## 🐛 Troubleshooting

### Problema: Las transacciones no aparecen filtradas por EVVM

**Solución**:
1. Verifica que el `evvmId` en `lib/evvm-registry.ts` coincide con el del contrato
2. Verifica que los eventos incluyen el campo `evvmId` (deberían, si usas `EvvmWithEvents.sol`)
3. Verifica que las queries SQL están usando `buildEvvmIdFilter()` correctamente

### Problema: Múltiples EVVMs en la misma blockchain no se distinguen

**Solución**:
1. Asegúrate de que cada EVVM tiene un `evvmId` único
2. Verifica que el registro en `lib/evvm-registry.ts` tiene todas las EVVMs
3. Usa el parámetro `evvmIds` en las funciones de query para filtrar específicamente

## 📚 Referencias

- [Guía de Deployment](./DEPLOY_NEW_EVVM.md) - Cómo desplegar una nueva EVVM
- [Setup de Amp](./SETUP.md) - Configuración inicial de Amp
- [Cómo Funciona EVVM](./HOW_EVVM_WORKS.md) - Conceptos fundamentales de EVVM



