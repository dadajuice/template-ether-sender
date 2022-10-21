let express = require('express');
let router = express.Router();

const Web3 = require("web3");
const EthereumTx = require('ethereumjs-tx').Transaction;
const axios = require('axios');
const ethNetwork = 'https://goerli.infura.io/v3/914cc489153047218ff33a71beab2a8f';
const web3 = new Web3(new Web3.providers.HttpProvider(ethNetwork));

const publicAddress = "0xEcc179a1b25Dad72D022CD830F9d26221fcA8A81";

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

    sendEthereum(address, ethAmount);
    req.flash('success', ethAmount + " ETH sent successfully to " + address
        + ". I may take up to few minutes before the transaction is completed.");
    res.redirect("/");
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

function sendEthereum(toAddress, ethAmount) {
    // TODO: Proceed to do the real transfer ...
}

module.exports = router;
