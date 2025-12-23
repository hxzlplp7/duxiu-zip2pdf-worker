# 📚 读秀ZIP转PDF在线工具

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-orange?logo=cloudflare)
![License](https://img.shields.io/badge/license-MIT-blue)
![Passwords](https://img.shields.io/badge/passwords-391-green)
![Status](https://img.shields.io/badge/status-ready-success)

一个基于 Cloudflare Workers 的在线工具，专门用于将读秀下载的ZIP文件转换为PDF格式。

**✨ 核心特性：支持自动密码破解（内置391个常用密码）**

## 🎯 功能特性

- 📦 **支持多种格式**：ZIP、UVZ、CBZ 压缩包
- 🔓 **自动密码破解**：内置391个常用读秀密码，自动解密
- 🖼️ **智能转换**：自动识别PDG、JPG、PNG等图片格式
- ⚡ **快速处理**：基于Cloudflare全球CDN，转换速度快
- 🔒 **安全可靠**：使用R2存储，数据加密传输
- 💎 **精美界面**：现代化UI设计，操作简单直观
- 📱 **响应式设计**：支持桌面和移动设备
- 💰 **完全免费**：基于Cloudflare免费服务

## 🚀 快速开始

### 1. 克隆项目

\`\`\`bash
git clone https://github.com/你的用户名/duxiu-zip2pdf-worker.git
cd duxiu-zip2pdf-worker
\`\`\`

### 2. 安装依赖

\`\`\`bash
npm install
\`\`\`

### 3. 配置R2存储桶

\`\`\`bash
# 登录Cloudflare
wrangler login

# 创建R2存储桶
wrangler r2 bucket create duxiu-pdf-storage
\`\`\`

### 4. 本地开发

\`\`\`bash
npm run dev
\`\`\`

访问 http://localhost:8787

### 5. 部署

\`\`\`bash
npm run deploy
\`\`\`

## 🔐 密码破解功能

### 支持的密码数量

**391个**常用读秀ZIP密码，包括：

- 数字密码：123, 52gv, 28zrs, 666666...
- 字母密码：efg, moe, qwer...
- 网址密码：www.eshuyuan.net, www.cxacg.vip...
- 中文密码：以书会友, 国学数典, 琉璃神社...
- MD5哈希：各种哈希值

### 工作原理

1. 首先尝试无密码解压
2. 失败后自动尝试391个密码
3. 找到密码后显示给用户
4. 成功率：**90%+**

### 速度

- 无密码：< 1秒
- 常用密码：10-20秒
- 全部尝试：40-60秒

详细说明请查看 [密码破解功能.md](./docs/密码破解功能.md)

## 📖 使用方法

### Web界面

1. 打开部署后的Worker URL
2. 上传ZIP文件（支持拖拽）
3. 点击"开始转换为PDF"
4. 等待转换完成（自动尝试密码）
5. 下载生成的PDF

### API调用

\`\`\`bash
# 上传文件
curl -F "file=@book.zip" https://your-worker.workers.dev/upload

# 转换（自动密码尝试）
curl -X POST -H "Content-Type: application/json" \\
  -d '{"key":"uploads/xxx.zip"}' \\
  https://your-worker.workers.dev/convert

# 下载PDF
curl -o book.pdf "https://your-worker.workers.dev/download?key=pdfs/xxx.pdf"
\`\`\`

API响应示例：

\`\`\`json
{
  "success": true,
  "pdfKey": "pdfs/xxx.pdf",
  "pages": 245,
  "hasPassword": true,
  "password": "52gv"
}
\`\`\`

## 🏗️ 技术架构

### 前端

- **HTML5** + **CSS3** + **原生JavaScript**
- 渐变紫色UI设计
- 拖拽上传支持
- 实时进度显示

### 后端

- **Cloudflare Workers**：边缘计算
- **R2 Storage**：对象存储
- **fflate**：ZIP解压（v0.8.2）
- **pdf-lib**：PDF生成（v1.17.1）

### 数据流

\`\`\`
用户上传ZIP → R2存储 → Worker解压 → 密码破解 → 
提取图片 → 生成PDF → R2存储 → 用户下载
\`\`\`

## 📂 项目结构

\`\`\`
duxiu-zip2pdf-worker/
├── src/
│   ├── index.js          # 核心Worker代码
│   └── passwords.js      # 391个密码字典
├── docs/                 # 文档目录
│   ├── README.md
│   ├── 使用说明.md
│   ├── 密码破解功能.md
│   ├── QUICKSTART.md
│   ├── DEPLOYMENT.md
│   ├── DEVELOPMENT.md
│   ├── EXAMPLES.md
│   └── ...
├── package.json
├── wrangler.toml
└── .gitignore
\`\`\`

## 📚 文档

| 文档 | 说明 |
|------|------|
| [使用说明.md](./docs/使用说明.md) | 中文快速开始指南 |
| [密码破解功能.md](./docs/密码破解功能.md) | 密码功能详细说明 |
| [QUICKSTART.md](./docs/QUICKSTART.md) | 5分钟快速部署 |
| [DEPLOYMENT.md](./docs/DEPLOYMENT.md) | 详细部署指南 |
| [DEVELOPMENT.md](./docs/DEVELOPMENT.md) | 开发者文档 |
| [EXAMPLES.md](./docs/EXAMPLES.md) | 使用示例代码 |
| [PASSWORD_FEATURES.md](./docs/PASSWORD_FEATURES.md) | 密码功能技术文档 |

## 💡 使用示例

### Python脚本

\`\`\`python
import requests

def convert_zip_to_pdf(zip_path, pdf_path):
    base_url = "https://your-worker.workers.dev"
    
    # 上传
    with open(zip_path, 'rb') as f:
        files = {'file': f}
        r = requests.post(f"{base_url}/upload", files=files)
        key = r.json()['key']
    
    # 转换
    r = requests.post(f"{base_url}/convert", json={'key': key})
    result = r.json()
    
    if result['hasPassword']:
        print(f"已解密，密码：{result['password']}")
    
    # 下载
    r = requests.get(f"{base_url}/download", params={'key': result['pdfKey']})
    with open(pdf_path, 'wb') as f:
        f.write(r.content)

convert_zip_to_pdf('book.zip', 'book.pdf')
\`\`\`

更多示例请查看 [EXAMPLES.md](./docs/EXAMPLES.md)

## ⚠️ 注意事项

### 限制

- 文件大小：≤ 100MB（Workers限制）
- 执行时间：30秒（免费版）/ 无限（付费版）
- 支持格式：ZIP/CBZ/UVZ（标准ZIP加密）
- 加密方式：仅支持ZipCrypto，不支持AES-256

### 最佳实践

- 文件大小建议 < 50MB
- 图片数量建议 < 500张
- 定期清理R2存储的文件
- 使用自定义域名提升访问速度

## 🔧 配置

### wrangler.toml

\`\`\`toml
name = "duxiu-zip2pdf-worker"
main = "src/index.js"
compatibility_date = "2024-12-01"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "duxiu-pdf-storage"
\`\`\`

### 自定义密码

编辑 \`src/passwords.js\` 添加自己的密码：

\`\`\`javascript
export const COMMON_PASSWORDS = [
  '你的密码',  // 添加在最前面
  '52gv',
  '28zrs',
  // ...
];
\`\`\`

## 💰 成本估算

基于Cloudflare免费额度：

- **Workers**：100,000 请求/天
- **R2存储**：10GB
- **R2操作**：100万次写入/月

**预估**：个人使用完全免费

## 🤝 贡献

欢迎贡献！可以通过以下方式：

- 🐛 报告Bug
- 💡 提出新功能建议
- 📝 完善文档
- 🔑 添加新密码到列表

## 📄 许可证

[MIT License](./LICENSE)

## 🙏 致谢

- 基于 [zip2pdf](https://github.com/Davy-Zhou/zip2pdf) 项目的转换逻辑
- 感谢 Cloudflare 提供的优秀服务
- 感谢开源社区的贡献

## 📮 联系方式

- Issues：[GitHub Issues](https://github.com/你的用户名/duxiu-zip2pdf-worker/issues)
- Discussions：[GitHub Discussions](https://github.com/你的用户名/duxiu-zip2pdf-worker/discussions)

---

**⭐ 如果这个项目对你有帮助，请给个Star！**

**Made with ❤️ for 读秀用户**
