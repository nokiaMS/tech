# web3.js APIs链接 #
web3.js version 0.2x.x APIs: [https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-methods](https://github.com/ethereum/wiki/wiki/JavaScript-API#contract-methods)

we3.js version 1.0 APIs: [https://web3js.readthedocs.io/en/1.0/index.html](https://web3js.readthedocs.io/en/1.0/index.html)

# Tips #
1. As this API is designed to work with a local RPC node, all its functions use synchronous HTTP requests by default. If you want to make an asynchronous request, you can pass an optional callback as the last parameter to most functions.All callbacks are using an error first callback style: (web3.js APIs主要是用来与本地的节点进行同行的,因此设计成了默认是同步调用的模式. 如果想使用异步的方式来调用API, 那么可以用函数的最后一个参数传递一个回调函数给被调用的函数.所以回调函数都是使用的的错误在前的回调方式)

    	web3.eth.getBlock(48, function(error, result){
    		if(!error)
    			console.log(JSON.stringify(result));
    		else
    		console.error(error);
    	})      //参数中的function(error, result){...}为异步调用方式中的回调函数.

2. 可以以批量请求的方式来执行代码. 批量请求方式不会使得单个请求的执行更快,但是能够提高并发度.
   	
    	var batch = web3.createBatch();  //创建batch
    	batch.add(web3.eth.getBalance.request('0x0000000000000000000000000000000000000000', 'latest', callback));  
   		batch.add(web3.eth.Contract(abi).at(address).balance.request(address, callback2));
    	batch.execute();   //执行batch
3. 
