/**
 * Configuración del Dataset de Amp para EVVM en Base Sepolia
 * 
 * Esta configuración usa eventTables() de Amp para indexación automática
 * de eventos del contrato EvvmWithEvents desplegado en Base Sepolia.
 */

import { defineDataset, eventTables } from "@edgeandnode/amp"
// @ts-ignore
import { abi } from "./abis/EvvmWithEvents.json"

// Dirección del contrato EVVM con eventos desplegado en Base Sepolia
// ACTUALIZAR después del despliegue
const EVVM_CONTRACT_ADDRESS = "0xACTUALIZAR_DESPUES_DEL_DESPLIEGUE"

export default defineDataset(() => {
  return {
    namespace: "evvm",
    name: "evvm_explorer_base_sepolia",
    network: "base-sepolia",
    description: "Dataset para el explorador de bloques EVVM en Base Sepolia - Indexa eventos del contrato EVVM",
    
    // Dependencia: Dataset base de Base Sepolia con bloques, transacciones y logs
    dependencies: {
      "base-sepolia": "base-sepolia/base@0.0.1",
    },

    // ✨ Amp crea automáticamente tablas desde los eventos del ABI ✨
    tables: eventTables(abi, "base-sepolia"),
  }
})






