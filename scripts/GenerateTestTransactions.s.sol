// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {EvvmWithEvents} from "../contracts/EvvmWithEvents.sol";

/**
 * @title Script para Generar Transacciones de Prueba
 * @notice Genera transacciones de prueba que emiten eventos para indexación con Amp
 * 
 * USO:
 * 1. Configurar variables de entorno en .env:
 *    - PRIVATE_KEY=tu_private_key
 *    - SEPOLIA_RPC_URL=https://rpc.sepolia.org
 * 
 * 2. Ejecutar:
 *    forge script scripts/GenerateTestTransactions.s.sol:GenerateTestTransactions \
 *      --rpc-url $SEPOLIA_RPC_URL \
 *      --broadcast \
 *      -vvv
 */
contract GenerateTestTransactions is Script {
    
    // Dirección del contrato EVVM desplegado
    address constant EVVM_CONTRACT = 0x4Db514984aAE6A24A05f07c30310050c245b0256;
    
    // Direcciones de prueba (puedes cambiarlas)
    // Usamos direcciones simples para evitar problemas de checksum
    address constant TEST_USER_1 = 0x1111111111111111111111111111111111111111;
    address constant TEST_USER_2 = 0x2222222222222222222222222222222222222222;
    address constant TEST_USER_3 = 0x3333333333333333333333333333333333333333;
    
    // Token address (address(0) = ETH)
    address constant TOKEN = address(0);
    
    function run() external {
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deployer address:", deployer);
        console.log("EVVM Contract:", EVVM_CONTRACT);
        
        vm.startBroadcast(deployerPrivateKey);
        
        EvvmWithEvents evvm = EvvmWithEvents(payable(EVVM_CONTRACT));
        
        console.log("\n=== Generando transacciones de prueba ===");
        
        // 1. Agregar balance a usuarios de prueba (emite BalanceUpdated)
        console.log("\n1. Agregando balances...");
        
        uint256 amount1 = 1 ether;
        evvm.addBalance(TEST_USER_1, TOKEN, amount1);
        console.log("Balance agregado a USER_1:", amount1 / 1e18, "ETH");
        
        uint256 amount2 = 2 ether;
        evvm.addBalance(TEST_USER_2, TOKEN, amount2);
        console.log("Balance agregado a USER_2:", amount2 / 1e18, "ETH");
        
        uint256 amount3 = 3 ether;
        evvm.addBalance(TEST_USER_3, TOKEN, amount3);
        console.log("Balance agregado a USER_3:", amount3 / 1e18, "ETH");
        
        // 2. Cambiar estado de staker (emite StakerStatusUpdated)
        console.log("\n2. Cambiando estados de staker...");
        
        evvm.setPointStaker(TEST_USER_1, 0x01); // Hacer staker
        console.log("USER_1 ahora es staker");
        
        evvm.setPointStaker(TEST_USER_2, 0x01); // Hacer staker
        console.log("USER_2 ahora es staker");
        
        // 3. Agregar más balances para generar más eventos
        console.log("\n3. Agregando balances adicionales...");
        
        evvm.addBalance(TEST_USER_1, TOKEN, 5 ether);
        console.log("Balance adicional agregado a USER_1: 5 ETH");
        
        evvm.addBalance(TEST_USER_2, TOKEN, 10 ether);
        console.log("Balance adicional agregado to USER_2: 10 ETH");
        
        vm.stopBroadcast();
        
        console.log("\nTransacciones de prueba generadas exitosamente!");
        console.log("\nEventos generados:");
        console.log("- BalanceUpdated: 5 eventos");
        console.log("- StakerStatusUpdated: 2 eventos");
        console.log("\nVerifica en Amp:");
        console.log('pnpm run amp:query \'SELECT * FROM "evvm/evvm_explorer@dev".balance_updated ORDER BY block_num DESC LIMIT 10\'');
    }
}

