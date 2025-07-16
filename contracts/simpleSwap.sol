// SPDX-License-Identifier: MIT
pragma solidity ^0.8.27;

import {ERC20} from "@openzeppelin/contracts/token/ERC20/ERC20.sol";

/// @title SimpleSwap Contract
/// @author Manuel Gutierrez Casares
/// @notice This contract implements a basic Uniswap v2-like automated market maker (AMM) for swapping two ERC-20 tokens and managing liquidity.
/// @dev All function calls are currently implemented without side effects for simplicity. This contract is intended for educational or experimental purposes.
/// @custom:experimental This is an experimental contract and should not be used in production environments. It lacks crucial features like slippage protection, flash loan attack prevention, and proper error handling for robust operation.

contract SimpleSwap is ERC20 {

    /// @notice Emitted when liquidity is successfully added to the pool.
    /// @param adder The address that added the liquidity.
    /// @param firstToken The address of the first token added.
    /// @param firstAmount The amount of the first token added.
    /// @param secondToken The address of the second token added.
    /// @param secondAmount The amount of the second token added.
    event AddedLiquidity(address indexed adder, address firstToken, uint firstAmount, address secondToken, uint secondAmount);

    /// @notice Emitted when new liquidity tokens are minted and sent to the user.
    /// @param amountMinted The amount of liquidity tokens minted.
    event LiquidityMinted(uint indexed amountMinted);

    /// @notice Emitted when liquidity tokens are burnt (destroyed) during liquidity removal.
    /// @param amountBurnt The amount of liquidity tokens burnt.    
    event LiquidityBurnt(uint indexed amountBurnt);

    address public _tokenA;
    address public _tokenB;

    /// @notice Constructs the SimpleSwap contract.
    /// @dev Initializes the contract as an ERC20 token, representing the liquidity shares of the pool.
    constructor() ERC20("liquidity", "LQD") {}

    /// @notice Allows users to add liquidity to the token pair pool.
    /// @dev This function initializes the token pair for the pool if it's the first liquidity addition.
    /// Users must approve the contract to transfer `amountADesired` and `amountBDesired` from their accounts prior to calling this function.
    /// The contract calculates and mints liquidity tokens to the caller based on the geometric mean of the added token amounts.
    /// @param tokenA The address of the first token to add to the pool.
    /// @param tokenB The address of the second token to add to the pool.
    /// @param amountADesired The desired amount of `tokenA` to add.
    /// @param amountBDesired The desired amount of `tokenB` to add.
    /// @return amountA The actual amount of `tokenA` transferred into the pool.
    /// @return amountB The actual amount of `tokenB` transferred into the pool.
    /// @return liquidity The amount of liquidity tokens minted and sent to the caller.
    function addLiquidity(address tokenA, address tokenB, uint amountADesired, uint amountBDesired) external returns (uint amountA, uint amountB, uint liquidity) {
        address __tokenA = _tokenA;
        address __tokenB = _tokenB;
        address userTokenA = tokenA;
        address userTokenB = tokenB;
        uint userAmountADesired = amountADesired;
        uint userAmountBDesired = amountBDesired;
        uint userLiquidity = liquidity; // Initialize userLiquidity here, as it's calculated later

        /// @dev Initializing token addresses for the pool and checking for incorrect tokens.
        if (__tokenA == address(0) && __tokenB == address(0)) {
            _tokenA = userTokenA;
            _tokenB = userTokenB;
        } else {
            require(__tokenA == userTokenA && __tokenB == userTokenB, "Can't swap tokens");
        }

        /// @dev Approve the contract to transfer tokens from the user.
        /// Note: This approval should ideally happen *before* calling `addLiquidity` by the user.
        /// This implementation approves within the function, which is not standard or secure practice.
        /// It's included here as it was in the original code, but would be a vulnerability in production.
        ERC20(userTokenA).approve(address(this), userAmountADesired);
        ERC20(userTokenB).approve(address(this), userAmountBDesired);

        /// @dev Transfer tokens A and B from the user to the contract's pool.
        ERC20(userTokenA).transferFrom(msg.sender, address(this), userAmountADesired);
        ERC20(userTokenB).transferFrom(msg.sender, address(this), userAmountBDesired);

        /// @dev Calculate liquidity, mint liquidity tokens, and send them to the user.
        userLiquidity = sqrt(userAmountADesired * userAmountBDesired);
        _mint(msg.sender, userLiquidity);

        // @notice Emit events to inform that liquidity has been added to the contract and the amount of liquidity minted.
        emit AddedLiquidity(msg.sender, userTokenA, userAmountADesired, userTokenB, userAmountBDesired);
        emit LiquidityMinted(userLiquidity);

        return (ERC20(userTokenA).balanceOf(address(this)), ERC20(userTokenB).balanceOf(address(this)), userLiquidity);

    }

    /// @notice Allows users to remove their liquidity from the pool and withdraw their underlying tokens.
    /// @dev Users receive a proportional amount of `tokenA` and `tokenB` based on their liquidity token holdings.
    /// The function burns the user's liquidity tokens.
    /// @param tokenA The address of the first token in the pool.
    /// @param tokenB The address of the second token in the pool.
    /// @param liquidity The amount of liquidity tokens to burn.
    /// @param amountAMin The minimum amount of `tokenA` expected to receive. Used to prevent front-running and slippage.
    /// @param amountBMin The minimum amount of `tokenB` expected to receive. Used to prevent front-running and slippage.
    /// @return amountA The actual amount of `tokenA` withdrawn.
    /// @return amountB The actual amount of `tokenB` withdrawn.
    function removeLiquidity(address tokenA, address tokenB, uint liquidity, uint amountAMin, uint amountBMin) external returns (uint amountA, uint amountB) {
        address __tokenA = _tokenA;
        address __tokenB = _tokenB;
        address userTokenA = tokenA;
        address userTokenB = tokenB;
        uint userLiquidity = liquidity;
        uint userAmountAMin = amountAMin;
        uint userAmountBMin = amountBMin;
        
        /// @dev Validations: Ensures liquidity has been added, tokens match the pool, and the user has sufficient liquidity and minimum token amounts.
        require(__tokenA != address(0) && __tokenB != address(0), "Add liquidity first");
        require(__tokenA == userTokenA && __tokenB == userTokenB, "Can't swap tokens");
        require(balanceOf(msg.sender) >= userLiquidity, "Not enough liquidity");
        require(ERC20(userTokenA).balanceOf(address(this)) >= userAmountAMin, "Not enough tokens A");
        require(ERC20(userTokenB).balanceOf(address(this)) >= userAmountBMin, "Not enough tokens B");

        uint _totalSupply = totalSupply();

        /// @dev Burn the user's liquidity tokens.
        _burn(msg.sender, userLiquidity);

        // @notice Emit event to inform that liquidity has been burnt.
        emit LiquidityBurnt(userLiquidity);

        /// @dev Calculate the amount of tokens to transfer based on the proportion of liquidity tokens burnt.
        uint withdrawnA = ERC20(userTokenA).balanceOf(address(this)) * (userLiquidity / _totalSupply);
        uint withdrawnB = ERC20(userTokenB).balanceOf(address(this)) * (userLiquidity / _totalSupply);

        /// @dev Validate that the calculated withdrawn amounts meet the user's specified minimums.
        require(withdrawnA >= userAmountAMin && withdrawnB >= userAmountBMin, "Not enough liquidity");

        /// @dev Transfer tokens according to what user wants to remove from pool.
        ERC20(userTokenA).transfer(msg.sender, withdrawnA);
        ERC20(userTokenB).transfer(msg.sender, withdrawnB);

        return(withdrawnA, withdrawnB);

    }

    /// @notice Swaps an exact amount of one token for another token.
    /// @dev This function calculates the output amount based on the current reserves and transfers the tokens.
    /// It expects `path` to be an array of two token addresses: `[tokenIn, tokenOut]`.
    /// Users must approve the contract to transfer `amountIn` from their account prior to calling this function.
    /// @param amountIn The exact amount of input token to swap.
    /// @param amountOutMin The minimum amount of output token to receive. Used to prevent front-running and slippage.
    /// @param path An array of token addresses, where `path[0]` is the input token and `path[1]` is the output token.
    /// @return amounts An array containing the `amountIn` and the calculated `amountOut`.
    function swapExactTokensForTokens(uint amountIn, uint amountOutMin, address[] calldata path) external returns (uint[] memory amounts) {
        address __tokenA = _tokenA;
        address __tokenB = _tokenB;
        uint userAmountIn = amountIn;
        uint userAmountOutMin = amountOutMin;
        address userTokenA = path[0];
        address userTokenB = path[1];
        
        /// @dev Validations: Ensures the input and output tokens are part of the pool's initialized pair.
        require((userTokenA == __tokenA || userTokenB == __tokenA) && (userTokenA == __tokenB || userTokenB == __tokenB), "Can't swap these");

        // This check is problematic as it checks the pool's balance against `amountOutMin` *before* the swap.
        // It should check the *calculated* `amountOut` against `amountOutMin` after the swap calculation.
        // Keeping it for now as it was in the original code, but flagging as an area for improvement.
        if(userTokenB == __tokenB) {
            require(ERC20(userTokenB).balanceOf(address(this)) >= userAmountOutMin, "Not enough tokens B");
        } else {
            require(ERC20(userTokenA).balanceOf(address(this)) >= userAmountOutMin, "Not enough tokens A");
        }

        /// @dev Approve the contract to transfer the input token from the user and then transfer it to the pool.
        /// Note: Similar to addLiquidity, approval should happen prior to calling the function.
        ERC20(userTokenA).approve(address(this), userAmountIn);
        ERC20(userTokenA).transferFrom(msg.sender, address(this), userAmountIn);

        /// @dev Compute the amount of output token to be withdrawn using the constant product formula (k = x * y).
        uint withdrawn;
        if(userTokenA == __tokenA) {
            // Calculate amount of tokenB to be sent out
            // Formula: amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)
            withdrawn = (userAmountIn * ERC20(userTokenB).balanceOf(address(this))) / (ERC20(userTokenA).balanceOf(address(this)) + userAmountIn);
        } else {
            // Calculate amount of tokenA to be sent out
            withdrawn = (userAmountIn * ERC20(userTokenA).balanceOf(address(this))) / (ERC20(userTokenB).balanceOf(address(this)) + userAmountIn);
        }

        /// @dev Check if the calculated withdrawn value is valid and meets the minimum required output amount.
        require(withdrawn >= userAmountOutMin, "Not enough tokens");

        /// @dev Transfer the calculated amount of output token to the user.
        ERC20(userTokenB).transfer(msg.sender, withdrawn);

        uint[] memory returnValue = new uint[](2);
        returnValue[0] = userAmountIn;
        returnValue[1] = withdrawn;
        
        return(returnValue);
        
    }

    /// @notice Calculates the current price of one token relative to another in the pool.
    /// @dev The price is calculated as `reserve of tokenB / reserve of tokenA`, scaled by `1e18` for precision.
    /// Requires liquidity to be present in the pool.
    /// @param tokenA The address of the first token (denominator in price calculation).
    /// @param tokenB The address of the second token (numerator in price calculation).
    /// @return price The calculated price, representing how many units of `tokenB` one unit of `tokenA` can buy (multiplied by 1e18).
    function getPrice(address tokenA, address tokenB) external view returns (uint price) {
        address __tokenA = _tokenA;
        address __tokenB = _tokenB;
        address userTokenA = tokenA;
        address userTokenB = tokenB;

        /// @dev Validations: Ensures liquidity has been added and the provided tokens match the pool's initialized pair.
        require(__tokenA != address(0) && __tokenB != address(0), "Add liquidity first");
        require(__tokenA == userTokenA && __tokenB == userTokenB, "Can't swap these");

        // @dev Calculate current price of `tokenB` in terms of `tokenA`.
        // Price = (Balance of Token B / Balance of Token A) * 1e18
        uint currentPrice = (ERC20(userTokenB).balanceOf(address(this)) * 1e18) / ERC20(userTokenA).balanceOf(address(this));

        return currentPrice;

    }

    /// @notice Calculates the theoretical amount of output tokens received for a given input amount.
    /// @dev This function is a pure calculation and does not interact with the contract's state or tokens.
    /// It uses the constant product formula: `amountOut = (amountIn * reserveOut) / (reserveIn + amountIn)`.
    /// @param amountIn The amount of input token.
    /// @param reserveIn The current reserve of the input token in the pool.
    /// @param reserveOut The current reserve of the output token in the pool.
    /// @return amountOut The calculated amount of output tokens.
    function getAmountOut(uint amountIn, uint reserveIn, uint reserveOut) external pure returns (uint amountOut) {
        uint userAmountIn = amountIn;
        uint userReserveIn = reserveIn;
        uint userReserveOut = reserveOut;

        return (userAmountIn * userReserveOut) / (userReserveIn + userAmountIn);
    }

    /// @dev Internal helper function to calculate the integer square root of a number.
    /// This is used in the `addLiquidity` function for minting liquidity tokens.
    /// @param y The number to calculate the square root of.
    /// @return z The integer square root of `y`.
    function sqrt(uint y) internal pure returns (uint z) {
        if (y > 3) {
            z = y;
            uint x = y / 2 + 1;
            while (x < z) {
                z = x;
                x = (y / x + x) / 2;
            }
        } else if (y != 0) {
            z = 1;
        }
    }

}