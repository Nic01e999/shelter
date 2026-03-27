# 邮箱验证码登录系统 - 实现提示词

## 系统概述

实现一个基于邮箱验证码的现代化登录系统，支持注册、登录、忘记密码等功能。

**核心特性**：
- 邮箱 + 验证码注册/登录（无需传统密码注册流程）
- 密码重置功能
- Session Token 认证
- 英文邮件支持
- 开发环境控制台验证码输出

---

## 技术架构

### 后端技术栈
- **框架**: Flask (Python)
- **密码哈希**: bcrypt (12 rounds)
- **Token 生成**: secrets.token_urlsafe()
- **邮件发送**: smtplib + SMTP

### 数据表设计

**注意**: 以下是参考设计，请根据你的项目实际数据库结构调整

```sql
-- 用户表
CREATE TABLE users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

-- 会话表
CREATE TABLE sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    token TEXT UNIQUE NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
);

-- 验证码表
CREATE TABLE reset_codes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT NOT NULL,
    code TEXT NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

---

## API 端点设计

### 1. 注册 `POST /api/auth/register`

**请求**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "token": "session_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**逻辑**:
1. 验证邮箱格式（正则）
2. 验证密码长度（≥6位）
3. 检查邮箱是否已注册
4. bcrypt 哈希密码（12 rounds）
5. 创建用户记录
6. 生成 session token（32字节）
7. 创建会话记录（有效期30天）
8. 返回 token 和用户信息

---

### 2. 登录 `POST /api/auth/login`

**请求**:
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**响应**:
```json
{
  "success": true,
  "token": "session_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**错误响应（用户不存在）**:
```json
{
  "error": "该邮箱未注册，请先注册",
  "code": "USER_NOT_FOUND"
}
```

**逻辑**:
1. 查找用户
2. 如果不存在，返回特殊错误码 `USER_NOT_FOUND`（前端可引导注册）
3. bcrypt 验证密码
4. 更新最后登录时间
5. 生成新 session token
6. 返回 token 和用户信息

---

### 3. 登出 `POST /api/auth/logout`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "success": true
}
```

**逻辑**:
1. 从请求头获取 token
2. 删除对应的 session 记录

---

### 4. 获取当前用户 `GET /api/auth/me`

**请求头**:
```
Authorization: Bearer <token>
```

**响应**:
```json
{
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

---

### 5. 发送验证码 `POST /api/auth/forgot-password`

**请求**:
```json
{
  "email": "user@example.com",
  "lang": "zh"
}
```

**响应**:
```json
{
  "success": true
}
```

**逻辑**:
1. 验证邮箱格式
2. **重要**: 无论用户是否存在都发送验证码（支持新用户注册）
3. 检查冷却时间（60秒内不能重复发送）
4. 生成6位数字验证码
5. 设置过期时间（10分钟）
6. 保存到数据库
7. 发送邮件

---

### 6. 重置密码/验证码注册 `POST /api/auth/reset-password`

**请求**:
```json
{
  "email": "user@example.com",
  "code": "123456",
  "password": "newpassword123"
}
```

**响应**:
```json
{
  "success": true,
  "token": "session_token_here",
  "user": {
    "id": 1,
    "email": "user@example.com"
  }
}
```

**逻辑**:
1. 验证邮箱、验证码、密码格式
2. 查找有效的验证码（未使用 + 未过期）
3. 标记验证码为已使用
4. **检查用户是否存在**:
   - **不存在**: 创建新用户（验证码注册）
   - **存在**: 更新密码 + 删除所有旧会话（强制重新登录）
5. 生成新 session token
6. 返回 token 和用户信息

---

## 安全机制

### 1. 密码哈希
```python
import bcrypt

def hash_password(password: str) -> str:
    return bcrypt.hashpw(
        password.encode('utf-8'),
        bcrypt.gensalt(12)
    ).decode('utf-8')

def verify_password(password: str, password_hash: str) -> bool:
    return bcrypt.checkpw(
        password.encode('utf-8'),
        password_hash.encode('utf-8')
    )
```

### 2. Token 生成
```python
import secrets

def generate_session_token() -> str:
    return secrets.token_urlsafe(32)  # 256-bit

def generate_reset_code() -> str:
    import random
    return ''.join([str(random.randint(0, 9)) for _ in range(6)])
```

### 3. 认证中间件
```python
from functools import wraps
from flask import request, jsonify, g

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth_header = request.headers.get('Authorization', '')

        if not auth_header.startswith('Bearer '):
            return jsonify({'error': '未登录'}), 401

        token = auth_header[7:]

        # 查询数据库验证 token
        session = query_session(token)

        if not session or is_expired(session):
            return jsonify({'error': '登录已过期'}), 401

        g.user = session['user']
        g.token = token

        return f(*args, **kwargs)

    return decorated
```

---

## 邮件服务

### 配置参数

```python
# SMTP 配置
SMTP_HOST = "smtp.example.com"
SMTP_PORT = 465  # SSL
SMTP_USE_SSL = True
SMTP_USER = "noreply@example.com"
SMTP_PASSWORD = "your_password"
SMTP_SENDER = "noreply@example.com"

# 验证码配置
CODE_EXPIRE_MINUTES = 10
CODE_RESEND_SECONDS = 60

# Token 配置
TOKEN_EXPIRE_DAYS = 30
PASSWORD_MIN_LENGTH = 6
```

### 邮件模板

**文本配置**:
```python
EMAIL_TEXTS = {
  'subject': 'YourApp - Password Reset Code',
  'title': 'Password Reset Code',
  'body': 'You are resetting your password. The code is:',
  'note': 'Valid for {minutes} minutes. Do not share.',
  'sent': 'Sent',
  'valid_until': 'Valid until'
}
```

**HTML 邮件模板**（液态玻璃风格）:
```python
def send_reset_code(email: str, code: str, lang: str = 'en') -> bool:
    from datetime import datetime
    from email.mime.text import MIMEText
    from email.mime.multipart import MIMEMultipart
    import smtplib

    texts = EMAIL_TEXTS.get(lang, EMAIL_TEXTS['en'])
    now = datetime.now()
    send_time = now.strftime("%Y-%m-%d %H:%M:%S")

    # 计算过期时间
    expire_minutes = now.minute + CODE_EXPIRE_MINUTES
    expire_hour = now.hour
    if expire_minutes >= 60:
        expire_minutes -= 60
        expire_hour += 1
    expire_time = f"{expire_hour:02d}:{expire_minutes:02d}"

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <head><meta charset="UTF-8"></head>
    <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                 padding: 20px; background: #f5f5f5;">
        <div style="max-width: 400px; margin: 0 auto; background: white;
                    padding: 30px; border-radius: 12px;
                    box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
            <h2 style="margin: 0 0 20px; color: #333; font-size: 20px;">
                {texts['title']}
            </h2>
            <p style="color: #666; margin: 0 0 20px; font-size: 14px;">
                {texts['body']}
            </p>
            <div style="background: #f8f8f8; padding: 15px; border-radius: 8px;
                        text-align: center; margin: 0 0 20px;">
                <span style="font-size: 32px; font-weight: bold;
                             letter-spacing: 8px; color: #333;">
                    {code}
                </span>
            </div>
            <p style="color: #999; font-size: 12px; margin: 0 0 10px;">
                {texts['note'].format(minutes=CODE_EXPIRE_MINUTES)}
            </p>
            <div style="border-top: 1px solid #eee; padding-top: 15px; margin-top: 15px;">
                <p style="color: #bbb; font-size: 11px; margin: 0 0 5px;">
                    📅 {texts['sent']}: {send_time}
                </p>
                <p style="color: #bbb; font-size: 11px; margin: 0;">
                    ⏰ {texts['valid_until']}: {expire_time}
                </p>
            </div>
        </div>
    </body>
    </html>
    """

    msg = MIMEMultipart('alternative')
    msg['Subject'] = texts['subject']
    msg['From'] = f"YourApp <{SMTP_SENDER}>"
    msg['To'] = email

    text_content = f"{texts['body']} {code}"
    msg.attach(MIMEText(text_content, 'plain', 'utf-8'))
    msg.attach(MIMEText(html_content, 'html', 'utf-8'))

    try:
        if SMTP_USE_SSL:
            server = smtplib.SMTP_SSL(SMTP_HOST, SMTP_PORT)
        else:
            server = smtplib.SMTP(SMTP_HOST, SMTP_PORT)
            server.starttls()

        server.login(SMTP_USER, SMTP_PASSWORD)
        server.sendmail(SMTP_SENDER, [email], msg.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f"邮件发送失败: {e}")
        return False
```

### 开发环境支持

**控制台输出验证码**（SMTP 未配置时）:
```python
if not SMTP_USER or not SMTP_PASSWORD:
    print("\n" + "="*60)
    print(f"📧 验证码邮件（控制台模式）")
    print(f"收件人: {email}")
    print(f"验证码: {code}")
    print(f"有效期: {CODE_EXPIRE_MINUTES} 分钟")
    print("="*60 + "\n")
    return True  # 开发环境返回成功
```

---

## 数据验证

### 验证函数
```python
import re

EMAIL_REGEX = re.compile(r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$')

def validate_email(email: str) -> bool:
    if not email or not isinstance(email, str):
        return False
    return bool(EMAIL_REGEX.match(email))

def validate_password(password: str, min_length: int = 6) -> bool:
    if not password or not isinstance(password, str):
        return False
    return len(password) >= min_length

def validate_code(code: str, expected_length: int = 6) -> bool:
    if not code or not isinstance(code, str):
        return False
    return len(code) == expected_length and code.isdigit()
```

---

## 前端集成示例

### 1. 注册流程
```javascript
async function register(email, password) {
  const response = await fetch('/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.user.email);
    return data;
  } else {
    throw new Error(data.error);
  }
}
```

### 2. 登录流程
```javascript
async function login(email, password) {
  const response = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password })
  });

  const data = await response.json();

  if (response.status === 404 && data.code === 'USER_NOT_FOUND') {
    // 引导用户注册
    if (confirm('该邮箱未注册，是否前往注册？')) {
      window.location.href = '/register';
    }
    return;
  }

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.user.email);
    return data;
  } else {
    throw new Error(data.error);
  }
}
```

### 3. 验证码重置密码
```javascript
async function sendResetCode(email, lang = 'zh') {
  const response = await fetch('/api/auth/forgot-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, lang })
  });

  const data = await response.json();

  if (data.success) {
    alert('验证码已发送，请查收邮件');
  } else {
    throw new Error(data.error);
  }
}

async function resetPassword(email, code, password) {
  const response = await fetch('/api/auth/reset-password', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code, password })
  });

  const data = await response.json();

  if (data.success) {
    localStorage.setItem('authToken', data.token);
    localStorage.setItem('userEmail', data.user.email);
    alert('密码重置成功');
    return data;
  } else {
    throw new Error(data.error);
  }
}
```

### 4. 认证请求
```javascript
async function fetchWithAuth(url, options = {}) {
  const token = localStorage.getItem('authToken');

  const response = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`
    }
  });

  if (response.status === 401) {
    // Token 过期，清除本地存储并跳转登录
    localStorage.removeItem('authToken');
    localStorage.removeItem('userEmail');
    window.location.href = '/login';
    return;
  }

  return response;
}
```

---

## 关键实现要点

### 1. 验证码注册流程
- `/api/auth/forgot-password` 无论用户是否存在都发送验证码
- `/api/auth/reset-password` 检查用户是否存在：
  - 不存在 → 创建新用户（验证码注册）
  - 存在 → 更新密码（密码重置）

### 2. 安全措施
- 密码使用 bcrypt 哈希（12 rounds）
- Token 使用 `secrets.token_urlsafe(32)` 生成
- 验证码10分钟过期
- 验证码60秒冷却时间
- Session token 30天过期
- 密码重置后删除所有旧会话

### 3. 错误处理
- 登录时用户不存在返回特殊错误码 `USER_NOT_FOUND`
- 验证码冷却时间返回 429 状态码
- Token 过期返回 401 并提示重新登录

### 4. 开发环境支持
- SMTP 未配置时验证码输出到控制台
- 邮件发送失败时降级到控制台输出（非生产环境）

---

## 部署配置

### 共享的 SMTP 配置（直接使用）

**重要**: 以下是已配置好的 SMTP 服务器，两个项目共用，直接复制到你的 `.env` 文件：

```bash
# ========================================
# SMTP 邮件配置（阿里企业邮箱）
# ========================================

# 阿里企业邮箱地址
SMTP_USER=verification@wordplayer.top
SMTP_SENDER=verification@wordplayer.top

# 阿里企业邮箱密码
SMTP_PASSWORD=rephe7-nubBij-hinnyg

# 阿里企业邮箱 SMTP 服务器配置
SMTP_HOST=smtp.qiye.aliyun.com
SMTP_PORT=465
SMTP_USE_SSL=true

# ========================================
# Token 配置
# ========================================
TOKEN_EXPIRE_DAYS=30

# ========================================
# 验证码配置
# ========================================
CODE_EXPIRE_MINUTES=5
CODE_RESEND_SECONDS=60

# ========================================
# 安全配置
# ========================================
SECRET_KEY=your-project-secret-key-here
```

**注意**:
- SMTP 配置完全相同，直接复制即可
- 只需修改 `SECRET_KEY` 为你项目的密钥
- 邮件模板中的应用名称改成你的项目名

### 生产环境检查清单
- [ ] 配置真实的 SMTP 服务器
- [ ] 设置强随机 SECRET_KEY
- [ ] 启用 HTTPS
- [ ] 配置 CORS（如果前后端分离）
- [ ] 设置数据库备份
- [ ] 配置日志记录
- [ ] 添加速率限制（防止暴力破解）

---

## 使用此提示词

将此文档提供给 Claude，并说明：

```
请根据这份文档，在我的项目中实现邮箱验证码登录系统。

我的项目信息：
- 后端框架：[你的框架]
- 数据库：[你的数据库]
- 前端框架：[你的前端框架]
- 特殊需求：[任何特殊需求]

请根据我的实际情况调整实现，特别是数据库部分。
```

---

## 与原项目的差异

**需要你自己实现的部分**：
1. 数据库层（Repository 模式）
2. 数据库连接管理
3. 具体的数据表结构（根据你的项目调整）

**可以直接复用的部分**：
1. API 端点设计
2. 安全机制（bcrypt、token 生成）
3. 邮件服务逻辑
4. 验证函数
5. 前端集成代码

**配置共享**：
- 两个项目可以使用同一个 SMTP 服务器
- 只需修改邮件模板中的应用名称
- 子域名不同不影响邮件发送
