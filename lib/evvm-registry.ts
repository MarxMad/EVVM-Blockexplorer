/**
 * Registro de EVVMs desplegadas
 * 
 * Este archivo mantiene un registro de todas las EVVMs desplegadas
 * con su información: evvmId, chainId, contractAddress, y metadata
 */

import { SupportedChain, SUPPORTED_CHAINS } from "./config"

export interface EVVMInfo {
  evvmId: number
  chainId: number
  chain: SupportedChain
  contractAddress: string
  name?: string
  deployedAt?: number
  metadata?: {
    principalTokenName?: string
    principalTokenSymbol?: string
    principalTokenAddress?: string
  }
}

/**
 * Registro de todas las EVVMs desplegadas
 * 
 * Para agregar una nueva EVVM:
 * 1. Despliega el contrato usando scripts/DeployEvvmWithEvents.s.sol
 * 2. Obtén el evvmId del contrato (llamando getEvvmID())
 * 3. Agrega la entrada aquí con la información correcta
 */
export const EVVM_REGISTRY: EVVMInfo[] = [
  // EVVM en Sepolia
  {
    evvmId: 1000, // O el ID que configuraste en el deployment
    chainId: 11155111,
    chain: "sepolia",
    contractAddress: "0x4Db514984aAE6A24A05f07c30310050c245b0256",
    name: "EVVM Block Explorer - Sepolia",
    metadata: {
      principalTokenName: "MATE",
      principalTokenSymbol: "MATE",
    },
  },
  
  // EVVM en Base Mainnet
  {
    evvmId: 3000,
    chainId: 8453,
    chain: "base",
    contractAddress: "0x2F6683b3e10D8579CA482D243682ee8e7E663dFB",
    name: "EVVM Block Explorer - Base",
    metadata: {
      principalTokenName: "MATE",
      principalTokenSymbol: "MATE",
    },
  },
  
  // Agregar más EVVMs aquí después de desplegarlas
  // Ejemplo:
  // {
  //   evvmId: 2000,
  //   chainId: 84532,
  //   chain: "baseSepolia",
  //   contractAddress: "0x...",
  //   name: "Mi Nueva EVVM",
  // },
]

/**
 * Obtiene todas las EVVMs de una blockchain específica
 */
export function getEVVMsByChain(chain: SupportedChain): EVVMInfo[] {
  return EVVM_REGISTRY.filter(evvm => evvm.chain === chain)
}

/**
 * Obtiene una EVVM por su ID
 */
export function getEVVMById(evvmId: number): EVVMInfo | undefined {
  return EVVM_REGISTRY.find(evvm => evvm.evvmId === evvmId)
}

/**
 * Obtiene una EVVM por su dirección de contrato
 */
export function getEVVMByAddress(contractAddress: string): EVVMInfo | undefined {
  return EVVM_REGISTRY.find(
    evvm => evvm.contractAddress.toLowerCase() === contractAddress.toLowerCase()
  )
}

/**
 * Obtiene todas las EVVMs
 */
export function getAllEVVMs(): EVVMInfo[] {
  return EVVM_REGISTRY
}

/**
 * Obtiene los evvmIds de una blockchain específica
 */
export function getEvvmIdsByChain(chain: SupportedChain): number[] {
  return getEVVMsByChain(chain).map(evvm => evvm.evvmId)
}

/**
 * Verifica si un evvmId está registrado
 */
export function isEvvmIdRegistered(evvmId: number): boolean {
  return EVVM_REGISTRY.some(evvm => evvm.evvmId === evvmId)
}



