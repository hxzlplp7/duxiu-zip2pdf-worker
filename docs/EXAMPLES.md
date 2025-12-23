# 使用示例

## 基本使用

### 1. Web界面使用

访问部署后的Worker URL，例如：
\`\`\`
https://duxiu-zip2pdf-worker.YOUR-SUBDOMAIN.workers.dev
\`\`\`

1. 点击上传区域或拖拽ZIP文件
2. 等待文件上传完成
3. 点击"开始转换为PDF"
4. 等待转换完成
5. 点击下载按钮获取PDF

### 2. 使用curl命令行

#### 上传文件

\`\`\`bash
curl -X POST https://your-worker.workers.dev/upload \\
  -F "file=@path/to/your/book.zip"
\`\`\`

响应示例：
\`\`\`json
{
  "success": true,
  "key": "uploads/1234567890-abc123-book.zip",
  "filename": "book.zip",
  "size": 12345678
}
\`\`\`

#### 转换文件

\`\`\`bash
curl -X POST https://your-worker.workers.dev/convert \\
  -H "Content-Type: application/json" \\
  -d '{"key":"uploads/1234567890-abc123-book.zip"}'
\`\`\`

响应示例：
\`\`\`json
{
  "success": true,
  "pdfKey": "pdfs/1234567890-abc123-book.pdf",
  "pages": 245
}
\`\`\`

#### 下载PDF

\`\`\`bash
curl -o book.pdf https://your-worker.workers.dev/download?key=pdfs/1234567890-abc123-book.pdf
\`\`\`

#### 列出所有PDF

\`\`\`bash
curl https://your-worker.workers.dev/list
\`\`\`

响应示例：
\`\`\`json
{
  "success": true,
  "files": [
    {
      "key": "pdfs/1234567890-abc123-book.pdf",
      "size": 15678901,
      "uploaded": "2024-12-23T04:14:36.000Z"
    }
  ]
}
\`\`\`

### 3. 使用Python脚本

\`\`\`python
import requests

# Worker URL
BASE_URL = "https://your-worker.workers.dev"

# 上传文件
def upload_file(filepath):
    with open(filepath, 'rb') as f:
        files = {'file': f}
        response = requests.post(f"{BASE_URL}/upload", files=files)
        return response.json()

# 转换文件
def convert_file(key):
    data = {'key': key}
    response = requests.post(f"{BASE_URL}/convert", json=data)
    return response.json()

# 下载PDF
def download_pdf(key, output_path):
    params = {'key': key}
    response = requests.get(f"{BASE_URL}/download", params=params)
    with open(output_path, 'wb') as f:
        f.write(response.content)

# 完整流程
def convert_zip_to_pdf(zip_path, pdf_path):
    print("上传文件...")
    upload_result = upload_file(zip_path)
    print(f"上传成功: {upload_result['key']}")
    
    print("转换中...")
    convert_result = convert_file(upload_result['key'])
    print(f"转换成功: {convert_result['pages']} 页")
    
    print("下载PDF...")
    download_pdf(convert_result['pdfKey'], pdf_path)
    print(f"完成! PDF保存至: {pdf_path}")

# 使用示例
if __name__ == "__main__":
    convert_zip_to_pdf("book.zip", "book.pdf")
\`\`\`

### 4. 使用JavaScript/Node.js

\`\`\`javascript
const FormData = require('form-data');
const fs = require('fs');
const axios = require('axios');

const BASE_URL = 'https://your-worker.workers.dev';

// 上传文件
async function uploadFile(filepath) {
  const form = new FormData();
  form.append('file', fs.createReadStream(filepath));
  
  const response = await axios.post(\`\${BASE_URL}/upload\`, form, {
    headers: form.getHeaders()
  });
  
  return response.data;
}

// 转换文件
async function convertFile(key) {
  const response = await axios.post(\`\${BASE_URL}/convert\`, { key });
  return response.data;
}

// 下载PDF
async function downloadPdf(key, outputPath) {
  const response = await axios.get(\`\${BASE_URL}/download\`, {
    params: { key },
    responseType: 'stream'
  });
  
  const writer = fs.createWriteStream(outputPath);
  response.data.pipe(writer);
  
  return new Promise((resolve, reject) => {
    writer.on('finish', resolve);
    writer.on('error', reject);
  });
}

// 完整流程
async function convertZipToPdf(zipPath, pdfPath) {
  try {
    console.log('上传文件...');
    const uploadResult = await uploadFile(zipPath);
    console.log(\`上传成功: \${uploadResult.key}\`);
    
    console.log('转换中...');
    const convertResult = await convertFile(uploadResult.key);
    console.log(\`转换成功: \${convertResult.pages} 页\`);
    
    console.log('下载PDF...');
    await downloadPdf(convertResult.pdfKey, pdfPath);
    console.log(\`完成! PDF保存至: \${pdfPath}\`);
  } catch (error) {
    console.error('错误:', error.message);
  }
}

// 使用示例
convertZipToPdf('book.zip', 'book.pdf');
\`\`\`

## 高级用法

### 批量处理

\`\`\`bash
#!/bin/bash

# 批量转换目录中的所有ZIP文件
for file in *.zip; do
    echo "处理: $file"
    
    # 上传
    upload_result=$(curl -s -X POST https://your-worker.workers.dev/upload \\
        -F "file=@$file")
    key=$(echo $upload_result | jq -r '.key')
    
    # 转换
    convert_result=$(curl -s -X POST https://your-worker.workers.dev/convert \\
        -H "Content-Type: application/json" \\
        -d "{\"key\":\"$key\"}")
    pdf_key=$(echo $convert_result | jq -r '.pdfKey')
    
    # 下载
    output="${file%.zip}.pdf"
    curl -o "$output" "https://your-worker.workers.dev/download?key=$pdf_key"
    
    echo "完成: $output"
done
\`\`\`

### 集成到现有应用

\`\`\`html
<!DOCTYPE html>
<html>
<head>
    <title>集成示例</title>
</head>
<body>
    <input type="file" id="fileInput" accept=".zip">
    <button onclick="convertFile()">转换</button>
    
    <script>
        async function convertFile() {
            const file = document.getElementById('fileInput').files[0];
            if (!file) return alert('请选择文件');
            
            const BASE_URL = 'https://your-worker.workers.dev';
            
            // 上传
            const formData = new FormData();
            formData.append('file', file);
            const uploadRes = await fetch(\`\${BASE_URL}/upload\`, {
                method: 'POST',
                body: formData
            });
            const { key } = await uploadRes.json();
            
            // 转换
            const convertRes = await fetch(\`\${BASE_URL}/convert\`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ key })
            });
            const { pdfKey } = await convertRes.json();
            
            // 下载
            window.location.href = \`\${BASE_URL}/download?key=\${pdfKey}\`;
        }
    </script>
</body>
</html>
\`\`\`

## 常见使用场景

### 1. 个人书库管理

定期转换下载的读秀书籍，建立个人PDF书库。

### 2. 批量处理

使用脚本批量转换历史下载的ZIP文件。

### 3. 自动化工作流

集成到自动化脚本中，如：
- 下载 → 转换 → 上传到网盘
- 下载 → 转换 → 发送到Kindle

### 4. Web服务

将转换功能集成到自己的网站或应用中。

## 最佳实践

1. **文件命名**: 使用有意义的文件名，便于管理
2. **定期清理**: 定期删除不需要的文件，节省空间
3. **批量处理**: 对于大量文件，使用脚本批量处理更高效
4. **错误处理**: 在脚本中添加错误处理和重试机制
5. **进度监控**: 处理大文件时，监控进度避免超时

## 故障排除

### 问题：上传失败

检查：
- 文件是否损坏
- 文件大小是否超限
- 网络连接是否正常

### 问题：转换失败

检查：
- ZIP文件格式是否正确
- 是否包含有效的图片文件
- 图片格式是否支持

### 问题：下载链接无效

检查：
- PDF是否已生成
- Key是否正确
- 文件是否已过期

## 提示和技巧

1. **文件压缩**: 对于大文件，可以先压缩再上传
2. **分批处理**: 将大书拆分为多个ZIP分别处理
3. **使用代理**: 如网络不稳定，可使用代理
4. **保存记录**: 记录转换历史，避免重复处理
