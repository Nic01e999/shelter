from flask import jsonify, request
from . import ai_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
import json

@ai_bp.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI 对话接口"""
    data = request.json
    user_id = data.get('user_id')
    message = data.get('message')
    role = data.get('role', 'psychology')

    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai'))
    from service import AIService

    try:
        ai_service = AIService(user_id)
        response = ai_service.chat(message, role)
        return jsonify({
            'success': True,
            'response': response
        })
    except Exception as e:
        return jsonify({
            'success': False,
            'error': str(e)
        }), 500

@ai_bp.route('/api/ai/todolist/<int:user_id>', methods=['GET'])
def get_todolist(user_id):
    """获取用户的所有待办清单"""
    conn = get_db()
    projects = conn.execute(
        'SELECT id, title, tasks FROM todo_lists WHERE user_id = ?',
        (user_id,)
    ).fetchall()
    conn.close()

    result = []
    for project in projects:
        result.append({
            'id': project['id'],
            'title': project['title'],
            'tasks': json.loads(project['tasks'])
        })

    return jsonify(result)

@ai_bp.route('/api/ai/todolist/<int:project_id>', methods=['PUT'])
def update_todolist(project_id):
    """更新待办清单"""
    data = request.json
    tasks = data.get('tasks', [])

    conn = get_db()
    conn.execute(
        'UPDATE todo_lists SET tasks = ? WHERE id = ?',
        (json.dumps(tasks), project_id)
    )
    conn.commit()
    conn.close()

    return jsonify({'success': True})
