# 📚 读秀ZIP转PDF在线工具

![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?logo=cloudflare)
![License](https://img.shields.io/badge/License-MIT-blue)
![Status](https://img.shields.io/badge/Status-Ready-success)

一个基于 Cloudflare Workers 的在线工具，将读秀ZIP文件一键转换为PDF。

**🔥 核心特性：支持自动密码破解（100个常用密码）**

---

## ⚡ 一分钟快速部署

### 前提条件
- [Node.js](https://nodejs.org/) 18 或更高版本
- [Cloudflare账号](https://dash.cloudflare.com/sign-up)

### 部署命令

```bash
# 1. 克隆项目
git clone https://github.com/hxzlplp7/duxiu-zip2pdf-worker.git
cd duxiu-zip2pdf-worker

# 2. 安装依赖
npm install

# 3. 登录Cloudflare（会打开浏览器授权）
npx wrangler login

# 4. 创建R2存储桶
npx wrangler r2 bucket create duxiu-pdf-storage

# 5. 部署！
npm run deploy
```

部署成功后，你会看到类似这样的URL：
```
https://duxiu-zip2pdf-worker.你的ID.workers.dev
```

打开这个URL就可以使用了！

---

## 🎯 功能特性

| 功能 | 说明 |
|------|------|
| 📦 多格式支持 | ZIP、UVZ、CBZ |
| 🔓 自动解密 | 100个常用密码自动尝试 |
| 📁 子文件夹 | 自动识别子文件夹内图片 |
| 📖 封面识别 | 自动识别cov001/cov002 |
| 📋 实时日志 | 显示完整转换过程 |
| ⏰ 24小时自动删除 | 保护隐私 |
| 🔐 手动密码 | 自动失败可手动输入 |

---

## 📖 使用方法

1. 打开你的Worker URL
2. 上传ZIP文件（拖拽或点击）
3. 点击"开始转换为PDF"
4. 等待转换完成
5. 下载PDF文件

---

## ❓ 常见问题

### Error 1101
查看日志排查：
```bash
npx wrangler tail
```

### 转换失败
- 文件太大：建议<50MB
- 密码错误：手动输入密码重试
- 格式问题：确保ZIP内有PDG/JPG/PNG图片

### R2存储桶问题
```bash
# 查看已有存储桶
npx wrangler r2 bucket list

# 如果没有，创建一个
npx wrangler r2 bucket create duxiu-pdf-storage

# 重新部署
npm run deploy
```

---

## 📂 项目结构

```
duxiu-zip2pdf-worker/
├── src/
│   ├── index.js        # 核心代码
│   └── passwords.js    # 密码字典
├── docs/               # 文档
├── package.json
├── wrangler.toml       # Cloudflare配置
└── README.md
```

---

## 🔗 相关链接

- 📖 [详细部署教程](./docs/一键部署指南.md)
- 🐛 [问题反馈](https://github.com/hxzlplp7/duxiu-zip2pdf-worker/issues)

---

## 📄 许可证

MIT License

---

**⭐ 如果有用，请给个Star！**
