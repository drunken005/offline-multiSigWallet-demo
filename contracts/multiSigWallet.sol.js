module.exports.abi = [{"constant":true,"inputs":[{"name":"","type":"uint256"}],"name":"owners","outputs":[{"name":"","type":"address"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sigV","type":"uint8[]"},{"name":"sigR","type":"bytes32[]"},{"name":"sigS","type":"bytes32[]"},{"name":"destination","type":"address"},{"name":"value","type":"uint256"},{"name":"data","type":"bytes"},{"name":"tokenContractAddr","type":"address"},{"name":"requestId","type":"uint256"}],"name":"executeTokenTransaction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[{"name":"","type":"address"}],"name":"isOwner","outputs":[{"name":"","type":"bool"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"threshold","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"nonce","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":true,"inputs":[],"name":"MAX_OWNER_COUNT","outputs":[{"name":"","type":"uint256"}],"payable":false,"stateMutability":"view","type":"function"},{"constant":false,"inputs":[{"name":"sigV","type":"uint8[]"},{"name":"sigR","type":"bytes32[]"},{"name":"sigS","type":"bytes32[]"},{"name":"destination","type":"address"},{"name":"value","type":"uint256"},{"name":"data","type":"bytes"}],"name":"executeTransaction","outputs":[],"payable":false,"stateMutability":"nonpayable","type":"function"},{"constant":true,"inputs":[],"name":"VERSION","outputs":[{"name":"","type":"string"}],"payable":false,"stateMutability":"view","type":"function"},{"inputs":[{"name":"_owners","type":"address[]"},{"name":"_threshold","type":"uint256"}],"payable":false,"stateMutability":"nonpayable","type":"constructor"},{"payable":true,"stateMutability":"payable","type":"fallback"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"Deposit","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"sender","type":"address"},{"indexed":false,"name":"destination","type":"address"},{"indexed":false,"name":"value","type":"uint256"}],"name":"ExecuteTransaction","type":"event"},{"anonymous":false,"inputs":[{"indexed":true,"name":"recovered","type":"address"},{"indexed":false,"name":"hash","type":"bytes32"},{"indexed":false,"name":"v","type":"uint8"},{"indexed":false,"name":"r","type":"bytes32"},{"indexed":false,"name":"s","type":"bytes32"},{"indexed":false,"name":"destination","type":"address"},{"indexed":false,"name":"value","type":"uint256"},{"indexed":false,"name":"data","type":"bytes"},{"indexed":false,"name":"nonce","type":"uint256"}],"name":"Test1","type":"event"}];
module.exports.bytecode = "0x60806040523480156200001157600080fd5b5060405162000f3f38038062000f3f8339810160405280516020820151910180519091906000908260328211806200004857508181115b8062000052575080155b806200005c575081155b156200006757600080fd5b600092505b84518310156200013b576003600086858151811015156200008957fe5b6020908102909101810151600160a060020a031682528101919091526040016000205460ff1680620000dc57508483815181101515620000c557fe5b90602001906020020151600160a060020a03166000145b15620000e757600080fd5b6001600360008786815181101515620000fc57fe5b602090810291909101810151600160a060020a03168252810191909152604001600020805460ff1916911515919091179055600192909201916200006c565b84516200015090600290602088019062000162565b50505060019190915550620001f69050565b828054828255906000526020600020908101928215620001ba579160200282015b82811115620001ba5782518254600160a060020a031916600160a060020a0390911617825560209092019160019091019062000183565b50620001c8929150620001cc565b5090565b620001f391905b80821115620001c8578054600160a060020a0319168155600101620001d3565b90565b610d3980620002066000396000f30060806040526004361061008d5763ffffffff7c0100000000000000000000000000000000000000000000000000000000600035041663025e7c2781146100cf5780632aafa81f146101035780632f54bf6e1461022f57806342cde4e814610264578063affed0e01461028b578063d74f8edd146102a0578063f16379e7146102b5578063ffa1ad74146103d0575b60003411156100cd5760408051348152905133917fe1fffcc4923d04b559f4d29a8bfc6cda04eb5b0d3c460751c2402c5c5cc9109c919081900360200190a25b005b3480156100db57600080fd5b506100e760043561045a565b60408051600160a060020a039092168252519081900360200190f35b34801561010f57600080fd5b50604080516020600480358082013583810280860185019096528085526100cd95369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a99890198929750908201955093508392508501908490808284375050604080516020888301358a018035601f8101839004830284018301909452838352979a8935600160a060020a03169a8a8301359a9199909850606090910196509194509081019250819084018382808284375094975050508335600160a060020a0316945050506020909101359050610482565b34801561023b57600080fd5b50610250600160a060020a036004351661080f565b604080519115158252519081900360200190f35b34801561027057600080fd5b50610279610824565b60408051918252519081900360200190f35b34801561029757600080fd5b5061027961082a565b3480156102ac57600080fd5b50610279610830565b3480156102c157600080fd5b50604080516020600480358082013583810280860185019096528085526100cd95369593946024949385019291829185019084908082843750506040805187358901803560208181028481018201909552818452989b9a998901989297509082019550935083925085019084908082843750506040805187358901803560208181028481018201909552818452989b9a99890198929750908201955093508392508501908490808284375050604080516020888301358a018035601f8101839004830284018301909452838352979a8935600160a060020a03169a8a8301359a919990985060609091019650919450908101925081908401838280828437509497506108359650505050505050565b3480156103dc57600080fd5b506103e5610cd6565b6040805160208082528351818301528351919283929083019185019080838360005b8381101561041f578181015183820152602001610407565b50505050905090810190601f16801561044c5780820380516001836020036101000a031916815260200191505b509250505060405180910390f35b600280548290811061046857fe5b600091825260209091200154600160a060020a0316905081565b6000806000806000806001548d511015151561049d57600080fd5b8b518d51101580156104b157508d518d5110155b15156104bc57600080fd5b60197f01000000000000000000000000000000000000000000000000000000000000000260007f010000000000000000000000000000000000000000000000000000000000000002308d8d8d6000546040518088600160f860020a031916600160f860020a031916815260010187600160f860020a031916600160f860020a031916815260010186600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140185600160a060020a0316600160a060020a03166c0100000000000000000000000002815260140184815260200183805190602001908083835b602083106105c25780518252601f1990920191602091820191016105a3565b51815160209384036101000a600019018019909216911617905292019384525060405192839003019091209c5060009b508b9a50505050505050505b60015484101561070a576001868f8681518110151561061957fe5b906020019060200201518f8781518110151561063157fe5b906020019060200201518f8881518110151561064957fe5b60209081029091018101516040805160008082528185018084529790975260ff9095168582015260608501939093526080840152905160a0808401949293601f19830193908390039091019190865af11580156106aa573d6000803e3d6000fd5b50505060206040510351925084600160a060020a031683600160a060020a03161180156106ef5750600160a060020a03831660009081526003602052604090205460ff165b15156106fa57600080fd5b82945083806001019450506105fe565b600080546001018155604080517fa9059cbb000000000000000000000000000000000000000000000000000000008152600160a060020a038e81166004830152602482018e905291518b95509185169263a9059cbb926044808401936020939083900390910190829087803b15801561078257600080fd5b505af1158015610796573d6000803e3d6000fd5b505050506040513d60208110156107ac57600080fd5b505190508015156107bc57600080fd5b60408051600160a060020a038d168152602081018c9052815133927fc30242710fb95d9ef6302f180394ac6516348508eece470012af3f0c4f934f37928290030190a25050505050505050505050505050565b60036020526000908152604090205460ff1681565b60015481565b60005481565b603281565b6000806000806000806001548b511015151561085057600080fd5b89518b5114801561086257508b518b51145b151561086d57600080fd5b600080546040517f190000000000000000000000000000000000000000000000000000000000000080825260018201849052306c010000000000000000000000008181026002850152600160a060020a038f16026016840152602a83018d90528b5191949390928e928e928e929091604a82019060208501908083835b602083106109095780518252601f1990920191602091820191016108ea565b6001836020036101000a038019825116818451168082178552505050505050905001828152602001975050505050505050604051809103902095506001868d600081518110151561095657fe5b906020019060200201518d600081518110151561096f57fe5b906020019060200201518d600081518110151561098857fe5b60209081029091018101516040805160008082528185018084529790975260ff9095168582015260608501939093526080840152905160a0808401949293601f19830193908390039091019190865af11580156109e9573d6000803e3d6000fd5b50505060206040510351945060009350600092505b600154831015610b0a576001868d85815181101515610a1957fe5b906020019060200201518d86815181101515610a3157fe5b906020019060200201518d87815181101515610a4957fe5b60209081029091018101516040805160008082528185018084529790975260ff9095168582015260608501939093526080840152905160a0808401949293601f19830193908390039091019190865af1158015610aaa573d6000803e3d6000fd5b50505060206040510351915083600160a060020a031682600160a060020a0316118015610aef5750600160a060020a03821660009081526003602052604090205460ff165b1515610afa57600080fd5b81935082806001019350506109fe565b84600160a060020a03167f1051c22b9a03af9d54f3027e21f369c7c7a89327972d43199f4178335c412bd6878e6000815181101515610b4557fe5b906020019060200201518e6000815181101515610b5e57fe5b906020019060200201518e6000815181101515610b7757fe5b906020019060200201518e8e8e6000546040518089600019166000191681526020018860ff1660ff1681526020018760001916600019168152602001866000191660001916815260200185600160a060020a0316600160a060020a0316815260200184815260200180602001838152602001828103825284818151815260200191508051906020019080838360005b83811015610c1e578181015183820152602001610c06565b50505050905090810190601f168015610c4b5780820380516001836020036101000a031916815260200191505b50995050505050505050505060405180910390a25060008054600101815586518190819060208a018b8d5af19050801515610c8557600080fd5b60408051600160a060020a038b168152602081018a9052815133927fc30242710fb95d9ef6302f180394ac6516348508eece470012af3f0c4f934f37928290030190a2505050505050505050505050565b60408051808201909152600581527f302e302e320000000000000000000000000000000000000000000000000000006020820152815600a165627a7a72305820ea30c0c688dd304ff0a76b3623c86531527a0cec9609143d874d7a0a8cefce040029";