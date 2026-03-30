from functools import wraps
from flask import request, jsonify, g
from datetime import datetime
import sys, os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

def require_auth(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        auth = request.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return jsonify({'error': '未登录'}), 401

        token = auth[7:]
        with get_db() as conn:
            session = conn.execute(
                'SELECT s.*, u.id as user_id, u.email FROM sessions s '
                'JOIN users u ON s.user_id = u.id '
                'WHERE s.token = ? AND s.expires_at > ?',
                (token, datetime.now().isoformat())
            ).fetchone()

        if not session:
            return jsonify({'error': '登录已过期'}), 401

        g.user_id = session['user_id']
        g.email = session['email']
        g.token = token
        return f(*args, **kwargs)
    return decorated
