// SPDX-License-Identifier: MIT
pragma solidity ^0.8.6;

/**
 * @title SGAA NFT - SALE GOOGLE ADS ACCOUNTS
 * @dev ERC-721 contract with token transfer restriction
 * @author Senior Solidity Developer
 */

// ERC-721 Interfaces
interface IERC165 {
    function supportsInterface(bytes4 interfaceId) external view returns (bool);
}

interface IERC721 is IERC165 {
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);

    function balanceOf(address owner) external view returns (uint256 balance);
    function ownerOf(uint256 tokenId) external view returns (address owner);
    function safeTransferFrom(address from, address to, uint256 tokenId) external;
    function transferFrom(address from, address to, uint256 tokenId) external;
    function approve(address to, uint256 tokenId) external;
    function getApproved(uint256 tokenId) external view returns (address operator);
    function setApprovalForAll(address operator, bool _approved) external;
    function isApprovedForAll(address owner, address operator) external view returns (bool);
    function safeTransferFrom(address from, address to, uint256 tokenId, bytes calldata data) external;
}

interface IERC721Metadata is IERC721 {
    function name() external view returns (string memory);
    function symbol() external view returns (string memory);
    function tokenURI(uint256 tokenId) external view returns (string memory);
}

interface IERC721Receiver {
    function onERC721Received(address operator, address from, uint256 tokenId, bytes calldata data) external returns (bytes4);
}

/**
 * @title SGAA NFT Contract
 * @notice NFT contract with the ability to lock token transfers
 */
contract SGAA_NFT is IERC721Metadata {

    // ========== STATE VARIABLES ========== //

    string private _name = "SALE GOOGLE ADS ACCOUNTS";
    string private _symbol = "SGAA";

    address public owner;
    uint256 private _tokenIdCounter;

    // Flag to allow/disallow NFT transfers between users
    bool public transferable = false;

    // Base URI for metadata
    string private _baseTokenURI;

    // Mappings for ERC-721
    mapping(uint256 => address) private _owners;
    mapping(address => uint256) private _balances;
    mapping(uint256 => address) private _tokenApprovals;
    mapping(address => mapping(address => bool)) private _operatorApprovals;

    // Mapping to store the URI of each token
    mapping(uint256 => string) private _tokenURIs;

    // ========== EVENTS ========== //

    event TransferableChanged(bool newStatus);
    event TokenBurned(uint256 indexed tokenId, address indexed owner);
    event BatchMinted(address[] indexed recipients, uint256[] tokenIds);
    event OwnershipTransferred(address indexed previousOwner, address indexed newOwner);
    event BaseURIChanged(string newBaseURI);

    // ========== MODIFIERS ========== //

    modifier onlyOwner() {
        require(msg.sender == owner, "SGAA: caller is not the owner");
        _;
    }

    modifier tokenExists(uint256 tokenId) {
        require(_owners[tokenId] != address(0), "SGAA: token does not exist");
        _;
    }

    // ========== CONSTRUCTOR ========== //

    constructor() {
        owner = msg.sender;
        _tokenIdCounter = 1; // Start with 1
        emit OwnershipTransferred(address(0), msg.sender);
    }

    // ========== OWNER FUNCTIONS ========== //

    /**
     * @notice Mint a single NFT token
     * @param to Recipient's address
     * @return tokenId ID of the created token
     */
    function mint(address to) public onlyOwner returns (uint256) {
        require(to != address(0), "SGAA: mint to zero address");

        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter++;

        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(address(0), to, tokenId);

        return tokenId;
    }

    /**
     * @notice Batch mint NFT tokens
     * @param recipients Array of recipient addresses
     * @return tokenIds Array of created token IDs
     */
    function mintBatch(address[] calldata recipients)
    external
    onlyOwner
    returns (uint256[] memory tokenIds)
    {
        require(recipients.length > 0, "SGAA: empty recipients array");
        require(recipients.length <= 100, "SGAA: batch too large"); // Limit for security

        tokenIds = new uint256[](recipients.length);

        for (uint256 i = 0; i < recipients.length; i++) {
            require(recipients[i] != address(0), "SGAA: mint to zero address");

            uint256 tokenId = _tokenIdCounter;
            _tokenIdCounter++;

            _balances[recipients[i]]++;
            _owners[tokenId] = recipients[i];

            tokenIds[i] = tokenId;

            emit Transfer(address(0), recipients[i], tokenId);
        }

        emit BatchMinted(recipients, tokenIds);

        return tokenIds;
    }

    /**
     * @notice Burn a token by the contract owner
     * @param tokenId ID of the token to be burned
     */
    function burn(uint256 tokenId) external onlyOwner tokenExists(tokenId) {
        address tokenOwner = _owners[tokenId];

        // Clear approvals
        _approve(address(0), tokenId);

        _balances[tokenOwner]--;
        delete _owners[tokenId];
        delete _tokenURIs[tokenId];

        emit TokenBurned(tokenId, tokenOwner);
        emit Transfer(tokenOwner, address(0), tokenId);
    }

    /**
     * @notice Batch burn tokens
     * @param tokenIds Array of token IDs to be burned
     */
    function burnBatch(uint256[] calldata tokenIds) external onlyOwner {
        require(tokenIds.length > 0, "SGAA: empty tokenIds array");
        require(tokenIds.length <= 100, "SGAA: batch too large");

        for (uint256 i = 0; i < tokenIds.length; i++) {
            uint256 tokenId = tokenIds[i];
            require(_owners[tokenId] != address(0), "SGAA: token does not exist");

            address tokenOwner = _owners[tokenId];

            _approve(address(0), tokenId);

            _balances[tokenOwner]--;
            delete _owners[tokenId];
            delete _tokenURIs[tokenId];

            emit TokenBurned(tokenId, tokenOwner);
            emit Transfer(tokenOwner, address(0), tokenId);
        }
    }

    /**
     * @notice Enable/disable the ability to transfer tokens
     * @param _transferable true - allow transfer, false - disallow
     */
    function setTransferable(bool _transferable) external onlyOwner {
        transferable = _transferable;
        emit TransferableChanged(_transferable);
    }

    /**
     * @notice Set the base URI for metadata
     * @param baseURI New base URI
     */
    function setBaseURI(string memory baseURI) external onlyOwner {
        _baseTokenURI = baseURI;
        emit BaseURIChanged(baseURI);
    }

    /**
     * @notice Set the URI for a specific token
     * @param tokenId Token ID
     * @param uri Metadata URI
     */
    function setTokenURI(uint256 tokenId, string memory uri)
    external
    onlyOwner
    tokenExists(tokenId)
    {
        _tokenURIs[tokenId] = uri;
    }

    /**
     * @notice Transfer contract ownership
     * @param newOwner Address of the new owner
     */
    function transferOwnership(address newOwner) external onlyOwner {
        require(newOwner != address(0), "SGAA: new owner is zero address");
        address oldOwner = owner;
        owner = newOwner;
        emit OwnershipTransferred(oldOwner, newOwner);
    }

    // ========== VIEW FUNCTIONS ========== //

    function name() external view override returns (string memory) {
        return _name;
    }

    function symbol() external view override returns (string memory) {
        return _symbol;
    }

    function balanceOf(address ownerAddress) external view override returns (uint256) {
        require(ownerAddress != address(0), "SGAA: balance query for zero address");
        return _balances[ownerAddress];
    }

    function ownerOf(uint256 tokenId) public view override tokenExists(tokenId) returns (address) {
        return _owners[tokenId];
    }

    function tokenURI(uint256 tokenId)
    external
    view
    override
    tokenExists(tokenId)
    returns (string memory)
    {
        string memory _tokenURI = _tokenURIs[tokenId];

        // If an individual URI is set
        if (bytes(_tokenURI).length > 0) {
            return _tokenURI;
        }

        // If a base URI is set
        if (bytes(_baseTokenURI).length > 0) {
            return string(abi.encodePacked(_baseTokenURI, _toString(tokenId)));
        }

        return "";
    }

    function totalSupply() external view returns (uint256) {
        return _tokenIdCounter - 1;
    }

    function getApproved(uint256 tokenId)
    external
    view
    override
    tokenExists(tokenId)
    returns (address)
    {
        return _tokenApprovals[tokenId];
    }

    function isApprovedForAll(address ownerAddress, address operator)
    external
    view
    override
    returns (bool)
    {
        return _operatorApprovals[ownerAddress][operator];
    }

    function supportsInterface(bytes4 interfaceId)
    external
    pure
    override
    returns (bool)
    {
        return
            interfaceId == type(IERC721).interfaceId ||
            interfaceId == type(IERC721Metadata).interfaceId ||
            interfaceId == type(IERC165).interfaceId;
    }

    // ========== TRANSFER FUNCTIONS ========== //

    /**
     * @notice Token transfer (only available if transferable = true or called by the owner)
     */
    function transferFrom(address from, address to, uint256 tokenId)
    public
    override
    tokenExists(tokenId)
    {
        require(
            transferable || msg.sender == owner,
            "SGAA: token transfers are disabled"
        );
        require(
            _isApprovedOrOwner(msg.sender, tokenId),
            "SGAA: transfer caller is not owner nor approved"
        );
        require(ownerOf(tokenId) == from, "SGAA: transfer from incorrect owner");
        require(to != address(0), "SGAA: transfer to zero address");

        _transfer(from, to, tokenId);
    }

    function safeTransferFrom(address from, address to, uint256 tokenId)
    external
    override
    {
        safeTransferFrom(from, to, tokenId, "");
    }

    function safeTransferFrom(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    )
    public
    override
    {
        transferFrom(from, to, tokenId);
        require(
            _checkOnERC721Received(from, to, tokenId, data),
            "SGAA: transfer to non ERC721Receiver implementer"
        );
    }

    function approve(address to, uint256 tokenId) external override tokenExists(tokenId) {
        address tokenOwner = ownerOf(tokenId);
        require(to != tokenOwner, "SGAA: approval to current owner");
        require(
            msg.sender == tokenOwner || _operatorApprovals[tokenOwner][msg.sender],
            "SGAA: approve caller is not owner nor approved for all"
        );

        _approve(to, tokenId);
    }

    function setApprovalForAll(address operator, bool approved) external override {
        require(operator != msg.sender, "SGAA: approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }

    // ========== INTERNAL FUNCTIONS ========== //

    function _transfer(address from, address to, uint256 tokenId) internal {
        _approve(address(0), tokenId);

        _balances[from]--;
        _balances[to]++;
        _owners[tokenId] = to;

        emit Transfer(from, to, tokenId);
    }

    function _approve(address to, uint256 tokenId) internal {
        _tokenApprovals[tokenId] = to;
        emit Approval(ownerOf(tokenId), to, tokenId);
    }

    function _isApprovedOrOwner(address spender, uint256 tokenId)
    internal
    view
    returns (bool)
    {
        address tokenOwner = ownerOf(tokenId);
        return (
            spender == tokenOwner ||
            _tokenApprovals[tokenId] == spender ||
            _operatorApprovals[tokenOwner][spender]
        );
    }

    function _checkOnERC721Received(
        address from,
        address to,
        uint256 tokenId,
        bytes memory data
    ) private returns (bool) {
        if (to.code.length > 0) {
            try IERC721Receiver(to).onERC721Received(msg.sender, from, tokenId, data) returns (bytes4 retval) {
                return retval == IERC721Receiver.onERC721Received.selector;
            } catch (bytes memory reason) {
                if (reason.length == 0) {
                    revert("SGAA: transfer to non ERC721Receiver implementer");
                } else {
                    assembly {
                        revert(add(32, reason), mload(reason))
                    }
                }
            }
        }
        return true;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}
