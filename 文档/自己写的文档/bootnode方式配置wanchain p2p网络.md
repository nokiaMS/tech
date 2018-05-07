# wanchain用bootnode方式建立p2p网络 #
1. 在窗口1启动bootnode

	`root@ubuntu:~/go/bft_v101_nodes/node4# /root/go/src/github.com/wanchain/go-wanchain/build/bin/bootnode -nodekey=prv.key`
2. 启动窗口2
	1. 初始化node
	
		`root@ubuntu:~/go/bft_v101_nodes/node1# /root/go/src/github.com/wanchain/go-wanchain/build/bin/gwan --datadir "./" --nodekey ./prv.key init ./genesis.json`
	2. 启动node
	
		`root@ubuntu:~/go/bft_v101_nodes/node1# /root/go/src/github.com/wanchain/go-wanchain/build/bin/gwan --datadir "./" --nodekey ./prv.key --networkid 168 --port 40001 --bootnodes enode://caed6f01ac300c8a0834e53ee0afd5363977be178910bd2c7793985f38024a59665d9879dd7b03c2bffdfeb89979d0bb4a282de5d6f948870f4f337eeeb8254f@192.168.138.136:30301 console`

		(在实际使用中发现,bootnode的地址必须写机器的外网地址,如果写127.0.0.1或者[::]都不能发现节点.)
3. 在窗口3启动另外一个节点,按照步骤2进行配置.
4. 两个节点启动完成之后,在console上执行命令,发现peer数为1.

	` > net.peerCount`

	 (结果为1.)

# 以static node方式配置p2p网络 #

在节点的数据文件夹添加静态节点配置文件 static-nodes.json

文件内容如下:

    root@ubuntu:~/go/bft_static_node/node1# cat static-nodes.json 
    [
    "enode://77a5bc672c0d882a3a0a9f3699820c609ad83a46f9492cb8c98479de7e591ddb425d44642e8e60a4c47a080e334002d64777d56e0527578bf4cc92f89a0588cd@[::]:40001?discport=0",
    "enode://c8fba9784ed125b339a7268643911a2ea46c32d5230d7ad276ae42aa5fe3e05702c80c3c8a584633ca7bcea826fade6d284de9a3910f3e1eaaef7f25a6ebb4da@[::]:40002?discport=0",
    "enode://42fdd28ee7f63e8a8ea5192768e1508313689b981c55788da0ad852e5fd96a237ca9d878b738a37ba265500919d299f7e2d4237e4b6167de77d83c219834fb7f@[::]:40003?discport=0",
    "enode://caed6f01ac300c8a0834e53ee0afd5363977be178910bd2c7793985f38024a59665d9879dd7b03c2bffdfeb89979d0bb4a282de5d6f948870f4f337eeeb8254f@[::]:40004?discport=0"
    ]
    root@ubuntu:~/go/bft_static_node/node1# 

---- END ----

