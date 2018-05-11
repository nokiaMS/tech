# 文档链接 #
原理介绍 [https://github.com/ethereum/EIPs/issues/650](https://github.com/ethereum/EIPs/issues/650)

## 1. **istanbul BFT全名:**  ##
	1. Istanbul byzantine fault tolerant consensus protocol.
## 2. **IBFT中的几个概念:** ##
	1. validator: 挖矿(块验证)的参与者.
	2. proposer: 在validators中被选出来的节点,这个节点提供要添加的块进行IBFT协商.
	3. Round: 一个round开始于提议者创建一个区块提议,结束于块被提交或者round改变.
	4. Proposal: 新块产生提议.用于IBFT的共识协商.协商通过的块会被添加到区块链中.
	5. Sequence: 提议的序列号. 新提议的序列号需要大于之前所有的提议的序列号. 当前每一个提议的区块的高度就是与这个区块相关联的序列号.
	6. Backlog: 用来保持将来的共识消息的存储.
	7. Round state: round的状态有三种, pre-prepare, prepare和commit.
	8. Consensus proof: 块的提交签名. 这个提交签名能够证明块经过了共识的过程.
	9. snapshot: 最后一个epoch的validator投票状态.
	
## 3. IBFT的三阶段提交 ##
	1. Istanbul BFT inherits from the original PBFT by using 3-phase consensus, PRE-PREPARE, PREPARE, and COMMIT.
	(Istanbul BFT继承自PBFT,也使用3阶段提交,PRE-PREPARE, PREPARE,COMMIT)
	 The system can tolerate at most of F faulty nodes in a N validator nodes network, where N = 3F + 1.
	(系统能够容忍最多F个错误节点,如果有N=3F+1个validators的话.) 
	2. Before each round, the validators will pick one of them as the proposer, by default, in a round robin fashion 
	(在每个round开始之前,这些validators会选出他们中的一个作为proposer, 默认使用round robin方式选择proposer). 
	3. The proposer will then propose a new block proposal and broadcast it along with the PRE-PREPARE message
	(proposer然后提出一个新块提议并且在PRE-PREPARE消息中广播这个块提议). 
	4. Upon receiving the PRE-PREPARE message from the proposer, 
	   validators enter the state of PRE-PREPARED and then broadcast PREPARE message
	   (一旦收到PRE-PREPARE消息后,那么这个validator就会进入到PRE-PREPARED状态,然后广播PREPARE消息). 
	5. This step is to make sure all validators are working on the same sequence and the same round
	(这个步骤主要用来保证所有的validators都工作在相同的sequence和相同的round之下). 
	6. While receiving 2F + 1 of PREPARE messages, the validator enters the state of PREPARED and then broadcasts COMMIT message
	(当收到2F+1个PREPARE消息之后,validator就进入到了PREPARED状态然后广播COMMIT消息). 
	7. This step is to inform its peers that it accepts the proposed block and is going to insert the block to the chain. Lastly, 
	   validators wait for 2F + 1 of COMMIT messages to enter COMMITTED state and then insert the block to the chain. 
	(这个步骤用来通知它的对端它接受了被提议的块并且准备把这个块插入到链中. validators等待2F+1个COMMIT消息,然后进入到COMMITTED状态,然后把块插入到链中.)
## 4. 防止链分叉 ##
	1. Blocks in Istanbul BFT protocol are final, 
	   which means that there are no forks and any valid block must be somewhere in the main chain. 
	   To prevent a faulty node from generating a totally different chain from the main chain, 
	   each validator appends 2F + 1 received COMMIT signatures to extraData field in the header before inserting it into the chain.
	(为了防止链分叉,每个validator都会把接收到的2F+1个COMMIT签名附加到块头的extraData域中,然后才把块插入到链中.所以说采用IBFT的链是不会分叉的.)
   	3. Thus blocks are self-verifiable and light client can be supported as well. 
   	   However, the dynamic extraData would cause an issue on block hash calculation. 
       Since the same block from different validators can have different set of COMMIT signatures, 
       the same block can have different block hashes as well. 
       To solve this, we calculate the block hash by excluding the COMMIT signatures part. 
       Therefore, we can still keep the block/block hash consistency as well as put the consensus proof in the block header.
   	 (把consensus proof添加到块头中会导致不同的validator的相同的块的hash计算的值不同,
      为了解决这个问题,IBFT中在计算块头的hash的时候并没有包含consensus proof部分的数据,
      因此各个节点中虽然consensus proof部分不同,但是计算出来的block hash还是一样的.)

## 5. 共识状态 ##
	1. IBFT是一个状态机复本算法.为了达到块共识,每个validator都会维护一个状态机复本.
	2. 状态机的几个状态如下:
		1. NEW ROUND: 
		   在这个状态中,首先会选出一个proposer, 
           proposer从它自己的txpool中收集交易,然后提出一个新的块提议(block proposal),
           然后把这个block proposal广播给validators,然后proposer就进入到了PRE-PREPARED状态.
           而其余的validators等待PRE-PREPARE消息,直到收到了一个PRE-PREPARE消息之后才会进入到PRE-PREPARE状态.
		2. PRE-PREPARED:
		   当validator收到了一个PRE-PREPARE消息之后,状态机就会进入到这个状态,然后发送PREPARE消息. 
           发送了PREPARE消息之后, validator会等待2F+1个PREPARE消息,当收到2F+1个PREPARE消息之后,
           validaotr就进入到了PREPARED状态.
		3. PREPARED: 
		   当validator收到2F+1个PREPARE消息之后, validator进入到PREPARED状态,然后广播COMMIT消息. 
           validator广播COMMIT消息之后等待2F+1个来自其他validator的COMMIT消息.
		4. COMMITTED: 
		   validator收到2F+1个COMMIT消息之后会进入到COMMITTED状态,validator进入到COMMITTED状态之后首先把收
           到的2F+1个commitment signatures附加到块的extraData中,然后执行把提议的块插入到本地的链中的操作.
		5. FINAL_COMMITTED: 
		   当块被成功的插入到了本地的链中之后validator就进入到了FINAL_COMMITTED状态. 
           从分析代码看出,在FINAL_COMMITTED状态时, 代码通过调用newRound()函数自动进入到NEW ROUND,开始新的一轮round
           (不需要等待任何广播消息).
		6. ROUND CHAGNE: 
		   在程序出现问题的时候(比如超时或者块插入失败)的时候状态机才会进入到ROUND CHAGNE状态,
           如果程序运行一切正常,那么状态机不会进入到ROUND CHANGE状态. 在ROUND CHAGNE状态的时候,
           validator等待2F+1个具有同样proposed round number编码的ROUND CHANGE消息后,
           状态机从ROUND CHAGNE状态转换到NEW ROUND状态.
		
## 6. Proposer选择  ##

	1. 目前支持两种proposer选择策略: 
		round robin和sticky proposer. 
		在round robin中每个块或者每个round change中proposer都会发生变化. 
		在sticky proposer中, 当round change发生的时候proposer会发生变化,否则不会发生变化.
	
## 7. Future message和backlog ##
	1. 什么是future message?
		- future message就是在当前的状态收到的应该在后续状态才应该收到的消息,
		  比如说在new round状态收到了COMMIT消息.我们就把这种消息叫做future message.
		- 当一个validator收到了future message的时候,它会把这个future message暂存到backlog中,然后在将来合适的时候进行处理.
## 8. 共识算法的一个优化 ##
	1. 为了加快共识过程的速度,一个validator如果在收到2F+1个PREPARE消息之前收到了2F+1个COMMIT消息,
	   那么状态机直接就会跳转到COMMITTED状态,这样这个validator就不需要再继续等待PREPARE消息了.
## 9. 常量 ##
	1. EPOCH_LENGTH: 经过多少个块之后检查并重置pending votes. 建议30000.
	2. REQUEST_TIMEOUT: 发送round change消息并转换到ROUND CHANGE状态的定时器超时事件.
	3. BLOCK_PERIOD: 两个块之间的最小时间间隔,以秒为单位.
	4. PROPOSER_POLICY: proposer选择策略.
	5. ISTANBUL_DIGEST: IBFT魔术字.
	6. DEFAULT_DIFFICULTY: 默认的出块难度, 默认值为0x0000000000000001.
	7. EXTRA_VANITY: 给proposer vanity预留的固定长度的extra-data前缀. 建议32个字节.
	8. NONCE_AUTH: 投票添加一个validator时候使用的魔术字.
	9. NONCE_DROP: 投票删除一个validator时候使用的魔术字.
	10. UNCLE_HASH: uuncles在POW算法之外是没有意义的所以此值总是设置为Keccak256(RLP[])
	11. PREPREPARE_MSG_CODE: PREPREPARE消息代码,0
	12. COMMIT_MSG_CODE: COMMIT消息代码,1
	13. ROUND_CHANGE_MSG_CODE: ROUND CHANGE消息代码,2
	14. BLOCK_NUMBER: 链上块的高度,genesis block的块高度是0.
	15. N: 被授权的validator数量.
	16. F: 允许的出错validator数量.
	17. VALIDATOR_INDEX: block validator索引.
	18. VALIDATOR_LIMIT: 通过或者不通过proposal的validator验证数量,为了保持链上的"多数共识",这个值必须要至少大于等于floor(N/2)+1

## 10. block header ##
	
	1. timestamp: 至少要大于等于 parent timestamp + BLOCK_PERIOD
	2. difficulty: 必须填入0x0000000000000001
	3. extraData: 包含三部分内容, validator list, proposer seal, committed seal.
	4. 共识证明: 
	       Before inserting a block into the blockchain, each validator needs to collect 2F + 1 of 
       committed seals from other validators to compose a consensus proof. Once it receives enough 
       committed seals, it will fill the CommittedSeal in IstanbulExtra, recalculate the extraData, 
       and then insert the block into the blockchain. Note that since committed seals can differ by 
       different sources, we exclude that part while calculating the block hash as in the previous 
       section.
## 11. 块锁机制 ##
	1. 块锁机制为了解决安全问题. 当一个proposer在高度H,块B的时候被锁住的话,他只能提交"高度H,块B"的提议. 
	   另一方面, 当一个validator被锁住的话,他只能对"高度H,块B"进行投票.
	2. 加锁和解锁
		1. 加锁: 当validator收到2F+1个PREPARE消息,那么这个validator被锁定在当前的高度H,块B上.
		2. 解锁: 当validator不能把块B插入到链中的时候,那个这个时候validator再高度H,块B上被解锁.
	
## 12. Gossip network ##
		

	- Traditionally, validators need to be strongly connected in order to reach stable consensus results, which means all validators need 
	  to be connected directly to each other; however, in practical network environment, stable and constant p2p connections are hard to 
      achieve. To resolve this issue, Istanbul BFT implements gossip network to overcome this constrain. 
      In a gossip network environment, all validators only need to be weakly connected, which means any two validators are seen connected 
      when either they are directly connected or they are connected with one or more validators in between. Consensus messages will be 
      relayed between validators.
## 13. Nodekey和validator ##

	为了成为一个validator, 一个节点需要满足一下的条件:

	1. 挖矿使用的账户(账户地址是从nodekey中产生出来的)需要在genesis.json的extraData域中列出,或者经过动态添加方式添加到validators中.
	2. 用节点的nodekey作为私钥来对共识消息进行签名.
## 14. IBFT的产生背景 ##
	1. IBFT的产生背景来自于为银行构建区块链时的挑战. 
	   我们选择ethereum作为基本协议是因为它的智能合约能力. 
       然后,对于要求延迟低的场景其内置的POW共识算法并不是理想的选择.
	2. 银行系统意图实现一个私链或者联盟链用来运行他们的应用.PBFT是一个理想的选择. 
	   这样的场景需要一个高度的可控性及更高的吞吐率, 
       公链上的分布式POW的有点在私链和联盟脸上已经变成了一个缺点或者一个劣势. 
       另一方面, PBFT环境中采用"指定的validators"这种方式,这种方式在私链和联盟链中运行的比较好.
## 15. IBFT的几个常见问题. ##
### 1. 在IBFT算法中使用GAS还需要么? ###
		1. 需要gas来阻止代码的无限循环及任何虚拟机的无限制消耗.
###	2. 在联盟链中,支持gas还有意义么? ###
		1. 	The network would be vulnerable if every account has unlimited gas or unlimited transaction sending power. However, to enable so, one can run all validators with gas price flag --gasprice 0 to accept gas price at zero.
		    (如果每个账户都有无限的发送交易的能力或者有无限的gas,那么这个网络是容易受到攻击的. 然而,如果你确实想要这么做, 那么你可以按照如下的方式运行所有node, 在启动gwan的时候添加参数--gasprice 0,这样就可以接受gasprice为0的交易了.)

----------
# 问题 #
1. 在4中,为什么IBFT能够防止链的分叉?
2. VALIDATOR_LIMIT的用处.
3. BLOCK_PERIOD会不会影响出块的速度?
4. DEFAULT_DIFFICULTY怎么影响出块速度?
5. --gasprice 0 这个设置有效么?怎么用的.