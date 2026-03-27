from flask import Flask, jsonify, request
from flask_cors import CORS
import sqlite3
import json
from datetime import datetime
import os

app = Flask(__name__)
CORS(app)

# 使用绝对路径
BASE_DIR = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
DB_PATH = os.path.join(BASE_DIR, 'database', 'user.db')

def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    return conn

# 用户相关接口
@app.route('/api/users', methods=['GET'])
def get_users():
    conn = get_db()
    users = conn.execute('SELECT * FROM users').fetchall()
    conn.close()
    return jsonify([dict(u) for u in users])

@app.route('/api/users', methods=['POST'])
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

# 待办清单相关接口
@app.route('/api/todos/<int:user_id>', methods=['GET'])
def get_todos(user_id):
    conn = get_db()
    todos = conn.execute(
        'SELECT * FROM todo_lists WHERE user_id = ?', (user_id,)
    ).fetchall()
    conn.close()
    result = []
    for todo in todos:
        item = dict(todo)
        item['tasks'] = json.loads(item['tasks'])
        result.append(item)
    return jsonify(result)

@app.route('/api/todos', methods=['POST'])
def create_todo():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO todo_lists (user_id, title, position_angle, tasks) VALUES (?, ?, ?, ?)',
        (data['user_id'], data['title'], data['position_angle'], json.dumps(data.get('tasks', [])))
    )
    conn.commit()
    todo_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': todo_id}), 201

@app.route('/api/todos/<int:todo_id>', methods=['PUT'])
def update_todo(todo_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE todo_lists SET title = ?, position_angle = ?, tasks = ?, updated_at = ? WHERE id = ?',
        (data['title'], data['position_angle'], json.dumps(data['tasks']), datetime.now(), todo_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/todos/<int:todo_id>', methods=['DELETE'])
def delete_todo(todo_id):
    conn = get_db()
    conn.execute('DELETE FROM todo_lists WHERE id = ?', (todo_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=9999)
