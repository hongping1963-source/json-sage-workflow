# DeepSeek 配置指南

## 1. 基本配置

### 1.1 模型参数
```json
{
  "model": "deepseek-coder:6.7b",
  "temperature": 0.7,        // 控制输出的随机性 (0.0 - 1.0)
  "top_p": 0.9,             // 控制输出的多样性
  "top_k": 40,              // 控制每一步生成时考虑的token数量
  "max_tokens": 2048,       // 最大输出token数
  "presence_penalty": 0.0,   // 重复惩罚系数 (-2.0 - 2.0)
  "frequency_penalty": 0.0,  // 频率惩罚系数 (-2.0 - 2.0)
  "stop": ["</s>", "```"]   // 停止生成的标记
}
```

### 1.2 系统配置
```json
{
  "num_ctx": 8192,          // 上下文窗口大小
  "num_gpu": 1,             // 使用的GPU数量
  "num_thread": 4,          // CPU线程数
  "seed": 42,               // 随机种子
  "batch_size": 512         // 批处理大小
}
```

## 2. API配置

### 2.1 REST API
```bash
# 基本生成请求
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "deepseek-coder:6.7b",
  "prompt": "Write a function to calculate fibonacci numbers",
  "stream": false
}'

# 流式生成请求
curl -X POST http://localhost:11434/api/generate -d '{
  "model": "deepseek-coder:6.7b",
  "prompt": "Write a function to calculate fibonacci numbers",
  "stream": true
}'
```

### 2.2 WebSocket API
```javascript
const ws = new WebSocket('ws://localhost:11434/api/generate');
ws.send(JSON.stringify({
  "model": "deepseek-coder:6.7b",
  "prompt": "Your prompt here",
  "stream": true
}));
```

## 3. 高级配置

### 3.1 模型量化
```bash
# FP16量化
ollama pull deepseek-coder:6.7b-fp16

# INT8量化
ollama pull deepseek-coder:6.7b-int8

# INT4量化
ollama pull deepseek-coder:6.7b-int4
```

### 3.2 自定义Modelfile
```
FROM deepseek-coder:6.7b

# 设置系统提示
SYSTEM """You are an AI programming assistant. Write code to solve problems and answer questions."""

# 设置参数
PARAMETER temperature 0.7
PARAMETER top_p 0.9
PARAMETER top_k 40
PARAMETER num_ctx 8192

# 添加模板
TEMPLATE """
[INST] {{.Prompt}} [/INST]
"""
```

## 4. 性能优化

### 4.1 内存优化
```json
{
  "num_batch": 512,         // 批处理大小
  "num_gqa": 8,            // 注意力头分组数
  "num_gpu_layers": 35,    // GPU加载的层数
  "rope_scaling": "linear" // RoPE缩放方式
}
```

### 4.2 推理优化
```json
{
  "mmap": true,            // 使用内存映射
  "numa": false,           // NUMA支持
  "low_vram": false,       // 低显存模式
  "rope_freq_base": 10000, // RoPE基频
  "rope_freq_scale": 1.0   // RoPE频率缩放
}
```

## 5. 特殊用途配置

### 5.1 代码补全模式
```json
{
  "stop": ["\n\n", "```"],
  "temperature": 0.1,
  "top_p": 0.95,
  "presence_penalty": 0.1,
  "frequency_penalty": 0.1
}
```

### 5.2 代码解释模式
```json
{
  "temperature": 0.7,
  "top_p": 0.9,
  "presence_penalty": 0.0,
  "frequency_penalty": 0.0,
  "max_tokens": 1024
}
```

### 5.3 代码重构模式
```json
{
  "temperature": 0.2,
  "top_p": 0.95,
  "presence_penalty": 0.1,
  "frequency_penalty": 0.1,
  "max_tokens": 2048
}
```

## 6. 最佳实践

### 6.1 提示工程
- 使用清晰的指令
- 提供上下文信息
- 指定输出格式
- 使用示例说明

### 6.2 错误处理
- 设置超时机制
- 实现重试逻辑
- 验证输出结果
- 记录错误日志

### 6.3 性能调优
- 根据需求选择量化版本
- 调整批处理大小
- 优化上下文长度
- 监控资源使用

## 7. 常见问题

### 7.1 内存问题
- 使用量化版本
- 减少上下文长度
- 启用低显存模式
- 调整批处理大小

### 7.2 性能问题
- 使用GPU加速
- 优化参数设置
- 实现并行处理
- 使用流式输出

### 7.3 质量问题
- 调整温度参数
- 优化提示工程
- 使用停止标记
- 实现后处理
