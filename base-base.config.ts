/**
 * Dataset Base de Base
 * 
 * Este dataset indexa bloques, transacciones y logs de Base directamente
 * desde el RPC configurado en infra/amp/providers/base.toml.
 * 
 * Este dataset es una dependencia del dataset EVVM en Base.
 */

import { defineDataset, blocks, transactions, logs } from "@edgeandnode/amp"

export default defineDataset(() => {
  return {
    namespace: "base",
    name: "base",
    network: "base",
    description: "Dataset base de Base con bloques, transacciones y logs indexados desde RPC",
    
    // Usar las tablas base de Amp que indexan automáticamente desde el RPC
    tables: {
      blocks: blocks,
      transactions: transactions,
      logs: logs,
    },
  }
})






