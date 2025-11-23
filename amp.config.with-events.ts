/**
 * Configuración del Dataset de Amp para EVVM CON EVENTOS
 * 
 * Esta es la versión ideal que usa eventTables() de Amp para indexación automática.
 * Requiere que despliegues el contrato EvvmWithEvents.sol en lugar del original.
 * 
 * Documentación: https://ampup.sh/docs
 */

import { defineDataset, eventTables } from "@edgeandnode/amp"
// @ts-ignore
import { abi } from "./abis/EvvmWithEvents.json"

// Dirección de TU contrato EVVM personalizado con eventos
// Cambia esto por la dirección de tu contrato desplegado
const EVVM_CONTRACT_ADDRESS = "0xTU_CONTRATO_EVVM_CON_EVENTOS"

export default defineDataset(() => {
  return {
    namespace: "evvm",
    name: "evvm_explorer",
    network: "sepolia",
    description: "Dataset para el explorador de bloques EVVM - Indexa eventos del contrato EVVM personalizado",
    
    // Dependencia: Dataset base de Sepolia con bloques, transacciones y logs
    dependencies: {
      sepolia: "sepolia/base@0.0.1",
    },

    // ✨ MAGIA: Amp crea automáticamente tablas desde los eventos del ABI ✨
    tables: eventTables(abi, "sepolia"),
  }
})

/**
 * 🎯 TABLAS GENERADAS AUTOMÁTICAMENTE POR AMP:
 * 
 * Amp creará automáticamente estas tablas desde los eventos:
 * 
 * 1. PayExecuted
 *    - from (indexed)
 *    - to (indexed)
 *    - token (indexed)
 *    - amount
 *    - nonce
 *    - priorityFlag
 *    - executor
 *    - evvmId
 *    - block_num, timestamp, tx_hash (automáticos)
 * 
 * 2. PayMultipleExecuted
 *    - from (indexed)
 *    - executor (indexed)
 *    - recipientCount
 *    - successfulTransactions
 *    - failedTransactions
 *    - evvmId
 * 
 * 3. DispersePayExecuted
 *    - from (indexed)
 *    - token (indexed)
 *    - executor (indexed)
 *    - recipientCount
 *    - totalAmount
 *    - evvmId
 * 
 * 4. BalanceUpdated
 *    - account (indexed)
 *    - token (indexed)
 *    - previousBalance
 *    - newBalance
 *    - evvmId
 * 
 * 5. RewardGiven
 *    - staker (indexed)
 *    - rewardAmount
 *    - transactionCount
 *    - evvmId
 * 
 * 6. RewardRecalculated
 *    - bonusRecipient (indexed)
 *    - oldReward
 *    - newReward
 *    - eraTokens
 *    - bonusAmount
 *    - evvmId
 * 
 * 7. TreasuryAmountAdded
 *    - user (indexed)
 *    - token (indexed)
 *    - amount
 *    - evvmId
 * 
 * 8. TreasuryAmountRemoved
 *    - user (indexed)
 *    - token (indexed)
 *    - amount
 *    - evvmId
 * 
 * 9. StakerStatusUpdated
 *    - user (indexed)
 *    - isStaker
 *    - evvmId
 * 
 * 📊 EJEMPLOS DE QUERIES:
 * 
 * // Últimos pagos
 * SELECT * FROM "evvm/evvm_explorer@dev".PayExecuted 
 * ORDER BY block_num DESC LIMIT 10
 * 
 * // Pagos de una dirección específica
 * SELECT * FROM "evvm/evvm_explorer@dev".PayExecuted 
 * WHERE from = '0x...' OR to = '0x...'
 * ORDER BY block_num DESC
 * 
 * // Cambios de balance de un token
 * SELECT * FROM "evvm/evvm_explorer@dev".BalanceUpdated 
 * WHERE token = '0x...' AND account = '0x...'
 * ORDER BY block_num DESC
 * 
 * // Recompensas otorgadas
 * SELECT * FROM "evvm/evvm_explorer@dev".RewardGiven 
 * WHERE staker = '0x...'
 * ORDER BY block_num DESC
 * 
 * // Estadísticas de payMultiple
 * SELECT 
 *   COUNT(*) as total_batches,
 *   SUM(successfulTransactions) as total_successful,
 *   SUM(failedTransactions) as total_failed
 * FROM "evvm/evvm_explorer@dev".PayMultipleExecuted
 */

