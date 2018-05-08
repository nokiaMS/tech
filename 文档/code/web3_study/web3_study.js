#!/usr/bin/node

const Web3 = require('web3')

//if object web3 has not been created, then we create it. if not, we should re-use the old one.
if(typeof web3 !== 'undefined') {
	web3 = new Web3(web3.currentProvider)
} else {
	web3 = new Web3(new Web3.providers.HttpProvider("http://localhost:10001"))
}



