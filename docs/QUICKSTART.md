# 快速入门指南

欢迎使用读秀ZIP转PDF在线工具！本指南将帮助你在5分钟内完成部署。

## 📋 前置要求

在开始之前，请确保你已经：

- ✅ 拥有 Cloudflare 账号（免费账号即可）
- ✅ 安装了 Node.js（16或更高版本）
- ✅ 安装了 npm（通常随Node.js一起安装）

## 🚀 5分钟快速部署

### 步骤 1: 安装 Wrangler CLI

在命令行中运行：

\`\`\`bash
npm install -g wrangler
\`\`\`

### 步骤 2: 登录 Cloudflare

\`\`\`bash
wrangler login
\`\`\`

浏览器会自动打开，点击授权即可。

### 步骤 3: 进入项目目录

\`\`\`bash
cd duxiu-zip2pdf-worker
\`\`\`

### 步骤 4: 创建 R2 存储桶

\`\`\`bash
wrangler r2 bucket create duxiu-pdf-storage
\`\`\`

看到 "Created bucket duxiu-pdf-storage" 表示成功！

### 步骤 5: 安装依赖（如果还没安装）

\`\`\`bash
npm install
\`\`\`

### 步骤 6: 部署到 Cloudflare

\`\`\`bash
npm run deploy
\`\`\`

等待几秒钟，你会看到类似这样的输出：

\`\`\`
Published duxiu-zip2pdf-worker
  https://duxiu-zip2pdf-worker.YOUR-SUBDOMAIN.workers.dev
\`\`\`

🎉 **恭喜！部署完成！**

## 🧪 测试你的Worker

### 方法1: 浏览器访问

在浏览器中打开部署后的URL：
\`\`\`
https://duxiu-zip2pdf-worker.YOUR-SUBDOMAIN.workers.dev
\`\`\`

你应该能看到一个漂亮的上传界面！

### 方法2: 本地开发模式

如果你想在本地测试：

\`\`\`bash
npm run dev
\`\`\`

然后访问 \`http://localhost:8787\`

## 📱 开始使用

1. **上传ZIP文件**
   - 点击上传区域或拖拽ZIP文件
   - 支持格式：.zip, .uvz, .cbz

2. **转换为PDF**
   - 点击"开始转换为PDF"按钮
   - 等待转换完成（通常几秒到几分钟）

3. **下载PDF**
   - 转换完成后，点击"下载PDF文件"按钮

## 🎯 下一步

现在你已经成功部署了Worker，可以：

### 使用自定义域名（可选）

1. 登录 [Cloudflare Dashboard](https://dash.cloudflare.com/)
2. 进入你的Worker
3. 点击 "Triggers" → "Add Custom Domain"
4. 输入你的域名（需要在Cloudflare管理）

### 查看实时日志

\`\`\`bash
npm run tail
\`\`\`

这会显示Worker的实时日志，方便调试。

### 更新代码

修改代码后，重新部署：

\`\`\`bash
npm run deploy
\`\`\`

## 📚 进阶学习

想了解更多？查看这些文档：

- 📖 [README.md](./README.md) - 完整项目说明
- 🔧 [DEVELOPMENT.md](./DEVELOPMENT.md) - 开发文档
- 🚀 [DEPLOYMENT.md](./DEPLOYMENT.md) - 详细部署指南
- 💡 [EXAMPLES.md](./EXAMPLES.md) - 使用示例

## ⚠️ 常见问题

### Q: 部署时提示 "R2 bucket not found"

**A:** 确保你已经创建了名为 \`duxiu-pdf-storage\` 的R2存储桶：

\`\`\`bash
wrangler r2 bucket create duxiu-pdf-storage
\`\`\`

### Q: 转换速度很慢

**A:** 这取决于：
- ZIP文件大小
- 图片数量
- 网络速度

对于大文件（超过50MB或500张图片），可能需要几分钟。

### Q: 转换失败

**A:** 检查：
- ZIP文件是否损坏
- 是否包含图片文件
- 图片格式是否支持（PDG、JPG、PNG等）

### Q: 如何删除已上传的文件

**A:** 目前没有自动清理功能，你可以：
- 在Cloudflare Dashboard中手动删除R2中的文件
- 或者添加定期清理功能（参见DEVELOPMENT.md）

### Q: 免费额度够用吗？

**A:** 对于个人使用，Cloudflare的免费额度通常足够：
- Workers: 100,000 请求/天
- R2: 10GB 存储

超出部分才会收费。

## 💰 成本估算

假设你每天转换10本书，每本50MB：

- **存储**: 500MB/天 × 30天 = 15GB（稍超免费额度）
- **请求**: 30次转换/天 << 100,000次限制
- **预计费用**: $0 - $1/月

> 💡 提示：定期清理不需要的文件可以保持在免费额度内！

## 🆘 获取帮助

遇到问题？

1. 查看文档（README.md, DEPLOYMENT.md等）
2. 检查 [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
3. 在项目中提交Issue

## 🎓 学习资源

- [Cloudflare Workers教程](https://developers.cloudflare.com/workers/get-started/guide/)
- [R2存储文档](https://developers.cloudflare.com/r2/)
- [pdf-lib使用指南](https://pdf-lib.js.org/)

## ✨ 恭喜

你已经成功部署了读秀ZIP转PDF在线工具！现在可以：

- 📚 转换你的读秀电子书
- 🔧 自定义功能（参考DEVELOPMENT.md）
- 🌟 分享给朋友使用

Happy converting! 📖➡️📄
