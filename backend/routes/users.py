from flask import jsonify, request
from . import users_bp
from database import get_db

@users_bp.route('/api/users', methods=['GET'])
def get_users():
    with get_db() as conn:
        users = conn.execute('SELECT * FROM users').fetchall()
    return jsonify([dict(u) for u in users])

@users_bp.route('/api/users', methods=['POST'])
def create_user():
    data = request.json
    with get_db() as conn:
        cursor = conn.execute(
            'INSERT INTO users (username, email) VALUES (?, ?)',
            (data['username'], data.get('email'))
        )
        conn.commit()
        user_id = cursor.lastrowid
    return jsonify({'id': user_id, 'username': data['username']}), 201
