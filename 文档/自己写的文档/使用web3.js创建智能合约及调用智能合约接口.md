# 使用web3.js接口创建智能合约及调用智能合约接口 #
**1. 初始化node**

	1. 首先系统需要安装node.js及npm.
	2. 安装完成之后在任意文件夹下执行命令如下:
		mkdir web3test
		cd web3test
		npm init 	//初始化node文件夹.
		npm install web3 --save		//在安装的时候需要注意目前web3有两个版本,一个是0.20版本,另外一个是1.0.0版本,两个版本的api接口不同,具体不同查看github.com上的web3.js说明.
									//如何通过npm安装指定版本的软件: npm install web3@0.20.6
	3. 查看已经安装的web3的版本.
		1. 可以通过web3.js的命令来查看.
		2. 也可以进入到文件夹node_modules,打开package.json文件查看web3的版本.
			`root@ubuntu:~/test/web3test# pwd
			/root/test/web3test
			root@ubuntu:~/test/web3test# cat package.json 
			{
  				"name": "web3test",
  				"version": "1.0.0",
  				"description": "",
  				"main": "index.js",
  				"scripts": {
    			"test": "echo \"Error: no test specified\" && exit 1"
  			},
  			"author": "",
  			"license": "ISC",
  			"dependencies": {
    			"solc": "^0.4.23",
    			"web3": "^0.20.6"		//web3模块版本.
  				}
			}
			root@ubuntu:~/test/web3test# 
			`

## 创建一个合约 ##
	合约内容如下:

		`root@ubuntu:~/test/web3test# cat contract.sol 
		 pragma solidity ^0.4.0;

		 contract HelloWorldContract {
		 function sayHi() constant returns (string) {
			 return "Hello World.";
		 	}
		 }
		 root@ubuntu:~/test/web3test# 
		 `

## 编译及发布合约 ##

    root@ubuntu:~/test/web3test# cat compileDeploy.js 
    const fs = require('fs');
    const solc = require('solc');
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:10001"));
    const input = fs.readFileSync('contract.sol');
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':HelloWorldContract'].bytecode;
    const abi = output.contracts[':HelloWorldContract'].interface;
    const helloWorldContract = web3.eth.contract(JSON.parse(abi));
    console.log("Unlocking coinbase account.");
    console.log("web3 version is: " + web3.version.api);
    try {
    	web3.personal.unlockAccount("0xe353a5d9907cd806eac46a6476f3c464e91d8209","123456",3000);
    } catch(e) {
    	console.log(e);
    	return;
    }
    
    console.log("Deploying the contract.");
    
    const helloWorldContractInstance = helloWorldContract.new({
    	data: '0x' + bytecode,
    	from: "0xe353a5d9907cd806eac46a6476f3c464e91d8209",
    	gas: 2000000
    	}, (err, res) => {
    	if(err) {
    		console.log(err);
    		return;
    	}
    	console.log(res.transactionHash);
    	if(res.address) {
    		console.log('Contract address: ' + res.address);
    	}
    });
    
    root@ubuntu:~/test/web3test# 

合约如果正确发布会打印如下信息:

    0x1059b0f616eb66a9ca8a376cad295a6dbc1322bfcf01c2be51d70e2b6e238d89  //交易hash.
    0x1059b0f616eb66a9ca8a376cad295a6dbc1322bfcf01c2be51d70e2b6e238d89
    Contract address: 0x4e71f9d0d835fbd4e479ec723baef7d591dc89b3		//合约地址.
    root@ubuntu:~/test/web3test#
    
## 使用已经发布的合约中的函数 ##
    const fs = require('fs');
    const solc = require('solc');
    const Web3 = require('web3');
    const web3 = new Web3(new Web3.providers.HttpProvider("http://127.0.0.1:10001"));
    const input = fs.readFileSync('contract.sol');
    const output = solc.compile(input.toString(), 1);
    const bytecode = output.contracts[':HelloWorldContract'].bytecode;
    const abi = output.contracts[':HelloWorldContract'].interface;
    try {
    web3.personal.unlockAccount("0xe353a5d9907cd806eac46a6476f3c464e91d8209","123456",3000);
    } catch(e) {
    console.log(e);
    return;
    }
    
    const hwContract = web3.eth.contract(JSON.parse(abi)); //通过abi创建合约对象.
    const hwContractInstance = hwContract.at('0x5891f87b2080140e65fb7fba676500c0964b1b53'); //根据地址获取部署的合约实例.
    console.log(hwContractInstance.sayHi.call());  //合约函数调用.

合约正常调用后打印如下信息:

    Hello World.
    root@ubuntu:~/test/web3test# 

打印了Hello World.说明合约中的函数sayHi()被正确调用了.

## 注意 ##
	在部署合约及执行合约中的函数的时候必须有挖矿节点正在挖矿,值有交易被真正的挖出来且被正确打包到区块链上一个交易才算真正有效.
	
---- END ----

