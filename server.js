// Re:365 수신거부 서버
// Railway/Render 등 클라우드 배포용

import express from 'express';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3001;

// CORS 허용
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 헬스체크
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// ===========================================
// 수신거부 페이지 (HTML 렌더링)
// ===========================================

app.get('/unsubscribe', (req, res) => {
  const email = req.query.email || '';
  const name = req.query.name || '';

  const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Re:365 광고성 정보 메일 수신 거절 신청</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Malgun Gothic', sans-serif;
      background: #f5f5f5;
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 20px;
    }
    .container {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 10px rgba(0,0,0,0.1);
      max-width: 450px;
      width: 100%;
      overflow: hidden;
    }
    .header {
      background: #f8f9fa;
      padding: 20px;
      border-bottom: 1px solid #e9ecef;
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .header h1 {
      font-size: 16px;
      font-weight: 600;
      color: #333;
    }
    .close-btn {
      background: none;
      border: none;
      font-size: 24px;
      color: #666;
      cursor: pointer;
    }
    .content {
      padding: 30px 20px;
      text-align: center;
    }
    .name {
      color: #333;
      margin-bottom: 15px;
    }
    .question {
      font-size: 15px;
      color: #333;
      margin-bottom: 10px;
    }
    .email {
      font-size: 14px;
      color: #666;
      margin-bottom: 25px;
    }
    .buttons {
      display: flex;
      gap: 10px;
      justify-content: center;
    }
    .btn {
      padding: 12px 40px;
      border: none;
      border-radius: 4px;
      font-size: 14px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .btn-primary {
      background: #ec4899;
      color: white;
    }
    .btn-primary:hover {
      background: #db2777;
    }
    .btn-secondary {
      background: #e5e7eb;
      color: #374151;
    }
    .btn-secondary:hover {
      background: #d1d5db;
    }
    .notice {
      padding: 15px 20px;
      background: #f9fafb;
      border-top: 1px solid #e9ecef;
      font-size: 12px;
      color: #666;
      line-height: 1.5;
    }
    .result {
      display: none;
      padding: 30px 20px;
      text-align: center;
    }
    .result.show {
      display: block;
    }
    .result-icon {
      font-size: 48px;
      margin-bottom: 15px;
    }
    .result-message {
      font-size: 16px;
      color: #333;
      margin-bottom: 10px;
    }
    .result-sub {
      font-size: 14px;
      color: #666;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>Re:365 광고성 정보 메일 수신 거절 신청</h1>
    </div>
    <div class="content" id="confirmContent">
      <p class="name">${name ? name + '님' : ''}</p>
      <p class="question"><strong>Re:365 광고성 정보 메일</strong> 수신을 거절 하시겠습니까?</p>
      <p class="email">메일 주소 : <strong>${email ? email.replace(/(.{2})(.*)(@.*)/, '$1****$3') : ''}</strong></p>
      <div class="buttons">
        <button class="btn btn-primary" onclick="processUnsubscribe()">수신 거절</button>
      </div>
    </div>
    <div class="result" id="resultContent">
      <div class="result-icon" id="resultIcon">✅</div>
      <p class="result-message" id="resultMessage">수신거부 처리가 완료되었습니다.</p>
      <p class="result-sub" id="resultSub">더 이상 광고성 메일을 받지 않습니다.</p>
      <p style="margin-top: 20px; font-size: 13px; color: #9ca3af;">이 탭을 닫아주세요.</p>
    </div>
    <div class="notice">
      · 광고성 정보 메일 수신을 거절하시면, Re:365에서 제공하는 행사 및 할인 정보가 제공되지 않습니다.
    </div>
  </div>

  <script>
    function processUnsubscribe() {
      const email = '${email}';
      if (!email) {
        alert('이메일 정보가 없습니다.');
        return;
      }

      fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email })
      })
      .then(res => res.json())
      .then(data => {
        document.getElementById('confirmContent').style.display = 'none';
        const resultContent = document.getElementById('resultContent');
        resultContent.classList.add('show');

        if (data.success) {
          document.getElementById('resultIcon').textContent = '✅';
          document.getElementById('resultMessage').textContent = '수신거부 처리가 완료되었습니다.';
          document.getElementById('resultSub').textContent = '더 이상 광고성 메일을 받지 않습니다.';
        } else {
          document.getElementById('resultIcon').textContent = 'ℹ️';
          document.getElementById('resultMessage').textContent = data.message || '처리 중 오류가 발생했습니다.';
          document.getElementById('resultSub').textContent = '';
        }
      })
      .catch(err => {
        alert('오류가 발생했습니다: ' + err.message);
      });
    }
  </script>
</body>
</html>
  `;

  res.set('Content-Type', 'text/html; charset=utf-8');
  res.send(html);
});

// ===========================================
// 수신거부 데이터 저장 (파일 기반)
// ===========================================

const DATA_DIR = process.env.DATA_DIR || './data';
const UNSUBSCRIBE_LOG_FILE = path.join(DATA_DIR, 'unsubscribe_log.json');

// 데이터 디렉토리 생성
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// 수신거부 로그 읽기
const readUnsubscribeLog = () => {
  try {
    if (fs.existsSync(UNSUBSCRIBE_LOG_FILE)) {
      const data = fs.readFileSync(UNSUBSCRIBE_LOG_FILE, 'utf-8');
      return JSON.parse(data);
    }
  } catch (e) {
    console.error('[수신거부] 로그 읽기 오류:', e.message);
  }
  return { unsubscribed: [] };
};

// 수신거부 로그 저장
const saveUnsubscribeLog = (log) => {
  try {
    fs.writeFileSync(UNSUBSCRIBE_LOG_FILE, JSON.stringify(log, null, 2), 'utf-8');
  } catch (e) {
    console.error('[수신거부] 로그 저장 오류:', e.message);
  }
};

// 수신거부 API
app.post('/api/unsubscribe', (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(400).json({ success: false, message: '이메일이 필요합니다.' });
  }

  console.log(`[수신거부] 요청: ${email}`);

  const log = readUnsubscribeLog();
  const existingIndex = log.unsubscribed.findIndex(
    item => item.email.toLowerCase() === email.toLowerCase()
  );

  if (existingIndex >= 0) {
    return res.json({
      success: false,
      email: email,
      message: '이미 수신거부 처리되었습니다.'
    });
  }

  log.unsubscribed.push({
    email: email,
    timestamp: new Date().toISOString()
  });
  saveUnsubscribeLog(log);

  console.log(`[수신거부] 완료: ${email}`);

  res.json({
    success: true,
    email: email,
    message: '수신거부 처리되었습니다.',
    timestamp: new Date().toISOString()
  });
});

// 수신거부 목록 조회 API
app.get('/api/unsubscribe/list', (req, res) => {
  const log = readUnsubscribeLog();
  res.json(log);
});

// 서버 시작
app.listen(PORT, () => {
  console.log(`\n========================================`);
  console.log(`  Re:365 수신거부 서버 실행 중`);
  console.log(`  Port: ${PORT}`);
  console.log(`========================================\n`);
  console.log(`헬스체크: /health`);
  console.log(`수신거부 페이지: /unsubscribe?email=test@example.com`);
  console.log(`수신거부 목록: /api/unsubscribe/list\n`);
});
