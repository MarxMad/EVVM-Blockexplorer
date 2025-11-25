# 🧠 Cómo Funciona una EVVM

## 🎯 Concepto Fundamental

**EVVM = Ethereum Virtual Machine Virtualization**

Una EVVM es una **blockchain virtual** que existe como contratos inteligentes en una blockchain host (como Sepolia).

## 🔄 Dos Tipos de Transacciones

### 1. Transacciones L1 (Host Blockchain)
- Son transacciones reales en Sepolia
- Consumen gas real de Sepolia
- Se ven en Sepolia Scanner
- Ejemplos:
  - Desplegar contratos
  - Llamar funciones de contratos
  - Transferir ETH real

### 2. Transacciones Virtuales (Dentro de la EVVM)
- Son transacciones que ocurren **dentro** de la blockchain virtual
- NO consumen gas directamente (solo la llamada inicial)
- NO se ven en Sepolia Scanner como transacciones normales
- Se representan mediante **eventos** emitidos por el contrato EVVM
- Ejemplos:
  - `pay()` - Pago virtual entre usuarios
  - `payMultiple()` - Múltiples pagos virtuales
  - `dispersePay()` - Distribución virtual de tokens
  - Cambios de balance virtual

## 🏗️ Arquitectura

```
┌─────────────────────────────────────┐
│   Sepolia (Blockchain Host L1)     │
│                                     │
│  ┌──────────────────────────────┐  │
│  │  Contrato EVVM (Smart Contract)│ │
│  │                                │ │
│  │  ┌──────────────────────────┐ │ │
│  │  │  Blockchain Virtual      │ │ │
│  │  │  - Balances virtuales    │ │ │
│  │  │  - Transacciones virtuales│ │ │
│  │  │  - Estado virtual        │ │ │
│  │  └──────────────────────────┘ │ │
│  └──────────────────────────────┘  │
└─────────────────────────────────────┘
```

## 💡 Ejemplo Práctico

### Escenario: Usuario A paga a Usuario B

1. **Transacción L1** (en Sepolia):
   - Usuario llama `pay()` en el contrato EVVM
   - Consume gas de Sepolia
   - Se ve en Sepolia Scanner como una llamada a contrato

2. **Transacción Virtual** (dentro de la EVVM):
   - El contrato EVVM procesa el pago virtualmente
   - Actualiza balances internos (no tokens reales)
   - Emite evento `PayExecuted(from, to, amount, ...)`
   - Esta es la transacción que el explorador debe mostrar

## 📊 Estado Virtual

La EVVM mantiene su propio estado:

```solidity
// Balances virtuales (no tokens reales)
mapping(address => mapping(address => uint256)) balances;

// Nonces virtuales
mapping(address => uint256) nextSyncUsedNonce;

// Stakers virtuales
mapping(address => bytes1) stakerList;
```

## 🎯 Por Qué Necesitamos Eventos

Sin eventos, no podemos saber qué transacciones virtuales ocurrieron. Los eventos son la única forma de rastrear:
- Qué pagos se hicieron
- Quién pagó a quién
- Cuánto se transfirió
- Cuándo ocurrió

## 🔍 El Explorador de Bloques

El explorador debe mostrar:
- ✅ Transacciones VIRTUALES dentro de la EVVM
- ✅ Balances virtuales
- ✅ Bloques virtuales (agrupados por bloque L1)
- ❌ NO transacciones L1 de Sepolia (esas van en Sepolia Scanner)

## 🌐 Múltiples EVVMs

Cada EVVM desplegada es una blockchain virtual **independiente**:
- Tiene su propio estado
- Sus propias transacciones
- Sus propios usuarios
- Su propio EVVM ID

Puedes desplegar múltiples EVVMs en la misma blockchain host, cada una funcionando como una blockchain separada.

## 📝 Resumen

1. **EVVM = Blockchain Virtual** sobre una blockchain host
2. **Transacciones Virtuales** = Actividad dentro de la EVVM (capturada por eventos)
3. **Transacciones L1** = Actividad en la blockchain host (gas, deployments)
4. **El Explorador** muestra transacciones virtuales, no L1
5. **Múltiples EVVMs** = Múltiples blockchains virtuales independientes






