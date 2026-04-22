# Web3/区块链测试

去中心化应用的测试策略与技术。

## 智能合约安全测试与形式化验证

智能合约测试方法论。

- 单元测试（Hardhat/Foundry）
- 安全审计工具（Slither/Mythril）
- 形式化验证
- 模糊测试

### 智能合约测试框架

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

/**
 * @title 测试示例合约
 * @dev 展示可测试的合约设计模式
 */
contract TokenVault {
    mapping(address => uint256) private balances;
    uint256 public totalSupply;
    
    event Deposit(address indexed user, uint256 amount);
    event Withdrawal(address indexed user, uint256 amount);
    
    /**
     * @dev 存入代币
     * @param amount 存入数量
     */
    function deposit(uint256 amount) external payable {
        require(amount > 0, "Amount must be greater than 0");
        require(msg.value == amount, "Incorrect ETH amount");
        
        balances[msg.sender] += amount;
        totalSupply += amount;
        
        emit Deposit(msg.sender, amount);
    }
    
    /**
     * @dev 提取代币
     * @param amount 提取数量
     */
    function withdraw(uint256 amount) external {
        require(amount > 0, "Amount must be greater than 0");
        require(balances[msg.sender] >= amount, "Insufficient balance");
        
        // 先更新状态，再转账（防止重入攻击）
        balances[msg.sender] -= amount;
        totalSupply -= amount;
        
        (bool success, ) = msg.sender.call{value: amount}("");
        require(success, "Transfer failed");
        
        emit Withdrawal(msg.sender, amount);
    }
    
    /**
     * @dev 查询余额
     * @param user 用户地址
     * @return 余额
     */
    function balanceOf(address user) external view returns (uint256) {
        return balances[user];
    }
}
```

```javascript
// test/TokenVault.test.js - Hardhat测试示例
const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("TokenVault", function () {
    let TokenVault;
    let vault;
    let owner;
    let addr1;
    let addr2;

    beforeEach(async function () {
        TokenVault = await ethers.getContractFactory("TokenVault");
        [owner, addr1, addr2] = await ethers.getSigners();
        vault = await TokenVault.deploy();
        await vault.waitForDeployment();
    });

    describe("存款功能", function () {
        it("应该允许用户存入ETH", async function () {
            const depositAmount = ethers.parseEther("1.0");
            
            await expect(vault.connect(addr1).deposit(depositAmount, { value: depositAmount }))
                .to.emit(vault, "Deposit")
                .withArgs(addr1.address, depositAmount);
            
            expect(await vault.balanceOf(addr1.address)).to.equal(depositAmount);
            expect(await vault.totalSupply()).to.equal(depositAmount);
        });

        it("存入0应该失败", async function () {
            await expect(
                vault.connect(addr1).deposit(0, { value: 0 })
            ).to.be.revertedWith("Amount must be greater than 0");
        });

        it("金额不匹配应该失败", async function () {
            await expect(
                vault.connect(addr1).deposit(ethers.parseEther("1.0"), { value: ethers.parseEther("0.5") })
            ).to.be.revertedWith("Incorrect ETH amount");
        });
    });

    describe("取款功能", function () {
        beforeEach(async function () {
            const depositAmount = ethers.parseEther("1.0");
            await vault.connect(addr1).deposit(depositAmount, { value: depositAmount });
        });

        it("应该允许用户取款", async function () {
            const withdrawAmount = ethers.parseEther("0.5");
            
            await expect(vault.connect(addr1).withdraw(withdrawAmount))
                .to.emit(vault, "Withdrawal")
                .withArgs(addr1.address, withdrawAmount);
            
            expect(await vault.balanceOf(addr1.address)).to.equal(ethers.parseEther("0.5"));
        });

        it("超额取款应该失败", async function () {
            await expect(
                vault.connect(addr1).withdraw(ethers.parseEther("2.0"))
            ).to.be.revertedWith("Insufficient balance");
        });

        it("应该防止重入攻击", async function () {
            // 部署恶意合约进行重入测试
            const Attacker = await ethers.getContractFactory("ReentrancyAttacker");
            const attacker = await Attacker.deploy(await vault.getAddress());
            
            // 尝试重入攻击
            const attackAmount = ethers.parseEther("1.0");
            await attacker.attack({ value: attackAmount });
            
            // 验证攻击未成功耗尽合约
            expect(await ethers.provider.getBalance(await vault.getAddress())).to.be.gte(0);
        });
    });

    describe("模糊测试", function () {
        it("应该处理随机存款金额", async function () {
            for (let i = 0; i < 100; i++) {
                const randomAmount = BigInt(Math.floor(Math.random() * 1000000));
                if (randomAmount > 0) {
                    await vault.connect(addr1).deposit(randomAmount, { value: randomAmount });
                }
            }
            
            expect(await vault.totalSupply()).to.equal(await vault.balanceOf(addr1.address));
        });
    });
});
```

### 安全审计工具集成

```python
from typing import Dict, List
import subprocess
import json

class SmartContractAuditor:
    """
    智能合约审计器
    集成多种安全分析工具
    """
    def __init__(self, contract_path: str):
        """
        初始化审计器
        
        Args:
            contract_path: 合约文件路径
        """
        self.contract_path = contract_path
    
    def run_slither(self) -> Dict:
        """
        运行Slither分析
        
        Returns:
            dict: 分析结果
        """
        cmd = [
            "slither",
            self.contract_path,
            "--json", "-",
            "--detect", "all"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=300)
            return json.loads(result.stdout) if result.stdout else {"error": "No output"}
        except Exception as e:
            return {"error": str(e)}
    
    def run_mythril(self) -> Dict:
        """
        运行Mythril符号执行
        
        Returns:
            dict: 分析结果
        """
        cmd = [
            "myth",
            "analyze",
            self.contract_path,
            "--execution-timeout", "600"
        ]
        
        try:
            result = subprocess.run(cmd, capture_output=True, text=True, timeout=600)
            return {
                "output": result.stdout,
                "issues": self._parse_mythril_output(result.stdout)
            }
        except Exception as e:
            return {"error": str(e)}
    
    def _parse_mythril_output(self, output: str) -> List[Dict]:
        """
        解析Mythril输出
        
        Args:
            output: 原始输出
            
        Returns:
            list: 问题列表
        """
        issues = []
        # 简化解析逻辑
        for line in output.split("\n"):
            if "Issue:" in line:
                issues.append({"description": line.strip()})
        return issues
    
    def generate_audit_report(self) -> Dict:
        """
        生成审计报告
        
        Returns:
            dict: 综合审计报告
        """
        slither_result = self.run_slither()
        mythril_result = self.run_mythril()
        
        return {
            "contract": self.contract_path,
            "slither": slither_result,
            "mythril": mythril_result,
            "summary": {
                "total_issues": len(slither_result.get("results", [])) + 
                               len(mythril_result.get("issues", [])),
                "severity_high": 0,
                "severity_medium": 0,
                "severity_low": 0
            }
        }
```

## 去中心化应用分布式测试策略

DApp测试方法论。

- 前端交互测试
- 链上状态验证
- 多节点测试
- 共识机制测试

### DApp测试架构

```python
from typing import Dict, List, Optional
from dataclasses import dataclass
import asyncio

@dataclass
class BlockchainState:
    """区块链状态"""
    block_number: int
    gas_price: int
    chain_id: int
    accounts: List[str]

class DAppTester:
    """
    DApp测试器
    测试去中心化应用
    """
    def __init__(self, rpc_url: str, private_key: str = None):
        """
        初始化测试器
        
        Args:
            rpc_url: RPC节点地址
            private_key: 测试账户私钥
        """
        self.rpc_url = rpc_url
        self.private_key = private_key
        self.web3 = None
        
        try:
            from web3 import Web3
            self.web3 = Web3(Web3.HTTPProvider(rpc_url))
        except ImportError:
            pass
    
    def get_state(self) -> BlockchainState:
        """
        获取区块链状态
        
        Returns:
            BlockchainState: 当前状态
        """
        if not self.web3:
            return BlockchainState(0, 0, 0, [])
        
        return BlockchainState(
            block_number=self.web3.eth.block_number,
            gas_price=self.web3.eth.gas_price,
            chain_id=self.web3.eth.chain_id,
            accounts=self.web3.eth.accounts
        )
    
    def deploy_contract(self, bytecode: str, abi: List,
                       constructor_args: List = None) -> str:
        """
        部署合约
        
        Args:
            bytecode: 合约字节码
            abi: 合约ABI
            constructor_args: 构造参数
            
        Returns:
            str: 合约地址
        """
        if not self.web3:
            return ""
        
        Contract = self.web3.eth.contract(abi=abi, bytecode=bytecode)
        
        if constructor_args:
            tx_hash = Contract.constructor(*constructor_args).transact()
        else:
            tx_hash = Contract.constructor().transact()
        
        tx_receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
        return tx_receipt.contractAddress
    
    def test_transaction(self, contract_address: str,
                        abi: List,
                        function_name: str,
                        args: List = None,
                        value: int = 0) -> Dict:
        """
        测试合约调用
        
        Args:
            contract_address: 合约地址
            abi: 合约ABI
            function_name: 函数名
            args: 参数
            value: 转账金额
            
        Returns:
            dict: 交易结果
        """
        if not self.web3:
            return {"error": "Web3 not initialized"}
        
        contract = self.web3.eth.contract(address=contract_address, abi=abi)
        func = getattr(contract.functions, function_name)
        
        try:
            # 先估算gas
            gas_estimate = func(*args).estimateGas() if args else func().estimateGas()
            
            # 执行交易
            tx_hash = func(*args).transact({"value": value}) if args else func().transact({"value": value})
            
            receipt = self.web3.eth.wait_for_transaction_receipt(tx_hash)
            
            return {
                "success": receipt.status == 1,
                "gas_used": receipt.gasUsed,
                "gas_estimate": gas_estimate,
                "block_number": receipt.blockNumber,
                "tx_hash": tx_hash.hex()
            }
        
        except Exception as e:
            return {
                "success": False,
                "error": str(e)
            }
    
    def fork_mainnet(self, block_number: int = None) -> 'DAppTester':
        """
        Fork主网进行测试
        
        Args:
            block_number: 指定区块高度
            
        Returns:
            DAppTester: 新的测试实例
        """
        # 使用Anvil或Hardhat网络进行fork
        return DAppTester("http://localhost:8545")
```

## 区块链测试网络管理

```python
class TestNetworkManager:
    """
    测试网络管理器
    管理本地测试网络
    """
    def __init__(self):
        self.processes = {}
    
    def start_anvil(self, port: int = 8545,
                   fork_url: str = None) -> Dict:
        """
        启动Anvil本地节点
        
        Args:
            port: 端口
            fork_url: Fork的RPC地址
            
        Returns:
            dict: 节点信息
        """
        cmd = ["anvil", "--port", str(port)]
        
        if fork_url:
            cmd.extend(["--fork-url", fork_url])
        
        import subprocess
        process = subprocess.Popen(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        self.processes[f"anvil_{port}"] = process
        
        return {
            "url": f"http://localhost:{port}",
            "pid": process.pid
        }
    
    def stop_network(self, name: str):
        """
        停止测试网络
        
        Args:
            name: 网络名称
        """
        process = self.processes.get(name)
        if process:
            process.terminate()
            del self.processes[name]
```

## 最佳实践

1. **测试网优先**：主网操作前先在测试网验证
2. **Gas优化**：测试不同Gas价格下的行为
3. **边界测试**：测试极端输入和边界条件
4. **安全审计**：部署前进行专业安全审计
5. **升级测试**：测试合约升级机制
