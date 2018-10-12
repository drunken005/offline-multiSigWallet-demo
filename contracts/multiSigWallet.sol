pragma solidity ^0.4.22;

import "./ERC20Interface.sol";

/// @title Multisignature wallet - Allows multiple parties to agree on transactions before execution.
/// @author Stefan George - <stefan.george@consensys.net>
/// https://github.com/ConsenSys/MultiSigWallet
/// This is the exact verified contract currently storing millions in assets:
/// https://etherscan.io/address/0x851b7f3ab81bd8df354f0d7640efcd7288553419#code
/// Warning: The compiled contract might be susceptible to ZeroFunctionSelector (very low-severity), DelegateCallReturnValue (low-severity), ECRecoverMalformedInput (medium-severity), SkipEmptyStringLiteral (low-severity) Solidity compiler bugs.
contract MultiSigWallet {
    string constant public VERSION = "0.0.2";
    uint constant public MAX_OWNER_COUNT = 50;
    uint public nonce;
    uint public threshold;
    address[] public owners;
    mapping(address => bool) public isOwner;

    event Deposit(address indexed sender, uint value);
    event ExecuteTransaction(address indexed sender, address destination, uint value);


    modifier validRequirement(uint ownerCount, uint _threshold) {
        if (ownerCount > MAX_OWNER_COUNT
        || _threshold > ownerCount
        || _threshold == 0
        || ownerCount == 0)
            revert();
        _;
    }

    /*
     * Public functions
     */
    /// @dev Contract constructor sets initial owners and required number of confirmations.
    /// @param _owners List of initial owners.
    /// @param _threshold Number of required confirmations.
    constructor(address[] _owners, uint _threshold) public validRequirement(_owners.length, _threshold)
    {
        for (uint i = 0; i < _owners.length; i++) {
            if (isOwner[_owners[i]] || _owners[i] == 0)
                revert();
            isOwner[_owners[i]] = true;
        }
        owners = _owners;
        threshold = _threshold;
    }

    modifier onlyWallet() {
        if (msg.sender != address(this))
            revert();
        _;
    }


    /// @dev Fallback function allows to deposit ether.
    function() public payable
    {
        if (msg.value > 0)
            emit Deposit(msg.sender, msg.value);
    }

    event Test1(address indexed recovered, bytes32 hash, uint8 v, bytes32 r, bytes32 s, address destination, uint value, bytes data, uint nonce);
    // Note that address recovered from signatures must be strictly increasing, in order to prevent duplicates
    function executeTransaction(uint8[] sigV, bytes32[] sigR, bytes32[] sigS, address destination, uint value, bytes data) public {
        require(sigR.length >= threshold);
        require(sigR.length == sigS.length && sigR.length == sigV.length);

        // Follows ERC191 signature scheme: https://github.com/ethereum/EIPs/issues/191
        bytes32 txHash = keccak256(byte(0x19), byte(0), this, destination, value, data, nonce);


        address recovered1 = ecrecover(txHash, sigV[0], sigR[0], sigS[0]);
        address lastAdd = address(0); // cannot have address(0) as an owner
        // cannot have address(0) as an owner
        for (uint i = 0; i < threshold; i++) {
            address recovered = ecrecover(txHash, sigV[i], sigR[i], sigS[i]);
            require(recovered > lastAdd && isOwner[recovered]);
            lastAdd = recovered;
        }

        emit Test1(recovered1, txHash, sigV[0], sigR[0], sigS[0], destination, value, data, nonce);
        // If we make it here all signatures are accounted for.
        // The address.call() syntax is no longer recommended, see:
        // https://github.com/ethereum/solidity/issues/2884
        nonce = nonce + 1;
        bool success = false;
//        //call(g, a, v, in, insize, out, outsize)
//        //call contract at address a with input mem[in..(in+insize)) providing g gas and v wei and output area mem[out..(out+outsize)) returning 0 on error (eg. out of gas) and 1 on success
//
        assembly {success := call(gas, destination, value, add(data, 0x20), mload(data), 0, 0)}
        require(success);
        emit ExecuteTransaction(msg.sender, destination, value);
    }


    //Erc20 token transaction
    function executeTokenTransaction(uint8[] sigV, bytes32[] sigR, bytes32[] sigS, address destination, uint value, bytes data, address tokenContractAddr, uint requestId) public {
        require(sigR.length >= threshold);
        require(sigR.length >= sigS.length && sigR.length >= sigV.length);

        // Follows ERC191 signature scheme: https://github.com/ethereum/EIPs/issues/191
        bytes32 txHash = keccak256(byte(0x19), byte(0), this, destination, value, data, nonce);

        address lastAdd = address(0);
        // cannot have address(0) as an owner
        for (uint i = 0; i < threshold; i++) {
            address recovered = ecrecover(txHash, sigV[i], sigR[i], sigS[i]);
            require(recovered > lastAdd && isOwner[recovered]);
            lastAdd = recovered;
        }

        // If we make it here all signatures are accounted for.
        // The address.call() syntax is no longer recommended, see:
        // https://github.com/ethereum/solidity/issues/2884

        ERC20Interface instance = ERC20Interface(tokenContractAddr);
        nonce = nonce + 1;
        bool success = instance.transfer(destination, value);

        //assembly { success := call(gas, destination, value, add(data, 0x20), mload(data), 0, 0) }
        require(success);
        emit ExecuteTransaction(msg.sender, destination, value);
    }

}
