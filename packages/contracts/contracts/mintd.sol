// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

import {ERC721} from "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import {IERC721} from "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import {
    ERC721URIStorage
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import {
    ERC721Pausable
} from "@openzeppelin/contracts/token/ERC721/extensions/ERC721Pausable.sol";
import {Ownable} from "@openzeppelin/contracts/access/Ownable.sol";

/// @title MintdNFT – Luxury Watch Digital Certificate (MVP)
/// @notice ERC-721 with admin-only minting, mediated transfers, and vault statuses
contract Mintd is ERC721, ERC721URIStorage, ERC721Pausable, Ownable {
    uint256 private _nextTokenId = 1;

    // ------------------ ENUMS ------------------

    enum WatchStatus {
        ACTIVE,
        STOLEN
    }

    enum TransferStatus {
        NONE,
        PENDING,
        APPROVED,
        REJECTED,
        CANCELLED
    }

    // ------------------ STRUCTS ------------------

    struct WatchData {
        string serialNumber;
        uint256 mintTimestamp;
        address originalOwner;
        uint16 transferCount;
        WatchStatus status;
    }

    struct TransferRequest {
        uint256 tokenId;
        address from;
        address to;
        uint256 requestTimestamp;
        TransferStatus status;
        string paymentRef;
    }

    // ------------------ STATE ------------------

    mapping(address => bool) private isAdmin;
    mapping(uint256 => WatchData) private _watchData;
    mapping(uint256 => TransferRequest) private _transferRequests;
    mapping(uint256 => bool) private _transfersAllowed;

    // ------------------ EVENTS ------------------

    event AdminAdded(address indexed account);
    event AdminRemoved(address indexed account);

    event WatchMinted(
        uint256 indexed tokenId,
        address indexed owner,
        string uri,
        uint256 timestamp
    );

    event TransferRequested(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        string paymentRef,
        uint256 timestamp
    );
    event TransferApproved(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    event TransferRejected(
        uint256 indexed tokenId,
        address indexed by,
        uint256 timestamp
    );
    event TransferCancelled(
        uint256 indexed tokenId,
        address indexed by,
        uint256 timestamp
    );

    event OwnershipChanged(
        uint256 indexed tokenId,
        address indexed prev,
        address indexed next,
        uint256 timestamp
    );

    event WatchStolenFlagged(
        uint256 indexed tokenId,
        address indexed by,
        uint256 timestamp
    );
    event WatchStolenCleared(
        uint256 indexed tokenId,
        address indexed by,
        uint256 timestamp
    );

    // ------------------ MODIFIERS ------------------

    modifier onlyAdmin() {
        require(isAdmin[_msgSender()] || owner() == _msgSender(), "Not admin");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_ownerOf(tokenId) != address(0), "Token does not exist");
        _;
    }

    modifier notStolen(uint256 tokenId) {
        require(
            _watchData[tokenId].status != WatchStatus.STOLEN,
            "Token marked stolen"
        );
        _;
    }

    // ------------------ CONSTRUCTOR ------------------

    constructor(
        address initialOwner
    ) ERC721("MINTD", "MTND") Ownable(initialOwner) {
        require(initialOwner != address(0), "Invalid owner");
        _transferOwnership(initialOwner);
    }

    // ------------------ ADMIN CONTROL ------------------

    function addAdmin(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        isAdmin[account] = true;
        emit AdminAdded(account);
    }

    function removeAdmin(address account) external onlyOwner {
        require(account != address(0), "Zero address");
        isAdmin[account] = false;
        emit AdminRemoved(account);
    }

    // ------------------ PAUSE CONTROL ------------------

    function pause() external onlyOwner {
        _pause();
    }

    function unpause() external onlyOwner {
        _unpause();
    }

    // ------------------ MINTING ------------------

    function mint(
        address to,
        string calldata uri,
        string calldata serialNumber
    ) external onlyAdmin whenNotPaused returns (uint256) {
        uint256 tokenId = _nextTokenId++;

        _safeMint(to, tokenId);
        _setTokenURI(tokenId, uri);

        _watchData[tokenId] = WatchData({
            serialNumber: serialNumber,
            mintTimestamp: block.timestamp,
            originalOwner: to,
            transferCount: 0,
            status: WatchStatus.ACTIVE
        });

        emit WatchMinted(tokenId, to, uri, block.timestamp);
        return tokenId;
    }

    // ------------------ TRANSFER REQUEST WORKFLOW ------------------

    function requestTransfer(
        uint256 tokenId,
        address to,
        string calldata paymentRef
    ) external tokenExists(tokenId) notStolen(tokenId) whenNotPaused {
        require(ownerOf(tokenId) == msg.sender, "Not owner");
        require(to != address(0), "Zero address");

        TransferRequest storage req = _transferRequests[tokenId];
        require(req.status != TransferStatus.PENDING, "Pending request");

        _transferRequests[tokenId] = TransferRequest({
            tokenId: tokenId,
            from: msg.sender,
            to: to,
            requestTimestamp: block.timestamp,
            status: TransferStatus.PENDING,
            paymentRef: paymentRef
        });

        emit TransferRequested(tokenId, msg.sender, to, paymentRef, block.timestamp);
    }

    function cancelTransfer(uint256 tokenId) external tokenExists(tokenId) {
        TransferRequest storage req = _transferRequests[tokenId];
        require(req.status == TransferStatus.PENDING, "No pending");
        require(req.from == msg.sender, "Not requester");

        req.status = TransferStatus.CANCELLED;
        emit TransferCancelled(tokenId, msg.sender, block.timestamp);
    }

    function approveTransfer(
        uint256 tokenId
    ) external onlyAdmin tokenExists(tokenId) notStolen(tokenId) whenNotPaused {
        TransferRequest storage req = _transferRequests[tokenId];
        require(req.status == TransferStatus.PENDING, "No pending");

        _transfersAllowed[tokenId] = true;

        _safeTransfer(req.from, req.to, tokenId);

        _watchData[tokenId].transferCount++;
        req.status = TransferStatus.APPROVED;

        _transfersAllowed[tokenId] = false;

        emit TransferApproved(tokenId, req.from, req.to, block.timestamp);
        emit OwnershipChanged(tokenId, req.from, req.to, block.timestamp);
    }

    function rejectTransfer(
        uint256 tokenId
    ) external onlyAdmin tokenExists(tokenId) {
        TransferRequest storage req = _transferRequests[tokenId];
        require(req.status == TransferStatus.PENDING, "No pending");

        req.status = TransferStatus.REJECTED;
        emit TransferRejected(tokenId, msg.sender, block.timestamp);
    }

    // ------------------ STOLEN FLAG ------------------

    function adminSetStolen(
        uint256 tokenId,
        bool isStolen
    ) external onlyAdmin tokenExists(tokenId) {
        _watchData[tokenId].status = isStolen
            ? WatchStatus.STOLEN
            : WatchStatus.ACTIVE;

        if (isStolen) {
            emit WatchStolenFlagged(tokenId, msg.sender, block.timestamp);
        } else {
            emit WatchStolenCleared(tokenId, msg.sender, block.timestamp);
        }
    }
    //------------------ TRANSFER CONTROL ------------------

    function setTransferAllowed(
        uint256 tokenId,
        bool allowed
    ) external onlyAdmin tokenExists(tokenId) {
        _transfersAllowed[tokenId] = allowed;
    }

    // ------------------ TRANSFER OVERRIDES ------------------

    function transferFrom(
        address from,
        address to,
        uint256 tokenId
    ) public override(ERC721, IERC721) {
        require(
            isAdmin[msg.sender] || _transfersAllowed[tokenId],
            "Transfers restricted"
        );
        require(
            _watchData[tokenId].status != WatchStatus.STOLEN,
            "Token stolen"
        );

        if (isAdmin[msg.sender] == false) {
            _safeTransfer(from, to, tokenId);
            return;
        } else {
            super._transfer(from, to, tokenId);
        }
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) public override(ERC721, IERC721) {
        require(
            isAdmin[msg.sender] || _transfersAllowed[tokenId],
            "Transfers restricted"
        );
        require(
            _watchData[tokenId].status != WatchStatus.STOLEN,
            "Token stolen"
        );

        if (isAdmin[msg.sender]) {
            _safeTransfer(from, to, tokenId);
        } else {
            super.safeTransferFrom(from, to, tokenId, data);
        }
    }

    // ------------------ VIEW HELPERS ------------------

    function getWatchData(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (WatchData memory) {
        return _watchData[tokenId];
    }

    function getTransferRequest(
        uint256 tokenId
    ) external view tokenExists(tokenId) returns (TransferRequest memory) {
        return _transferRequests[tokenId];
    }

    function isAdminAddress(address account) external view returns (bool) {
        return isAdmin[account];
    }
    // @dev for testing only – remove in production
    function getNextTokenId() external view returns (uint256) {
        return _nextTokenId;
    }
    function getTransfersAllowed(uint256 tokenId) external view returns (bool) {
    return _transfersAllowed[tokenId];
}


    // ------------------ METADATA OVERRIDES ------------------

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override(ERC721, ERC721Pausable) returns (address) {
        return super._update(to, tokenId, auth);
    }

    function tokenURI(
        uint256 tokenId
    ) public view override(ERC721, ERC721URIStorage) returns (string memory) {
        return super.tokenURI(tokenId);
    }

    function supportsInterface(
        bytes4 interfaceId
    ) public view override(ERC721, ERC721URIStorage) returns (bool) {
        return super.supportsInterface(interfaceId);
    }
}
