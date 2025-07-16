# SimpleSwap: An Experimental AMM Front-End Implementation

## Project Overview

This repository contains the smart contract for **SimpleSwap**, an experimental Automated Market Maker (AMM) designed to emulate the core functionalities of a Uniswap V2-like decentralized exchange. It allows users to provide liquidity for a pair of ERC-20 tokens, facilitating swaps between them, and to remove their liquidity.

**Disclaimer:** This contract is developed for educational and experimental purposes. It currently lacks critical features necessary for production environments, such as robust slippage control, flash loan attack prevention, comprehensive error handling, and gas optimizations. **It is not audited and should NOT be used with real assets.**

## Usage

SimpleSwap operates with a fixed pair of ERC-20 tokens, which are determined by the first user who adds liquidity to the pool. Once set, only these two tokens can be traded or provided as liquidity.

Users can perform the following actions:

* **Add Liquidity:** Contribute a pair of tokens to the pool to become a liquidity provider and earn a share of trading fees (though fees are not explicitly implemented in this version, the mechanism is set up). This action also initializes the token pair if it's the first liquidity addition.
* **Remove Liquidity:** Withdraw proportional amounts of the underlying tokens by burning liquidity provider (LP) tokens.
* **Swap Tokens:** Exchange one token for another based on the constant product formula.
* **Get Price:** Query the current effective price of one token relative to another in the pool.
* **Get Amount Out:** Calculate the expected output amount for a given input amount, based on current reserves.

## Smart Contract Details

### Variables

* `_tokenA`: Stores the address of the first ERC-20 token in the liquidity pool.
* `_tokenB`: Stores the address of the second ERC-20 token in the liquidity pool.

### Constructor

* Initializes the `SimpleSwap` contract as an ERC-20 token itself, representing the liquidity shares of the pool.
    * **Name:** "liquidity"
    * **Symbol:** "LQD"

### Functions

* `addLiquidity(address tokenA, address tokenB, uint256 amountADesired, uint256 amountBDesired) external returns (uint256 amountA, uint256 amountB, uint256 liquidity)`
    * **Description:** Allows users to provide liquidity by depositing `tokenA` and `tokenB` into the pool. If the pool is empty, it sets `tokenA` and `tokenB` for the first time.
    * **Parameters:**
        * `tokenA`: The address of the first token to add.
        * `tokenB`: The address of the second token to add.
        * `amountADesired`: The desired amount of `tokenA` to deposit.
        * `amountBDesired`: The desired amount of `tokenB` to deposit.
    * **Returns:**
        * `amountA`: The actual amount of `tokenA` deposited.
        * `amountB`: The actual amount of `tokenB` deposited.
        * `liquidity`: The amount of 'LQD' (liquidity) tokens minted and sent to the caller.
    * **Note:** Users **must approve** the `SimpleSwap` contract to transfer `amountADesired` of `tokenA` and `amountBDesired` of `tokenB` *before* calling this function.

* `removeLiquidity(address tokenA, address tokenB, uint256 liquidity, uint256 amountAMin, uint256 amountBMin) external returns (uint256 amountA, uint256 amountB)`
    * **Description:** Enables users to withdraw their tokens from the pool by burning their 'LQD' (liquidity) tokens.
    * **Parameters:**
        * `tokenA`: The address of the first token in the pool.
        * `tokenB`: The address of the second token in the pool.
        * `liquidity`: The amount of 'LQD' tokens the user wishes to burn.
        * `amountAMin`: The minimum acceptable amount of `tokenA` to receive (slippage control).
        * `amountBMin`: The minimum acceptable amount of `tokenB` to receive (slippage control).
    * **Returns:**
        * `amountA`: The actual amount of `tokenA` withdrawn.
        * `amountB`: The actual amount of `tokenB` withdrawn.

* `swapExactTokensForTokens(uint256 amountIn, uint256 amountOutMin, address[] calldata path) external returns (uint256[] memory amounts)`
    * **Description:** Swaps an exact `amountIn` of the input token for an amount of the output token.
    * **Parameters:**
        * `amountIn`: The exact amount of input token to swap.
        * `amountOutMin`: The minimum acceptable amount of output token to receive (slippage control).
        * `path`: An array of token addresses, where `path[0]` is the input token and `path[1]` is the output token.
    * **Returns:**
        * `amounts`: An array containing `[amountIn, amountOut]`.
    * **Note:** Users **must approve** the `SimpleSwap` contract to transfer `amountIn` of the input token *before* calling this function.

* `getPrice(address tokenA, address tokenB) external view returns (uint256 price)`
    * **Description:** Calculates the current effective price of `tokenB` in terms of `tokenA` within the pool. The price is scaled by `1e18` for precision.
    * **Parameters:**
        * `tokenA`: The address of the token considered as the base for pricing.
        * `tokenB`: The address of the token whose price is being calculated relative to `tokenA`.
    * **Returns:**
        * `price`: The calculated price, representing how many units of `tokenB` one unit of `tokenA` can buy (scaled).

* `getAmountOut(uint256 amountIn, uint256 reserveIn, uint256 reserveOut) external pure returns (uint256 amountOut)`
    * **Description:** A pure function that calculates the theoretical amount of output tokens received for a given input amount, based on provided reserves. Useful for front-end price estimation.
    * **Parameters:**
        * `amountIn`: The amount of input token.
        * `reserveIn`: The current reserve of the input token in the pool.
        * `reserveOut`: The current reserve of the output token in the pool.
    * **Returns:**
        * `amountOut`: The calculated amount of output tokens.

* `sqrt(uint256 y) internal pure returns (uint256 z)`
    * **Description:** An internal helper function used to compute the integer square root of a number. This is primarily used during liquidity provision to determine the amount of 'LQD' tokens to mint.

### Events

* `AddedLiquidity(address indexed adder, address firstToken, uint256 firstAmount, address secondToken, uint256 secondAmount)`
    * **Description:** Emitted when liquidity is successfully added to the pool.
    * **Parameters:** `adder` (address of liquidity provider), `firstToken` (address of first token), `firstAmount` (amount of first token), `secondToken` (address of second token), `secondAmount` (amount of second token).

* `LiquidityMinted(uint256 indexed amountMinted)`
    * **Description:** Emitted when new liquidity tokens are minted and sent to the user.
    * **Parameters:** `amountMinted` (the amount of 'LQD' tokens minted).

* `LiquidityBurnt(uint256 indexed amountBurnt)`
    * **Description:** Emitted when liquidity tokens are burnt (destroyed) during liquidity removal.
    * **Parameters:** `amountBurnt` (the amount of 'LQD' tokens burnt).
    
---

### Getting Started (for developers)

To set up and interact with this contract locally:

1.  **Prerequisites:**
    * Node.js (LTS version recommended)
    * npm or yarn
    * Hardhat or Foundry (or your preferred Solidity development environment)

2.  **Installation:**
    ```bash
    git clone [repository-url]
    cd [repository-name]
    npm install # or yarn install
    ```

3.  **Compilation:**
    ```bash
    npx hardhat compile # or forge build
    ```

4.  **Testing (if tests exist):**
    ```bash
    npx hardhat test # or forge test
    ```

5.  **Deployment (example using Hardhat local network):**
    ```bash
    npx hardhat node # In a separate terminal
    npx hardhat run scripts/deploy.js --network localhost
    ```
    *(Note: You'll need to create a `deploy.js` script in the `scripts` folder if one doesn't exist, to deploy `SimpleSwap` and any mock ERC20 tokens for testing.)*

---

### Contribution

Feel free to open issues or pull requests if you have suggestions or want to contribute to this experimental project.

---

### License

This project is licensed under the MIT License. See the `LICENSE` file for details.

---

### Contact

For any questions or feedback, please contact Manuel Gutierrez Casares.