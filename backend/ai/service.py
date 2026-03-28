import os
import sys
from functools import partial

sys.path.insert(0, os.path.dirname(__file__))
from agent import ReActAgent, talk, websearch, task_breaker, list_projects, create_project
from tools import update_todolist

class AIService:
    def __init__(self, user_id: int, project_id: int = None, project_directory: str = None):
        self.user_id = user_id
        self.project_id = project_id
        self.project_directory = project_directory or os.getcwd()

    def chat(self, message: str, role: str = 'psychology', history: list = None) -> dict:
        """处理用户消息"""
        if role == 'psychology':
            # 绑定 user_id 到 create_project
            bound_create = partial(create_project, user_id=self.user_id)
            bound_create.__name__ = 'create_project'
            tools = [talk, websearch, list_projects, bound_create, task_breaker]
        else:
            # taskbreaker 角色，绑定 project_id 到 update_todolist
            bound_update = partial(update_todolist, self.project_id)
            bound_update.__name__ = 'up_todolist'
            tools = [talk, bound_update]

        agent = ReActAgent(
            tools=tools,
            model="deepseek-chat",
            project_directory=self.project_directory,
            role=role
        )

        response = agent.run(message, history=history or [])

        # 检查是否更新了待办清单或创建了项目
        updated_todolist = role == 'taskbreaker' and response is not None and 'up_todolist' in response
        created_project = 'create_project' in agent.called_tools

        return {
            'response': response or "抱歉，我现在无法回应。",
            'todolist_updated': updated_todolist,
            'project_created': created_project
        }
