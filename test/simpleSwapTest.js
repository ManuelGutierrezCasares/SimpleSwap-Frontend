const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SimpleSwap', function() {
    let SimpleSwap;
    let simpleSwap;
    let TokenA;
    let tokenA;
    let tokenB;        
    let amountTokenA = 10;
    let amountTokenB = 5;
    let signerMockAddress = '0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266';
    beforeEach(async function() {
        //_addr = "0x60EF8B3594DAF5390e4eB8395150F842F2D24712";
        SimpleSwap = await ethers.getContractFactory('SimpleSwap');
        simpleSwap = await SimpleSwap.deploy();
        let [signer] = await ethers.getSigners();
        signerMockAddress = signer.address;
        TokenA = await ethers.getContractFactory('MyToken');
        tokenA = await TokenA.deploy('MAN1', 'MANU1');
        tokenB = await TokenA.deploy('MAN2', 'MANU2');
        await simpleSwap.approve(tokenA.target, 100000000);
        await simpleSwap.approve(tokenB.target, 100000000);
        await tokenA.approve(simpleSwap.target, 100000000);
        await tokenB.approve(simpleSwap.target, 100000000);
        await tokenA.approve(signerMockAddress, 100000000);
        await tokenA.mint(signerMockAddress, 100000000);
        await tokenB.approve(signerMockAddress, 100000000);
        await tokenB.mint(signerMockAddress, 100000000);
    });
    it('testing allowance()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let allowanceA = await simpleSwap.allowance(signerMockAddress, tokenA.target);
        let allowanceB = await simpleSwap.allowance(signerMockAddress, tokenB.target);
        expect(allowanceA).to.equal(100000000);
        expect(allowanceB).to.equal(100000000);
    });    
    it('testing balanceOf()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let result = await simpleSwap.balanceOf(signerMockAddress);
        expect(result).to.equal(7);
    });    
    it('testing name()', async function() {
        let result = await simpleSwap.name();
        expect(result).to.equal('liquidity');
    });
    it('testing symbol()', async function() {
        let result = await simpleSwap.symbol();
        expect(result).to.equal('LQD');
    });
    it('testing addLiquidity()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let fixedTokenA = await simpleSwap._tokenA();
        let fixedTokenB = await simpleSwap._tokenB();
        expect(fixedTokenA).to.equal(tokenA.target);
        expect(fixedTokenB).to.equal(tokenB.target);
    });
    it('testing totalSupply()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let totalSupply = await simpleSwap.totalSupply();
        let estimatedResult = Math.sqrt(amountTokenA * amountTokenB);
        expect(totalSupply).to.equal(parseInt(estimatedResult));
    });
    it('testing removeLiquidity()', async function() {
        let amountTokenAMin = 5;
        let amountTokenBMin = 2;
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let totalSupply = await simpleSwap.totalSupply();
        await simpleSwap.removeLiquidity(tokenA.target, tokenB.target, totalSupply, amountTokenAMin, amountTokenBMin);
        let withdrawnA = amountTokenA * Number(totalSupply / totalSupply);
        let withdrawnB = amountTokenB * Number(totalSupply / totalSupply);

        expect(withdrawnA).to.equal(amountTokenA);
        expect(withdrawnB).to.equal(amountTokenB);
    });
    it('testing tokenA()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let tokenAContractAddress = await simpleSwap._tokenA();
        let result = await tokenA.target;
        expect(result).to.equal(tokenAContractAddress);
    });
    it('testing tokenB()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let tokenBContractAddress = await simpleSwap._tokenB();
        let result = await tokenB.target;
        expect(result).to.equal(tokenBContractAddress);
    });
    it('testing getPrice()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let result = await simpleSwap.getPrice(tokenA.target, tokenB.target);
        expect(Number(result)).to.equal(Number(amountTokenB * 1e18 / amountTokenA));
    });
    it('testing getAmountOut()', async function() {
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let amountIn = 10;
        let reserveIn = 2;
        let reserveOut = 4;
        let result = await simpleSwap.getAmountOut(amountIn, reserveIn, reserveOut);
        let expectedResult = (amountIn * reserveOut) / (reserveIn + amountIn);
        expect(parseInt(result)).to.equal(parseInt(expectedResult));
    });
    it('testing swapExactTokensForTokens1()', async function() {
        let amountIn = 10;
        let amountOutMin = 1;
        let path = [tokenA.target, tokenB.target];
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let result = await simpleSwap.swapExactTokensForTokens(amountIn, amountOutMin, path);
        result = [amountIn];
        let out = (amountIn * amountTokenB) / (amountTokenA + amountIn);
        result.push(out);
        let expectedResult = [amountIn, out];
        expect(result).to.deep.equal(expectedResult);
    });
    it('testing swapExactTokensForTokens2()', async function() {
        let amountIn = 10;
        let amountOutMin = 1;
        let path = [tokenB.target, tokenA.target];
        await simpleSwap.addLiquidity(tokenA.target, tokenB.target, amountTokenA, amountTokenB);
        let result = await simpleSwap.swapExactTokensForTokens(amountIn, amountOutMin, path);
        result = [amountIn];
        let out = (amountIn * amountTokenB) / (amountTokenA + amountIn);
        result.push(out);
        let expectedResult = [amountIn, out];
        expect(result).to.deep.equal(expectedResult);
    });
    it('testing decimals()', async function() {
        let result = await simpleSwap.decimals();
        expect(result).to.equal(18);
    });
})