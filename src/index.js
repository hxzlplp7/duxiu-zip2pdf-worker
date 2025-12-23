import { unzip, unzipSync } from 'fflate';
import { PDFDocument } from 'pdf-lib';
import { COMMON_PASSWORDS } from './passwords.js';

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const path = url.pathname;
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, X-Custom-Password',
    };
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders });
    }
    try {
      switch (path) {
        case '/':
          return handleHomePage(corsHeaders);
        case '/upload':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          return await handleUpload(request, env, corsHeaders);
        case '/convert':
          if (request.method !== 'POST') return new Response('Method not allowed', { status: 405 });
          return await handleConvert(request, env, corsHeaders);
        case '/download':
          return await handleDownload(request, env, corsHeaders);
        case '/list':
          return await handleList(env, corsHeaders);
        case '/cleanup':
          return await handleCleanup(env, corsHeaders);
        default:
          return new Response('Not found', { status: 404, headers: corsHeaders });
      }
    } catch (error) {
      console.error('Error:', error);
      return new Response(JSON.stringify({ error: error.message }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }
  }
};

function handleHomePage(corsHeaders) {
  const html = `<!DOCTYPE html>
<html lang="zh-CN">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>读秀ZIP转PDF</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: system-ui, sans-serif; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); min-height: 100vh; display: flex; justify-content: center; align-items: center; padding: 20px; }
    .container { background: rgba(255,255,255,0.95); border-radius: 24px; box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 40px; max-width: 800px; width: 100%; }
    h1 { color: #667eea; text-align: center; margin-bottom: 10px; font-size: 2.5em; background: linear-gradient(135deg, #667eea, #764ba2); -webkit-background-clip: text; -webkit-text-fill-color: transparent; }
    .subtitle { text-align: center; color: #666; margin-bottom: 30px; }
    .upload-area { border: 3px dashed #667eea; border-radius: 16px; padding: 60px 20px; text-align: center; cursor: pointer; transition: all 0.3s; background: rgba(102,126,234,0.05); margin-bottom: 20px; }
    .upload-area:hover { border-color: #764ba2; background: rgba(102,126,234,0.1); }
    .upload-area.dragging { border-color: #764ba2; transform: scale(1.02); }
    .upload-icon { font-size: 64px; margin-bottom: 20px; }
    .upload-text { font-size: 1.2em; color: #667eea; font-weight: 600; }
    .upload-hint { color: #999; font-size: 0.9em; margin-top: 10px; }
    input[type="file"] { display: none; }
    .file-info { background: #f5f5f5; padding: 15px; border-radius: 12px; margin: 15px 0; display: none; }
    .file-info-item { display: flex; justify-content: space-between; padding: 5px 0; }
    .password-box { display: none; margin: 15px 0; padding: 15px; background: #fff3cd; border-radius: 12px; border-left: 4px solid #ffc107; }
    .password-box input { padding: 10px; border: 2px solid #ffc107; border-radius: 8px; margin-right: 10px; flex: 1; }
    .password-box button { padding: 10px 20px; background: #ffc107; color: #fff; border: none; border-radius: 8px; cursor: pointer; }
    .btn { background: linear-gradient(135deg, #667eea, #764ba2); color: white; border: none; padding: 15px 40px; border-radius: 12px; font-size: 1.1em; font-weight: 600; cursor: pointer; width: 100%; margin-top: 10px; }
    .btn:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 20px rgba(102,126,234,0.5); }
    .progress-container { display: none; margin-top: 20px; }
    .progress-bar { width: 100%; height: 8px; background: #e0e0e0; border-radius: 10px; overflow: hidden; }
    .progress-fill { height: 100%; background: linear-gradient(90deg, #667eea, #764ba2); width: 0%; transition: width 0.3s; }
    .status { text-align: center; color: #666; margin-top: 10px; }
    .result { display: none; margin-top: 20px; padding: 20px; background: rgba(34,197,94,0.1); border-radius: 12px; border: 2px solid #22c55e; text-align: center; }
    .result-icon { font-size: 48px; }
    .result-text { color: #22c55e; font-size: 1.2em; font-weight: 600; margin: 15px 0; }
    .download-btn { background: linear-gradient(135deg, #22c55e, #16a34a); }
    .error { background: #fee; color: #c33; padding: 15px; border-radius: 8px; margin-top: 15px; display: none; border-left: 4px solid #c33; }
    .features { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 15px; margin-top: 25px; }
    .feature { text-align: center; padding: 15px; background: #f8f9fa; border-radius: 12px; }
    .feature-icon { font-size: 28px; margin-bottom: 8px; }
    .feature-title { color: #667eea; font-weight: 600; font-size: 0.9em; }
    .disclaimer { margin-top: 25px; padding: 15px; background: #fff9e6; border-left: 4px solid #ffc107; border-radius: 8px; font-size: 0.85em; color: #856404; }
    .disclaimer-title { font-weight: 700; color: #d39e00; margin-bottom: 10px; }
    .disclaimer p { margin: 8px 0; line-height: 1.5; }
  </style>
</head>
<body>
  <div class="container">
    <h1>📚 读秀ZIP转PDF</h1>
    <p class="subtitle">在线转换工具 | 支持自动密码破解（391个密码）</p>
    <div class="upload-area" id="uploadArea">
      <div class="upload-icon">📦</div>
      <div class="upload-text">点击或拖拽ZIP文件到这里</div>
      <div class="upload-hint">支持ZIP、UVZ、CBZ格式（自动识别封面封底和子文件夹）</div>
      <input type="file" id="fileInput" accept=".zip,.uvz,.cbz" />
    </div>
    <div class="file-info" id="fileInfo"></div>
    <div class="password-box" id="passwordBox">
      <strong>⚠️ 自动解密失败，请手动输入密码：</strong><br><br>
      <div style="display:flex;">
        <input type="text" id="manualPassword" placeholder="输入ZIP密码" />
        <button onclick="retryWithPassword()">重试</button>
      </div>
    </div>
    <button class="btn" id="convertBtn" disabled>开始转换为PDF</button>
    <div class="progress-container" id="progressBox">
      <div class="progress-bar"><div class="progress-fill" id="progressFill"></div></div>
      <div class="status" id="status">准备中...</div>
    </div>
    <div class="error" id="errorBox"></div>
    <div class="result" id="resultBox">
      <div class="result-icon">✅</div>
      <div class="result-text" id="resultText">转换成功！</div>
      <button class="btn download-btn" id="downloadBtn">下载PDF文件</button>
    </div>
    <div class="features">
      <div class="feature"><div class="feature-icon">⚡</div><div class="feature-title">快速转换</div></div>
      <div class="feature"><div class="feature-icon">🔓</div><div class="feature-title">自动解密</div></div>
      <div class="feature"><div class="feature-icon">📖</div><div class="feature-title">封面识别</div></div>
      <div class="feature"><div class="feature-icon">📁</div><div class="feature-title">子文件夹</div></div>
    </div>
    <div class="disclaimer">
      <div class="disclaimer-title">⚠️ 免责声明</div>
      <p><strong>1. 存储时限：</strong>文件保存24小时后自动删除，请及时下载。</p>
      <p><strong>2. 版权声明：</strong>仅供个人学习研究，请遵守版权法规。</p>
      <p><strong>3. 隐私保护：</strong>文件仅用于转换，不保存不分享。</p>
    </div>
  </div>
  <script>
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');
    const convertBtn = document.getElementById('convertBtn');
    const progressBox = document.getElementById('progressBox');
    const progressFill = document.getElementById('progressFill');
    const status = document.getElementById('status');
    const fileInfo = document.getElementById('fileInfo');
    const resultBox = document.getElementById('resultBox');
    const resultText = document.getElementById('resultText');
    const downloadBtn = document.getElementById('downloadBtn');
    const errorBox = document.getElementById('errorBox');
    const passwordBox = document.getElementById('passwordBox');
    let selectedFile = null, uploadedKey = null;
    uploadArea.onclick = () => fileInput.click();
    fileInput.onchange = (e) => selectFile(e.target.files[0]);
    uploadArea.ondragover = (e) => { e.preventDefault(); uploadArea.classList.add('dragging'); };
    uploadArea.ondragleave = () => uploadArea.classList.remove('dragging');
    uploadArea.ondrop = (e) => { e.preventDefault(); uploadArea.classList.remove('dragging'); selectFile(e.dataTransfer.files[0]); };
    function selectFile(file) {
      if (!file) return;
      if (!/\\.(zip|uvz|cbz)$/i.test(file.name)) { showError('请选择有效的ZIP文件'); return; }
      selectedFile = file;
      convertBtn.disabled = false;
      fileInfo.style.display = 'block';
      fileInfo.innerHTML = '<div class="file-info-item"><span>文件名：</span><span>' + file.name + '</span></div>' +
        '<div class="file-info-item"><span>大小：</span><span>' + (file.size/1024/1024).toFixed(2) + ' MB</span></div>';
      hideError(); passwordBox.style.display = 'none';
    }
    convertBtn.onclick = () => startConvert();
    async function startConvert(customPwd) {
      if (!selectedFile) return;
      convertBtn.disabled = true;
      progressBox.style.display = 'block';
      resultBox.style.display = 'none';
      hideError(); passwordBox.style.display = 'none';
      try {
        updateProgress(10, '正在上传...');
        const formData = new FormData();
        formData.append('file', selectedFile);
        const uploadRes = await fetch('/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) throw new Error('上传失败');
        const uploadData = await uploadRes.json();
        uploadedKey = uploadData.key;
        updateProgress(40, '上传完成，正在转换...');
        const headers = { 'Content-Type': 'application/json' };
        if (customPwd) headers['X-Custom-Password'] = customPwd;
        const convertRes = await fetch('/convert', { method: 'POST', headers, body: JSON.stringify({ key: uploadedKey }) });
        const contentType = convertRes.headers.get('content-type') || '';
        if (!contentType.includes('application/json')) {
          const text = await convertRes.text();
          throw new Error('服务器错误: ' + text.substring(0, 100));
        }
        const result = await convertRes.json();
        if (!convertRes.ok) {
          if (result.needPassword) { passwordBox.style.display = 'block'; updateProgress(50, '需要密码'); convertBtn.disabled = false; return; }
          throw new Error(result.error || '转换失败');
        }
        updateProgress(100, '完成！');
        resultBox.style.display = 'block';
        let msg = '转换成功！共 ' + result.pages + ' 页';
        if (result.hasPassword) msg += '<br><small>已解密（密码: ' + result.password + '）</small>';
        if (result.hasCover) msg += '<br><small>✓ 已识别封面封底</small>';
        resultText.innerHTML = msg;
        downloadBtn.onclick = () => { window.location.href = '/download?key=' + result.pdfKey; };
        progressBox.style.display = 'none';
      } catch (err) {
        showError(err.message);
        convertBtn.disabled = false;
      }
    }
    function retryWithPassword() {
      const pwd = document.getElementById('manualPassword').value.trim();
      if (!pwd) { alert('请输入密码'); return; }
      startConvert(pwd);
    }
    function updateProgress(pct, msg) { progressFill.style.width = pct + '%'; status.textContent = msg; }
    function showError(msg) { errorBox.textContent = '转换失败：' + msg; errorBox.style.display = 'block'; progressBox.style.display = 'none'; }
    function hideError() { errorBox.style.display = 'none'; }
  </script>
</body>
</html>`;
  return new Response(html, { headers: { ...corsHeaders, 'Content-Type': 'text/html; charset=utf-8' } });
}

async function handleUpload(request, env, corsHeaders) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');
    if (!file) {
      return new Response(JSON.stringify({ error: '没有文件' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const key = 'uploads/' + Date.now() + '-' + Math.random().toString(36).slice(2) + '-' + file.name;
    await env.BUCKET.put(key, file.stream(), { httpMetadata: { contentType: 'application/zip' }, customMetadata: { expiresAt: new Date(Date.now() + 86400000).toISOString() } });
    return new Response(JSON.stringify({ success: true, key, filename: file.name, size: file.size }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function handleConvert(request, env, corsHeaders) {
  try {
    const { key } = await request.json();
    const customPassword = request.headers.get('X-Custom-Password');
    if (!key) {
      return new Response(JSON.stringify({ error: '缺少key' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const object = await env.BUCKET.get(key);
    if (!object) {
      return new Response(JSON.stringify({ error: '文件不存在' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const zipData = await object.arrayBuffer();
    let files = null;
    let usedPassword = null;

    // 尝试解压
    try {
      files = await new Promise((resolve, reject) => {
        unzip(new Uint8Array(zipData), (err, result) => {
          if (err) reject(err);
          else resolve(result);
        });
      });
    } catch (e) {
      // 需要密码
      if (customPassword) {
        try {
          files = unzipSync(new Uint8Array(zipData), { password: new TextEncoder().encode(customPassword) });
          usedPassword = customPassword;
        } catch (e2) { /* 继续尝试 */ }
      }
      if (!files) {
        for (let i = 0; i < COMMON_PASSWORDS.length; i++) {
          try {
            files = unzipSync(new Uint8Array(zipData), { password: new TextEncoder().encode(COMMON_PASSWORDS[i]) });
            usedPassword = COMMON_PASSWORDS[i];
            break;
          } catch (e3) { continue; }
        }
      }
      if (!files) {
        return new Response(JSON.stringify({ error: '无法解压，密码不在列表中', needPassword: true }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
      }
    }

    // 提取图片（支持子文件夹）
    const imageFiles = [];
    let cover = null, backCover = null, hasCover = false;
    for (const [fullPath, data] of Object.entries(files)) {
      if (!data || data.length === 0) continue;
      const lp = fullPath.toLowerCase();
      if (!(lp.endsWith('.pdg') || lp.endsWith('.jpg') || lp.endsWith('.jpeg') || lp.endsWith('.png') || lp.endsWith('.bmp') || lp.endsWith('.tif') || lp.endsWith('.tiff') || lp.endsWith('.gif'))) continue;
      const fname = fullPath.split(/[/\\]/).pop().toLowerCase();
      if (fname.includes('cov001')) { cover = { filename: fullPath, data }; hasCover = true; }
      else if (fname.includes('cov002')) { backCover = { filename: fullPath, data }; hasCover = true; }
      else { imageFiles.push({ filename: fullPath, data }); }
    }
    if (imageFiles.length === 0 && !cover && !backCover) {
      return new Response(JSON.stringify({ error: 'ZIP中无图片' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    imageFiles.sort((a, b) => a.filename.localeCompare(b.filename, undefined, { numeric: true }));
    const finalFiles = [];
    if (cover) finalFiles.push(cover);
    finalFiles.push(...imageFiles);
    if (backCover) finalFiles.push(backCover);

    // 生成PDF
    const pdfDoc = await PDFDocument.create();
    for (const { filename, data } of finalFiles) {
      try {
        let img;
        const ln = filename.toLowerCase();
        if (ln.endsWith('.png')) { img = await pdfDoc.embedPng(data); }
        else { try { img = await pdfDoc.embedJpg(data); } catch { try { img = await pdfDoc.embedPng(data); } catch { continue; } } }
        const page = pdfDoc.addPage([img.width, img.height]);
        page.drawImage(img, { x: 0, y: 0, width: img.width, height: img.height });
      } catch (e) { continue; }
    }
    const pdfBytes = await pdfDoc.save();
    const pdfKey = key.replace('uploads/', 'pdfs/').replace(/\.(zip|uvz|cbz)$/i, '.pdf');
    const expiresAt = new Date(Date.now() + 86400000);
    await env.BUCKET.put(pdfKey, pdfBytes, { httpMetadata: { contentType: 'application/pdf' }, customMetadata: { expiresAt: expiresAt.toISOString() } });
    return new Response(JSON.stringify({ success: true, pdfKey, pages: finalFiles.length, hasPassword: !!usedPassword, password: usedPassword, hasCover, expiresIn: '24小时' }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function handleDownload(request, env, corsHeaders) {
  try {
    const url = new URL(request.url);
    const key = url.searchParams.get('key');
    if (!key) return new Response('Missing key', { status: 400 });
    const object = await env.BUCKET.get(key);
    if (!object) return new Response('File not found or expired', { status: 404 });
    if (object.customMetadata && object.customMetadata.expiresAt) {
      if (new Date() > new Date(object.customMetadata.expiresAt)) {
        await env.BUCKET.delete(key);
        return new Response('File expired', { status: 410 });
      }
    }
    return new Response(object.body, { headers: { ...corsHeaders, 'Content-Type': 'application/pdf', 'Content-Disposition': 'attachment; filename="' + key.split('/').pop() + '"' } });
  } catch (error) {
    return new Response('Error: ' + error.message, { status: 500 });
  }
}

async function handleList(env, corsHeaders) {
  try {
    const list = await env.BUCKET.list({ prefix: 'pdfs/' });
    const files = list.objects.map(o => ({ key: o.key, size: o.size }));
    return new Response(JSON.stringify({ success: true, files }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}

async function handleCleanup(env, corsHeaders) {
  try {
    const now = new Date();
    let deleted = 0;
    for (const prefix of ['uploads/', 'pdfs/']) {
      const list = await env.BUCKET.list({ prefix });
      for (const obj of list.objects) {
        const o = await env.BUCKET.get(obj.key);
        if (o && o.customMetadata && o.customMetadata.expiresAt && new Date(o.customMetadata.expiresAt) < now) {
          await env.BUCKET.delete(obj.key);
          deleted++;
        }
      }
    }
    return new Response(JSON.stringify({ success: true, deleted }), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
  }
}
