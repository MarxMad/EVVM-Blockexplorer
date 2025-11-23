/**
 * Configuración del Dataset de Amp para EVVM en Base
 * 
 * Esta configuración usa eventTables() de Amp para indexación automática
 * de eventos del contrato EvvmWithEvents desplegado en Base.
 */

import { defineDataset, eventTables } from "@edgeandnode/amp"
// @ts-ignore
import { abi } from "./abis/EvvmWithEvents.json"

// Dirección del contrato EVVM con eventos desplegado en Base Mainnet
const EVVM_CONTRACT_ADDRESS = "0x2F6683b3e10D8579CA482D243682ee8e7E663dFB"

export default defineDataset(() => {
  return {
    namespace: "evvm",
    name: "evvm_explorer_base",
    network: "base",
    description: "Dataset para el explorador de bloques EVVM en Base - Indexa eventos del contrato EVVM",
    
    // Dependencia: Dataset base de Base con bloques, transacciones y logs
    dependencies: {
      base: "base/base@0.0.1",
    },

    // ✨ Amp crea automáticamente tablas desde los eventos del ABI ✨
    tables: eventTables(abi, "base"),
  }
})

