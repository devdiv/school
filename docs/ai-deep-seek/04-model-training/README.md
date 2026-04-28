---
title: "模型训练与微调"
description: "从零训练大语言模型、指令微调、偏好对齐、模型压缩的完整知识体系"
---

# 🧠 模型训练与微调

> **核心目标**：掌握大语言模型从预训练到部署的全生命周期技术，包括分布式预训练、指令微调（SFT）、强化学习对齐（RLHF/DPO）、模型压缩（量化/剪枝/蒸馏）。

## 📋 目录

- [预训练（Pre-training）](./pretraining/) — 分布式训练、混合精度、数据流水线
- [指令微调（SFT）](./finetuning/) — 指令数据集构建、LoRA/QLoRA、全量微调
- [偏好对齐（Alignment）](./alignment/) — 奖励模型、PPO、DPO/ORPO 算法
- [模型压缩（Compression）](./compression/) — 量化、剪枝、知识蒸馏

## 🎯 概述

模型训练是 AI 系统最核心的技术栈，决定了模型的上限。整个训练流程可以抽象为三个阶段：

```mermaid
graph LR
    A[原始语料] --> B[数据预处理]
    B --> C[预训练 Pre-training]
    C --> D[指令微调 SFT]
    D --> E[偏好对齐 RLHF/DPO]
    E --> F[模型压缩]
    F --> G[部署推理]
    
    style C fill:#e1f5fe
    style D fill:#fff3e0
    style E fill:#e8f5e9
    style F fill:#f3e5f5
```

### 阶段说明

| 阶段 | 目标 | 典型数据量 | 计算资源 |
|------|------|-----------|---------|
| 预训练 | 通用语言建模能力 | 万亿 Token | 万卡 GPU 集群 |
| SFT | 指令跟随与对话能力 | 百万条指令 | 百卡 GPU |
| 对齐 | 安全与人类偏好 | 万条标注 | 十卡 GPU |
| 压缩 | 推理效率 | 无需数据 | 单机 GPU/CPU |

### 关键指标

| 指标 | 预训练阶段 | SFT 阶段 | 对齐阶段 |
|------|-----------|---------|---------|
| 损失函数 | Next Token Prediction | Next Token Prediction | DPO Loss / PPO Reward |
| 评估方式 | Perplexity / 零样本推理 | 人工评估 / 自动化 Benchmark | 安全测试 / 偏好一致率 |
| 学习率 | 1e-4 ~ 3e-4（Cosine） | 1e-5 ~ 5e-5 | 1e-5 ~ 5e-5 |
| 训练轮数 | 3 ~ 7 个 Epoch | 1 ~ 3 个 Epoch | 1 ~ 2 个 Epoch |

## ⚡ 核心技术概览

### 预训练关键技术

- **分布式训练**：数据并行（DP）、张量并行（TP）、流水线并行（PP）
- **混合精度训练**：FP16 / BF16 / FP8
- **数据工程**：去重、质量筛选、多语言配比
- **训练稳定性**：梯度裁剪、Warmup、Loss Spike 检测

### 微调关键技术

- **全量微调（Full Fine-tuning）**：更新全部参数
- **参数高效微调（PEFT）**：LoRA、QLoRA、Adapter、Prefix Tuning
- **数据构建**：指令模板、多样性保证、难度平衡

### 对齐关键技术

- **RLHF**：训练奖励模型 → PPO 优化 → 在线交互
- **DPO（直接偏好优化）**：无需奖励模型，直接优化偏好数据
- **ORPO**：联合监督微调与偏好优化

### 压缩关键技术

- **量化**：PTQ（训练后量化）、QAT（量化感知训练）、混合精度
- **剪枝**：结构化剪枝、非结构化剪枝、动态剪枝
- **蒸馏**：Logits 蒸馏、Hidden State 蒸馏、行为克隆

## 🔧 实践建议

> **Pro Tip**：对于大多数应用场景，**QLoRA + 高质量 SFT 数据** 即可达到接近全量微调的效果，成本降低 10 倍以上。

> **Pro Tip**：DPO 正在逐步替代 RLHF，因为它更稳定、更简单，且不需要额外的奖励模型训练。

## 📚 交叉引用

- [Agent 架构](../01-agent-arch/) — 训练后的模型如何驱动 Agent
- [AI 安全](../02-ai-security/) — 对齐后的安全边界保障
- [架构设计](../03-architecture/) — 系统架构与部署
- [服务端平台](../05-server-platform/) — 推理服务与基础设施

## 📖 延伸阅读

- [Attention Is All You Need](https://arxiv.org/abs/1706.03762) — Transformer 基础
- [LLaMA 2: Open Foundation and Fine-Tuned Chat Models](https://arxiv.org/abs/2307.09288) — 预训练实践
- [QLoRA: Efficient Finetuning of Quantized LLMs](https://arxiv.org/abs/2305.14314) — 高效微调
- [Direct Preference Optimization: Your Language Model is Secretly a Reward Model](https://arxiv.org/abs/2305.18290) — DPO 算法
