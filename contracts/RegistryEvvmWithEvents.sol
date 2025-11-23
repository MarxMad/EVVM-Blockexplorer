// SPDX-License-Identifier: EVVM-NONCOMMERCIAL-1.0
// Versión con eventos para integración con Amp

pragma solidity ^0.8.0;

import {OwnableUpgradeable} from "@openzeppelin/contracts-upgradeable/access/OwnableUpgradeable.sol";
import {Initializable} from "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import {UUPSUpgradeable} from "@openzeppelin/contracts-upgradeable/proxy/utils/UUPSUpgradeable.sol";

contract RegistryEvvmWithEvents is Initializable, OwnableUpgradeable, UUPSUpgradeable {

    // 🎯 EVENTOS PARA AMP 🎯
    event EvvmRegistered(
        uint256 indexed evvmID,
        uint256 indexed chainId,
        address indexed evvmAddress,
        address registrant,
        uint256 timestamp
    );

    event ChainIdWhitelisted(
        uint256 indexed chainId,
        address indexed whitelister,
        uint256 timestamp
    );

    event SuperUserProposed(
        address indexed currentSuperUser,
        address indexed proposedSuperUser,
        uint256 timeToAccept
    );

    event SuperUserChanged(
        address indexed oldSuperUser,
        address indexed newSuperUser,
        uint256 timestamp
    );

    event UpgradeProposed(
        address indexed currentImplementation,
        address indexed proposedImplementation,
        uint256 timeToAccept
    );

    event UpgradeExecuted(
        address indexed oldImplementation,
        address indexed newImplementation,
        uint256 timestamp
    );

    // ... resto del código igual ...
    error InvalidUser();
    error InvalidInput();
    error AlreadyRegistered();
    error ChainIdNotRegistered();
    error EvvmIdAlreadyRegistered();

    struct Metadata {
        uint256 chainId;
        address evvmAddress;
    }

    struct AddressTypeProposal {
        address current;
        address proposal;
        uint256 timeToAccept;
    }

    AddressTypeProposal superUser;
    AddressTypeProposal upgradeProposal;

    mapping(uint256 evvmID => Metadata) private registry;
    mapping(uint256 chainId => bool answer) private isThisChainIdRegistered;
    mapping(uint256 chainId => mapping(address evvm => bool answer)) isThisAddressRegistered;

    uint256 publicCounter;

    modifier isSuperUser() {
        if (msg.sender != superUser.current) revert InvalidUser();
        _;
    }

    constructor() {
        _disableInitializers();
    }

    function initialize(address initialSuperUser) public initializer {
        publicCounter = 1000;
        superUser = AddressTypeProposal(initialSuperUser, address(0), 0);
        __Ownable_init(initialSuperUser);
        // UUPSUpgradeable no requiere inicialización en OpenZeppelin v5
    }

    function registerEvvm(
        uint256 chainId,
        address evvmAddress
    ) external returns (uint256) {
        if (chainId == 0 || evvmAddress == address(0)) revert InvalidInput();

        if (isThisAddressRegistered[chainId][evvmAddress])
            revert AlreadyRegistered();

        if (!isThisChainIdRegistered[chainId]) revert ChainIdNotRegistered();

        uint256 evvmID = publicCounter;
        registry[evvmID] = Metadata(chainId, evvmAddress);
        isThisAddressRegistered[chainId][evvmAddress] = true;
        publicCounter++;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit EvvmRegistered(
            evvmID,
            chainId,
            evvmAddress,
            msg.sender,
            block.timestamp
        );

        return evvmID;
    }

    function sudoRegisterEvvm(
        uint256 evvmID,
        uint256 chainId,
        address evvmAddress
    ) external isSuperUser returns (uint256) {
        if (
            evvmID < 1 ||
            evvmID > 999 ||
            chainId == 0 ||
            evvmAddress == address(0)
        ) revert InvalidInput();

        if (isThisAddressRegistered[chainId][evvmAddress])
            revert AlreadyRegistered();

        if (
            registry[evvmID].chainId != 0 &&
            registry[evvmID].evvmAddress != address(0)
        ) revert EvvmIdAlreadyRegistered();

        if (!isThisChainIdRegistered[chainId]) revert ChainIdNotRegistered();

        registry[evvmID] = Metadata(chainId, evvmAddress);
        isThisAddressRegistered[chainId][evvmAddress] = true;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit EvvmRegistered(
            evvmID,
            chainId,
            evvmAddress,
            msg.sender,
            block.timestamp
        );

        return evvmID;
    }

    function registerChainId(uint256[] memory chainIds) external isSuperUser {
        for (uint256 i = 0; i < chainIds.length; i++) {
            if (chainIds[i] == 0) revert InvalidInput();
            isThisChainIdRegistered[chainIds[i]] = true;
            
            // ✨ EMITIR EVENTO PARA AMP ✨
            emit ChainIdWhitelisted(chainIds[i], msg.sender, block.timestamp);
        }
    }

    function proposeSuperUser(address _newSuperUser) external isSuperUser {
        if (_newSuperUser == address(0) || _newSuperUser == superUser.current) {
            revert();
        }

        superUser.proposal = _newSuperUser;
        superUser.timeToAccept = block.timestamp + 7 days;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit SuperUserProposed(
            superUser.current,
            _newSuperUser,
            superUser.timeToAccept
        );
    }

    function rejectProposalSuperUser() external isSuperUser {
        superUser.proposal = address(0);
        superUser.timeToAccept = 0;
    }

    function acceptSuperUser() external {
        if (block.timestamp < superUser.timeToAccept) {
            revert();
        }
        if (msg.sender != superUser.proposal) {
            revert();
        }

        address oldSuperUser = superUser.current;
        superUser.current = superUser.proposal;
        superUser.proposal = address(0);
        superUser.timeToAccept = 0;
        _transferOwnership(superUser.current);

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit SuperUserChanged(oldSuperUser, superUser.current, block.timestamp);
    }

    function proposeUpgrade(address _newImplementation) external isSuperUser {
        if (_newImplementation == address(0)) {
            revert InvalidInput();
        }

        upgradeProposal.proposal = _newImplementation;
        upgradeProposal.timeToAccept = block.timestamp + 7 days;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit UpgradeProposed(
            upgradeProposal.current,
            _newImplementation,
            upgradeProposal.timeToAccept
        );
    }

    function rejectProposalUpgrade() external isSuperUser {
        upgradeProposal.proposal = address(0);
        upgradeProposal.timeToAccept = 0;
    }

    function acceptProposalUpgrade() external isSuperUser {
        if (block.timestamp < upgradeProposal.timeToAccept) {
            revert();
        }
        if (upgradeProposal.proposal == address(0)) {
            revert InvalidInput();
        }

        address oldImplementation = upgradeProposal.current;
        address newImplementation = upgradeProposal.proposal;

        upgradeProposal.proposal = address(0);
        upgradeProposal.timeToAccept = 0;

        // ✨ EMITIR EVENTO PARA AMP ✨
        emit UpgradeExecuted(oldImplementation, newImplementation, block.timestamp);

        upgradeToAndCall(newImplementation, "");
    }

    // Getters (sin cambios)
    function getEvvmIdMetadata(
        uint256 evvmID
    ) external view returns (Metadata memory) {
        return registry[evvmID];
    }

    function getWhiteListedEvvmIdActive()
        external
        view
        returns (uint256[] memory)
    {
        uint256 count;
        for (uint256 i = 1; i <= 999; i++) {
            if (
                registry[i].chainId != 0 &&
                registry[i].evvmAddress != address(0)
            ) {
                count++;
            }
        }

        uint256[] memory activeEvvmIds = new uint256[](count);
        uint256 index;

        for (uint256 i = 1; i <= 999; i++) {
            if (
                registry[i].chainId != 0 &&
                registry[i].evvmAddress != address(0)
            ) {
                activeEvvmIds[index] = i;
                index++;
            }
        }

        return activeEvvmIds;
    }

    function getPublicEvvmIdActive() external view returns (uint256[] memory) {
        uint256 count = publicCounter - 1000;

        uint256[] memory activeEvvmIds = new uint256[](count);
        uint256 index;

        for (uint256 i = 1000 ; i < publicCounter; i++) {
            if (
                registry[i].chainId != 0 &&
                registry[i].evvmAddress != address(0)
            ) {
                activeEvvmIds[index] = i;
                index++;
            }
        }

        return activeEvvmIds;
    }

    function _authorizeUpgrade(
        address newImplementation
    ) internal override isSuperUser {
        // Authorization is now handled in acceptProposalUpgrade
    }

    function getSuperUserData()
        external
        view
        returns (AddressTypeProposal memory)
    {
        return superUser;
    }

    function getSuperUser() external view returns (address) {
        return superUser.current;
    }

    function isChainIdRegistered(uint256 chainId) external view returns (bool) {
        return isThisChainIdRegistered[chainId];
    }

    function isAddressRegistered(
        uint256 chainId,
        address evvmAddress
    ) external view returns (bool) {
        return isThisAddressRegistered[chainId][evvmAddress];
    }

    function getUpgradeProposalData()
        external
        view
        returns (AddressTypeProposal memory)
    {
        return upgradeProposal;
    }

    function getVersion() external pure returns (uint256) {
        return 1;
    }
}

