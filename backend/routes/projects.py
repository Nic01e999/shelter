from flask import jsonify, request
from . import projects_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
import json
from datetime import datetime

@projects_bp.route('/api/projects/<int:user_id>', methods=['GET'])
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

@projects_bp.route('/api/projects', methods=['POST'])
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

@projects_bp.route('/api/projects/<int:project_id>', methods=['PUT'])
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

@projects_bp.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    conn = get_db()
    conn.execute('DELETE FROM todo_lists WHERE id = ?', (project_id,))
    conn.commit()
    conn.close()
    return jsonify({'success': True})
