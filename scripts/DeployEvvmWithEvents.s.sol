// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {EvvmWithEvents} from "../contracts/EvvmWithEvents.sol";
import {EvvmStructs} from "@evvm/testnet-contracts/contracts/evvm/lib/EvvmStructs.sol";

/**
 * @title Script de Despliegue para EvvmWithEvents
 * @notice Despliega el contrato EVVM con eventos para integración con Amp
 * 
 * Este MISMO contrato puede desplegarse en cualquier blockchain EVM-compatible:
 * - Sepolia
 * - Base
 * - Base Sepolia
 * - Cualquier otra red EVM
 * 
 * USO:
 * 1. Configurar variables de entorno en .env:
 *    - PRIVATE_KEY=tu_private_key
 *    - SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/tu_key (para Sepolia)
 *    - BASE_RPC_URL=https://mainnet.base.org (para Base)
 *    - BASE_SEPOLIA_RPC_URL=https://sepolia.base.org (para Base Sepolia)
 *    - ETHERSCAN_API_KEY=tu_etherscan_key (opcional, para verificación)
 * 
 * 2. Ejecutar en Sepolia:
 *    forge script scripts/DeployEvvmWithEvents.s.sol:DeployEvvmWithEvents \
 *      --rpc-url $SEPOLIA_RPC_URL \
 *      --broadcast \
 *      --verify \
 *      -vvvv
 * 
 * 3. Ejecutar en Base Sepolia:
 *    forge script scripts/DeployEvvmWithEvents.s.sol:DeployEvvmWithEvents \
 *      --rpc-url $BASE_SEPOLIA_RPC_URL \
 *      --broadcast \
 *      --verify \
 *      -vvvv
 */
contract DeployEvvmWithEvents is Script {
    
    // Direcciones de contratos (pueden ser address(0) si no existen en esta blockchain)
    // Para Sepolia, usa las direcciones existentes
    // Para Base/Base Sepolia, usa address(0) y configura después
    address constant STAKING_CONTRACT = address(0); // Actualizar según la blockchain
    address constant NAMESERVICE = address(0); // Actualizar según la blockchain
    address constant TREASURY = address(0); // Actualizar según la blockchain
    
    // Token MATE (puede ser address(0) para ETH o un token ERC20)
    address constant MATE_TOKEN = address(0);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("Deployer balance:", deployer.balance / 1e18, "ETH");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Detectar la blockchain actual basándose en el chainId
        uint256 chainId = block.chainid;
        string memory chainName = "Unknown";
        uint256 evvmId = 1000; // Default
        
        if (chainId == 11155111) {
            chainName = "Sepolia";
            evvmId = 1000;
        } else if (chainId == 84532) {
            chainName = "Base Sepolia";
            evvmId = 2000;
        } else if (chainId == 8453) {
            chainName = "Base";
            evvmId = 3000;
        }
        
        console.log("Deploying on chain:", chainId);
        console.log("Chain name:", chainName);
        
        // Configurar metadata de EVVM
        EvvmStructs.EvvmMetadata memory evvmMetadata = EvvmStructs.EvvmMetadata({
            EvvmName: string.concat("EVVM Block Explorer - ", chainName),
            EvvmID: evvmId, // EVVM ID único por blockchain
            principalTokenName: "MATE",
            principalTokenSymbol: "MATE",
            principalTokenAddress: MATE_TOKEN, // Dirección del token principal
            reward: 1 * 10**18, // Recompensa inicial (1 MATE por transacción)
            totalSupply: 0, // Se actualiza automáticamente
            eraTokens: 1000000 * 10**18 // Threshold inicial para cambio de era
        });
        
        // Desplegar contrato EVVM con eventos
        console.log("\n--- Desplegando EvvmWithEvents ---");
        EvvmWithEvents evvm = new EvvmWithEvents(
            deployer, // _initialOwner (admin)
            STAKING_CONTRACT, // _stakingContractAddress (puede ser address(0))
            evvmMetadata // _evvmMetadata
        );
        
        console.log("EvvmWithEvents desplegado en:", address(evvm));
        
        // Configurar NameService y Treasury (si están disponibles)
        if (NAMESERVICE != address(0) && TREASURY != address(0)) {
            try evvm._setupNameServiceAndTreasuryAddress(NAMESERVICE, TREASURY) {
                console.log("NameService y Treasury configurados");
            } catch {
                console.log("WARNING: No se pudo configurar NameService/Treasury");
            }
        } else {
            console.log("INFO: NameService y Treasury no configurados (usa address(0))");
            console.log("   Configuralos manualmente despues del despliegue si es necesario");
        }
        
        // Verificar configuración
        console.log("\n--- Verificacion ---");
        console.log("EVVM ID:", evvm.getEvvmID());
        console.log("Admin:", evvm.getCurrentAdmin());
        console.log("Staking Contract:", evvm.getStakingContractAddress());
        console.log("Reward Amount:", evvm.getRewardAmount() / 1e18, "MATE");
        
        vm.stopBroadcast();
        
        console.log("\nDespliegue completado!");
        console.log("\nProximos pasos:");
        console.log("1. Guarda la direccion del contrato:", address(evvm));
        console.log("2. Identifica la blockchain donde desplegaste (Sepolia/Base/Base Sepolia)");
        console.log("3. Actualiza la config de Amp correspondiente:");
        console.log("   - Sepolia: amp.config.ts");
        console.log("   - Base: amp.config.base.ts");
        console.log("   - Base Sepolia: amp.config.base-sepolia.ts");
        console.log("4. Actualiza lib/config.ts con esta direccion en la blockchain correspondiente");
        console.log("5. Obten el ABI: cp out/EvvmWithEvents.sol/EvvmWithEvents.json abis/EvvmWithEvents.json");
        console.log("6. Reconstruye el dataset de Amp para esta blockchain");
    }
}

