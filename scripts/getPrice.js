const { ethers } = require('hardhat');

async function main() {
    _addr = "0xa5bE805c423fE80DFbCC62182A341f958a003D42";
    SimpleSwap = await ethers.getContractFactory('SimpleSwap');
    simpleSwap = await SimpleSwap.attach(_addr)
    let hola = await simpleSwap.name();
    console.log(hola);
    //console.log(simpleSwap.totalSupply());
    //let tokenA = '0x22cda8bF234eC0B494FF7fB035EAaF0CEdF8CaCB';
    //let tokenB = '0xF448EF179eF390Bbc2f43D3a4018989B19cf7092';
    //try {
    //    let result = await simpleSwap.totalSupply();
        
    //} catch (error) {
    //    console.log(error);
    //}
    //await simpleSwap.addLiquidity('0x22cda8bF234eC0B494FF7fB035EAaF0CEdF8CaCB', '0xF448EF179eF390Bbc2f43D3a4018989B19cf7092', '1000', '500');
};

main();