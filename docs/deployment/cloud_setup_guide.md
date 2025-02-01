# 腾讯云GPU工作空间 DeepSeek配置指南

## 1. 环境准备

### 1.1 检查GPU资源
```bash
# 检查GPU状态
nvidia-smi

# 检查CUDA版本
nvcc --version
```

### 1.2 检查网络连接
```bash
# 检查本地Ollama服务
curl http://localhost:11434/api/version

# 确保防火墙允许Ollama端口
```

## 2. 配置方案

### 2.1 直接连接方案
1. 本地Ollama服务作为客户端
2. 云端工作空间作为开发环境
3. 通过API进行通信

### 2.2 独立部署方案
1. 在云端部署Ollama服务
2. 配置GPU支持
3. 本地通过API访问

## 3. 操作步骤

### 3.1 方案一：直接连接（推荐）

1. 在本地启动Ollama服务：
```bash
ollama serve
```

2. 配置SSH隧道：
```bash
ssh -L 11434:localhost:11434 user@cloud-workspace
```

3. 在云端验证连接：
```bash
curl http://localhost:11434/api/version
```

4. 拉取DeepSeek模型：
```bash
ollama pull deepseek-coder:14b
```

### 3.2 方案二：独立部署

1. 在云端安装Ollama：
```bash
curl https://ollama.ai/install.sh | sh
```

2. 配置GPU支持：
```bash
# 编辑Ollama服务配置
sudo vim /etc/ollama/config.json
```

3. 启动服务：
```bash
sudo systemctl start ollama
```

4. 拉取模型：
```bash
ollama pull deepseek-coder:14b
```

## 4. 开发配置

### 4.1 API配置
```javascript
const OLLAMA_API = 'http://localhost:11434/api';

async function generateCode(prompt) {
  const response = await fetch(`${OLLAMA_API}/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'deepseek-coder:14b',
      prompt: prompt
    })
  });
  return await response.json();
}
```

### 4.2 环境变量
```bash
# .env
OLLAMA_HOST=http://localhost:11434
MODEL_NAME=deepseek-coder:14b
```

## 5. 安全考虑

### 5.1 网络安全
- 使用SSH隧道加密通信
- 限制API访问范围
- 配置防火墙规则

### 5.2 资源控制
- 设置GPU内存限制
- 配置请求频率限制
- 监控资源使用

## 6. 故障排除

### 6.1 连接问题
- 检查网络连接
- 验证端口开放
- 检查服务状态

### 6.2 性能问题
- 监控GPU使用
- 检查内存占用
- 优化请求频率

## 7. 最佳实践

### 7.1 开发建议
- 使用异步请求
- 实现错误重试
- 添加超时处理
- 缓存常用结果

### 7.2 部署建议
- 定期备份配置
- 监控服务状态
- 记录错误日志
- 制定恢复计划
