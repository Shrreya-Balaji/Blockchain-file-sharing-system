// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract FileStorage {
    struct FileChunks {
        bytes32 fileId;
        string encryptionKey;
        bytes32[] chunkHashes;
        string fileName;
        string fileType;
        address owner;
        address[] sharedWith;
    }

    mapping(address => mapping(bytes32 => FileChunks)) public fileChunksMetadata;
    mapping(bytes32 => mapping(address => bool)) public accessPermissions;
    mapping(address => uint256) public ownerFileCounts;

    event ChunkUploaded(
        address indexed uploader,
        bytes32 indexed fileId,
        bytes32 chunkHash
    );

    event AccessGranted(
        address indexed uploader,
        bytes32 indexed fileId,
        address indexed recipient
    );

    event FileUploaded(
        address indexed uploader,
        bytes32 indexed fileId
    );

    event FileShared(
        address indexed sender,
        bytes32 indexed fileId,
        address[] recipients
    );

    // Mapping to store fileIds for each owner
    mapping(address => bytes32[]) internal ownerFileIds;

    function uploadFileChunks(
        string memory encryptionKey,
        bytes32[] memory chunkHashes,
        string memory fileName,
        string memory fileType
    ) external {
        bytes32 newFileId = generateFileId(msg.sender, fileName);

        address[] memory initialShare = new address[](1);
        initialShare[0] = msg.sender;

        fileChunksMetadata[msg.sender][newFileId] = FileChunks({
            fileId: newFileId,
            encryptionKey: encryptionKey,
            chunkHashes: chunkHashes,
            fileName: fileName,
            fileType: fileType,
            owner: msg.sender,
            sharedWith: initialShare
        });

        for (uint256 i = 0; i < chunkHashes.length; i++) {
            emit ChunkUploaded(msg.sender, newFileId, chunkHashes[i]);
        }

        ownerFileCounts[msg.sender]++;
        ownerFileIds[msg.sender].push(newFileId);

        emit FileUploaded(msg.sender, newFileId);
    }

    function shareFile(bytes32 fileId, address recipient) external {
        require(msg.sender == fileChunksMetadata[msg.sender][fileId].owner, "Only file owner can share");
        fileChunksMetadata[msg.sender][fileId].sharedWith.push(recipient);

        emit FileShared(msg.sender, fileId, fileChunksMetadata[msg.sender][fileId].sharedWith);
    }

    function hasAccess(bytes32 fileId, address user) external view returns (bool) {
        return accessPermissions[fileId][user];
    }

    function generateFileId(address owner, string memory fileName) internal pure returns (bytes32) {
        return keccak256(abi.encodePacked(owner, fileName));
    }

    function getFileDetails(address owner, string memory fileName) external view returns (
        bytes32 fileId,
        string memory encryptionKey,
        bytes32[] memory chunkHashes,
        string memory fileType,
        address fileOwner
    ) {
        bytes32 fileIdResult = generateFileId(owner, fileName);
        FileChunks storage file = fileChunksMetadata[owner][fileIdResult];
        require(file.owner != address(0), "File not found");

        return (
            file.fileId,
            file.encryptionKey,
            file.chunkHashes,
            file.fileType,
            file.owner
        );
    }

    function getAllFiles(address owner) external view returns (bytes32[] memory) {
        return ownerFileIds[owner];
    }

    function getFileChunkHashes(bytes32 fileId) external view returns (bytes32[] memory) {
        return fileChunksMetadata[msg.sender][fileId].chunkHashes;
    }
    // Add other existing functions here...
}
