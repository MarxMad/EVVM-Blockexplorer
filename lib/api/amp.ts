/**
 * Funciones para consultar datasets de Amp usando SQL
 * Amp es una base de datos nativa de blockchain que expone datos vía SQL sobre HTTP
 * Documentación: https://github.com/edgeandnode/amp
 */

import { AMP_CONFIG, EVVM_CONTRACT_ADDRESS, CURRENT_CHAIN, getEvvmIdsByChain } from "@/lib/config"
import type { EVVMBlock, EVVMTransaction, EVVMAddress, EVVMStats } from "@/lib/types/evvm"

// Normalizar dirección del contrato para comparaciones (sin 0x, minúsculas)
const EVVM_CONTRACT_NORMALIZED = EVVM_CONTRACT_ADDRESS.replace(/^0x/i, '').toLowerCase()

// Obtener el namespace del dataset según la blockchain
function getDatasetNamespace(): string {
  const network = CURRENT_CHAIN
  if (network === "base") {
    return "evvm/evvm_explorer_base@dev"
  } else if (network === "baseSepolia") {
    return "evvm/evvm_explorer_base_sepolia@dev"
  } else {
    return "evvm/evvm_explorer@dev" // Sepolia por defecto
  }
}

/**
 * Genera una condición WHERE para filtrar por evvmId(s)
 * Si no se especifica evvmIds, incluye todas las EVVMs de la blockchain actual
 * Si se especifica un array, filtra por esos evvmIds
 */
function buildEvvmIdFilter(evvmIds?: number[]): string {
  if (!evvmIds || evvmIds.length === 0) {
    // Si no se especifica, usar todas las EVVMs de la blockchain actual
    const allEvvmIds = getEvvmIdsByChain(CURRENT_CHAIN)
    if (allEvvmIds.length === 0) {
      return "" // No hay filtro si no hay EVVMs registradas
    }
    if (allEvvmIds.length === 1) {
      return `WHERE evvm_id = ${allEvvmIds[0]}`
    }
    return `WHERE evvm_id IN (${allEvvmIds.join(", ")})`
  }
  
  if (evvmIds.length === 1) {
    return `WHERE evvm_id = ${evvmIds[0]}`
  }
  
  return `WHERE evvm_id IN (${evvmIds.join(", ")})`
}

/**
 * Ejecuta una consulta SQL a Amp
 * Amp acepta consultas SQL directamente vía HTTP POST
 * Formato: curl -X POST http://localhost:1603 --data 'SELECT * FROM "namespace/table" LIMIT 10'
 */
async function queryAmpSQL<T>(sql: string): Promise<T[]> {
  // Si no hay endpoint configurado, retornar array vacío silenciosamente
  if (!AMP_CONFIG.endpoint || AMP_CONFIG.endpoint === "") {
    return []
  }

  try {
    // Crear un AbortController para timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 segundos

    // Preparar headers
    const headers: HeadersInit = {
      "Content-Type": "text/plain",
    }
    
    // Agregar token de autenticación si está configurado
    if (AMP_CONFIG.token) {
      headers["Authorization"] = `Bearer ${AMP_CONFIG.token}`
    }

    try {
      const response = await fetch(AMP_CONFIG.endpoint, {
        method: "POST",
        headers,
        body: sql,
        signal: controller.signal,
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        const errorText = await response.text()
        console.warn(`Amp query failed: ${response.status} ${response.statusText} - ${errorText}`)
        return []
      }

      // Amp devuelve JSON Lines (una línea por fila)
      const text = await response.text()
      const lines = text.trim().split("\n").filter((line) => line.length > 0)

      // Parsear cada línea como JSON
      const results: T[] = []
      for (const line of lines) {
        try {
          results.push(JSON.parse(line) as T)
        } catch (e) {
          console.warn("Failed to parse line:", line, e)
        }
      }

      return results
    } finally {
      clearTimeout(timeoutId)
    }
  } catch (error: any) {
    // Manejar errores de conexión (ECONNREFUSED, timeout, etc.) silenciosamente
    if (
      error?.code === "ECONNREFUSED" ||
      error?.name === "AbortError" ||
      error?.message?.includes("fetch failed") ||
      error?.message?.includes("aborted")
    ) {
      // Amp no está disponible - esto es esperado durante el desarrollo
      // No loguear como error, solo retornar array vacío
      return []
    }

    // Para otros errores, loguear pero no fallar
    console.warn("Error executing SQL query to Amp:", error?.message || error)
    return []
  }
}

/**
 * Obtiene los últimos N bloques EVVM
 * Usa los eventos para agrupar por bloque L1
 * Intenta usar pay_executed primero, luego balance_updated como fallback
 * 
 * @param limit - Número máximo de bloques a retornar
 * @param evvmIds - IDs de EVVMs a filtrar (opcional, si no se especifica usa todas las de la blockchain actual)
 */
export async function getLatestEVVMBlocks(limit: number = 10, evvmIds?: number[]): Promise<EVVMBlock[]> {
  const datasetNamespace = getDatasetNamespace()
  const evvmFilter = buildEvvmIdFilter(evvmIds)
  
  // Intentar primero con pay_executed (eventos de pagos)
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  // Filtramos por evvmId para soportar múltiples EVVMs
  let sql = `
    SELECT 
      block_num as block_number,
      MAX(timestamp) as timestamp,
      COUNT(*) as transaction_count,
      MIN(tx_hash) as first_transaction_hash
    FROM "${datasetNamespace}".pay_executed
    ${evvmFilter}
    GROUP BY block_num
    ORDER BY block_num DESC
    LIMIT ${limit}
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Si no hay eventos de pay_executed, usar balance_updated como fallback
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    // Filtramos por evvmId para soportar múltiples EVVMs
    if (results.length === 0) {
      sql = `
        SELECT 
          block_num as block_number,
          MAX(timestamp) as timestamp,
          COUNT(*) as transaction_count,
          MIN(tx_hash) as first_transaction_hash
        FROM "${datasetNamespace}".balance_updated
        ${evvmFilter}
        GROUP BY block_num
        ORDER BY block_num DESC
        LIMIT ${limit}
      `
      results = await queryAmpSQL<any>(sql)
    }

    return results.map((row, index) => {
      // Convertir timestamp ISO a Unix timestamp si es necesario
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        blockId: Number(row.block_number || index + 1),
        timestamp,
        hash: `0x${row.block_number?.toString(16).padStart(64, '0') || ''}`,
        parentHash: row.block_number > 0 ? `0x${(row.block_number - 1).toString(16).padStart(64, '0')}` : "",
        transactionCount: Number(row.transaction_count || 0),
        l1TransactionHash: String(row.first_transaction_hash || ""),
        executor: undefined,
        status: "finalized" as const,
      }
    })
  } catch (error) {
    console.error("Error fetching latest blocks:", error)
    return []
  }
}

/**
 * Obtiene un bloque EVVM por ID
 * Nota: El ID del bloque corresponde al número de bloque L1
 * 
 * @param blockId - ID del bloque L1
 * @param evvmIds - IDs de EVVMs a filtrar (opcional, si no se especifica usa todas las de la blockchain actual)
 */
export async function getEVVMBlockById(blockId: number, evvmIds?: number[]): Promise<EVVMBlock | null> {
  const datasetNamespace = getDatasetNamespace()
  const evvmFilter = buildEvvmIdFilter(evvmIds)
  const whereClause = evvmFilter ? `${evvmFilter} AND block_num = ${blockId}` : `WHERE block_num = ${blockId}`
  
  // Intentar primero con pay_executed
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  // Filtramos por evvmId para soportar múltiples EVVMs
  let sql = `
    SELECT 
      block_num as block_number,
      MAX(timestamp) as timestamp,
      COUNT(*) as transaction_count,
      MIN(tx_hash) as first_transaction_hash
    FROM "${datasetNamespace}".pay_executed
    ${whereClause}
    GROUP BY block_num
    LIMIT 1
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Si no hay resultados, usar balance_updated como fallback
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    // Filtramos por evvmId para soportar múltiples EVVMs
    if (results.length === 0) {
      sql = `
        SELECT 
          block_num as block_number,
          MAX(timestamp) as timestamp,
          COUNT(*) as transaction_count,
          MIN(tx_hash) as first_transaction_hash
        FROM "${datasetNamespace}".balance_updated
        ${whereClause}
        GROUP BY block_num
        LIMIT 1
      `
      results = await queryAmpSQL<any>(sql)
    }

    if (results.length === 0) {
      return null
    }

    const row = results[0]
    
    // Convertir timestamp ISO a Unix timestamp si es necesario
    let timestamp = 0
    if (row.timestamp) {
      if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
        timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
      } else {
        timestamp = Number(row.timestamp)
      }
    }

    return {
      blockId: Number(row.block_number || blockId),
      timestamp,
      hash: `0x${row.block_number?.toString(16).padStart(64, '0') || ''}`,
      parentHash: row.block_number > 0 ? `0x${(row.block_number - 1).toString(16).padStart(64, '0')}` : "",
      transactionCount: Number(row.transaction_count || 0),
      l1TransactionHash: String(row.first_transaction_hash || ""),
      executor: undefined,
      status: "finalized" as const,
    }
  } catch (error) {
    console.error("Error fetching block:", error)
    return null
  }
}

/**
 * Obtiene las transacciones de un bloque EVVM
 * Nota: El blockId corresponde al número de bloque L1
 * Intenta usar pay_executed primero, luego balance_updated como fallback
 * 
 * @param blockId - ID del bloque L1
 * @param evvmIds - IDs de EVVMs a filtrar (opcional, si no se especifica usa todas las de la blockchain actual)
 */
export async function getEVVMBlockTransactions(blockId: number, evvmIds?: number[]): Promise<EVVMTransaction[]> {
  const datasetNamespace = getDatasetNamespace()
  const evvmFilter = buildEvvmIdFilter(evvmIds)
  const whereClause = evvmFilter ? `${evvmFilter} AND block_num = ${blockId}` : `WHERE block_num = ${blockId}`
  
  // Intentar primero con pay_executed
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  // Filtramos por evvmId para soportar múltiples EVVMs
  let sql = `
    SELECT 
      tx_hash,
      block_num,
      timestamp,
      "from",
      "to",
      amount,
      nonce,
      priority_flag,
      executor
    FROM "${datasetNamespace}".pay_executed
    ${whereClause}
    ORDER BY timestamp ASC
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Si no hay eventos de pay_executed, usar balance_updated como fallback
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    // Filtramos por evvmId para soportar múltiples EVVMs
    if (results.length === 0) {
      sql = `
        SELECT 
          tx_hash,
          block_num,
          timestamp,
          account as "to",
          CAST('0x0000000000000000000000000000000000000000' AS VARCHAR) as "from",
          new_balance as amount,
          CAST(0 AS BIGINT) as nonce,
          CAST(false AS BOOLEAN) as priority_flag,
          CAST(NULL AS VARCHAR) as executor
        FROM "${datasetNamespace}".balance_updated
        ${whereClause}
        ORDER BY timestamp ASC
      `
      results = await queryAmpSQL<any>(sql)
    }

    return results.map((row) => {
      // Convertir timestamp ISO a Unix timestamp si es necesario
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        transactionId: String(row.tx_hash || ""),
        hash: String(row.tx_hash || ""),
        blockId: Number(row.block_num || blockId),
        timestamp,
        from: String(row.from || "0x0000000000000000000000000000000000000000"),
        to: String(row.to || ""),
        value: String(row.amount || "0"),
        nonceType: (row.priority_flag ? "async" : "sync") as "sync" | "async",
        nonce: Number(row.nonce || 0),
        executor: row.executor ? String(row.executor) : undefined,
        status: "success" as "success" | "failed",
        l1TransactionHash: String(row.tx_hash || ""),
        logIndex: undefined,
        inputData: undefined,
        gasUsed: undefined,
        fee: undefined,
      }
    })
  } catch (error) {
    console.error("Error fetching block transactions:", error)
    return []
  }
}

/**
 * Obtiene las últimas N transacciones EVVM
 * Usa eventos PayExecuted primero, luego balance_updated como fallback
 * 
 * @param limit - Número máximo de transacciones a retornar
 * @param evvmIds - IDs de EVVMs a filtrar (opcional, si no se especifica usa todas las de la blockchain actual)
 */
export async function getLatestEVVMTransactions(limit: number = 10, evvmIds?: number[]): Promise<EVVMTransaction[]> {
  const datasetNamespace = getDatasetNamespace()
  const evvmFilter = buildEvvmIdFilter(evvmIds)
  
  // Intentar primero con pay_executed (eventos de pagos reales)
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  // Filtramos por evvmId para soportar múltiples EVVMs
  let sql = `
    SELECT 
      tx_hash,
      block_num,
      timestamp,
      "from",
      "to",
      amount,
      nonce,
      priority_flag,
      executor
    FROM "${datasetNamespace}".pay_executed
    ${evvmFilter}
    ORDER BY block_num DESC, timestamp DESC
    LIMIT ${limit}
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Si no hay eventos de pay_executed, usar balance_updated como fallback
    // (representa cambios de balance, aunque no sean pagos completos)
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    // Filtramos por evvmId para soportar múltiples EVVMs
    if (results.length === 0) {
      sql = `
        SELECT 
          tx_hash,
          block_num,
          timestamp,
          account as "to",
          CAST('0x0000000000000000000000000000000000000000' AS VARCHAR) as "from",
          new_balance as amount,
          CAST(0 AS BIGINT) as nonce,
          CAST(false AS BOOLEAN) as priority_flag,
          CAST(NULL AS VARCHAR) as executor
        FROM "${datasetNamespace}".balance_updated
        ${evvmFilter}
        ORDER BY block_num DESC, timestamp DESC
        LIMIT ${limit}
      `
      results = await queryAmpSQL<any>(sql)
    }

    return results.map((row) => {
      // Convertir timestamp ISO a Unix timestamp si es necesario
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        transactionId: String(row.tx_hash || ""),
        hash: String(row.tx_hash || ""),
        blockId: Number(row.block_num || 0),
        timestamp,
        from: String(row.from || "0x0000000000000000000000000000000000000000"),
        to: String(row.to || ""),
        value: String(row.amount || "0"),
        nonceType: (row.priority_flag ? "async" : "sync") as "sync" | "async",
        nonce: Number(row.nonce || 0),
        executor: row.executor ? String(row.executor) : undefined,
        status: "success" as "success" | "failed",
        l1TransactionHash: String(row.tx_hash || ""),
        logIndex: undefined,
        inputData: undefined,
        gasUsed: undefined,
        fee: undefined,
      }
    })
  } catch (error) {
    console.error("Error fetching latest transactions:", error)
    return []
  }
}

/**
 * Obtiene una transacción EVVM por ID o hash
 * Nota: El ID es el hash de la transacción L1 (tx_hash del evento)
 * Intenta buscar en pay_executed primero, luego balance_updated como fallback
 */
export async function getEVVMTransactionById(transactionId: string): Promise<EVVMTransaction | null> {
  const datasetNamespace = getDatasetNamespace()
  // Normalizar el ID: remover 0x si está presente y convertir a minúsculas
  const normalizedId = transactionId.replace(/^0x/i, '').toLowerCase()
  
  // Como Amp no soporta CAST de FixedSizeBinary a VARCHAR, obtenemos todos los registros
  // y filtramos en código. Esto es aceptable mientras no haya muchos registros.
  // Filtrar por dirección del contrato EVVM
  
  // Intentar primero con pay_executed
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  let sql = `
    SELECT 
      tx_hash,
      block_num,
      timestamp,
      "from",
      "to",
      amount,
      nonce,
      priority_flag,
      executor
    FROM "${datasetNamespace}".pay_executed
    ORDER BY block_num DESC
    LIMIT 1000
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Filtrar por hash normalizado en código
    let found = results.find((row: any) => {
      const rowHash = String(row.tx_hash || '').replace(/^0x/i, '').toLowerCase()
      return rowHash === normalizedId
    })
    
    // Si no hay resultados, buscar en balance_updated
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    if (!found) {
      sql = `
        SELECT 
          tx_hash,
          block_num,
          timestamp,
          account as "to",
          CAST('0x0000000000000000000000000000000000000000' AS VARCHAR) as "from",
          new_balance as amount,
          CAST(0 AS BIGINT) as nonce,
          CAST(false AS BOOLEAN) as priority_flag,
          CAST(NULL AS VARCHAR) as executor
        FROM "${datasetNamespace}".balance_updated
        ORDER BY block_num DESC
        LIMIT 1000
      `
      results = await queryAmpSQL<any>(sql)
      
      // Filtrar por hash normalizado en código
      found = results.find((row: any) => {
        const rowHash = String(row.tx_hash || '').replace(/^0x/i, '').toLowerCase()
        return rowHash === normalizedId
      })
    }
    
    if (!found) {
      return null
    }
    
    const row = found
    
    // Convertir timestamp ISO a Unix timestamp si es necesario
    let timestamp = 0
    if (row.timestamp) {
      if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
        timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
      } else {
        timestamp = Number(row.timestamp)
      }
    }

    return {
      transactionId: String(row.tx_hash || transactionId),
      hash: String(row.tx_hash || transactionId),
      blockId: Number(row.block_num || 0),
      timestamp,
      from: String(row.from || "0x0000000000000000000000000000000000000000"),
      to: String(row.to || ""),
      value: String(row.amount || "0"),
      nonceType: (row.priority_flag ? "async" : "sync") as "sync" | "async",
      nonce: Number(row.nonce || 0),
      executor: row.executor ? String(row.executor) : undefined,
      status: "success" as "success" | "failed",
      l1TransactionHash: String(row.tx_hash || transactionId),
      logIndex: undefined,
      inputData: undefined,
      gasUsed: undefined,
      fee: undefined,
    }
  } catch (error) {
    console.error("Error fetching transaction:", error)
    return null
  }
}

/**
 * Obtiene las transacciones de una dirección EVVM
 * Busca en eventos PayExecuted donde la dirección es from o to
 */
export async function getEVVMAddressTransactions(
  address: string,
  limit: number = 20,
  offset: number = 0
): Promise<EVVMTransaction[]> {
  const datasetNamespace = getDatasetNamespace()
  const escapedAddress = address.replace(/^0x/i, '').replace(/'/g, "''")
  // Intentar primero con pay_executed
  // Nota: No filtramos por address del contrato porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  // Filtramos solo por from/to (direcciones del usuario)
  let sql = `
    SELECT 
      tx_hash,
      block_num,
      timestamp,
      "from",
      "to",
      amount,
      nonce,
      priority_flag,
      executor
    FROM "${datasetNamespace}".pay_executed
    WHERE ("from" = 0x${escapedAddress} OR "to" = 0x${escapedAddress})
    ORDER BY block_num DESC, timestamp DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Si no hay resultados, buscar en balance_updated
    // Nota: No filtramos por address del contrato porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    // Filtramos solo por account (dirección del usuario)
    if (results.length === 0) {
      sql = `
        SELECT 
          tx_hash,
          block_num,
          timestamp,
          account as "to",
          CAST('0x0000000000000000000000000000000000000000' AS VARCHAR) as "from",
          new_balance as amount,
          CAST(0 AS BIGINT) as nonce,
          CAST(false AS BOOLEAN) as priority_flag,
          CAST(NULL AS VARCHAR) as executor
        FROM "${datasetNamespace}".balance_updated
        WHERE account = 0x${escapedAddress}
        ORDER BY block_num DESC, timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      results = await queryAmpSQL<any>(sql)
    }
    
    return results.map((row) => {
      // Convertir timestamp ISO a Unix timestamp si es necesario
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        transactionId: String(row.tx_hash || ""),
        hash: String(row.tx_hash || ""),
        blockId: Number(row.block_num || 0),
        timestamp,
        from: String(row.from || "0x0000000000000000000000000000000000000000"),
        to: String(row.to || ""),
        value: String(row.amount || "0"),
        nonceType: (row.priority_flag ? "async" : "sync") as "sync" | "async",
        nonce: Number(row.nonce || 0),
        executor: row.executor ? String(row.executor) : undefined,
        status: "success" as "success" | "failed",
        l1TransactionHash: String(row.tx_hash || ""),
        logIndex: undefined,
        inputData: undefined,
        gasUsed: undefined,
        fee: undefined,
      }
    })
  } catch (error) {
    console.error("Error fetching address transactions:", error)
    return []
  }
}

/**
 * Obtiene información de una dirección EVVM
 * Usa eventos BalanceUpdated para obtener el balance actual
 */
export async function getEVVMAddress(address: string): Promise<EVVMAddress | null> {
  const datasetNamespace = getDatasetNamespace()
  try {
    // Normalizar dirección: remover 0x si está presente
    const normalizedAddress = address.replace(/^0x/i, '').replace(/'/g, "''")
    
    // Obtener el balance más reciente de eventos BalanceUpdated
    // Nota: No filtramos por address del contrato porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    const balanceSQL = `
      SELECT new_balance, block_num
      FROM "${datasetNamespace}".balance_updated
      WHERE account = 0x${normalizedAddress}
      ORDER BY block_num DESC
      LIMIT 1
    `
    const balanceResults = await queryAmpSQL<{ new_balance: string; block_num: number }>(balanceSQL)
    const currentBalance = balanceResults[0]?.new_balance || "0"

    // Obtener estadísticas de transacciones
    const allTransactions = await getEVVMAddressTransactions(address, 1000, 0)

    const incomingTransactions = allTransactions.filter((tx) => tx.to.toLowerCase() === address.toLowerCase())
    const outgoingTransactions = allTransactions.filter((tx) => tx.from.toLowerCase() === address.toLowerCase())

    return {
      address,
      balance: currentBalance,
      totalTransactions: allTransactions.length,
      incomingTransactions: incomingTransactions.length,
      outgoingTransactions: outgoingTransactions.length,
    }
  } catch (error) {
    console.error("Error fetching address:", error)
    return null
  }
}

/**
 * Obtiene bloques EVVM con paginación
 */
export async function getEVVMBlocksPaginated(
  limit: number = 20,
  offset: number = 0
): Promise<EVVMBlock[]> {
  const datasetNamespace = getDatasetNamespace()
  // Intentar primero con pay_executed
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  let sql = `
    SELECT 
      block_num as block_number,
      MAX(timestamp) as timestamp,
      COUNT(*) as transaction_count,
      MIN(tx_hash) as first_transaction_hash
    FROM "${datasetNamespace}".pay_executed
    GROUP BY block_num
    ORDER BY block_num DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    if (results.length === 0) {
      sql = `
        SELECT 
          block_num as block_number,
          MAX(timestamp) as timestamp,
          COUNT(*) as transaction_count,
          MIN(tx_hash) as first_transaction_hash
        FROM "${datasetNamespace}".balance_updated
        GROUP BY block_num
        ORDER BY block_num DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      results = await queryAmpSQL<any>(sql)
    }

    return results.map((row, index) => {
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        blockId: Number(row.block_number || index + 1),
        timestamp,
        hash: `0x${row.block_number?.toString(16).padStart(64, '0') || ''}`,
        parentHash: row.block_number > 0 ? `0x${(row.block_number - 1).toString(16).padStart(64, '0')}` : "",
        transactionCount: Number(row.transaction_count || 0),
        l1TransactionHash: String(row.first_transaction_hash || ""),
        executor: undefined,
        status: "finalized" as const,
      }
    })
  } catch (error) {
    console.error("Error fetching paginated blocks:", error)
    return []
  }
}

/**
 * Obtiene transacciones EVVM con paginación
 */
export async function getEVVMTransactionsPaginated(
  limit: number = 20,
  offset: number = 0
): Promise<EVVMTransaction[]> {
  const datasetNamespace = getDatasetNamespace()
  // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
  let sql = `
    SELECT 
      tx_hash,
      block_num,
      timestamp,
      "from",
      "to",
      amount,
      nonce,
      priority_flag,
      executor
    FROM "${datasetNamespace}".pay_executed
    ORDER BY block_num DESC, timestamp DESC
    LIMIT ${limit} OFFSET ${offset}
  `

  try {
    let results = await queryAmpSQL<any>(sql)
    
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    if (results.length === 0) {
      sql = `
        SELECT 
          tx_hash,
          block_num,
          timestamp,
          account as "to",
          CAST('0x0000000000000000000000000000000000000000' AS VARCHAR) as "from",
          new_balance as amount,
          CAST(0 AS BIGINT) as nonce,
          CAST(false AS BOOLEAN) as priority_flag,
          CAST(NULL AS VARCHAR) as executor
        FROM "${datasetNamespace}".balance_updated
        ORDER BY block_num DESC, timestamp DESC
        LIMIT ${limit} OFFSET ${offset}
      `
      results = await queryAmpSQL<any>(sql)
    }

    return results.map((row) => {
      let timestamp = 0
      if (row.timestamp) {
        if (typeof row.timestamp === 'string' && row.timestamp.includes('T')) {
          timestamp = Math.floor(new Date(row.timestamp).getTime() / 1000)
        } else {
          timestamp = Number(row.timestamp)
        }
      }

      return {
        transactionId: String(row.tx_hash || ""),
        hash: String(row.tx_hash || ""),
        blockId: Number(row.block_num || 0),
        timestamp,
        from: String(row.from || "0x0000000000000000000000000000000000000000"),
        to: String(row.to || ""),
        value: String(row.amount || "0"),
        nonceType: (row.priority_flag ? "async" : "sync") as "sync" | "async",
        nonce: Number(row.nonce || 0),
        executor: row.executor ? String(row.executor) : undefined,
        status: "success" as "success" | "failed",
        l1TransactionHash: String(row.tx_hash || ""),
        logIndex: undefined,
        inputData: undefined,
        gasUsed: undefined,
        fee: undefined,
      }
    })
  } catch (error) {
    console.error("Error fetching paginated transactions:", error)
    return []
  }
}

/**
 * Obtiene estadísticas generales de la EVVM
 * Usa eventos PayExecuted primero, luego balance_updated como fallback
 */
export async function getEVVMStats(): Promise<EVVMStats> {
  const datasetNamespace = getDatasetNamespace()
  try {
    // Obtener el último bloque
    const latestBlocks = await getLatestEVVMBlocks(1)
    const latestBlock = latestBlocks[0]?.blockId || 0

    // Intentar contar bloques con pay_executed
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    let totalBlocksSQL = `SELECT COUNT(DISTINCT block_num) as count FROM "${datasetNamespace}".pay_executed`
    let totalBlocksResult = await queryAmpSQL<{ count: number }>(totalBlocksSQL)
    let totalBlocks = totalBlocksResult[0]?.count || 0

    // Si no hay bloques con pay_executed, usar balance_updated
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    if (totalBlocks === 0) {
      totalBlocksSQL = `SELECT COUNT(DISTINCT block_num) as count FROM "${datasetNamespace}".balance_updated`
      totalBlocksResult = await queryAmpSQL<{ count: number }>(totalBlocksSQL)
      totalBlocks = totalBlocksResult[0]?.count || latestBlock
    }

    // Contar transacciones en las últimas 24 horas
    // Convertir a ISO string para comparar con timestamps ISO de Amp
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    const twentyFourHoursAgo = new Date(Date.now() - 86400 * 1000).toISOString()
    let recentTxSQL = `SELECT COUNT(*) as count FROM "${datasetNamespace}".pay_executed WHERE timestamp >= '${twentyFourHoursAgo}'`
    let recentTxResult = await queryAmpSQL<{ count: number }>(recentTxSQL)
    let totalTransactions24h = recentTxResult[0]?.count || 0

    // Si no hay transacciones con pay_executed, usar balance_updated
    // Nota: No filtramos por address porque Amp no soporta CAST de FixedSizeBinary a VARCHAR
    if (totalTransactions24h === 0) {
      recentTxSQL = `SELECT COUNT(*) as count FROM "${datasetNamespace}".balance_updated WHERE timestamp >= '${twentyFourHoursAgo}'`
      recentTxResult = await queryAmpSQL<{ count: number }>(recentTxSQL)
      totalTransactions24h = recentTxResult[0]?.count || 0
    }

    const tps = totalTransactions24h / 86400 // Transacciones por segundo en 24h

    return {
      latestBlock,
      totalTransactions24h,
      tps: Math.round(tps * 100) / 100,
      totalBlocks,
    }
  } catch (error) {
    console.error("Error fetching stats:", error)
    return {
      latestBlock: 0,
      totalTransactions24h: 0,
      tps: 0,
      totalBlocks: 0,
    }
  }
}
