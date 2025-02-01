# JsonSageAI 部署指南

## 1. 环境要求

### 1.1 系统要求
- Node.js >= 16.x
- TypeScript >= 4.x
- 内存: >= 4GB
- 存储: >= 1GB

### 1.2 依赖服务
- DeepSeek AI API
- Redis (可选，用于缓存)
- MongoDB (可选，用于存储)

## 2. 安装步骤

### 2.1 安装 Node.js
```bash
# 使用 nvm 安装 Node.js
nvm install 16
nvm use 16
```

### 2.2 安装依赖
```bash
# 使用 pnpm
pnpm install

# 或使用 npm
npm install
```

### 2.3 配置环境变量
```bash
# 创建 .env 文件
cp .env.example .env

# 编辑 .env 文件
DEEPSEEK_API_KEY=your-api-key
NODE_ENV=production
PORT=3000
```

## 3. 部署配置

### 3.1 基本配置
```typescript
{
    "agent": {
        "maxTokens": 2048,
        "temperature": 0.7,
        "caching": true
    },
    "server": {
        "port": 3000,
        "host": "0.0.0.0",
        "cors": true
    }
}
```

### 3.2 缓存配置
```typescript
{
    "cache": {
        "enabled": true,
        "provider": "redis",
        "ttl": 3600,
        "maxSize": "1gb"
    }
}
```

### 3.3 日志配置
```typescript
{
    "logging": {
        "level": "info",
        "format": "json",
        "file": "/var/log/json-sage-ai.log"
    }
}
```

## 4. 部署方式

### 4.1 直接部署
```bash
# 编译
pnpm build

# 运行
pnpm start
```

### 4.2 Docker 部署
```bash
# 构建镜像
docker build -t json-sage-ai .

# 运行容器
docker run -d \
    -p 3000:3000 \
    -e DEEPSEEK_API_KEY=your-api-key \
    json-sage-ai
```

### 4.3 Kubernetes 部署
```yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: json-sage-ai
spec:
  replicas: 3
  template:
    spec:
      containers:
      - name: json-sage-ai
        image: json-sage-ai:latest
        env:
        - name: DEEPSEEK_API_KEY
          valueFrom:
            secretKeyRef:
              name: api-secrets
              key: deepseek-api-key
```

## 5. 监控和日志

### 5.1 健康检查
```bash
# 健康检查端点
curl http://localhost:3000/health

# 详细状态
curl http://localhost:3000/status
```

### 5.2 指标收集
```typescript
// Prometheus 指标
const metrics = {
    requestsTotal: new Counter(...),
    requestDuration: new Histogram(...),
    errorsTotal: new Counter(...)
};
```

### 5.3 日志收集
```typescript
// 使用 Winston 日志
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.json(),
    transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' })
    ]
});
```

## 6. 扩展和优化

### 6.1 性能优化
1. 启用缓存
2. 调整批处理大小
3. 优化模型参数

### 6.2 高可用配置
1. 多实例部署
2. 负载均衡
3. 故障转移

### 6.3 安全加固
1. API 密钥轮换
2. 请求限流
3. 数据加密

## 7. 故障排除

### 7.1 常见问题
1. API 连接超时
2. 内存使用过高
3. 响应延迟

### 7.2 解决方案
1. 检查网络连接
2. 调整内存限制
3. 优化查询性能

## 8. 维护和更新

### 8.1 更新流程
```bash
# 停止服务
pm2 stop json-sage-ai

# 更新代码
git pull

# 更新依赖
pnpm install

# 重启服务
pm2 restart json-sage-ai
```

### 8.2 备份策略
1. 配置文件备份
2. 数据备份
3. 日志归档
