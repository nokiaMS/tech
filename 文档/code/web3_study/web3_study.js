#!/usr/bin/node

const Web3 = require('web3')

//if object web3 has not been created, then we create it. if not, we should re-use the old one.
if(typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider)
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:10000"))
}

//version.
var version = web3.version
console.log(version.api)  //0.20.6     //do not need "--rpcapi version"
console.log(version.node) //return the client/node version: gwan/v1.0.4-wan-5f686911/linux-amd64/go1.10  //do not need "--rpcapi version"
console.log(version.network) //return the network protocl version  //Need "--rpcapi version"
console.log(version.ethereum) //Need "--rpcapi version"
//console.log(version1.whisper)  //Need "--rpcapi version"

console.log("isConnected: " + web3.isConnected()) //if a connection to a node exists.

//(done) net  "--rpcapi net" is MUST.
var net = web3.net
console.log("isListening: " + net.listening)
console.log(net.peerCount)

//eth "--rpcapi eth" is MUST.
var eth = web3.eth
console.log(eth.defaultAccount)
console.log(eth.defaultBlock)
console.log(eth.syncing) //whether the node is syncing or not.
console.log(eth.coinbase)
console.log("is mining: " + eth.mining)
console.log(eth.hashrate) //seem this attribute is only valid on PoW, but not valid on IBFT, right?
console.log(eth.gasPrice.toString(10))
console.log(eth.accounts)
console.log(eth.blockNumber)
//console.log(eth.register)
//console.log(eth.unRegister)
console.log(eth.getBalance('0xe353a5d9907cd806eac46a6476f3c464e91d8209').toString(10))
//eth.getStorageAt()
//eth.getCode()
console.log(eth.getBlock(0)) //return a block matching the block number or block hash.
//eth.getBlockTransactionCount    //continue.

