let signerAddress;
let SimpleSwap;
let tokenA;
let tokenB;
let connected;
let amountTokenA;
let amountTokenB;
let signer;



init();

async function init() {
    const provider = new ethers.providers.JsonRpcProvider("https://sepolia.infura.io/v3/f300225e203c45b9ba70c0daef9cc172");
    SimpleSwap = new ethers.Contract(contractAddress, contractAbi, provider);
    connected = false;
}


async function connect()
{
    if (typeof window.ethereum !== undefined) {
        await window.ethereum.request({"method": "eth_requestAccounts","params": [],});
        const provider = new ethers.providers.Web3Provider(window.ethereum);
        signer = provider.getSigner();
        signerAddress = await signer.getAddress();
        document.getElementById("accountAddress").innerText = signerAddress;
        connected = true;
        updateLiquidity();
    } else {
        alert("creese una metamask");
    }
}

async function handleSubmit() {
    if (!connected) {
        alert("creese una metamask");
    } else {
        const AmountToBuy = document.querySelector("#form > input.IHAVE").value;
        tokenA = new ethers.Contract(tokenAAddress, tokenAAbi, signer);
        tokenB = new ethers.Contract(tokenBAddress, tokenBAbi, signer);
        let tokenABalanceOfSigner, tokenBBalanceOfSigner;
        try {
            tokenABalanceOfSigner = await tokenA.balanceOf(signerAddress);
            tokenBBalanceOfSigner = await tokenB.balanceOf(signerAddress);
        } catch (error) {
            tokenABalanceOfSigner = null;
            tokenBBalanceOfSigner = null;
        }
        
        let contractSigned = new ethers.Contract(contractAddress, contractAbi, signer);
        let tx; 

        if (Number(tokenABalanceOfSigner) === 0 || Number(tokenBBalanceOfSigner) === 0 || tokenABalanceOfSigner === null || tokenBBalanceOfSigner === null) {
            alert('Usted no tenía balance de los tokens MAN1 o MAN2, se le han minteado y se ha agregado liquidez al SimpleSwap para el uso de esta DAPP');
            tx = await contractSigned.approve(tokenAAddress, 100000000);
            tx.wait();
            tx = await contractSigned.approve(tokenBAddress, 100000000);
            tx.wait();
            tx = await tokenA.approve(contractAddress, 100000000);
            tx.wait();
            tx = await tokenB.approve(contractAddress, 100000000);
            tx.wait();
            tx = await tokenA.approve(signerAddress, 100000000);
            tx.wait();
            tx = await tokenA.mint(signerAddress, 100000000);
            tx.wait();
            tx = await tokenB.approve(signerAddress, 100000000);
            tx.wait();
            tx = await tokenB.mint(signerAddress, 100000000);
        }
        
        if (isNaN(amountTokenA) || isNaN(amountTokenB)) {
            alert('You need to use numbers.')
        } else {
            tx.wait(30)
            tx = await contractSigned.swapExactTokensForTokens(Number(amountTokenA), Number(amountTokenB), [tokenAAddress, tokenBAddress]);
            await tx.wait();
            updateLiquidity();
            alert('Your transaction has been completed. Congratulations.')
        }
    }
}

async function updateLiquidity() {
    const price = await SimpleSwap.getPrice(tokenAAddress, tokenBAddress);
    document.getElementById('liquidityPriceDisplay').innerText = Number(price);
}

function setValueTokenToSpend() {
	amountTokenA = document.getElementsByClassName("IHAVE")[0].value;
	amountTokenB = document.getElementsByClassName("IWANT")[0].value;
}