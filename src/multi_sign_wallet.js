const EtherSigner = require('ethereum-offline-sign');
const multiWalletSig = require('multi-wallet-sig');
const BigNumber = require('bignumber.js');

const ERC20Interface = require('../contracts/ERC20Interface.sol.js');
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
        let web3 = web3Connection(config.ethPoint);
        this.web3 = web3;
        this.eth = web3.eth;
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

    async getBalance(web3, address, tokenAddress) {
        let balance;
        if (tokenAddress) {
            let tokenContract = web3.eth.contract(ERC20Interface.abi);
            balance = tokenContract.at(tokenAddress).balanceOf(address);
        } else {
            balance = await web3.eth.getBalance(address);
        }
        return parseInt(balance);
    }

    compileContract() {
        let multiContract = compile('contracts/multiSigWallet.sol', 'contracts/ERC20Interface.sol', 'MultiSigWallet');
        return require('../' + multiContract);
    }

    /**
     * Deploy contract to Ether chain
     * @param name Contract name
     * @param contract Compiled contract abi and bytecode
     * @param params Contract constructor params type of array
     * @returns {Promise<*>}
     */
    async deployContract(name, contract, params = []) {
        let web3 = this.web3;
        printLog(`Deploy ${name} contract`);
        //Get current gas price
        let gasPrice = web3.eth.gasPrice;

        //offline sign contract deploy data
        let etherSigner = new EtherSigner(null, config.senderPrivateKey, gasPrice, config.gasLimit);
        let creator = etherSigner.getAddress();
        printLogBasic(`${name} contract creator: ${creator}`);
        const dpContract = web3.eth.contract(contract.abi);

        printLogBasic('Deploy ' + name + ' contract  params:');
        console.log('    ', params);

        params.push({data: contract.bytecode, gas: config.gasLimit, from: creator});

        let deployContractTx = etherSigner.deployContractSign(dpContract, params, web3.eth.getTransactionCount(creator));

        //send raw transaction
        printLogBasic('Send deploy ' + name + ' contract  transaction.');
        let depHash = web3.eth.sendRawTransaction(deployContractTx);
        printLogBasic('Deploy ' + name + ' contract transaction hash: ' + depHash);
        printLogBasic('wait deploy .............');

        //Waiting for block confirmation
        let confirmTx = await this.txReceiptConfirm(web3, depHash);
        printLogBasic(name + ' deployed at : 【' + confirmTx.contractAddress + '】');
        printLog('Deploy ' + name + ' contract success.\n');
        return confirmTx.contractAddress;
    }


    async sendToken(destination, amount) {
        let {eth, web3, getBalance, txFinalConfirm} = this;
        printLog('Send Erc20 Token ' + amount + ' [INS] to [' + destination + '].');
        let gasPrice = web3.eth.gasPrice;
        let contractAddress = config.erc20Token;
        let tokenContract = web3.eth.contract(ERC20Interface.abi);
        let etherSigner = new EtherSigner(tokenContract.at(contractAddress), config.senderPrivateKey, gasPrice, config.gasLimit);
        let signer = etherSigner.getAddress();
        let nonce = eth.getTransactionCount(signer);
        let params = [destination, etherSigner.toWei(amount), {from: signer}];
        let signedTx = etherSigner.contractTransferSign('transfer', params, contractAddress, nonce, 0);

        let hash = eth.sendRawTransaction(signedTx);
        printLogBasic('Send Erc20 Token ' + amount + ' [INS] to [' + destination + '] raw transaction hash : ' + hash);

        let confirmTx = await txFinalConfirm(web3, hash, 3);
        printLogBasic('Send Erc20 Token ' + amount + ' [INS] to [' + destination + '] transaction confirm : ' + confirmTx.hash);

        //Get 'destination' balance
        let multiBalance = await getBalance(web3, destination, contractAddress);
        printLogBasic('[' + destination + '] Erc20 Token [INS] balance: ' + multiBalance);
        printLog('Send  Erc20 Token ' + amount + ' [INS] to [' + destination + '] success. \n');
    }

    async sendEther(web3, destination, amount) {
        let gasPrice = web3.eth.gasPrice;
        let etherSigner = new EtherSigner(null, config.senderPrivateKey, gasPrice, config.gasLimit);

        //Send amount ETH to destination
        printLog('Send ' + amount + ' ETH to [' + destination + '].');
        let senderNonce = await web3.eth.getTransactionCount(config.sender);

        //Offline sign eth transaction data
        let sigTx = etherSigner.transferSign(senderNonce, destination, etherSigner.toWei(amount, 'ether'));
        printLogBasic('Sender nonce: ' + senderNonce);
        printLogBasic('Send ' + amount + ' ETH to [' + destination + '] offline sign hash: ' + sigTx);

        let hash = web3.eth.sendRawTransaction(sigTx);
        printLogBasic('Send ' + amount + ' ETH to [' + destination + '] raw transaction hash : ' + hash);

        let confirmTx = await this.txFinalConfirm(web3, hash, 3);
        printLogBasic('Send ' + amount + ' ETH to [' + destination + '] transaction confirm : ' + confirmTx.hash);

        //Get 'destination' balance
        let multiBalance = await this.getBalance(web3, destination);
        printLogBasic('[' + destination + '] ETH balance: ' + multiBalance);
        printLog('Send ' + amount + ' ETH to [' + destination + '] success. \n');
    }

    executeTransactionListen(web3, multiSignWallet) {
        multiSignWallet.ExecuteTransaction().watch((err, res) => {
            this.txFinalConfirm(web3, res.transactionHash, 3).then((result) => {
                console.log('==================================event ExecuteTransaction s===========================================\n');
                let args = res.args;
                if (parseInt(args.tokenContractAddr)) {
                    console.log('********************************** Listened Erc20 Withdraw *****************************');
                    console.log(args);
                } else {
                    console.log('>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>> Listened Ether Withdraw >>>>>>>>>>>>>>>>>>>>>>>>>>>>>');
                    console.log(args);
                }
                console.log('==================================event ExecuteTransaction e===========================================\n');
            }).catch(console.log);
        });
    }

    async executeContractFunc(web3, contract, value, erc20Token) {
        erc20Token = erc20Token || 0;

        let symbol = erc20Token ? 'Erc20 Token [INS]' : 'ETH';

        let gasPrice = web3.eth.gasPrice;
        let senderNonce = await web3.eth.getTransactionCount(config.sender);

        let etherSigner = new EtherSigner(contract, config.senderPrivateKey, gasPrice, config.gasLimit);

        //Multi node signature authentication is performed for multiSignWallet transfer, call method 'executeTransaction'
        printLog('Call multiSignWallet `executeTransaction` multi sign transfer ' + symbol + ' to destination');
        let multiNonce = contract.nonce.call();
        printLogBasic('multiNonce: ' + multiNonce.toString());

        //***The ·amount· must be of the BigNumber type, Otherwise multiSignWallet contract signature authentication will fail
        //***The version of bignumber.js in the running env must be specified as @git+https://github.com/frozeman/bignumber.js-nolookahead.git
        let amount = etherSigner.toWei(new BigNumber(value), 'ether');

        //Contract multi-validation pre-signed
        let data = '0x', requestId = 1;
        let signParams = [
            contract.address,
            config.destination,
            amount,
            data,
            multiNonce
        ];
        let signatures = multiWalletSig.createSigs(config.privateKeys, ...signParams);
        printLogBasic('Execute executeTransaction pre signatures:');
        console.log(signatures);


        let params = [signatures.sigV, signatures.sigR, signatures.sigS].concat(signParams.slice(1,4)).concat([
            erc20Token,
            requestId,
            {
                gasPrice,
                gas: config.gasLimit,
                from: config.sender
            }]);


        //Offline sign contract transaction
        let sigConTx = etherSigner.contractTransferSign('executeTransaction', params, contract.address, senderNonce, 0);
        // printLogBasic('MultiSignWallet executeTransaction offline sign hash: ' + sigConTx);

        let conHash = web3.eth.sendRawTransaction(sigConTx);
        printLogBasic('Execute multiWalletSig transaction hash : ' + conHash);
        printLogBasic('Wait confirm.....');

        let confirmConTx = await this.txFinalConfirm(web3, conHash, 3);
        printLogBasic('Execute multiWalletSig transaction confirm : ' + confirmConTx.hash);

        let multiBalance = await this.getBalance(web3, contract.address, erc20Token);
        printLogBasic('MultiSignWallet ' + symbol + ' balance: ' + multiBalance);
        printLog('Call multiSignWallet `executeTransaction` multi sign transfer ' + symbol + ' to destination success.\n')


    }

    async run(multiSignAddress) {

        this.compileContract();
        let {web3} = this;
        let multiContract = require('../contracts/multiSigWallet.sol.js');

        //Deploy MultiSignWallet contract.
        multiSignAddress = multiSignAddress || await this.deployContract('MultiSignWallet', multiContract, [config.owners, config.threshold]);

        let multiSignWallet = web3.eth.contract(multiContract.abi).at(multiSignAddress);
        this.executeTransactionListen(web3, multiSignWallet);

        //Send 10000 INS Token to MultiSignWallet
        await this.sendToken(multiSignWallet.address, 10000);

        //Send 0.02 ETH to MultiSignWallet
        await this.sendEther(web3, multiSignWallet.address, 0.02);

        //Execute MultiSignWallet method 'executeTransaction' transfer ETH
        await this.executeContractFunc(web3, multiSignWallet, 0.01);

        //Execute MultiSignWallet method 'executeTransaction' transfer Erc20Token
        await this.executeContractFunc(web3, multiSignWallet, 1000, config.erc20Token);
    }

}

module.exports = MultiSignWallet;