// SPDX-License-Identifier: EVVM-NONCOMMERCIAL-1.0
// Versión con eventos para integración con Amp

pragma solidity ^0.8.0;

/**
 * @title EVVM Core Contract with Events for Amp Integration
 * @notice Versión del contrato core de EVVM con eventos agregados para indexación con Amp
 * @dev Los eventos permiten que Amp indexe automáticamente la actividad de la EVVM
 */

import {NameService} from "@evvm/testnet-contracts/contracts/nameService/NameService.sol";
import {EvvmStorage} from "@evvm/testnet-contracts/contracts/evvm/lib/EvvmStorage.sol";
import {ErrorsLib} from "@evvm/testnet-contracts/contracts/evvm/lib/ErrorsLib.sol";
import {SignatureUtils} from "@evvm/testnet-contracts/contracts/evvm/lib/SignatureUtils.sol";
import {Strings} from "@openzeppelin/contracts/utils/Strings.sol";

contract EvvmWithEvents is EvvmStorage {

    // 🎯 EVENTOS PARA AMP 🎯

    /**
     * @notice Emitido cuando se ejecuta un pago exitoso
     * @param from Dirección origen del pago
     * @param to Dirección destino del pago
     * @param token Dirección del token transferido
     * @param amount Cantidad transferida
     * @param nonce Nonce de la transacción
     * @param priorityFlag Si es true = async nonce, false = sync nonce
     * @param executor Dirección que ejecutó la transacción
     * @param evvmId ID de la instancia EVVM
     */
    event PayExecuted(
        address indexed from,
        address indexed to,
        address indexed token,
        uint256 amount,
        uint256 nonce,
        bool priorityFlag,
        address executor,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando se ejecuta payMultiple
     * @param from Dirección origen
     * @param recipientCount Número de destinatarios
     * @param successfulTransactions Transacciones exitosas
     * @param failedTransactions Transacciones fallidas
     * @param executor Dirección que ejecutó
     * @param evvmId ID de la instancia EVVM
     */
    event PayMultipleExecuted(
        address indexed from,
        uint256 recipientCount,
        uint256 successfulTransactions,
        uint256 failedTransactions,
        address indexed executor,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando se ejecuta dispersePay
     * @param from Dirección origen
     * @param recipientCount Número de destinatarios
     * @param totalAmount Cantidad total distribuida
     * @param token Token transferido
     * @param executor Dirección que ejecutó
     * @param evvmId ID de la instancia EVVM
     */
    event DispersePayExecuted(
        address indexed from,
        uint256 recipientCount,
        uint256 totalAmount,
        address indexed token,
        address indexed executor,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando cambia el balance de una cuenta
     * @param account Dirección de la cuenta
     * @param token Token afectado
     * @param previousBalance Balance anterior
     * @param newBalance Nuevo balance
     * @param evvmId ID de la instancia EVVM
     */
    event BalanceUpdated(
        address indexed account,
        address indexed token,
        uint256 previousBalance,
        uint256 newBalance,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando se otorga una recompensa a un staker
     * @param staker Dirección del staker
     * @param rewardAmount Cantidad de recompensa otorgada
     * @param transactionCount Número de transacciones procesadas
     * @param evvmId ID de la instancia EVVM
     */
    event RewardGiven(
        address indexed staker,
        uint256 rewardAmount,
        uint256 transactionCount,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando se recalcula la recompensa (cambio de era)
     * @param oldReward Recompensa anterior
     * @param newReward Nueva recompensa (mitad de la anterior)
     * @param eraTokens Nuevo threshold de era tokens
     * @param bonusRecipient Dirección que recibió el bonus aleatorio
     * @param bonusAmount Cantidad del bonus recibido
     * @param evvmId ID de la instancia EVVM
     */
    event RewardRecalculated(
        uint256 oldReward,
        uint256 newReward,
        uint256 eraTokens,
        address indexed bonusRecipient,
        uint256 bonusAmount,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando el treasury agrega tokens
     * @param user Dirección que recibió tokens
     * @param token Token agregado
     * @param amount Cantidad agregada
     * @param evvmId ID de la instancia EVVM
     */
    event TreasuryAmountAdded(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando el treasury remueve tokens
     * @param user Dirección de la que se removieron tokens
     * @param token Token removido
     * @param amount Cantidad removida
     * @param evvmId ID de la instancia EVVM
     */
    event TreasuryAmountRemoved(
        address indexed user,
        address indexed token,
        uint256 amount,
        uint256 evvmId
    );

    /**
     * @notice Emitido cuando se actualiza el estado de un staker
     * @param user Dirección del usuario
     * @param isStaker Si es true, se convirtió en staker; si es false, dejó de serlo
     * @param evvmId ID de la instancia EVVM
     */
    event StakerStatusUpdated(
        address indexed user,
        bool isStaker,
        uint256 evvmId
    );

    modifier onlyAdmin() {
        if (msg.sender != admin.current) {
            revert();
        }
        _;
    }

    constructor(
        address _initialOwner,
        address _stakingContractAddress,
        EvvmMetadata memory _evvmMetadata
    ) {
        stakingContractAddress = _stakingContractAddress;
        admin.current = _initialOwner;
        balances[_stakingContractAddress][evvmMetadata.principalTokenAddress] =
            getRewardAmount() * 2;
        stakerList[_stakingContractAddress] = FLAG_IS_STAKER;
        breakerSetupNameServiceAddress = FLAG_IS_STAKER;
        evvmMetadata = _evvmMetadata;
    }

    function _setupNameServiceAndTreasuryAddress(
        address _nameServiceAddress,
        address _treasuryAddress
    ) external {
        if (breakerSetupNameServiceAddress == 0x00) {
            revert();
        }
        nameServiceAddress = _nameServiceAddress;
        balances[nameServiceAddress][evvmMetadata.principalTokenAddress] =
            10000 * 10 ** 18;
        stakerList[nameServiceAddress] = FLAG_IS_STAKER;
        treasuryAddress = _treasuryAddress;
    }

    function setEvvmID(uint256 newEvvmID) external onlyAdmin {
        if (newEvvmID == 0) {
            if (block.timestamp > windowTimeToChangeEvvmID)
                revert ErrorsLib.WindowToChangeEvvmIDExpired();
        }
        evvmMetadata.EvvmID = newEvvmID;
        windowTimeToChangeEvvmID = block.timestamp + 1 days;
    }

    fallback() external {
        if (currentImplementation == address(0)) revert();
        assembly {
            calldatacopy(0, 0, calldatasize())
            let result := delegatecall(
                gas(),
                sload(currentImplementation.slot),
                0,
                calldatasize(),
                0,
                0
            )
            returndatacopy(0, 0, returndatasize())
            switch result
            case 0 {
                revert(0, returndatasize())
            }
            default {
                return(0, returndatasize())
            }
        }
    }

    function addBalance(
        address user,
        address token,
        uint256 quantity
    ) external {
        uint256 previousBalance = balances[user][token];
        balances[user][token] += quantity;
        
        // ✨ EMITIR EVENTO PARA AMP ✨
        emit BalanceUpdated(
            user,
            token,
            previousBalance,
            balances[user][token],
            evvmMetadata.EvvmID
        );
    }

    function setPointStaker(address user, bytes1 answer) external {
        bool wasStaker = stakerList[user] == FLAG_IS_STAKER;
        stakerList[user] = answer;
        bool isStaker = stakerList[user] == FLAG_IS_STAKER;
        
        // ✨ EMITIR EVENTO PARA AMP ✨
        if (wasStaker != isStaker) {
            emit StakerStatusUpdated(user, isStaker, evvmMetadata.EvvmID);
        }
    }

    function pay(
        address from,
        address to_address,
        string memory to_identity,
        address token,
        uint256 amount,
        uint256 priorityFee,
        uint256 nonce,
        bool priorityFlag,
        address executor,
        bytes memory signature
    ) external {
        if (
            !SignatureUtils.verifyMessageSignedForPay(
                evvmMetadata.EvvmID,
                from,
                to_address,
                to_identity,
                token,
                amount,
                priorityFee,
                priorityFlag ? nonce : nextSyncUsedNonce[from],
                priorityFlag,
                executor,
                signature
            )
        ) revert ErrorsLib.InvalidSignature();

        if (executor != address(0)) {
            if (msg.sender != executor)
                revert ErrorsLib.SenderIsNotTheExecutor();
        }

        if (priorityFlag && asyncUsedNonce[from][nonce])
            revert ErrorsLib.InvalidAsyncNonce();

        address to = !Strings.equal(to_identity, "")
            ? NameService(nameServiceAddress).verifyStrictAndGetOwnerOfIdentity(
                to_identity
            )
            : to_address;

        // Guardar balance anterior para el evento
        uint256 fromPreviousBalance = balances[from][token];
        uint256 toPreviousBalance = balances[to][token];

        if (!_updateBalance(from, to, token, amount))
            revert ErrorsLib.UpdateBalanceFailed();

        if (isAddressStaker(msg.sender)) {
            if (priorityFee > 0) {
                if (!_updateBalance(from, msg.sender, token, priorityFee))
                    revert ErrorsLib.UpdateBalanceFailed();
            }
            _giveReward(msg.sender, 1);
        }

        if (priorityFlag) {
            asyncUsedNonce[from][nonce] = true;
        } else {
            nextSyncUsedNonce[from]++;
        }

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit PayExecuted(
            from,
            to,
            token,
            amount,
            nonce,
            priorityFlag,
            executor != address(0) ? executor : msg.sender,
            evvmMetadata.EvvmID
        );
    }

    function payMultiple(
        PayData[] memory payData
    )
        external
        returns (
            uint256 successfulTransactions,
            uint256 failedTransactions,
            bool[] memory results
        )
    {
        address to_aux;
        results = new bool[](payData.length);
        address from = payData.length > 0 ? payData[0].from : address(0);
        
        for (uint256 iteration = 0; iteration < payData.length; iteration++) {
            if (
                !SignatureUtils.verifyMessageSignedForPay(
                    evvmMetadata.EvvmID,
                    payData[iteration].from,
                    payData[iteration].to_address,
                    payData[iteration].to_identity,
                    payData[iteration].token,
                    payData[iteration].amount,
                    payData[iteration].priorityFee,
                    payData[iteration].priorityFlag
                        ? payData[iteration].nonce
                        : nextSyncUsedNonce[payData[iteration].from],
                    payData[iteration].priorityFlag,
                    payData[iteration].executor,
                    payData[iteration].signature
                )
            ) revert ErrorsLib.InvalidSignature();

            if (payData[iteration].executor != address(0)) {
                if (msg.sender != payData[iteration].executor) {
                    failedTransactions++;
                    results[iteration] = false;
                    continue;
                }
            }

            if (payData[iteration].priorityFlag) {
                if (
                    !asyncUsedNonce[payData[iteration].from][
                        payData[iteration].nonce
                    ]
                ) {
                    asyncUsedNonce[payData[iteration].from][
                        payData[iteration].nonce
                    ] = true;
                } else {
                    failedTransactions++;
                    results[iteration] = false;
                    continue;
                }
            } else {
                if (
                    nextSyncUsedNonce[payData[iteration].from] ==
                    payData[iteration].nonce
                ) {
                    nextSyncUsedNonce[payData[iteration].from]++;
                } else {
                    failedTransactions++;
                    results[iteration] = false;
                    continue;
                }
            }

            to_aux = !Strings.equal(payData[iteration].to_identity, "")
                ? NameService(nameServiceAddress)
                    .verifyStrictAndGetOwnerOfIdentity(
                        payData[iteration].to_identity
                    )
                : payData[iteration].to_address;

            if (
                payData[iteration].priorityFee + payData[iteration].amount >
                balances[payData[iteration].from][payData[iteration].token]
            ) {
                failedTransactions++;
                results[iteration] = false;
                continue;
            }

            if (
                !_updateBalance(
                    payData[iteration].from,
                    to_aux,
                    payData[iteration].token,
                    payData[iteration].amount
                )
            ) {
                failedTransactions++;
                results[iteration] = false;
                continue;
            } else {
                if (
                    payData[iteration].priorityFee > 0 &&
                    isAddressStaker(msg.sender)
                ) {
                    if (
                        !_updateBalance(
                            payData[iteration].from,
                            msg.sender,
                            payData[iteration].token,
                            payData[iteration].priorityFee
                        )
                    ) {
                        failedTransactions++;
                        results[iteration] = false;
                        continue;
                    }
                }

                successfulTransactions++;
                results[iteration] = true;
            }
        }

        if (isAddressStaker(msg.sender)) {
            _giveReward(msg.sender, successfulTransactions);
        }

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit PayMultipleExecuted(
            from,
            payData.length,
            successfulTransactions,
            failedTransactions,
            msg.sender,
            evvmMetadata.EvvmID
        );
    }

    function dispersePay(
        address from,
        DispersePayMetadata[] memory toData,
        address token,
        uint256 amount,
        uint256 priorityFee,
        uint256 nonce,
        bool priorityFlag,
        address executor,
        bytes memory signature
    ) external {
        if (
            !SignatureUtils.verifyMessageSignedForDispersePay(
                evvmMetadata.EvvmID,
                from,
                sha256(abi.encode(toData)),
                token,
                amount,
                priorityFee,
                priorityFlag ? nonce : nextSyncUsedNonce[from],
                priorityFlag,
                executor,
                signature
            )
        ) revert ErrorsLib.InvalidSignature();

        if (executor != address(0)) {
            if (msg.sender != executor)
                revert ErrorsLib.SenderIsNotTheExecutor();
        }

        if (priorityFlag) {
            if (asyncUsedNonce[from][nonce])
                revert ErrorsLib.InvalidAsyncNonce();
        }

        if (balances[from][token] < amount + priorityFee)
            revert ErrorsLib.InsufficientBalance();

        uint256 acomulatedAmount = 0;
        balances[from][token] -= (amount + priorityFee);
        address to_aux;
        for (uint256 i = 0; i < toData.length; i++) {
            acomulatedAmount += toData[i].amount;

            if (!Strings.equal(toData[i].to_identity, "")) {
                if (
                    NameService(nameServiceAddress).strictVerifyIfIdentityExist(
                        toData[i].to_identity
                    )
                ) {
                    to_aux = NameService(nameServiceAddress).getOwnerOfIdentity(
                            toData[i].to_identity
                        );
                }
            } else {
                to_aux = toData[i].to_address;
            }

            balances[to_aux][token] += toData[i].amount;
        }

        if (acomulatedAmount != amount)
            revert ErrorsLib.InvalidAmount(acomulatedAmount, amount);

        if (isAddressStaker(msg.sender)) {
            _giveReward(msg.sender, 1);
            balances[msg.sender][token] += priorityFee;
        } else {
            balances[from][token] += priorityFee;
        }

        if (priorityFlag) {
            asyncUsedNonce[from][nonce] = true;
        } else {
            nextSyncUsedNonce[from]++;
        }

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit DispersePayExecuted(
            from,
            toData.length,
            amount,
            token,
            executor != address(0) ? executor : msg.sender,
            evvmMetadata.EvvmID
        );
    }

    function caPay(address to, address token, uint256 amount) external {
        uint256 size;
        address from = msg.sender;

        assembly {
            size := extcodesize(from)
        }

        if (size == 0) revert ErrorsLib.NotAnCA();

        uint256 fromPreviousBalance = balances[from][token];
        uint256 toPreviousBalance = balances[to][token];

        if (!_updateBalance(from, to, token, amount))
            revert ErrorsLib.UpdateBalanceFailed();

        if (isAddressStaker(msg.sender)) {
            _giveReward(msg.sender, 1);
        }
    }

    function disperseCaPay(
        DisperseCaPayMetadata[] memory toData,
        address token,
        uint256 amount
    ) external {
        uint256 size;
        address from = msg.sender;

        assembly {
            size := extcodesize(from)
        }

        if (size == 0) revert ErrorsLib.NotAnCA();

        uint256 acomulatedAmount = 0;
        if (balances[msg.sender][token] < amount)
            revert ErrorsLib.InsufficientBalance();

        balances[msg.sender][token] -= amount;

        for (uint256 i = 0; i < toData.length; i++) {
            acomulatedAmount += toData[i].amount;
            if (acomulatedAmount > amount)
                revert ErrorsLib.InvalidAmount(acomulatedAmount, amount);

            balances[toData[i].toAddress][token] += toData[i].amount;
        }

        if (acomulatedAmount != amount)
            revert ErrorsLib.InvalidAmount(acomulatedAmount, amount);

        if (isAddressStaker(msg.sender)) {
            _giveReward(msg.sender, 1);
        }
    }

    function addAmountToUser(
        address user,
        address token,
        uint256 amount
    ) external {
        if (msg.sender != treasuryAddress)
            revert ErrorsLib.SenderIsNotTreasury();

        uint256 previousBalance = balances[user][token];
        balances[user][token] += amount;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit TreasuryAmountAdded(
            user,
            token,
            amount,
            evvmMetadata.EvvmID
        );

        emit BalanceUpdated(
            user,
            token,
            previousBalance,
            balances[user][token],
            evvmMetadata.EvvmID
        );
    }

    function removeAmountFromUser(
        address user,
        address token,
        uint256 amount
    ) external {
        if (msg.sender != treasuryAddress)
            revert ErrorsLib.SenderIsNotTreasury();

        uint256 previousBalance = balances[user][token];
        balances[user][token] -= amount;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit TreasuryAmountRemoved(
            user,
            token,
            amount,
            evvmMetadata.EvvmID
        );

        emit BalanceUpdated(
            user,
            token,
            previousBalance,
            balances[user][token],
            evvmMetadata.EvvmID
        );
    }

    function _updateBalance(
        address from,
        address to,
        address token,
        uint256 value
    ) internal returns (bool) {
        uint256 fromBalance = balances[from][token];
        if (fromBalance < value) {
            return false;
        } else {
            uint256 toPreviousBalance = balances[to][token];
            unchecked {
                balances[from][token] = fromBalance - value;
                balances[to][token] += value;
            }
            
            // ✨ EMITIR EVENTO PARA AMP ✨
            // Solo emitir para el destinatario para evitar duplicados
            emit BalanceUpdated(
                to,
                token,
                toPreviousBalance,
                balances[to][token],
                evvmMetadata.EvvmID
            );
            
            return true;
        }
    }

    function _giveReward(address user, uint256 amount) internal returns (bool) {
        uint256 principalReward = evvmMetadata.reward * amount;
        uint256 userBalance = balances[user][evvmMetadata.principalTokenAddress];

        balances[user][evvmMetadata.principalTokenAddress] =
            userBalance + principalReward;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit RewardGiven(
            user,
            principalReward,
            amount,
            evvmMetadata.EvvmID
        );

        return (userBalance + principalReward ==
            balances[user][evvmMetadata.principalTokenAddress]);
    }

    function proposeImplementation(address _newImpl) external onlyAdmin {
        proposalImplementation = _newImpl;
        timeToAcceptImplementation = block.timestamp + 30 days;
    }

    function rejectUpgrade() external onlyAdmin {
        proposalImplementation = address(0);
        timeToAcceptImplementation = 0;
    }

    function acceptImplementation() external onlyAdmin {
        if (block.timestamp < timeToAcceptImplementation) revert();
        currentImplementation = proposalImplementation;
        proposalImplementation = address(0);
        timeToAcceptImplementation = 0;
    }

    function setNameServiceAddress(
        address _nameServiceAddress
    ) external onlyAdmin {
        nameServiceAddress = _nameServiceAddress;
    }

    function proposeAdmin(address _newOwner) external onlyAdmin {
        if (_newOwner == address(0) || _newOwner == admin.current) {
            revert();
        }
        admin.proposal = _newOwner;
        admin.timeToAccept = block.timestamp + 1 days;
    }

    function rejectProposalAdmin() external onlyAdmin {
        admin.proposal = address(0);
        admin.timeToAccept = 0;
    }

    function acceptAdmin() external {
        if (block.timestamp < admin.timeToAccept) {
            revert();
        }
        if (msg.sender != admin.proposal) {
            revert();
        }
        admin.current = admin.proposal;
        admin.proposal = address(0);
        admin.timeToAccept = 0;
    }

    function recalculateReward() public {
        if (evvmMetadata.totalSupply > evvmMetadata.eraTokens) {
            uint256 oldReward = evvmMetadata.reward;
            evvmMetadata.eraTokens += ((evvmMetadata.totalSupply -
                evvmMetadata.eraTokens) / 2);
            
            uint256 bonusAmount = evvmMetadata.reward * getRandom(1, 5083);
            balances[msg.sender][evvmMetadata.principalTokenAddress] += bonusAmount;
            
            evvmMetadata.reward = evvmMetadata.reward / 2;

            // ✨ EMITIR EVENTO PARA AMP ✨
            emit RewardRecalculated(
                oldReward,
                evvmMetadata.reward,
                evvmMetadata.eraTokens,
                msg.sender,
                bonusAmount,
                evvmMetadata.EvvmID
            );
        } else {
            revert();
        }
    }

    function getRandom(
        uint256 min,
        uint256 max
    ) internal view returns (uint256) {
        return
            min +
            (uint256(
                keccak256(abi.encodePacked(block.timestamp, block.prevrandao))
            ) % (max - min + 1));
    }

    function pointStaker(address user, bytes1 answer) public {
        if (msg.sender != stakingContractAddress) {
            revert();
        }
        bool wasStaker = stakerList[user] == FLAG_IS_STAKER;
        stakerList[user] = answer;
        bool isStaker = stakerList[user] == FLAG_IS_STAKER;
        
        // ✨ EMITIR EVENTO PARA AMP ✨
        if (wasStaker != isStaker) {
            emit StakerStatusUpdated(user, isStaker, evvmMetadata.EvvmID);
        }
    }

    // View functions (sin cambios, solo se mantienen)
    function getEvvmMetadata() external view returns (EvvmMetadata memory) {
        return evvmMetadata;
    }

    function getEvvmID() external view returns (uint256) {
        return evvmMetadata.EvvmID;
    }

    function getWhitelistTokenToBeAddedDateToSet()
        external
        view
        returns (uint256)
    {
        return whitelistTokenToBeAdded_dateToSet;
    }

    function getNameServiceAddress() external view returns (address) {
        return nameServiceAddress;
    }

    function getStakingContractAddress() external view returns (address) {
        return stakingContractAddress;
    }

    function getNextCurrentSyncNonce(
        address user
    ) external view returns (uint256) {
        return nextSyncUsedNonce[user];
    }

    function getIfUsedAsyncNonce(
        address user,
        uint256 nonce
    ) external view returns (bool) {
        return asyncUsedNonce[user][nonce];
    }

    function getNextFisherDepositNonce(
        address user
    ) external view returns (uint256) {
        return nextFisherDepositNonce[user];
    }

    function getBalance(
        address user,
        address token
    ) external view returns (uint) {
        return balances[user][token];
    }

    function isAddressStaker(address user) public view returns (bool) {
        return stakerList[user] == FLAG_IS_STAKER;
    }

    function getEraPrincipalToken() public view returns (uint256) {
        return evvmMetadata.eraTokens;
    }

    function getRewardAmount() public view returns (uint256) {
        return evvmMetadata.reward;
    }

    function getPrincipalTokenTotalSupply() public view returns (uint256) {
        return evvmMetadata.totalSupply;
    }

    function getCurrentImplementation() public view returns (address) {
        return currentImplementation;
    }

    function getProposalImplementation() public view returns (address) {
        return proposalImplementation;
    }

    function getTimeToAcceptImplementation() public view returns (uint256) {
        return timeToAcceptImplementation;
    }

    function getCurrentAdmin() public view returns (address) {
        return admin.current;
    }

    function getProposalAdmin() public view returns (address) {
        return admin.proposal;
    }

    function getTimeToAcceptAdmin() public view returns (uint256) {
        return admin.timeToAccept;
    }

    function getWhitelistTokenToBeAdded() public view returns (address) {
        return whitelistTokenToBeAdded_address;
    }
}

