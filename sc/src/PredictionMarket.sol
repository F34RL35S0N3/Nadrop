// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function transferFrom(address from, address to, uint256 amount) external returns (bool);
}

contract PredictionMarket {
    uint256 public constant FEE_BPS = 500;
    uint256 public constant BPS_DENOMINATOR = 10_000;

    address public immutable owner;
    address public immutable feeRecipient;
    IERC20 public immutable usdc;
    uint256 public nextMarketId;

    struct Market {
        uint64 deadline;
        bool resolved;
        bool outcome;
        uint128 totalYes;
        uint128 totalNo;
    }

    mapping(uint256 marketId => Market market) public markets;
    mapping(uint256 marketId => mapping(address user => mapping(bool side => uint256 amount))) public stakes;
    mapping(uint256 marketId => mapping(address user => bool claimed)) public claimed;

    error MarketClosed();
    error MarketNotResolved();
    error AlreadyClaimed();
    error NothingToClaim();
    error TooEarly();
    error TransferFailed();
    error ZeroAmount();
    error Unauthorized();
    error InvalidAddress();

    event MarketCreated(uint256 indexed marketId, uint64 deadline);
    event Staked(uint256 indexed marketId, address indexed user, bool side, uint256 amount);
    event MarketResolved(uint256 indexed marketId, bool outcome);
    event Claimed(uint256 indexed marketId, address indexed user, uint256 payout);

    modifier onlyOwner() {
        if (msg.sender != owner) revert Unauthorized();
        _;
    }

    constructor(address _feeRecipient, address _usdc) {
        if (_feeRecipient == address(0) || _usdc == address(0)) revert InvalidAddress();

        owner = msg.sender;
        feeRecipient = _feeRecipient;
        usdc = IERC20(_usdc);
    }

    function createMarket(uint64 deadline) external returns (uint256 marketId) {
        if (deadline <= block.timestamp) revert MarketClosed();

        marketId = nextMarketId;
        nextMarketId = marketId + 1;

        markets[marketId].deadline = deadline;

        emit MarketCreated(marketId, deadline);
    }

    function stakeFor(address user, uint256 marketId, bool side, uint256 amount) external {
        if (amount == 0) revert ZeroAmount();

        Market storage market = markets[marketId];
        if (block.timestamp >= market.deadline) revert MarketClosed();

        stakes[marketId][user][side] += amount;

        if (side) {
            market.totalYes += uint128(amount);
        } else {
            market.totalNo += uint128(amount);
        }

        bool success = usdc.transferFrom(msg.sender, address(this), amount);
        if (!success) revert TransferFailed();

        emit Staked(marketId, user, side, amount);
    }

    function resolveMarket(uint256 marketId, bool outcome) external onlyOwner {
        Market storage market = markets[marketId];
        if (block.timestamp < market.deadline) revert TooEarly();

        market.resolved = true;
        market.outcome = outcome;

        emit MarketResolved(marketId, outcome);
    }

    function claim(uint256 marketId) external {
        Market storage market = markets[marketId];
        if (!market.resolved) revert MarketNotResolved();
        if (claimed[marketId][msg.sender]) revert AlreadyClaimed();

        uint256 userStake = stakes[marketId][msg.sender][market.outcome];
        if (userStake == 0) revert NothingToClaim();

        uint256 winningPool = market.outcome ? market.totalYes : market.totalNo;
        uint256 totalPool = uint256(market.totalYes) + uint256(market.totalNo);
        uint256 fee = (totalPool * FEE_BPS) / BPS_DENOMINATOR;
        uint256 payout = (userStake * (totalPool - fee)) / winningPool;

        claimed[marketId][msg.sender] = true;

        bool feeSuccess = usdc.transfer(feeRecipient, fee);
        if (!feeSuccess) revert TransferFailed();

        bool payoutSuccess = usdc.transfer(msg.sender, payout);
        if (!payoutSuccess) revert TransferFailed();

        emit Claimed(marketId, msg.sender, payout);
    }

    function getMarket(uint256 marketId) external view returns (Market memory) {
        return markets[marketId];
    }

    function getStake(uint256 marketId, address user) external view returns (uint256 yesStake, uint256 noStake) {
        yesStake = stakes[marketId][user][true];
        noStake = stakes[marketId][user][false];
    }
}
