/**
 * Tipos TypeScript para los datos de la EVVM
 * Estos tipos representan la estructura de los bloques y transacciones virtuales de la EVVM
 */

/**
 * Bloque virtual de la EVVM
 * Representa un "bloque" que es en realidad un conjunto de transacciones finalizadas
 */
export interface EVVMBlock {
  /** ID del bloque virtual de la EVVM */
  blockId: number
  /** Timestamp del bloque (Unix timestamp) */
  timestamp: number
  /** Hash del bloque virtual */
  hash: string
  /** Hash del bloque padre (bloque anterior) */
  parentHash: string
  /** Número de transacciones en este bloque */
  transactionCount: number
  /** Hash de la transacción L1 que desencadenó este bloque */
  l1TransactionHash: string
  /** Dirección del executor (si aplica) */
  executor?: string
  /** Estado del bloque */
  status: "finalized" | "pending"
}

/**
 * Transacción virtual de la EVVM
 * Representa una transacción ejecutada dentro de la cadena virtual
 */
export interface EVVMTransaction {
  /** ID único de la transacción EVVM */
  transactionId: string
  /** Hash interno de la transacción */
  hash: string
  /** ID del bloque EVVM que contiene esta transacción */
  blockId: number
  /** Timestamp de la transacción */
  timestamp: number
  /** Dirección del remitente (dirección EVVM) */
  from: string
  /** Dirección del destinatario (dirección EVVM) */
  to: string
  /** Valor transferido (en wei o unidades nativas) */
  value: string
  /** Tipo de nonce utilizado: "sync" o "async" */
  nonceType: "sync" | "async"
  /** Valor del nonce */
  nonce: number
  /** Dirección del executor (si se usó un executor) */
  executor?: string
  /** Estado de la transacción */
  status: "success" | "failed"
  /** Hash de la transacción L1 de Sepolia que desencadenó esta ejecución */
  l1TransactionHash: string
  /** Índice del log en la transacción L1 */
  logIndex?: number
  /** Datos de entrada (input data) */
  inputData?: string
  /** Gas usado (si aplica) */
  gasUsed?: string
  /** Fee pagado */
  fee?: string
}

/**
 * Dirección en la EVVM
 */
export interface EVVMAddress {
  /** Dirección EVVM */
  address: string
  /** Balance en unidades nativas */
  balance: string
  /** Número total de transacciones */
  totalTransactions: number
  /** Número de transacciones entrantes */
  incomingTransactions: number
  /** Número de transacciones salientes */
  outgoingTransactions: number
}

/**
 * Estadísticas generales de la EVVM
 */
export interface EVVMStats {
  /** Último bloque EVVM */
  latestBlock: number
  /** Total de transacciones (24h) */
  totalTransactions24h: number
  /** Transacciones por segundo */
  tps: number
  /** Total de bloques */
  totalBlocks: number
}


