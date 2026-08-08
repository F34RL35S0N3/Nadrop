// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

contract TipStream {
    uint256 public constant FEE_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    address public immutable feeRecipient;

    struct Post {
        address creator;
        bool isLocked;
        uint256 unlockPrice;
        uint256 totalTips;
    }

    mapping(uint256 postId => Post post) public posts;
    mapping(uint256 postId => mapping(address user => bool unlocked)) public unlockedPosts;

    error InvalidFeeRecipient();
    error PostAlreadyExists();
    error PostDoesNotExist();
    error NotLocked();
    error AlreadyUnlocked();
    error InsufficientPayment();
    error TransferFailed();

    event PostCreated(uint256 indexed postId, address indexed creator, bool isLocked, uint256 unlockPrice);
    event Tipped(uint256 indexed postId, address indexed creator, address indexed tipper, uint256 amount);
    event Unlocked(uint256 indexed postId, address indexed creator, address indexed user, uint256 amount);

    constructor(address _feeRecipient) {
        if (_feeRecipient == address(0)) revert InvalidFeeRecipient();
        feeRecipient = _feeRecipient;
    }

    function createPost(uint256 postId, bool isLocked, uint256 unlockPrice) external {
        if (posts[postId].creator != address(0)) revert PostAlreadyExists();

        posts[postId] = Post({
            creator: msg.sender,
            isLocked: isLocked,
            unlockPrice: unlockPrice,
            totalTips: 0
        });

        if (!isLocked) {
            unlockedPosts[postId][msg.sender] = true;
        }

        emit PostCreated(postId, msg.sender, isLocked, unlockPrice);
    }

    function tip(address creator, uint256 postId) external payable {
        Post storage post = posts[postId];
        if (post.creator == address(0)) revert PostDoesNotExist();
        if (post.creator != creator) revert PostDoesNotExist();
        if (msg.value == 0) revert InsufficientPayment();

        post.totalTips += msg.value;
        _splitAndSend(creator, msg.value);

        emit Tipped(postId, creator, msg.sender, msg.value);
    }

    function unlock(uint256 postId) external payable {
        Post storage post = posts[postId];
        if (post.creator == address(0)) revert PostDoesNotExist();
        if (!post.isLocked) revert NotLocked();
        if (unlockedPosts[postId][msg.sender]) revert AlreadyUnlocked();
        if (msg.value < post.unlockPrice) revert InsufficientPayment();

        unlockedPosts[postId][msg.sender] = true;
        post.totalTips += msg.value;
        _splitAndSend(post.creator, msg.value);

        emit Unlocked(postId, post.creator, msg.sender, msg.value);
    }

    function _splitAndSend(address creator, uint256 amount) private {
        uint256 fee = (amount * FEE_BPS) / BPS_DENOMINATOR;
        uint256 creatorAmount = amount - fee;

        (bool feeSuccess,) = feeRecipient.call{value: fee}("");
        if (!feeSuccess) revert TransferFailed();

        (bool creatorSuccess,) = creator.call{value: creatorAmount}("");
        if (!creatorSuccess) revert TransferFailed();
    }
}
