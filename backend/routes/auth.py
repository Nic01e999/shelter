from flask import jsonify, request, g
from . import auth_bp
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
from utils.security import hash_password, verify_password, generate_token, generate_code, get_token_expiry, get_code_expiry
from utils.validators import validate_email, validate_password, validate_code
from utils.email_service import send_reset_code
from middleware.auth import require_auth

# 1. 注册
@auth_bp.route('/api/auth/register', methods=['POST'])
def register():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '')

    if not validate_email(email):
        return jsonify({'error': '邮箱格式错误'}), 400
    if not validate_password(password):
        return jsonify({'error': '密码至少6位'}), 400

    conn = get_db()
    existing = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    if existing:
        conn.close()
        return jsonify({'error': '邮箱已注册'}), 400

    password_hash = hash_password(password)
    cursor = conn.execute(
        'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
        (email.split('@')[0], email, password_hash)
    )
    user_id = cursor.lastrowid

    token = generate_token()
    conn.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        (user_id, token, get_token_expiry())
    )
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'token': token,
        'user': {'id': user_id, 'email': email}
    }), 201

# 2. 登录
@auth_bp.route('/api/auth/login', methods=['POST'])
def login():
    data = request.json
    email = data.get('email', '').strip()
    password = data.get('password', '')

    conn = get_db()
    user = conn.execute(
        'SELECT id, email, password_hash FROM users WHERE email = ?',
        (email,)
    ).fetchone()

    if not user:
        conn.close()
        return jsonify({'error': '该邮箱未注册，请先注册', 'code': 'USER_NOT_FOUND'}), 404

    if not verify_password(password, user['password_hash']):
        conn.close()
        return jsonify({'error': '密码错误'}), 401

    conn.execute(
        'UPDATE users SET last_login_at = ? WHERE id = ?',
        (datetime.now().isoformat(), user['id'])
    )

    token = generate_token()
    conn.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        (user['id'], token, get_token_expiry())
    )
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'token': token,
        'user': {'id': user['id'], 'email': user['email']}
    })

# 3. 登出
@auth_bp.route('/api/auth/logout', methods=['POST'])
@require_auth
def logout():
    conn = get_db()
    conn.execute('DELETE FROM sessions WHERE token = ?', (g.token,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

# 4. 获取当前用户
@auth_bp.route('/api/auth/me', methods=['GET'])
@require_auth
def get_me():
    return jsonify({'user': {'id': g.user_id, 'email': g.email}})

# 5. 发送验证码
@auth_bp.route('/api/auth/forgot-password', methods=['POST'])
def forgot_password():
    data = request.json
    email = data.get('email', '').strip()

    if not validate_email(email):
        return jsonify({'error': '邮箱格式错误'}), 400

    conn = get_db()
    recent = conn.execute(
        'SELECT created_at FROM reset_codes WHERE email = ? '
        'ORDER BY created_at DESC LIMIT 1',
        (email,)
    ).fetchone()

    if recent:
        created = datetime.fromisoformat(recent['created_at'])
        if (datetime.now() - created).seconds < 60:
            conn.close()
            return jsonify({'error': '请稍后再试'}), 429

    code = generate_code()
    conn.execute(
        'INSERT INTO reset_codes (email, code, expires_at) VALUES (?, ?, ?)',
        (email, code, get_code_expiry())
    )
    conn.commit()
    conn.close()

    send_reset_code(email, code)
    return jsonify({'success': True})

# 6. 重置密码/验证码注册
@auth_bp.route('/api/auth/reset-password', methods=['POST'])
def reset_password():
    data = request.json
    email = data.get('email', '').strip()
    code = data.get('code', '').strip()
    password = data.get('password', '')

    if not validate_email(email) or not validate_code(code) or not validate_password(password):
        return jsonify({'error': '参数错误'}), 400

    conn = get_db()
    reset = conn.execute(
        'SELECT id, expires_at FROM reset_codes WHERE email = ? AND code = ? '
        'AND used = 0 ORDER BY created_at DESC LIMIT 1',
        (email, code)
    ).fetchone()

    if not reset:
        conn.close()
        return jsonify({'error': '验证码无效'}), 400

    expires_at = datetime.fromisoformat(reset['expires_at'])
    if datetime.now() > expires_at:
        conn.close()
        return jsonify({'error': '验证码已过期'}), 400

    conn.execute('UPDATE reset_codes SET used = 1 WHERE id = ?', (reset['id'],))

    user = conn.execute('SELECT id FROM users WHERE email = ?', (email,)).fetchone()
    password_hash = hash_password(password)

    if user:
        conn.execute('UPDATE users SET password_hash = ? WHERE id = ?', (password_hash, user['id']))
        conn.execute('DELETE FROM sessions WHERE user_id = ?', (user['id'],))
        user_id = user['id']
    else:
        cursor = conn.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            (email.split('@')[0], email, password_hash)
        )
        user_id = cursor.lastrowid

    token = generate_token()
    conn.execute(
        'INSERT INTO sessions (user_id, token, expires_at) VALUES (?, ?, ?)',
        (user_id, token, get_token_expiry())
    )
    conn.commit()
    conn.close()

    return jsonify({
        'success': True,
        'token': token,
        'user': {'id': user_id, 'email': email}
    })
