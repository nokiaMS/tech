#!/usr/bin/node

const Web3 = require('web3')

//if object web3 has not been created, then we create it. if not, we should re-use the old one.
if(typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider)
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:50001"))
}

if(web3.isConnected() !== true) {
	console.log("Can not connect to web3 server.")
	return
}

//Connected to web3 server.
var eth = web3.eth
var oldBlockNum = eth.blockNumber

//Show the result of one minutes.
function getResult() {
	var curBlockNum = eth.blockNumber
	console.log("Blocks per minute: " + (curBlockNum - oldBlockNum))
	oldBlockNum = curBlockNum	
}

//Get the count of blocked per minute.
setInterval(getResult,60*1000)

