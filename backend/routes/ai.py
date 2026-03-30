from flask import jsonify, request
from . import ai_bp
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from database import get_db
import json
import logging

logger = logging.getLogger(__name__)

@ai_bp.route('/api/ai/chat', methods=['POST'])
def ai_chat():
    """AI 对话接口"""
    data = request.json
    if not data:
        return jsonify({'success': False, 'error': '请求数据为空'}), 400

    user_id = data.get('user_id')
    project_id = data.get('project_id')
    message = data.get('message')
    role = data.get('role', 'psychology')
    history = data.get('history', [])

    if not user_id or not message:
        return jsonify({'success': False, 'error': '缺少必需参数'}), 400

    if role not in ['psychology', 'taskbreaker']:
        return jsonify({'success': False, 'error': '无效的角色类型'}), 400

    sys.path.insert(0, os.path.join(os.path.dirname(os.path.dirname(__file__)), 'ai'))
    from service import AIService

    try:
        ai_service = AIService(user_id, project_id)
        result = ai_service.chat(message, role, history)

        if isinstance(result, dict):
            return jsonify({
                'success': True,
                'response': result['response'],
                'todolist_updated': result.get('todolist_updated', False),
                'project_created': result.get('project_created', False)
            })
        else:
            return jsonify({
                'success': True,
                'response': result,
                'todolist_updated': False
            })
    except Exception as e:
        logger.error(f"AI chat error: {str(e)}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'AI 服务暂时不可用，请稍后重试'
        }), 500

@ai_bp.route('/api/ai/todolist/<int:user_id>', methods=['GET'])
def get_todolist(user_id):
    """获取用户的所有待办清单"""
    with get_db() as conn:
        projects = conn.execute(
            'SELECT id, title, tasks FROM todo_lists WHERE user_id = ?',
            (user_id,)
        ).fetchall()

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

    with get_db() as conn:
        conn.execute(
            'UPDATE todo_lists SET tasks = ? WHERE id = ?',
            (json.dumps(tasks), project_id)
        )
        conn.commit()

    return jsonify({'success': True})
