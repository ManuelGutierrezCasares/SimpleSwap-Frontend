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
    tokenA = new ethers.Contract(tokenAAddress, tokenAAbi, provider);
    tokenB = new ethers.Contract(tokenBAddress, tokenBAbi, provider);
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
        let tokenABalanceOfSigner, tokenBBalanceOfSigner;
        try {
            tokenABalanceOfSigner = await tokenA.balanceOf(signerAddress);
            tokenBBalanceOfSigner = await tokenB.balanceOf(signerAddress);
        } catch (error) {
            tokenABalanceOfSigner = null;
            tokenBBalanceOfSigner = null;
        }

        if (!tokenABalanceOfSigner && !tokenBBalanceOfSigner) {
            alert('Usted no tenía balance de los tokens MAN1 o MAN2, se le han minteado y se ha agregado liquidez al SimpleSwap para el uso de esta DAPP');
            tokenA.approve(signerAddress);
            tokenA.mint(100000000);
            tokenB.approve(signerAddress);
            tokenB.mint(100000000);
        }
        let contractSigned = new ethers.Contract(contractAddress, contractAbi, signer);
        let tx = await contractSigned.addLiquidity(tokenAAddress, tokenBAddress, 100, 50);
        await tx.wait();
        updateLiquidity();
        
        if (isNaN(amountTokenA) || isNaN(amountTokenB)) {
            alert('You need to use numbers.')
        } else {
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