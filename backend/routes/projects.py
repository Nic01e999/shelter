from flask import jsonify, request
from . import projects_bp
from database import get_db
import json
from datetime import datetime
import logging

logger = logging.getLogger(__name__)

@projects_bp.route('/api/projects/<int:user_id>', methods=['GET'])
def get_projects(user_id):
    try:
        with get_db() as conn:
            projects = conn.execute(
                'SELECT * FROM todo_lists WHERE user_id = ?', (user_id,)
            ).fetchall()
            result = []
            for project in projects:
                item = dict(project)
                item['tasks'] = json.loads(item['tasks'])
                result.append(item)
        return jsonify(result)
    except Exception as e:
        logger.error(f"获取项目失败: {str(e)}", exc_info=True)
        return jsonify({'error': '获取项目失败'}), 500

@projects_bp.route('/api/projects', methods=['POST'])
def create_project():
    try:
        data = request.json
        if not data or 'user_id' not in data or 'title' not in data:
            return jsonify({'error': '缺少必需参数'}), 400

        with get_db() as conn:
            cursor = conn.execute(
                'INSERT INTO todo_lists (user_id, title, position_angle, tasks) VALUES (?, ?, ?, ?)',
                (data['user_id'], data['title'], data.get('position_angle', 0), json.dumps(data.get('tasks', [])))
            )
            conn.commit()
            project_id = cursor.lastrowid
        return jsonify({'id': project_id}), 201
    except Exception as e:
        logger.error(f"创建项目失败: {str(e)}", exc_info=True)
        return jsonify({'error': '创建项目失败'}), 500

@projects_bp.route('/api/projects/<int:project_id>', methods=['PUT'])
def update_project(project_id):
    try:
        data = request.json
        if not data:
            return jsonify({'error': '请求数据为空'}), 400

        with get_db() as conn:
            conn.execute(
                'UPDATE todo_lists SET title = ?, position_angle = ?, tasks = ?, updated_at = ? WHERE id = ?',
                (data.get('title', ''), data.get('position_angle', 0), json.dumps(data.get('tasks', [])), datetime.now(), project_id)
            )
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"更新项目失败: {str(e)}", exc_info=True)
        return jsonify({'error': '更新项目失败'}), 500

@projects_bp.route('/api/projects/<int:project_id>', methods=['DELETE'])
def delete_project(project_id):
    try:
        with get_db() as conn:
            conn.execute('DELETE FROM todo_lists WHERE id = ?', (project_id,))
            conn.commit()
        return jsonify({'success': True})
    except Exception as e:
        logger.error(f"删除项目失败: {str(e)}", exc_info=True)
        return jsonify({'error': '删除项目失败'}), 500
