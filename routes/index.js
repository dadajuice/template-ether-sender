let express = require('express');
let router = express.Router();

const Web3 = require("web3");
const ethNetwork = 'https://goerli.infura.io/v3/914cc489153047218ff33a71beab2a8f';
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));

const publicAddress = "<YOUR_ADDRESS>";
const privateKey = "<YOUR_KEY>";

router.get('/', async function(req, res) {
    res.render('index', {
        balance: await getBalance(publicAddress),
        error: req.flash('error'),
        success: req.flash('success'),
        address: publicAddress
    });
});

router.post('/', async function (req, res) {
    let ethAmount = req.body.amount;
    let address = req.body.address;

    if (ethAmount === undefined || ethAmount === "") {
        req.flash('error', "The amount to sent must be given.");
        res.redirect("/");
        return;
    }

    if (isNaN(ethAmount)) {
        req.flash('error', "The amount must be numeric.");
        res.redirect("/");
        return;
    }

    if (address === undefined || address === "") {
        req.flash('error', "The recipient address must be given.");
        res.redirect("/");
        return;
    }

    if (!Web3.utils.isAddress(address)) {
        req.flash('error', "The recipient address is invalid. Make sure its on the ETH network.");
        res.redirect("/");
        return;
    }

    try {
        let result = await sendEthereum(address, ethAmount);
        req.flash('success', ethAmount + " ETH sent successfully to " + address
            + ". <a href='https://goerli.etherscan.io/tx/" + result + "'>Transaction #" + result + "</a>.");
        res.redirect("/");
    } catch (e) {
        req.flash('error', e.message);
        res.redirect("/");
    }
});

async function getBalance(address) {
    return new Promise((resolve, reject) => {
        web3.eth.getBalance(address, async (err, result) => {
            if (err) {
                return reject(err);
            }
            const eth = web3.utils.fromWei(result, "ether");
            resolve(parseFloat(eth).toFixed(5));
        });
    });
}

async function sendEthereum(toAddress, ethAmount) {
    const txInfo = {
        from: publicAddress,
        to: toAddress,
        value: web3.utils.toWei(ethAmount.toString(), 'ether'),
        gas: '21000'
    };
    const tx = await web3.eth.accounts.signTransaction(txInfo, privateKey);
    const result = await web3.eth.sendSignedTransaction(tx.rawTransaction);
    return result.transactionHash;
}

module.exports = router;
