/**
 * Script para obtener los selectores de función del contrato EVVM
 * 
 * Ejecutar: npx tsx scripts/get-function-selectors.ts
 */

import { getFunctionSelector } from "viem"

// ABI mínimo con las funciones principales del contrato EVVM
// Reemplaza con el ABI completo cuando lo tengas
const EVVM_FUNCTIONS = [
  {
    name: "pay",
    type: "function",
    inputs: [
      { name: "from", type: "address" },
      { name: "to_address", type: "address" },
      { name: "to_identity", type: "string" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "priorityFee", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "priorityFlag", type: "bool" },
      { name: "executor", type: "address" },
      { name: "signature", type: "bytes" },
    ],
  },
  {
    name: "payMultiple",
    type: "function",
    inputs: [
      { name: "payData", type: "tuple[]" },
    ],
  },
  {
    name: "dispersePay",
    type: "function",
    inputs: [
      { name: "from", type: "address" },
      { name: "toData", type: "tuple[]" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "priorityFee", type: "uint256" },
      { name: "nonce", type: "uint256" },
      { name: "priorityFlag", type: "bool" },
      { name: "executor", type: "address" },
      { name: "signature", type: "bytes" },
    ],
  },
  {
    name: "caPay",
    type: "function",
    inputs: [
      { name: "to", type: "address" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
  {
    name: "disperseCaPay",
    type: "function",
    inputs: [
      { name: "toData", type: "tuple[]" },
      { name: "token", type: "address" },
      { name: "amount", type: "uint256" },
    ],
  },
] as const

console.log("Function Selectors del Contrato EVVM:\n")
console.log("=" .repeat(60))

EVVM_FUNCTIONS.forEach((func) => {
  try {
    // Nota: getFunctionSelector necesita el formato completo de la función
    // Esto es un ejemplo - necesitas el ABI completo y correcto
    const signature = `${func.name}(${func.inputs.map((i) => i.type).join(",")})`
    console.log(`${func.name.padEnd(20)} -> ${signature}`)
    console.log(`  (Necesitas calcular el selector con el ABI completo)`)
  } catch (error) {
    console.log(`${func.name.padEnd(20)} -> Error al calcular`)
  }
})

console.log("\n" + "=".repeat(60))
console.log("\nPara obtener los selectores reales:")
console.log("1. Obtén el ABI completo desde Etherscan")
console.log("2. Usa viem o ethers.js para calcular los selectores")
console.log("3. O consulta directamente en Etherscan las transacciones")
console.log("\nEjemplo con viem:")
console.log(`
import { getFunctionSelector } from 'viem'
import EVVM_ABI from './abis/EVVM.json'

EVVM_ABI
  .filter(item => item.type === 'function')
  .forEach(func => {
    const selector = getFunctionSelector(func)
    console.log(\`\${func.name}: \${selector}\`)
  })
`)


