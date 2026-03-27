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

# 项目相关接口（圆形轨道上的项目）
@app.route('/api/projects/<int:user_id>', methods=['GET'])
def get_projects(user_id):
    conn = get_db()
    projects = conn.execute(
        'SELECT * FROM todo_lists WHERE user_id = ?', (user_id,)
    ).fetchall()
    conn.close()
    result = []
    for project in projects:
        item = dict(project)
        item['tasks'] = json.loads(item['tasks'])
        result.append(item)
    return jsonify(result)

@app.route('/api/projects', methods=['POST'])
def create_project():
    data = request.json
    conn = get_db()
    cursor = conn.execute(
        'INSERT INTO todo_lists (user_id, title, position_angle, tasks) VALUES (?, ?, ?, ?)',
        (data['user_id'], data['title'], data['position_angle'], json.dumps(data.get('tasks', [])))
    )
    conn.commit()
    project_id = cursor.lastrowid
    conn.close()
    return jsonify({'id': project_id}), 201

@app.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    data = request.json
    conn = get_db()
    conn.execute(
        'UPDATE todo_lists SET title = ?, position_angle = ?, tasks = ?, updated_at = ? WHERE id = ?',
        (data['title'], data['position_angle'], json.dumps(data['tasks']), datetime.now(), project_id)
    )
    conn.commit()
    conn.close()
    return jsonify({'success': True})

@app.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db()
    conn.execute('DELETE FROM todo_lists WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})

if __name__ == '__main__':
    app.run(debug=True, port=9999)
