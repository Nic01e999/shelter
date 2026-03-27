from flask import jsonify, request
from . import users_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db

@users_bp.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])

@users_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO users (username, email) VALUES (?, ?)',
        (data['username'], data.get('email'))
    )
    conn.commit()
    user_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': user_id, 'username': data['username']}), 201
