# 开发文档

## 代码结构

### src/index.js

主Worker文件包含以下核心函数：

#### 1. fetch(request, env)
- 主入口函数
- 处理路由分发
- 错误处理和CORS

#### 2. handleHomePage(corsHeaders)
- 返回前端HTML页面
- 包含完整的UI和JavaScript

#### 3. handleUpload(request, env, corsHeaders)
- 处理文件上传
- 生成唯一文件key
- 存储到R2

#### 4. handleConvert(request, env, corsHeaders)
- 从R2获取ZIP文件
- 解压并提取图片
- 生成PDF
- 保存到R2

#### 5. handleDownload(request, env, corsHeaders)
- 提供PDF下载
- 设置正确的Content-Type

#### 6. handleList(env, corsHeaders)
- 列出所有PDF文件
- 返回JSON格式

## 核心转换流程

\`\`\`javascript
// 1. 解压ZIP
const files = await new Promise((resolve, reject) => {
  unzip(new Uint8Array(zipData), (err, result) => {
    if (err) reject(err);
    else resolve(result);
  });
});

// 2. 提取图片文件
const imageFiles = [];
for (const [filename, data] of Object.entries(files)) {
  if (isImageFile(filename)) {
    imageFiles.push({ filename, data });
  }
}

// 3. 排序
imageFiles.sort((a, b) => 
  a.filename.localeCompare(b.filename, undefined, {
    numeric: true,
    sensitivity: 'base'
  })
);

// 4. 创建PDF
const pdfDoc = await PDFDocument.create();
for (const { data } of imageFiles) {
  const image = await pdfDoc.embedJpg(data);
  const page = pdfDoc.addPage([image.width, image.height]);
  page.drawImage(image, { x: 0, y: 0, width: image.width, height: image.height });
}

// 5. 保存
const pdfBytes = await pdfDoc.save();
\`\`\`

## 数据流

\`\`\`
用户 → 上传ZIP → R2(uploads/) → 
Worker解压 → 提取图片 → 生成PDF → 
R2(pdfs/) → 用户下载
\`\`\`

## R2存储结构

\`\`\`
duxiu-pdf-storage/
├── uploads/
│   ├── 1234567890-abc123-book1.zip
│   └── 1234567891-def456-book2.zip
└── pdfs/
    ├── 1234567890-abc123-book1.pdf
    └── 1234567891-def456-book2.pdf
\`\`\`

## 支持的图片格式

- **.pdg**: 读秀专用格式（实际为JPG）
- **.jpg/.jpeg**: JPEG图片
- **.png**: PNG图片
- **.bmp**: BMP位图
- **.tif/.tiff**: TIFF图片

## 错误处理

### 客户端错误处理

\`\`\`javascript
try {
  // 操作
} catch (error) {
  showError('转换失败：' + error.message);
  convertBtn.disabled = false;
  progressContainer.style.display = 'none';
}
\`\`\`

### 服务端错误处理

\`\`\`javascript
catch (error) {
  console.error('Convert error:', error);
  return new Response(JSON.stringify({ 
    error: error.message,
    stack: error.stack 
  }), {
    status: 500,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });
}
\`\`\`

## 性能优化建议

### 1. 图片处理优化

\`\`\`javascript
// 可以添加图片压缩
async function compressImage(imageData) {
  // 使用sharp或其他图片处理库
}
\`\`\`

### 2. 并行处理

\`\`\`javascript
// 并行嵌入多张图片
await Promise.all(imageFiles.map(async ({ data }) => {
  return await pdfDoc.embedJpg(data);
}));
\`\`\`

### 3. 缓存策略

\`\`\`javascript
// 添加缓存控制
headers: {
  'Cache-Control': 'public, max-age=3600',
}
\`\`\`

### 4. 流式处理

对于大文件，考虑使用流式处理：

\`\`\`javascript
// 使用ReadableStream
const stream = new ReadableStream({
  async start(controller) {
    // 分块处理
  }
});
\`\`\`

## 添加新功能

### 1. 用户认证

\`\`\`javascript
async function authenticate(request) {
  const token = request.headers.get('Authorization');
  // 验证token
  return isValid;
}
\`\`\`

### 2. 文件加密

\`\`\`javascript
import { encrypt, decrypt } from './crypto';

// 上传时加密
const encrypted = await encrypt(fileData, password);
await env.BUCKET.put(key, encrypted);

// 下载时解密
const decrypted = await decrypt(encrypted, password);
\`\`\`

### 3. 水印添加

\`\`\`javascript
// 在每一页添加水印
page.drawText('Watermark', {
  x: 50,
  y: 50,
  size: 20,
  opacity: 0.5,
});
\`\`\`

### 4. OCR文字识别

\`\`\`javascript
// 集成Tesseract.js
import Tesseract from 'tesseract.js';

const { data: { text } } = await Tesseract.recognize(imageData);
\`\`\`

## 测试

### 单元测试

\`\`\`javascript
// test/index.test.js
import { handleConvert } from '../src/index.js';

describe('ZIP to PDF Conversion', () => {
  test('should convert valid ZIP to PDF', async () => {
    // 测试逻辑
  });
});
\`\`\`

### 集成测试

\`\`\`bash
# 使用wrangler测试
wrangler dev --test
\`\`\`

## 调试技巧

### 1. 本地调试

\`\`\`bash
npm run dev
# 访问 http://localhost:8787
\`\`\`

### 2. 查看日志

\`\`\`bash
wrangler tail --format pretty
\`\`\`

### 3. 使用console.log

\`\`\`javascript
console.log('Processing file:', filename);
console.log('Image count:', imageFiles.length);
\`\`\`

### 4. Chrome DevTools

在浏览器中使用开发者工具：
- Network panel查看请求
- Console查看错误
- Application查看存储

## API扩展

### 批量转换API

\`\`\`javascript
case '/batch-convert':
  return await handleBatchConvert(request, env, corsHeaders);
\`\`\`

### 进度查询API

\`\`\`javascript
case '/progress':
  const jobId = url.searchParams.get('jobId');
  return await getJobProgress(jobId, env, corsHeaders);
\`\`\`

### 文件管理API

\`\`\`javascript
case '/delete':
  return await handleDelete(request, env, corsHeaders);
\`\`\`

## 最佳实践

1. **错误处理**: 始终处理异常情况
2. **输入验证**: 验证所有用户输入
3. **资源清理**: 及时释放不需要的资源
4. **日志记录**: 记录关键操作和错误
5. **安全性**: 防止注入攻击和XSS
6. **性能**: 优化大文件处理
7. **可维护性**: 保持代码清晰简洁

## 贡献指南

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 推送到分支
5. 创建Pull Request

## 资源链接

- [Cloudflare Workers文档](https://developers.cloudflare.com/workers/)
- [R2文档](https://developers.cloudflare.com/r2/)
- [pdf-lib文档](https://pdf-lib.js.org/)
- [fflate文档](https://github.com/101arrowz/fflate)
