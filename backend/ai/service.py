import os
import sys
sys.path.insert(0, os.path.dirname(__file__))
from agent import ReActAgent, talk, websearch, task_breaker, up_todolist, read_file, write_to_file

class AIService:
    def __init__(self, user_id: int, project_directory: str = None):
        self.user_id = user_id
        self.project_directory = project_directory or os.getcwd()

    def chat(self, message: str, role: str = 'psychology') -> str:
        """处理用户消息"""
        if role == 'psychology':
            tools = [talk, websearch, task_breaker, read_file, write_to_file]
        else:
            tools = [talk, up_todolist, read_file, write_to_file]

        agent = ReActAgent(
            tools=tools,
            model="deepseek-chat",
            project_directory=self.project_directory,
            role=role
        )

        return agent.run(message)
