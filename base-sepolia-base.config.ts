/**
 * Dataset Base de Base Sepolia
 * 
 * Este dataset indexa bloques, transacciones y logs de Base Sepolia directamente
 * desde el RPC configurado en infra/amp/providers/base-sepolia.toml.
 * 
 * Este dataset es una dependencia del dataset EVVM en Base Sepolia.
 */

import { defineDataset, blocks, transactions, logs } from "@edgeandnode/amp"

export default defineDataset(() => {
  return {
    namespace: "base-sepolia",
    name: "base",
    network: "base-sepolia",
    description: "Dataset base de Base Sepolia con bloques, transacciones y logs indexados desde RPC",
    
    // Usar las tablas base de Amp que indexan automáticamente desde el RPC
    tables: {
      blocks: blocks,
      transactions: transactions,
      logs: logs,
    },
  }
})


