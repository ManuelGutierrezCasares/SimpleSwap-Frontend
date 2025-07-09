const { expect } = require('chai');
const { ethers } = require('hardhat');

describe('SimpleSwap', function() {
    let SimpleSwap;
    let simpleSwap;
    beforeEach(async function() {
        SimpleSwap = await ethers.getContractFactory('SimpleSwap');
        simpleSwap = await SimpleSwap.deploy();
    });

    it('testing getPrice()', async function() {
        await simpleSwap.addLiquidity('0x22cda8bF234eC0B494FF7fB035EAaF0CEdF8CaCB', '0xF448EF179eF390Bbc2f43D3a4018989B19cf7092', 1000, 500);
        let result = await simpleSwap.getPrice('0x22cda8bF234eC0B494FF7fB035EAaF0CEdF8CaCB', '0xF448EF179eF390Bbc2f43D3a4018989B19cf7092');
        expect(result).to.equal(5);
    });
})