# 部署指南

## 快速部署步骤

### 1. 安装Wrangler CLI

\`\`\`bash
npm install -g wrangler
\`\`\`

### 2. 登录Cloudflare

\`\`\`bash
wrangler login
\`\`\`

这会打开浏览器，让你授权Wrangler访问你的Cloudflare账号。

### 3. 创建R2存储桶

\`\`\`bash
wrangler r2 bucket create duxiu-pdf-storage
\`\`\`

### 4. 安装项目依赖

\`\`\`bash
npm install
\`\`\`

### 5. 部署Worker

\`\`\`bash
npm run deploy
\`\`\`

### 6. 访问你的Worker

部署成功后，会显示类似这样的URL：

\`\`\`
https://duxiu-zip2pdf-worker.YOUR-SUBDOMAIN.workers.dev
\`\`\`

## 自定义域名（可选）

### 1. 在Cloudflare Dashboard中

1. 进入你的Worker
2. 点击 **Triggers** 标签
3. 点击 **Add Custom Domain**
4. 输入你的域名（需要在Cloudflare管理）
5. 确认添加

### 2. 使用Wrangler

\`\`\`bash
wrangler domains add YOUR-DOMAIN.com
\`\`\`

## 环境变量（可选）

如果需要添加环境变量（如API密钥等），在 \`wrangler.toml\` 中添加：

\`\`\`toml
[vars]
API_KEY = "your-api-key"
MAX_FILE_SIZE = "100000000"
\`\`\`

或使用secrets（敏感信息）:

\`\`\`bash
wrangler secret put API_SECRET
\`\`\`

## 监控和日志

### 查看实时日志

\`\`\`bash
npm run tail
\`\`\`

或

\`\`\`bash
wrangler tail
\`\`\`

### 在Dashboard中查看

1. 进入Cloudflare Dashboard
2. 选择你的Worker
3. 查看 **Logs** 标签

## 更新部署

修改代码后，重新部署：

\`\`\`bash
npm run deploy
\`\`\`

## 回滚版本

Cloudflare会保留你的部署历史：

1. 进入Dashboard
2. 选择你的Worker
3. 点击 **Deployments** 标签
4. 选择要回滚的版本
5. 点击 **Rollback**

## 删除Worker和R2存储桶

### 删除Worker

\`\`\`bash
wrangler delete duxiu-zip2pdf-worker
\`\`\`

### 删除R2存储桶

**警告**：这会删除存储桶中的所有文件！

\`\`\`bash
wrangler r2 bucket delete duxiu-pdf-storage
\`\`\`

## 常见问题

### 1. R2存储桶绑定失败

确保 \`wrangler.toml\` 中的 \`bucket_name\` 与实际创建的存储桶名称一致。

### 2. 部署时包太大

Workers有大小限制。如果包太大，检查：
- 是否安装了不必要的依赖
- 是否可以使用CDN引入某些库

### 3. 文件上传失败

检查：
- 文件大小是否超过限制（默认100MB）
- R2存储桶是否正确配置
- 网络连接是否正常

### 4. PDF生成失败

可能原因：
- 图片格式不支持
- 内存不足
- 执行时间超时

解决方案：
- 减小单个ZIP文件的图片数量
- 优化图片质量
- 考虑使用分批处理

## 成本估算

Cloudflare Workers和R2的免费额度：

- **Workers**: 100,000 请求/天
- **R2 存储**: 10GB 存储空间
- **R2 操作**: 100万次A类操作/月，1000万次B类操作/月

对于个人使用，免费额度通常足够。

## 生产环境建议

1. **启用缓存**：使用Cloudflare Cache
2. **添加认证**：实现用户认证系统
3. **限流保护**：防止滥用
4. **错误监控**：集成Sentry等监控服务
5. **文件清理**：定期清理过期文件
6. **备份策略**：定期备份重要数据

## 支持

遇到问题？

1. 查看 [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
2. 查看 [R2文档](https://developers.cloudflare.com/r2/)
3. 在项目中提交Issue
