// Code generated - DO NOT EDIT.
// This file is a generated binding and any manual changes will be lost.

package remotebridge

import (
	"math/big"
	"strings"

	ethereum "github.com/ethereum/go-ethereum"
	"github.com/ethereum/go-ethereum/accounts/abi"
	"github.com/ethereum/go-ethereum/accounts/abi/bind"
	"github.com/ethereum/go-ethereum/common"
	"github.com/ethereum/go-ethereum/core/types"
	"github.com/ethereum/go-ethereum/event"
)

// Reference imports to suppress errors if they are not otherwise used.
var (
	_ = big.NewInt
	_ = strings.NewReader
	_ = ethereum.NotFound
	_ = abi.U256
	_ = bind.Bind
	_ = common.Big1
	_ = types.BloomLookup
	_ = event.NewSubscription
)

// RemoteBridgeABI is the input ABI used to generate the binding from.
const RemoteBridgeABI = "[{\"inputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"constructor\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"address\",\"name\":\"previousOwner\",\"type\":\"address\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"OwnershipTransferred\",\"type\":\"event\"},{\"anonymous\":false,\"inputs\":[{\"indexed\":true,\"internalType\":\"bytes32\",\"name\":\"hash\",\"type\":\"bytes32\"},{\"indexed\":true,\"internalType\":\"address\",\"name\":\"signer\",\"type\":\"address\"},{\"indexed\":false,\"internalType\":\"uint64\",\"name\":\"nonce\",\"type\":\"uint64\"}],\"name\":\"TransferRegistered\",\"type\":\"event\"},{\"constant\":true,\"inputs\":[],\"name\":\"getLastBlock\",\"outputs\":[{\"internalType\":\"uint256\",\"name\":\"\",\"type\":\"uint256\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"isOwner\",\"outputs\":[{\"internalType\":\"bool\",\"name\":\"\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"owner\",\"outputs\":[{\"internalType\":\"address\",\"name\":\"\",\"type\":\"address\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"local\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"remote\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"signer\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"nonce\",\"type\":\"uint64\"}],\"name\":\"register\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[],\"name\":\"renounceOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"uint256\",\"name\":\"lastBlock\",\"type\":\"uint256\"}],\"name\":\"setLastBlock\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"address\",\"name\":\"newOwner\",\"type\":\"address\"}],\"name\":\"transferOwnership\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"\",\"type\":\"bytes32\"}],\"name\":\"transfers\",\"outputs\":[{\"internalType\":\"bytes32\",\"name\":\"hash\",\"type\":\"bytes32\"},{\"internalType\":\"address\",\"name\":\"signer\",\"type\":\"address\"},{\"internalType\":\"uint64\",\"name\":\"nonce\",\"type\":\"uint64\"},{\"internalType\":\"bool\",\"name\":\"exist\",\"type\":\"bool\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"},{\"constant\":false,\"inputs\":[{\"internalType\":\"bytes32\",\"name\":\"local\",\"type\":\"bytes32\"},{\"internalType\":\"bytes32\",\"name\":\"remote\",\"type\":\"bytes32\"}],\"name\":\"update\",\"outputs\":[],\"payable\":false,\"stateMutability\":\"nonpayable\",\"type\":\"function\"},{\"constant\":true,\"inputs\":[],\"name\":\"version\",\"outputs\":[{\"internalType\":\"string\",\"name\":\"\",\"type\":\"string\"}],\"payable\":false,\"stateMutability\":\"view\",\"type\":\"function\"}]"

// RemoteBridgeBin is the compiled bytecode used for deploying new contracts.
var RemoteBridgeBin = "0x608060405234801561001057600080fd5b5060006100216100c460201b60201c565b9050806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff1602179055508073ffffffffffffffffffffffffffffffffffffffff16600073ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3506100cc565b600033905090565b610f19806100db6000396000f3fe608060405234801561001057600080fd5b506004361061009e5760003560e01c80637f2c4ca8116100665780637f2c4ca8146101365780638da5cb5b146101545780638f32d59b14610172578063efcb64cb14610190578063f2fde38b146101ac5761009e565b806313f57c3e146100a35780633c64f04b146100bf57806354fd4d50146100f25780635d974a6614610110578063715018a61461012c575b600080fd5b6100bd60048036036100b891908101906109ef565b6101c8565b005b6100d960048036036100d491908101906109c6565b610334565b6040516100e99493929190610c97565b60405180910390f35b6100fa6103a5565b6040516101079190610cdc565b60405180910390f35b61012a60048036036101259190810190610a8e565b6103de565b005b61013461042f565b005b61013e610535565b60405161014b9190610d7e565b60405180910390f35b61015c61053f565b6040516101699190610c61565b60405180910390f35b61017a610568565b6040516101879190610c7c565b60405180910390f35b6101aa60048036036101a59190810190610a2b565b6105c6565b005b6101c660048036036101c1919081019061099d565b6107c0565b005b6101d0610568565b61020f576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161020690610d5e565b60405180910390fd5b60026000838152602001908152602001600020600101601c9054906101000a900460ff16610272576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161026990610d3e565b60405180910390fd5b80600260008481526020019081526020016000206000018190555060006002600084815260200190815260200160002090508060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff16827ff323e3760341eb70d636a6304f7927d4ba8c42e4e8777d908098205ad3c8f49c8360010160149054906101000a900467ffffffffffffffff166040516103279190610d99565b60405180910390a3505050565b60026020528060005260406000206000915090508060000154908060010160009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16908060010160149054906101000a900467ffffffffffffffff169080600101601c9054906101000a900460ff16905084565b6040518060400160405280601381526020017f7374756220393939392e393939392e393939390000000000000000000000000081525081565b6103e6610568565b610425576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161041c90610d5e565b60405180910390fd5b8060018190555050565b610437610568565b610476576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161046d90610d5e565b60405180910390fd5b600073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a360008060006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff160217905550565b6000600154905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff16905090565b60008060009054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff166105aa610813565b73ffffffffffffffffffffffffffffffffffffffff1614905090565b6105ce610568565b61060d576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161060490610d5e565b60405180910390fd5b60026000858152602001908152602001600020600101601c9054906101000a900460ff1615610671576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161066890610d1e565b60405180910390fd5b60405180608001604052808481526020018373ffffffffffffffffffffffffffffffffffffffff1681526020018267ffffffffffffffff16815260200160011515815250600260008681526020019081526020016000206000820151816000015560208201518160010160006101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555060408201518160010160146101000a81548167ffffffffffffffff021916908367ffffffffffffffff160217905550606082015181600101601c6101000a81548160ff0219169083151502179055509050508173ffffffffffffffffffffffffffffffffffffffff16837ff323e3760341eb70d636a6304f7927d4ba8c42e4e8777d908098205ad3c8f49c836040516107b29190610d99565b60405180910390a350505050565b6107c8610568565b610807576040517f08c379a00000000000000000000000000000000000000000000000000000000081526004016107fe90610d5e565b60405180910390fd5b6108108161081b565b50565b600033905090565b600073ffffffffffffffffffffffffffffffffffffffff168173ffffffffffffffffffffffffffffffffffffffff16141561088b576040517f08c379a000000000000000000000000000000000000000000000000000000000815260040161088290610cfe565b60405180910390fd5b8073ffffffffffffffffffffffffffffffffffffffff166000809054906101000a900473ffffffffffffffffffffffffffffffffffffffff1673ffffffffffffffffffffffffffffffffffffffff167f8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e060405160405180910390a3806000806101000a81548173ffffffffffffffffffffffffffffffffffffffff021916908373ffffffffffffffffffffffffffffffffffffffff16021790555050565b60008135905061095881610e7a565b92915050565b60008135905061096d81610e91565b92915050565b60008135905061098281610ea8565b92915050565b60008135905061099781610ebf565b92915050565b6000602082840312156109af57600080fd5b60006109bd84828501610949565b91505092915050565b6000602082840312156109d857600080fd5b60006109e68482850161095e565b91505092915050565b60008060408385031215610a0257600080fd5b6000610a108582860161095e565b9250506020610a218582860161095e565b9150509250929050565b60008060008060808587031215610a4157600080fd5b6000610a4f8782880161095e565b9450506020610a608782880161095e565b9350506040610a7187828801610949565b9250506060610a8287828801610988565b91505092959194509250565b600060208284031215610aa057600080fd5b6000610aae84828501610973565b91505092915050565b610ac081610dd0565b82525050565b610acf81610de2565b82525050565b610ade81610dee565b82525050565b6000610aef82610db4565b610af98185610dbf565b9350610b09818560208601610e36565b610b1281610e69565b840191505092915050565b6000610b2a602683610dbf565b91507f4f776e61626c653a206e6577206f776e657220697320746865207a65726f206160008301527f64647265737300000000000000000000000000000000000000000000000000006020830152604082019050919050565b6000610b90601b83610dbf565b91507f7472616e7366657220616c7265616479207265676973746572656400000000006000830152602082019050919050565b6000610bd0601783610dbf565b91507f7472616e73666572206e6f7420726567697374657265640000000000000000006000830152602082019050919050565b6000610c10602083610dbf565b91507f4f776e61626c653a2063616c6c6572206973206e6f7420746865206f776e65726000830152602082019050919050565b610c4c81610e18565b82525050565b610c5b81610e22565b82525050565b6000602082019050610c766000830184610ab7565b92915050565b6000602082019050610c916000830184610ac6565b92915050565b6000608082019050610cac6000830187610ad5565b610cb96020830186610ab7565b610cc66040830185610c52565b610cd36060830184610ac6565b95945050505050565b60006020820190508181036000830152610cf68184610ae4565b905092915050565b60006020820190508181036000830152610d1781610b1d565b9050919050565b60006020820190508181036000830152610d3781610b83565b9050919050565b60006020820190508181036000830152610d5781610bc3565b9050919050565b60006020820190508181036000830152610d7781610c03565b9050919050565b6000602082019050610d936000830184610c43565b92915050565b6000602082019050610dae6000830184610c52565b92915050565b600081519050919050565b600082825260208201905092915050565b6000610ddb82610df8565b9050919050565b60008115159050919050565b6000819050919050565b600073ffffffffffffffffffffffffffffffffffffffff82169050919050565b6000819050919050565b600067ffffffffffffffff82169050919050565b60005b83811015610e54578082015181840152602081019050610e39565b83811115610e63576000848401525b50505050565b6000601f19601f8301169050919050565b610e8381610dd0565b8114610e8e57600080fd5b50565b610e9a81610dee565b8114610ea557600080fd5b50565b610eb181610e18565b8114610ebc57600080fd5b50565b610ec881610e22565b8114610ed357600080fd5b5056fea365627a7a72315820c2e4622f99aea025976965bc18df0b09f661c9cd382ae72ad2d6ef6c986c28b86c6578706572696d656e74616cf564736f6c634300050d0040"

// DeployRemoteBridge deploys a new Ethereum contract, binding an instance of RemoteBridge to it.
func DeployRemoteBridge(auth *bind.TransactOpts, backend bind.ContractBackend) (common.Address, *types.Transaction, *RemoteBridge, error) {
	parsed, err := abi.JSON(strings.NewReader(RemoteBridgeABI))
	if err != nil {
		return common.Address{}, nil, nil, err
	}

	address, tx, contract, err := bind.DeployContract(auth, parsed, common.FromHex(RemoteBridgeBin), backend)
	if err != nil {
		return common.Address{}, nil, nil, err
	}
	return address, tx, &RemoteBridge{RemoteBridgeCaller: RemoteBridgeCaller{contract: contract}, RemoteBridgeTransactor: RemoteBridgeTransactor{contract: contract}, RemoteBridgeFilterer: RemoteBridgeFilterer{contract: contract}}, nil
}

// RemoteBridge is an auto generated Go binding around an Ethereum contract.
type RemoteBridge struct {
	RemoteBridgeCaller     // Read-only binding to the contract
	RemoteBridgeTransactor // Write-only binding to the contract
	RemoteBridgeFilterer   // Log filterer for contract events
}

// RemoteBridgeCaller is an auto generated read-only Go binding around an Ethereum contract.
type RemoteBridgeCaller struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// RemoteBridgeTransactor is an auto generated write-only Go binding around an Ethereum contract.
type RemoteBridgeTransactor struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// RemoteBridgeFilterer is an auto generated log filtering Go binding around an Ethereum contract events.
type RemoteBridgeFilterer struct {
	contract *bind.BoundContract // Generic contract wrapper for the low level calls
}

// RemoteBridgeSession is an auto generated Go binding around an Ethereum contract,
// with pre-set call and transact options.
type RemoteBridgeSession struct {
	Contract     *RemoteBridge     // Generic contract binding to set the session for
	CallOpts     bind.CallOpts     // Call options to use throughout this session
	TransactOpts bind.TransactOpts // Transaction auth options to use throughout this session
}

// RemoteBridgeCallerSession is an auto generated read-only Go binding around an Ethereum contract,
// with pre-set call options.
type RemoteBridgeCallerSession struct {
	Contract *RemoteBridgeCaller // Generic contract caller binding to set the session for
	CallOpts bind.CallOpts       // Call options to use throughout this session
}

// RemoteBridgeTransactorSession is an auto generated write-only Go binding around an Ethereum contract,
// with pre-set transact options.
type RemoteBridgeTransactorSession struct {
	Contract     *RemoteBridgeTransactor // Generic contract transactor binding to set the session for
	TransactOpts bind.TransactOpts       // Transaction auth options to use throughout this session
}

// RemoteBridgeRaw is an auto generated low-level Go binding around an Ethereum contract.
type RemoteBridgeRaw struct {
	Contract *RemoteBridge // Generic contract binding to access the raw methods on
}

// RemoteBridgeCallerRaw is an auto generated low-level read-only Go binding around an Ethereum contract.
type RemoteBridgeCallerRaw struct {
	Contract *RemoteBridgeCaller // Generic read-only contract binding to access the raw methods on
}

// RemoteBridgeTransactorRaw is an auto generated low-level write-only Go binding around an Ethereum contract.
type RemoteBridgeTransactorRaw struct {
	Contract *RemoteBridgeTransactor // Generic write-only contract binding to access the raw methods on
}

// NewRemoteBridge creates a new instance of RemoteBridge, bound to a specific deployed contract.
func NewRemoteBridge(address common.Address, backend bind.ContractBackend) (*RemoteBridge, error) {
	contract, err := bindRemoteBridge(address, backend, backend, backend)
	if err != nil {
		return nil, err
	}
	return &RemoteBridge{RemoteBridgeCaller: RemoteBridgeCaller{contract: contract}, RemoteBridgeTransactor: RemoteBridgeTransactor{contract: contract}, RemoteBridgeFilterer: RemoteBridgeFilterer{contract: contract}}, nil
}

// NewRemoteBridgeCaller creates a new read-only instance of RemoteBridge, bound to a specific deployed contract.
func NewRemoteBridgeCaller(address common.Address, caller bind.ContractCaller) (*RemoteBridgeCaller, error) {
	contract, err := bindRemoteBridge(address, caller, nil, nil)
	if err != nil {
		return nil, err
	}
	return &RemoteBridgeCaller{contract: contract}, nil
}

// NewRemoteBridgeTransactor creates a new write-only instance of RemoteBridge, bound to a specific deployed contract.
func NewRemoteBridgeTransactor(address common.Address, transactor bind.ContractTransactor) (*RemoteBridgeTransactor, error) {
	contract, err := bindRemoteBridge(address, nil, transactor, nil)
	if err != nil {
		return nil, err
	}
	return &RemoteBridgeTransactor{contract: contract}, nil
}

// NewRemoteBridgeFilterer creates a new log filterer instance of RemoteBridge, bound to a specific deployed contract.
func NewRemoteBridgeFilterer(address common.Address, filterer bind.ContractFilterer) (*RemoteBridgeFilterer, error) {
	contract, err := bindRemoteBridge(address, nil, nil, filterer)
	if err != nil {
		return nil, err
	}
	return &RemoteBridgeFilterer{contract: contract}, nil
}

// bindRemoteBridge binds a generic wrapper to an already deployed contract.
func bindRemoteBridge(address common.Address, caller bind.ContractCaller, transactor bind.ContractTransactor, filterer bind.ContractFilterer) (*bind.BoundContract, error) {
	parsed, err := abi.JSON(strings.NewReader(RemoteBridgeABI))
	if err != nil {
		return nil, err
	}
	return bind.NewBoundContract(address, parsed, caller, transactor, filterer), nil
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_RemoteBridge *RemoteBridgeRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _RemoteBridge.Contract.RemoteBridgeCaller.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_RemoteBridge *RemoteBridgeRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _RemoteBridge.Contract.RemoteBridgeTransactor.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_RemoteBridge *RemoteBridgeRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _RemoteBridge.Contract.RemoteBridgeTransactor.contract.Transact(opts, method, params...)
}

// Call invokes the (constant) contract method with params as input values and
// sets the output to result. The result type might be a single field for simple
// returns, a slice of interfaces for anonymous returns and a struct for named
// returns.
func (_RemoteBridge *RemoteBridgeCallerRaw) Call(opts *bind.CallOpts, result interface{}, method string, params ...interface{}) error {
	return _RemoteBridge.Contract.contract.Call(opts, result, method, params...)
}

// Transfer initiates a plain transaction to move funds to the contract, calling
// its default method if one is available.
func (_RemoteBridge *RemoteBridgeTransactorRaw) Transfer(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _RemoteBridge.Contract.contract.Transfer(opts)
}

// Transact invokes the (paid) contract method with params as input values.
func (_RemoteBridge *RemoteBridgeTransactorRaw) Transact(opts *bind.TransactOpts, method string, params ...interface{}) (*types.Transaction, error) {
	return _RemoteBridge.Contract.contract.Transact(opts, method, params...)
}

// GetLastBlock is a free data retrieval call binding the contract method 0x7f2c4ca8.
//
// Solidity: function getLastBlock() constant returns(uint256)
func (_RemoteBridge *RemoteBridgeCaller) GetLastBlock(opts *bind.CallOpts) (*big.Int, error) {
	var (
		ret0 = new(*big.Int)
	)
	out := ret0
	err := _RemoteBridge.contract.Call(opts, out, "getLastBlock")
	return *ret0, err
}

// GetLastBlock is a free data retrieval call binding the contract method 0x7f2c4ca8.
//
// Solidity: function getLastBlock() constant returns(uint256)
func (_RemoteBridge *RemoteBridgeSession) GetLastBlock() (*big.Int, error) {
	return _RemoteBridge.Contract.GetLastBlock(&_RemoteBridge.CallOpts)
}

// GetLastBlock is a free data retrieval call binding the contract method 0x7f2c4ca8.
//
// Solidity: function getLastBlock() constant returns(uint256)
func (_RemoteBridge *RemoteBridgeCallerSession) GetLastBlock() (*big.Int, error) {
	return _RemoteBridge.Contract.GetLastBlock(&_RemoteBridge.CallOpts)
}

// IsOwner is a free data retrieval call binding the contract method 0x8f32d59b.
//
// Solidity: function isOwner() constant returns(bool)
func (_RemoteBridge *RemoteBridgeCaller) IsOwner(opts *bind.CallOpts) (bool, error) {
	var (
		ret0 = new(bool)
	)
	out := ret0
	err := _RemoteBridge.contract.Call(opts, out, "isOwner")
	return *ret0, err
}

// IsOwner is a free data retrieval call binding the contract method 0x8f32d59b.
//
// Solidity: function isOwner() constant returns(bool)
func (_RemoteBridge *RemoteBridgeSession) IsOwner() (bool, error) {
	return _RemoteBridge.Contract.IsOwner(&_RemoteBridge.CallOpts)
}

// IsOwner is a free data retrieval call binding the contract method 0x8f32d59b.
//
// Solidity: function isOwner() constant returns(bool)
func (_RemoteBridge *RemoteBridgeCallerSession) IsOwner() (bool, error) {
	return _RemoteBridge.Contract.IsOwner(&_RemoteBridge.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_RemoteBridge *RemoteBridgeCaller) Owner(opts *bind.CallOpts) (common.Address, error) {
	var (
		ret0 = new(common.Address)
	)
	out := ret0
	err := _RemoteBridge.contract.Call(opts, out, "owner")
	return *ret0, err
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_RemoteBridge *RemoteBridgeSession) Owner() (common.Address, error) {
	return _RemoteBridge.Contract.Owner(&_RemoteBridge.CallOpts)
}

// Owner is a free data retrieval call binding the contract method 0x8da5cb5b.
//
// Solidity: function owner() constant returns(address)
func (_RemoteBridge *RemoteBridgeCallerSession) Owner() (common.Address, error) {
	return _RemoteBridge.Contract.Owner(&_RemoteBridge.CallOpts)
}

// Transfers is a free data retrieval call binding the contract method 0x3c64f04b.
//
// Solidity: function transfers(bytes32 ) constant returns(bytes32 hash, address signer, uint64 nonce, bool exist)
func (_RemoteBridge *RemoteBridgeCaller) Transfers(opts *bind.CallOpts, arg0 [32]byte) (struct {
	Hash   [32]byte
	Signer common.Address
	Nonce  uint64
	Exist  bool
}, error) {
	ret := new(struct {
		Hash   [32]byte
		Signer common.Address
		Nonce  uint64
		Exist  bool
	})
	out := ret
	err := _RemoteBridge.contract.Call(opts, out, "transfers", arg0)
	return *ret, err
}

// Transfers is a free data retrieval call binding the contract method 0x3c64f04b.
//
// Solidity: function transfers(bytes32 ) constant returns(bytes32 hash, address signer, uint64 nonce, bool exist)
func (_RemoteBridge *RemoteBridgeSession) Transfers(arg0 [32]byte) (struct {
	Hash   [32]byte
	Signer common.Address
	Nonce  uint64
	Exist  bool
}, error) {
	return _RemoteBridge.Contract.Transfers(&_RemoteBridge.CallOpts, arg0)
}

// Transfers is a free data retrieval call binding the contract method 0x3c64f04b.
//
// Solidity: function transfers(bytes32 ) constant returns(bytes32 hash, address signer, uint64 nonce, bool exist)
func (_RemoteBridge *RemoteBridgeCallerSession) Transfers(arg0 [32]byte) (struct {
	Hash   [32]byte
	Signer common.Address
	Nonce  uint64
	Exist  bool
}, error) {
	return _RemoteBridge.Contract.Transfers(&_RemoteBridge.CallOpts, arg0)
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_RemoteBridge *RemoteBridgeCaller) Version(opts *bind.CallOpts) (string, error) {
	var (
		ret0 = new(string)
	)
	out := ret0
	err := _RemoteBridge.contract.Call(opts, out, "version")
	return *ret0, err
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_RemoteBridge *RemoteBridgeSession) Version() (string, error) {
	return _RemoteBridge.Contract.Version(&_RemoteBridge.CallOpts)
}

// Version is a free data retrieval call binding the contract method 0x54fd4d50.
//
// Solidity: function version() constant returns(string)
func (_RemoteBridge *RemoteBridgeCallerSession) Version() (string, error) {
	return _RemoteBridge.Contract.Version(&_RemoteBridge.CallOpts)
}

// Register is a paid mutator transaction binding the contract method 0xefcb64cb.
//
// Solidity: function register(bytes32 local, bytes32 remote, address signer, uint64 nonce) returns()
func (_RemoteBridge *RemoteBridgeTransactor) Register(opts *bind.TransactOpts, local [32]byte, remote [32]byte, signer common.Address, nonce uint64) (*types.Transaction, error) {
	return _RemoteBridge.contract.Transact(opts, "register", local, remote, signer, nonce)
}

// Register is a paid mutator transaction binding the contract method 0xefcb64cb.
//
// Solidity: function register(bytes32 local, bytes32 remote, address signer, uint64 nonce) returns()
func (_RemoteBridge *RemoteBridgeSession) Register(local [32]byte, remote [32]byte, signer common.Address, nonce uint64) (*types.Transaction, error) {
	return _RemoteBridge.Contract.Register(&_RemoteBridge.TransactOpts, local, remote, signer, nonce)
}

// Register is a paid mutator transaction binding the contract method 0xefcb64cb.
//
// Solidity: function register(bytes32 local, bytes32 remote, address signer, uint64 nonce) returns()
func (_RemoteBridge *RemoteBridgeTransactorSession) Register(local [32]byte, remote [32]byte, signer common.Address, nonce uint64) (*types.Transaction, error) {
	return _RemoteBridge.Contract.Register(&_RemoteBridge.TransactOpts, local, remote, signer, nonce)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_RemoteBridge *RemoteBridgeTransactor) RenounceOwnership(opts *bind.TransactOpts) (*types.Transaction, error) {
	return _RemoteBridge.contract.Transact(opts, "renounceOwnership")
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_RemoteBridge *RemoteBridgeSession) RenounceOwnership() (*types.Transaction, error) {
	return _RemoteBridge.Contract.RenounceOwnership(&_RemoteBridge.TransactOpts)
}

// RenounceOwnership is a paid mutator transaction binding the contract method 0x715018a6.
//
// Solidity: function renounceOwnership() returns()
func (_RemoteBridge *RemoteBridgeTransactorSession) RenounceOwnership() (*types.Transaction, error) {
	return _RemoteBridge.Contract.RenounceOwnership(&_RemoteBridge.TransactOpts)
}

// SetLastBlock is a paid mutator transaction binding the contract method 0x5d974a66.
//
// Solidity: function setLastBlock(uint256 lastBlock) returns()
func (_RemoteBridge *RemoteBridgeTransactor) SetLastBlock(opts *bind.TransactOpts, lastBlock *big.Int) (*types.Transaction, error) {
	return _RemoteBridge.contract.Transact(opts, "setLastBlock", lastBlock)
}

// SetLastBlock is a paid mutator transaction binding the contract method 0x5d974a66.
//
// Solidity: function setLastBlock(uint256 lastBlock) returns()
func (_RemoteBridge *RemoteBridgeSession) SetLastBlock(lastBlock *big.Int) (*types.Transaction, error) {
	return _RemoteBridge.Contract.SetLastBlock(&_RemoteBridge.TransactOpts, lastBlock)
}

// SetLastBlock is a paid mutator transaction binding the contract method 0x5d974a66.
//
// Solidity: function setLastBlock(uint256 lastBlock) returns()
func (_RemoteBridge *RemoteBridgeTransactorSession) SetLastBlock(lastBlock *big.Int) (*types.Transaction, error) {
	return _RemoteBridge.Contract.SetLastBlock(&_RemoteBridge.TransactOpts, lastBlock)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_RemoteBridge *RemoteBridgeTransactor) TransferOwnership(opts *bind.TransactOpts, newOwner common.Address) (*types.Transaction, error) {
	return _RemoteBridge.contract.Transact(opts, "transferOwnership", newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_RemoteBridge *RemoteBridgeSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _RemoteBridge.Contract.TransferOwnership(&_RemoteBridge.TransactOpts, newOwner)
}

// TransferOwnership is a paid mutator transaction binding the contract method 0xf2fde38b.
//
// Solidity: function transferOwnership(address newOwner) returns()
func (_RemoteBridge *RemoteBridgeTransactorSession) TransferOwnership(newOwner common.Address) (*types.Transaction, error) {
	return _RemoteBridge.Contract.TransferOwnership(&_RemoteBridge.TransactOpts, newOwner)
}

// Update is a paid mutator transaction binding the contract method 0x13f57c3e.
//
// Solidity: function update(bytes32 local, bytes32 remote) returns()
func (_RemoteBridge *RemoteBridgeTransactor) Update(opts *bind.TransactOpts, local [32]byte, remote [32]byte) (*types.Transaction, error) {
	return _RemoteBridge.contract.Transact(opts, "update", local, remote)
}

// Update is a paid mutator transaction binding the contract method 0x13f57c3e.
//
// Solidity: function update(bytes32 local, bytes32 remote) returns()
func (_RemoteBridge *RemoteBridgeSession) Update(local [32]byte, remote [32]byte) (*types.Transaction, error) {
	return _RemoteBridge.Contract.Update(&_RemoteBridge.TransactOpts, local, remote)
}

// Update is a paid mutator transaction binding the contract method 0x13f57c3e.
//
// Solidity: function update(bytes32 local, bytes32 remote) returns()
func (_RemoteBridge *RemoteBridgeTransactorSession) Update(local [32]byte, remote [32]byte) (*types.Transaction, error) {
	return _RemoteBridge.Contract.Update(&_RemoteBridge.TransactOpts, local, remote)
}

// RemoteBridgeOwnershipTransferredIterator is returned from FilterOwnershipTransferred and is used to iterate over the raw logs and unpacked data for OwnershipTransferred events raised by the RemoteBridge contract.
type RemoteBridgeOwnershipTransferredIterator struct {
	Event *RemoteBridgeOwnershipTransferred // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *RemoteBridgeOwnershipTransferredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(RemoteBridgeOwnershipTransferred)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(RemoteBridgeOwnershipTransferred)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *RemoteBridgeOwnershipTransferredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *RemoteBridgeOwnershipTransferredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// RemoteBridgeOwnershipTransferred represents a OwnershipTransferred event raised by the RemoteBridge contract.
type RemoteBridgeOwnershipTransferred struct {
	PreviousOwner common.Address
	NewOwner      common.Address
	Raw           types.Log // Blockchain specific contextual infos
}

// FilterOwnershipTransferred is a free log retrieval operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_RemoteBridge *RemoteBridgeFilterer) FilterOwnershipTransferred(opts *bind.FilterOpts, previousOwner []common.Address, newOwner []common.Address) (*RemoteBridgeOwnershipTransferredIterator, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _RemoteBridge.contract.FilterLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return &RemoteBridgeOwnershipTransferredIterator{contract: _RemoteBridge.contract, event: "OwnershipTransferred", logs: logs, sub: sub}, nil
}

// WatchOwnershipTransferred is a free log subscription operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_RemoteBridge *RemoteBridgeFilterer) WatchOwnershipTransferred(opts *bind.WatchOpts, sink chan<- *RemoteBridgeOwnershipTransferred, previousOwner []common.Address, newOwner []common.Address) (event.Subscription, error) {

	var previousOwnerRule []interface{}
	for _, previousOwnerItem := range previousOwner {
		previousOwnerRule = append(previousOwnerRule, previousOwnerItem)
	}
	var newOwnerRule []interface{}
	for _, newOwnerItem := range newOwner {
		newOwnerRule = append(newOwnerRule, newOwnerItem)
	}

	logs, sub, err := _RemoteBridge.contract.WatchLogs(opts, "OwnershipTransferred", previousOwnerRule, newOwnerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(RemoteBridgeOwnershipTransferred)
				if err := _RemoteBridge.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseOwnershipTransferred is a log parse operation binding the contract event 0x8be0079c531659141344cd1fd0a4f28419497f9722a3daafe3b4186f6b6457e0.
//
// Solidity: event OwnershipTransferred(address indexed previousOwner, address indexed newOwner)
func (_RemoteBridge *RemoteBridgeFilterer) ParseOwnershipTransferred(log types.Log) (*RemoteBridgeOwnershipTransferred, error) {
	event := new(RemoteBridgeOwnershipTransferred)
	if err := _RemoteBridge.contract.UnpackLog(event, "OwnershipTransferred", log); err != nil {
		return nil, err
	}
	return event, nil
}

// RemoteBridgeTransferRegisteredIterator is returned from FilterTransferRegistered and is used to iterate over the raw logs and unpacked data for TransferRegistered events raised by the RemoteBridge contract.
type RemoteBridgeTransferRegisteredIterator struct {
	Event *RemoteBridgeTransferRegistered // Event containing the contract specifics and raw log

	contract *bind.BoundContract // Generic contract to use for unpacking event data
	event    string              // Event name to use for unpacking event data

	logs chan types.Log        // Log channel receiving the found contract events
	sub  ethereum.Subscription // Subscription for errors, completion and termination
	done bool                  // Whether the subscription completed delivering logs
	fail error                 // Occurred error to stop iteration
}

// Next advances the iterator to the subsequent event, returning whether there
// are any more events found. In case of a retrieval or parsing error, false is
// returned and Error() can be queried for the exact failure.
func (it *RemoteBridgeTransferRegisteredIterator) Next() bool {
	// If the iterator failed, stop iterating
	if it.fail != nil {
		return false
	}
	// If the iterator completed, deliver directly whatever's available
	if it.done {
		select {
		case log := <-it.logs:
			it.Event = new(RemoteBridgeTransferRegistered)
			if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
				it.fail = err
				return false
			}
			it.Event.Raw = log
			return true

		default:
			return false
		}
	}
	// Iterator still in progress, wait for either a data or an error event
	select {
	case log := <-it.logs:
		it.Event = new(RemoteBridgeTransferRegistered)
		if err := it.contract.UnpackLog(it.Event, it.event, log); err != nil {
			it.fail = err
			return false
		}
		it.Event.Raw = log
		return true

	case err := <-it.sub.Err():
		it.done = true
		it.fail = err
		return it.Next()
	}
}

// Error returns any retrieval or parsing error occurred during filtering.
func (it *RemoteBridgeTransferRegisteredIterator) Error() error {
	return it.fail
}

// Close terminates the iteration process, releasing any pending underlying
// resources.
func (it *RemoteBridgeTransferRegisteredIterator) Close() error {
	it.sub.Unsubscribe()
	return nil
}

// RemoteBridgeTransferRegistered represents a TransferRegistered event raised by the RemoteBridge contract.
type RemoteBridgeTransferRegistered struct {
	Hash   [32]byte
	Signer common.Address
	Nonce  uint64
	Raw    types.Log // Blockchain specific contextual infos
}

// FilterTransferRegistered is a free log retrieval operation binding the contract event 0xf323e3760341eb70d636a6304f7927d4ba8c42e4e8777d908098205ad3c8f49c.
//
// Solidity: event TransferRegistered(bytes32 indexed hash, address indexed signer, uint64 nonce)
func (_RemoteBridge *RemoteBridgeFilterer) FilterTransferRegistered(opts *bind.FilterOpts, hash [][32]byte, signer []common.Address) (*RemoteBridgeTransferRegisteredIterator, error) {

	var hashRule []interface{}
	for _, hashItem := range hash {
		hashRule = append(hashRule, hashItem)
	}
	var signerRule []interface{}
	for _, signerItem := range signer {
		signerRule = append(signerRule, signerItem)
	}

	logs, sub, err := _RemoteBridge.contract.FilterLogs(opts, "TransferRegistered", hashRule, signerRule)
	if err != nil {
		return nil, err
	}
	return &RemoteBridgeTransferRegisteredIterator{contract: _RemoteBridge.contract, event: "TransferRegistered", logs: logs, sub: sub}, nil
}

// WatchTransferRegistered is a free log subscription operation binding the contract event 0xf323e3760341eb70d636a6304f7927d4ba8c42e4e8777d908098205ad3c8f49c.
//
// Solidity: event TransferRegistered(bytes32 indexed hash, address indexed signer, uint64 nonce)
func (_RemoteBridge *RemoteBridgeFilterer) WatchTransferRegistered(opts *bind.WatchOpts, sink chan<- *RemoteBridgeTransferRegistered, hash [][32]byte, signer []common.Address) (event.Subscription, error) {

	var hashRule []interface{}
	for _, hashItem := range hash {
		hashRule = append(hashRule, hashItem)
	}
	var signerRule []interface{}
	for _, signerItem := range signer {
		signerRule = append(signerRule, signerItem)
	}

	logs, sub, err := _RemoteBridge.contract.WatchLogs(opts, "TransferRegistered", hashRule, signerRule)
	if err != nil {
		return nil, err
	}
	return event.NewSubscription(func(quit <-chan struct{}) error {
		defer sub.Unsubscribe()
		for {
			select {
			case log := <-logs:
				// New log arrived, parse the event and forward to the user
				event := new(RemoteBridgeTransferRegistered)
				if err := _RemoteBridge.contract.UnpackLog(event, "TransferRegistered", log); err != nil {
					return err
				}
				event.Raw = log

				select {
				case sink <- event:
				case err := <-sub.Err():
					return err
				case <-quit:
					return nil
				}
			case err := <-sub.Err():
				return err
			case <-quit:
				return nil
			}
		}
	}), nil
}

// ParseTransferRegistered is a log parse operation binding the contract event 0xf323e3760341eb70d636a6304f7927d4ba8c42e4e8777d908098205ad3c8f49c.
//
// Solidity: event TransferRegistered(bytes32 indexed hash, address indexed signer, uint64 nonce)
func (_RemoteBridge *RemoteBridgeFilterer) ParseTransferRegistered(log types.Log) (*RemoteBridgeTransferRegistered, error) {
	event := new(RemoteBridgeTransferRegistered)
	if err := _RemoteBridge.contract.UnpackLog(event, "TransferRegistered", log); err != nil {
		return nil, err
	}
	return event, nil
}
