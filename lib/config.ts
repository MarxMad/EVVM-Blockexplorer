/**
 * Configuración del explorador de bloques EVVM
 * EVVM es una cadena de bloques virtual que existe como contratos inteligentes en múltiples blockchains
 */

// Configuración de blockchains soportadas
export const SUPPORTED_CHAINS = {
  sepolia: {
    name: "Sepolia",
    chainId: 11155111,
    explorerUrl: "https://sepolia.etherscan.io",
    rpcUrl: process.env.NEXT_PUBLIC_SEPOLIA_RPC_URL || "https://ethereum-sepolia-rpc.publicnode.com",
  },
  base: {
    name: "Base",
    chainId: 8453,
    explorerUrl: "https://basescan.org",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_RPC_URL || "https://mainnet.base.org",
  },
  baseSepolia: {
    name: "Base Sepolia",
    chainId: 84532,
    explorerUrl: "https://sepolia.basescan.org",
    rpcUrl: process.env.NEXT_PUBLIC_BASE_SEPOLIA_RPC_URL || "https://sepolia.base.org",
  },
} as const

export type SupportedChain = keyof typeof SUPPORTED_CHAINS

// Direcciones de los contratos EVVM por blockchain
export const EVVM_CONTRACTS: Record<SupportedChain, Record<string, string>> = {
  sepolia: {
    // Contrato principal de la EVVM (EVVM ID: 2) - Original sin eventos
    main: "0x9902984d86059234c3B6e11D5eAEC55f9627dD0f",
    // Contrato EVVM con eventos desplegado (para Amp)
    withEvents: "0x4Db514984aAE6A24A05f07c30310050c245b0256",
    // MATE Staking
    staking: "0x2FE943eE9bD346aF46d46BD36c9ccb86201Da21A",
    // NameService
    nameService: "0x93DFFaEd15239Ec77aaaBc79DF3b9818dD3E406A",
    // Treasury
    treasury: "0x213F4c8b5a228977436c2C4929F7bd67B29Af8CD",
    // P2P Swap
    p2pSwap: "0xC175f4Aa8b761ca7D0B35138969DF8095A1657B5",
  },
  base: {
    // EVVM con eventos desplegada en Base Mainnet
    withEvents: "0x2F6683b3e10D8579CA482D243682ee8e7E663dFB",
  },
  baseSepolia: {
    // EVVMs en Base Sepolia (se agregarán después del despliegue)
    withEvents: "", // Se actualizará después del despliegue
  },
}

// Configuración actual (se puede cambiar dinámicamente)
export const CURRENT_CHAIN: SupportedChain = (process.env.NEXT_PUBLIC_CHAIN as SupportedChain) || "sepolia"
export const CURRENT_EVVM = "withEvents" // Puede ser "main", "withEvents", o cualquier otra key

// Dirección del contrato principal actual
export const EVVM_CONTRACT_ADDRESS = EVVM_CONTRACTS[CURRENT_CHAIN][CURRENT_EVVM] || EVVM_CONTRACTS.sepolia.withEvents

// Red base actual
export const BASE_CHAIN = SUPPORTED_CHAINS[CURRENT_CHAIN]

// Configuración de Amp
// Amp es una base de datos nativa de blockchain que expone datos vía SQL sobre HTTP
// Por defecto, Amp corre en http://localhost:1603
// Los datos se organizan en namespaces, ej: "evvm/EVVMBlock"
export const AMP_CONFIG = {
  // URL del servidor HTTP de Amp para queries
  // Local: http://localhost:1603
  // Staging: https://gateway.amp.staging.thegraph.com
  // Producción: https://gateway.amp.thegraph.com
  endpoint: process.env.NEXT_PUBLIC_AMP_QUERY_URL || process.env.NEXT_PUBLIC_AMP_ENDPOINT || "http://localhost:1603",
  // Token de autenticación (solo necesario para datasets publicados)
  token: process.env.NEXT_PUBLIC_AMP_QUERY_TOKEN || "",
  // Dataset RPC de dependencia (bloques, transacciones, logs)
  rpcDataset: process.env.NEXT_PUBLIC_AMP_RPC_DATASET || "",
  // Red actual (se actualiza dinámicamente)
  network: CURRENT_CHAIN,
  // Namespace donde están tus tablas EVVM
  // Ajusta según cómo hayas configurado tu dataset en Amp
  namespace: process.env.NEXT_PUBLIC_AMP_NAMESPACE || "evvm",
}

// Configuración de RPC para consultas directas (fallback)
export const RPC_CONFIG = {
  sepolia: SUPPORTED_CHAINS.sepolia.rpcUrl,
  base: SUPPORTED_CHAINS.base.rpcUrl,
  baseSepolia: SUPPORTED_CHAINS.baseSepolia.rpcUrl,
}

