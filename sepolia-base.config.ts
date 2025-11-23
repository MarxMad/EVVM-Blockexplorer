/**
 * Dataset Base de Sepolia
 * 
 * Este dataset indexa bloques, transacciones y logs de Sepolia directamente
 * desde el RPC configurado en infra/amp/providers/sepolia.toml.
 * 
 * Este dataset es una dependencia del dataset EVVM.
 * Basado en el patrón del demo oficial: https://github.com/edgeandnode/amp-demo
 */

import { defineDataset, blocks, transactions, logs } from "@edgeandnode/amp"

export default defineDataset(() => {
  return {
    namespace: "sepolia",
    name: "base",
    network: "sepolia",
    description: "Dataset base de Sepolia con bloques, transacciones y logs indexados desde RPC",
    
    // Usar las tablas base de Amp que indexan automáticamente desde el RPC
    tables: {
      blocks: blocks,
      transactions: transactions,
      logs: logs,
    },
  }
})

