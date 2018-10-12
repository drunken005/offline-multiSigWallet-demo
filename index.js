const MultiSignWallet = require('./src/multi_sign_wallet');

let multiSignWallet = new MultiSignWallet();
multiSignWallet.run().catch(console.log);