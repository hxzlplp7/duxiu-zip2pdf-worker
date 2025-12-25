# 🔧 Error 1101 排查指南

Error 1101 表示 Cloudflare Worker 运行时抛出了异常。本文档帮你快速定位和解决问题。

---

## 🔍 第一步：查看实时日志

在项目目录下运行：

```powershell
npx wrangler tail
```

然后在浏览器中访问你的Worker并操作。观察终端输出的日志。

**常见日志错误：**

| 日志内容 | 问题原因 | 解决方法 |
|---------|---------|---------|
| `BUCKET is not defined` | R2未绑定 | 检查R2绑定 |
| `unzip is not a function` | 依赖问题 | 重新npm install |
| `TimeoutError` | 文件太大或密码太多 | 用更小的文件测试 |
| `Network error` | 网络问题 | 稍后重试 |

---

## 🔧 第二步：检查R2绑定

### 方法一：通过命令行

```powershell
# 查看已部署的Worker信息
npx wrangler deployments list
```

### 方法二：通过Dashboard

1. 访问 https://dash.cloudflare.com/
2. 点击 "Workers & Pages"
3. 找到 `duxiu-zip2pdf-worker`
4. 点击 "Settings" → "Variables"
5. 检查 "R2 Bucket Bindings" 部分
6. 确认有 `BUCKET` 绑定到 `duxiu-pdf-storage`

**如果没有绑定：**

1. 在Settings页面点击 "Edit"
2. 添加R2 Bucket Binding：
   - Variable name: `BUCKET`
   - R2 bucket: `duxiu-pdf-storage`
3. 保存

---

## 🔧 第三步：检查R2存储桶

```powershell
# 列出所有R2存储桶
npx wrangler r2 bucket list
```

**如果没有 duxiu-pdf-storage：**

```powershell
npx wrangler r2 bucket create duxiu-pdf-storage
```

**然后重新部署：**

```powershell
npm run deploy
```

---

## 🔧 第四步：重新部署

如果上述步骤都正常，尝试清理后重新部署：

```powershell
# 删除node_modules
Remove-Item -Recurse -Force node_modules

# 删除package-lock.json
Remove-Item package-lock.json

# 重新安装
npm install

# 重新部署
npm run deploy
```

---

## 🔧 第五步：检查wrangler.toml

确保 `wrangler.toml` 内容正确：

```toml
name = "duxiu-zip2pdf-worker"
main = "src/index.js"
compatibility_date = "2024-12-01"

[[r2_buckets]]
binding = "BUCKET"
bucket_name = "duxiu-pdf-storage"
```

**注意：**
- `binding` 必须是 `BUCKET`（大写）
- `bucket_name` 必须与你创建的存储桶名称一致

---

## 🔧 第六步：测试首页

先测试首页是否正常：

```powershell
curl https://duxiu-zip2pdf-worker.你的ID.workers.dev/
```

或在浏览器中访问。

**如果首页正常显示，但转换失败：**
- 问题在转换逻辑
- 查看日志确定具体错误

**如果首页也报错：**
- 问题在基础代码
- 重新部署

---

## 🧪 本地测试

在部署前先本地测试：

```powershell
npm run dev
```

访问 http://localhost:8787

如果本地正常但线上报错，可能是：
- R2绑定问题
- 环境差异

---

## 📋 完整重新部署流程

如果上述都无法解决，执行完整重新部署：

```powershell
# 1. 进入项目目录
cd D:\你的路径\duxiu-zip2pdf-worker

# 2. 清理
Remove-Item -Recurse -Force node_modules -ErrorAction SilentlyContinue
Remove-Item package-lock.json -ErrorAction SilentlyContinue

# 3. 安装依赖
npm install

# 4. 重新登录
npx wrangler login

# 5. 确保R2存储桶存在
npx wrangler r2 bucket create duxiu-pdf-storage

# 6. 部署
npm run deploy

# 7. 查看日志
npx wrangler tail
```

---

## 🆘 仍然无法解决？

1. **收集信息：**
   - `npx wrangler tail` 的输出
   - 浏览器控制台的错误（F12）
   - 你的操作步骤

2. **提交Issue：**
   - https://github.com/hxzlplp7/duxiu-zip2pdf-worker/issues

3. **提供以下信息：**
   - Node.js版本：`node --version`
   - npm版本：`npm --version`
   - 操作系统
   - 完整错误信息

---

## ✅ 成功标志

当你看到以下现象时，说明部署成功：

1. 访问Worker URL显示紫色界面
2. 上传小ZIP文件能正常转换
3. 日志框显示完整转换过程
4. 能成功下载PDF

**恭喜！问题已解决！** 🎉
