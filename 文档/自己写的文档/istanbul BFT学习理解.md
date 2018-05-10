# 文档链接 #
原理介绍 [https://github.com/ethereum/EIPs/issues/650](https://github.com/ethereum/EIPs/issues/650)

1. **istanbul BFT全名:** Istanbul byzantine fault tolerant consensus protocol.
2. **IBFT中的几个概念:**
	1. validator: 挖矿(块验证)的参与者.
	2. proposer: 在validators中被选出来的节点,这个节点提供要添加的块进行IBFT协商.
	3. Round: 一个round开始于提议者创建一个区块提议,结束于块被提交或者round改变.
	4. Proposal: 新块产生提议.用于IBFT的共识协商.协商通过的块会被添加到区块链中.
	5. Sequence: 提议的序列号. 新提议的序列号需要大于之前所有的提议的序列号. 当前每一个提议的区块的高度就是与这个区块相关联的序列号.
	6. Backlog: 用来保持将来的共识消息的存储.
	7. Round state: round的状态有三种, pre-prepare, prepare和commit.
	8. Consensus proof: 块的提交签名. 这个提交签名能够证明块经过了共识的过程.
	9. snapshot: 最后一个epoch的validator投票状态.
	
3. Istanbul BFT inherits from the original PBFT by using 3-phase consensus, PRE-PREPARE, PREPARE, and COMMIT.**(Istanbul BFT继承自PBFT,也使用3阶段提交,PRE-PREPARE, PREPARE,COMMIT)** The system can tolerate at most of F faulty nodes in a N validator nodes network, where N = 3F + 1.**(系统能够容忍最多F个错误节点,如果有N=3F+1个validators的话.)** Before each round, the validators will pick one of them as the proposer, by default, in a round robin fashion **(在每个round开始之前,这些validators会选出他们中的一个作为proposer, 默认使用round robin方式选择proposer)**. The proposer will then propose a new block proposal and broadcast it along with the PRE-PREPARE message **(proposer然后提出一个新块提议并且在PRE-PREPARE消息中广播这个块提议)** . Upon receiving the PRE-PREPARE message from the proposer, validators enter the state of PRE-PREPARED and then broadcast PREPARE message **(一旦收到PRE-PREPARE消息后,那么这个validator就会进入到PRE-PREPARED状态,然后广播PREPARE消息)**. This step is to make sure all validators are working on the same sequence and the same round**(这个步骤主要用来保证所有的validators都工作在相同的sequence和相同的round之下)**. While receiving 2F + 1 of PREPARE messages, the validator enters the state of PREPARED and then broadcasts COMMIT message **(当收到2F+1个PREPARE消息之后,validator就进入到了PREPARED状态然后广播COMMIT消息)**. This step is to inform its peers that it accepts the proposed block and is going to insert the block to the chain. Lastly, validators wait for 2F + 1 of COMMIT messages to enter COMMITTED state and then insert the block to the chain. **(这个步骤用来通知它的对端它接受了被提议的块并且准备把这个块插入到链中. validators等待2F+1个COMMIT消息,然后进入到COMMITTED状态,然后把块插入到链中.)**
4. Blocks in Istanbul BFT protocol are final, which means that there are no forks and any valid block must be somewhere in the main chain. 
   To prevent a faulty node from generating a totally different chain from the main chain, each validator appends 2F + 1 received COMMIT signatures to extraData field in the header before inserting it into the chain.**(为了防止链分叉,每个validator都会把接收到的2F+1个COMMIT签名附加到块头的extraData域中,然后才把块插入到链中.所以说采用IBFT的链是不会分叉的.)**
	
   	Thus blocks are self-verifiable and light client can be supported as well. However, the dynamic extraData would cause an issue on block hash calculation. Since the same block from different validators can have different set of COMMIT signatures, the same block can have different block hashes as well. To solve this, we calculate the block hash by excluding the COMMIT signatures part. Therefore, we can still keep the block/block hash consistency as well as put the consensus proof in the block header.**(把consensus proof添加到块头中会导致不同的validator的相同的块的hash计算的值不同,为了解决这个问题,IBFT中在计算块头的hash的时候并没有包含consensus proof部分的数据,因此各个节点中虽然consensus proof部分不同,但是计算出来的block hash还是一样的.)**

----------
# 问题 #
1. 在4中,为什么IBFT能够防止链的分叉?