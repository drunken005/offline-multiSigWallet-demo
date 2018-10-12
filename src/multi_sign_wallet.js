const EtherSigner = require('ethereum-offline-sign');
const multiWalletSig = require('multi-wallet-sig');
const BigNumber = require('bignumber.js');

const config = require('./config');
const compile = require('./compile_eth_contract');
const web3Connection = require('./web3_connection');

function printLog(log) {
    console.log('\x1B[33m%s\x1b[0m', '------------------ ' + log);
}

function printLogBasic(log) {
    console.log('\x1B[33m%s\x1b[0m', '    ' + log);
}

class MultiSignWallet {
    constructor() {
        this.web3 = web3Connection(config.ethPoint);
        this.eth = this.web3.eth;
        this.multiSignWallet = null;
    }

    txFinalConfirm(web3, txHash, numBlocksToWait = 1) {
        let blockNumber = web3.eth.blockNumber;
        return new Promise(function (resolve, reject) {
            function watch() {
                let currentBlock = web3.eth.blockNumber;
                if (currentBlock <= blockNumber) {
                    return watch();
                }
                let filter = web3.eth.filter('latest');
                filter.watch(function (error, result) {
                    if (!error) {
                        const trx = web3.eth.getTransaction(txHash);
                        web3.eth.getBlockNumber(function (err, currentBlock1) {
                            if (trx.blockNumber && currentBlock1 - trx.blockNumber >= numBlocksToWait) {
                                resolve(trx);
                                filter.stopWatching();
                            }
                        });
                    }
                });
            }

            setTimeout(watch, 3000)
        });
    }

    txReceiptConfirm(web3, txHash, numBlocksToWait = 1) {
        return new Promise(function (resolve, reject) {
            let filter = web3.eth.filter('latest');
            filter.watch(function (error, result) {
                if (!error) {
                    const trx = web3.eth.getTransactionReceipt(txHash);
                    web3.eth.getBlockNumber(function (err, currentBlock1) {
                        if (trx && trx.blockNumber && currentBlock1 - trx.blockNumber >= numBlocksToWait) {
                            resolve(trx);
                            filter.stopWatching();
                        }
                    });
                }
            });
        });
    }

    async getBalance(web3, address) {
        let balance = await web3.eth.getBalance(address);
        return parseInt(balance);
    }

    compileContract() {
        let multiContract = compile('contracts/multiSigWallet.sol', 'contracts/ERC20Interface.sol', 'MultiSigWallet');
        return require('../' + multiContract);
    }

    /**
     * Deploy multi sign wallet contract
     * @param privateKey Contract creator private key
     * @param owners ETH address that requires signature verification to execute the contract
     * @param threshold Number of required sign confirmations.
     * @returns {Promise<*>}
     */
    async createMultiSigWallet(privateKey, multiContract, owners, threshold) {
        let web3 = this.web3;
        printLog('Deploy multiSignWallet contract');
        //Get current gas price
        let gasPrice = web3.eth.gasPrice;

        //offline sign contract deploy data
        let etherSigner = new EtherSigner(null, privateKey, gasPrice, config.gasLimit);
        let creator = etherSigner.getAddress();
        printLogBasic(`MultiSigWallet creator: ${creator}`);
        const multi = web3.eth.contract(multiContract.abi);
        let params = [
            owners,
            threshold,
            {
                data: multiContract.bytecode,
                gas: config.gasLimit,
                from: creator
            }
        ];
        let deployContractTx = etherSigner.deployContractSign(multi, params, web3.eth.getTransactionCount(creator));
        // printLogBasic('Deploy contract sign result: ');
        // console.log(deployContractTx);

        //send raw transaction
        printLogBasic('Send deploy multiSigWallet contract  transaction.');
        let depHash = web3.eth.sendRawTransaction(deployContractTx);
        printLogBasic('Deploy multiSigWallet contract transaction hash: ' + depHash);
        printLogBasic('wait deploy .............');

        //Waiting for block confirmation
        let confirmTx = await this.txReceiptConfirm(web3, depHash);
        printLogBasic('MultiSigWallet deployed at : ' + confirmTx.contractAddress);
        printLog('Deploy multiSignWallet contract success.\n');
        this.multiSignWallet = multi.at(confirmTx.contractAddress);
        return this.multiSignWallet.address;
    }


    async run() {

        // let multiSignWalletContract = this.compileContract();
        let multiSignWalletContract = require('../contracts/multiSigWallet.sol.js');

        await this.createMultiSigWallet(config.senderPrivateKey, multiSignWalletContract, config.owners, config.threshold);


        let {eth, web3, getBalance, multiSignWallet, txFinalConfirm} = this;
        // let multiSignWallet = eth.contract(multiSignWalletContract.abi).at('0xede55bba08e2a1d342f4fae35e228dbcaeaa6038');

        let gasPrice = eth.gasPrice;
        let etherSigner = new EtherSigner(multiSignWallet, config.senderPrivateKey, gasPrice, config.gasLimit);

        //Send 0.1 ETH to multiSignWallet
        printLog('Send 0.1 ETH to multiSigWallet.');
        let senderNonce = await eth.getTransactionCount(config.sender);

        //Offline sign eth transaction data
        let sigTx = etherSigner.transferSign(senderNonce, multiSignWallet.address, etherSigner.toWei(0.1, 'ether'));
        printLogBasic('Sender nonce: ' + senderNonce);
        printLogBasic('Send 0.1 ETH to multiSignWallet offline sign hash: ' + sigTx);

        let hash = eth.sendRawTransaction(sigTx);
        printLogBasic('Send 0.1 ETH to multiSignWallet raw transaction hash : ' + hash);

        let confirmTx = await txFinalConfirm(web3, hash);
        printLogBasic('Send 0.1 ETH to multiSignWallet transaction confirm : ' + confirmTx.hash);

        //Get MultiSignWallet balance
        let multiBalance = await getBalance(web3, multiSignWallet.address);
        printLogBasic('MultiSignWallet ETH balance: ' + multiBalance);
        printLog('Send 0.1 ETH to multiSigWallet success. \n');

        //Multi node signature authentication is performed for multiSignWallet transfer, call method 'executeTransaction'
        printLog('Call multiSignWallet `executeTransaction` multi sign transfer ETH to destination');
        let multiNonce = multiSignWallet.nonce.call();
        printLogBasic('multiNonce: ' + multiNonce.toString());


        //***The ·amount· must be of the BigNumber type, Otherwise multiSignWallet contract signature authentication will fail
        //***The version of bignumber.js in the running env must be specified as @git+https://github.com/frozeman/bignumber.js-nolookahead.git
        let amount = etherSigner.toWei(new BigNumber(0.01), 'ether');

        //Contract multi-validation pre-signed
        let signatures = multiWalletSig.createSigs(config.privateKeys, multiSignWallet.address, multiNonce, config.destination, amount, '0x');
        printLogBasic('Execute executeTransaction pre signatures:');
        console.log(signatures);

        senderNonce = await eth.getTransactionCount(config.sender);
        let params = [
            signatures.sigV,
            signatures.sigR,
            signatures.sigS,
            config.destination,
            amount,
            '0x',
            {
                gasPrice,
                gas: config.gasLimit,
                from: config.sender
            }
        ];
        //Offline sign contract transaction
        let sigConTx = etherSigner.contractTransferSign('executeTransaction', params, multiSignWallet.address, senderNonce, 0);
        // printLogBasic('MultiSignWallet executeTransaction offline sign hash: ' + sigConTx);

        let conHash = eth.sendRawTransaction(sigConTx);
        printLogBasic('Execute multiWalletSig transaction hash : ' + conHash);
        printLogBasic('Wait confirm.....');

        let confirmConTx = await txFinalConfirm(web3, conHash);
        printLogBasic('Execute multiWalletSig transaction confirm : ' + confirmConTx.hash);

        multiBalance = await getBalance(web3, multiSignWallet.address);
        printLogBasic('MultiSignWallet ETH balance: ' + multiBalance);
        printLog('Call multiSignWallet `executeTransaction` multi sign success.')

        //Erc20 test
        //
    }

}

module.exports = MultiSignWallet;