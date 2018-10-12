//connect web3 for ETH test net
function web3_connection(ethPoint) {
    const Web3 = require('web3');
    const web3 = new Web3();
    try {
        web3.setProvider(new web3.providers.HttpProvider(ethPoint));
    } catch (e) {
        console.log('connect web3 error:', e);
    }

    if (!web3.isConnected()) {
        throw "Ether web3 is not connected!";
    } else {
        console.log('connected web3 ' + ethPoint);
    }
    let sync = web3.eth.syncing;
    if (sync) {
        console.log("Still syncing ...");
        console.log(sync);
    }
    return web3;
}

module.exports = web3_connection;
