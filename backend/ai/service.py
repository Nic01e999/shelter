import os
import sys
from functools import partial

sys.path.insert(0, os.path.dirname(__file__))
from agent import ReActAgent, talk, websearch, task_breaker, read_file, write_to_file
from tools import update_todolist

# 全局会话历史存储 {(user_id, project_id, role): messages}
_session_history = {}

class AIService:
    def __init__(self, user_id: int, project_id: int = None, project_directory: str = None):
        self.user_id = user_id
        self.project_id = project_id
        self.project_directory = project_directory or os.getcwd()

    def chat(self, message: str, role: str = 'psychology') -> str:
        """处理用户消息"""
        if role == 'psychology':
            tools = [talk, websearch, task_breaker, read_file, write_to_file]
        else:
            # taskbreaker 角色，绑定 project_id 到 update_todolist
            bound_update = partial(update_todolist, self.project_id)
            bound_update.__name__ = 'up_todolist'
            tools = [talk, bound_update, read_file, write_to_file]

        # 获取或创建会话历史
        session_key = (self.user_id, self.project_id, role)
        if session_key not in _session_history:
            _session_history[session_key] = []

        agent = ReActAgent(
            tools=tools,
            model="deepseek-chat",
            project_directory=self.project_directory,
            role=role
        )

        response = agent.run(message, history=_session_history[session_key])

        # 检查是否更新了待办清单
        updated_todolist = role == 'taskbreaker' and 'up_todolist' in str(_session_history[session_key][-5:])

        return {'response': response, 'todolist_updated': updated_todolist}
