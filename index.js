const MultiSignWallet = require('./src/multi_sign_wallet');

let multiSignWallet = new MultiSignWallet();

// deploy erc20 token
// let erc20Contract = require('./contracts/General.sol.js');
// multiSignWallet.deployContract('Erc20 Token INS', erc20Contract, ['INS', 'INS test', 100000000]).catch(console.log);


multiSignWallet.run().catch(console.log);

// multiSignWallet.test('0x2f4e47a54b8c5455711d14c5e67ac1982750bb78').catch(console.log);
