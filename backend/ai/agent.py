import ast
import inspect
import os
import re
from string import Template
from typing import List, Callable, Tuple

import click
from dotenv import load_dotenv
from openai import OpenAI
import platform

from prompts import get_prompt


class ReActAgent:
    def __init__(self, tools: List[Callable], model: str, project_directory: str, role: str = 'psychology'):
        self.tools = { func.__name__: func for func in tools }
        self.model = model
        self.project_directory = project_directory
        self.role = role
        self.client = OpenAI(
            base_url="https://api.deepseek.com",
            api_key=ReActAgent.get_api_key(),
        )

    def run(self, user_input: str, max_iterations: int = 5, history: list = None):
        prompt_template = get_prompt(self.role)

        # 使用历史记录或创建新的消息列表
        if history:
            messages = history.copy()
            messages.append({"role": "user", "content": f"<question>{user_input}</question>"})
        else:
            messages = [
                {"role": "system", "content": self.render_system_prompt(prompt_template)},
                {"role": "user", "content": f"<question>{user_input}</question>"}
            ]

        iteration = 0
        while iteration < max_iterations:
            iteration += 1

            # 请求模型
            content = self.call_model(messages)

            # 检测 Thought
            thought_match = re.search(r"<thought>(.*?)</thought>", content, re.DOTALL)
            if thought_match:
                thought = thought_match.group(1)
                print(f"\n\n💭 Thought: {thought}")

            # 不再检测 final_answer，由 talk() 工具处理所有用户交互

            # 检测 Action
            action_match = re.search(r"<action>(.*?)</action>", content, re.DOTALL)
            if not action_match:
                # 尝试匹配未闭合的 action（可能被截断）
                action_match = re.search(r"<action>(.*)", content, re.DOTALL)
                if action_match:
                    print("⚠️ 警告：模型输出被截断，<action> 标签未闭合，请求模型重新生成...")
                    messages.append({
                        "role": "user",
                        "content": "<observation>错误：你的输出被截断了，</action> 标签未闭合。请重新输出，注意：1) 使用双引号而不是反引号；2) 如果内容很长，请分多次写入，每次不超过50行。</observation>"
                    })
                    continue
                else:
                    # 没有任何 action 标签，提醒模型重新输出
                    messages.append({
                        "role": "user",
                        "content": "<observation>错误：你必须输出 <action> 或 <final_answer> 标签。请严格按照格式重新回答。</observation>"
                    })
                    continue
            action = action_match.group(1)
            tool_name, args = self.parse_action(action)

            print(f"\n\n🔧 Action: {tool_name}()")
            print(f"   参数: {args}")

            # Web 模式下，talk() 直接返回响应并结束
            if tool_name == "talk":
                try:
                    response = self.tools[tool_name](*args)
                    # 保存助手的回复到历史
                    messages.append({"role": "assistant", "content": content})
                    # 更新传入的历史记录
                    if history is not None:
                        history.clear()
                        history.extend(messages)
                    return response
                except Exception as e:
                    return f"错误：{str(e)}"

            try:
                observation = self.tools[tool_name](*args)
            except Exception as e:
                observation = f"工具执行错误：{str(e)}"
            print(f"\n\n🔍 Observation：{observation}")
            obs_msg = f"<observation>{observation}</observation>"
            messages.append({"role": "user", "content": obs_msg})


    def get_tool_list(self) -> str:
        """生成工具列表字符串，包含函数签名和简要说明"""
        tool_descriptions = []
        for func in self.tools.values():
            name = func.__name__
            signature = str(inspect.signature(func))
            doc = inspect.getdoc(func)
            tool_descriptions.append(f"- {name}{signature}: {doc}")
        return "\n".join(tool_descriptions)

    def render_system_prompt(self, system_prompt_template: str) -> str:
        """渲染系统提示模板，替换变量"""
        tool_list = self.get_tool_list()
        file_list = ", ".join(
            os.path.abspath(os.path.join(self.project_directory, f))
            for f in os.listdir(self.project_directory)
        )
        return Template(system_prompt_template).substitute(
            operating_system=self.get_operating_system_name(),
            tool_list=tool_list,
            file_list=file_list,
            project_directory=self.project_directory
        )

    @staticmethod
    def get_api_key() -> str:
        """Load the API key from an environment variable."""
        load_dotenv()
        api_key = os.getenv("DEEPSEEK_API_KEY")
        if not api_key:
            raise ValueError("未找到 DEEPSEEK_API_KEY 环境变量，请在 .env 文件中设置。")
        return api_key

    def call_model(self, messages):
        print("\n\n正在请求模型，请稍等...")
        response = self.client.chat.completions.create(
            model=self.model,
            messages=messages,
        )
        content = response.choices[0].message.content
        # print(f"\n\n📝 模型原始输出：\n{content}")
        messages.append({"role": "assistant", "content": content})
        return content

    def parse_action(self, code_str: str) -> Tuple[str, List[str]]:
        match = re.match(r'(\w+)\((.*)\)', code_str, re.DOTALL)
        if not match:
            raise ValueError("Invalid function call syntax")

        func_name = match.group(1)
        args_str = match.group(2).strip()

        # 手动解析参数，追踪字符串、括号和方括号深度
        args = []
        current_arg = ""
        in_string = False
        string_char = None
        i = 0
        paren_depth = 0
        bracket_depth = 0

        while i < len(args_str):
            char = args_str[i]

            if not in_string:
                if char in ['"', "'"]:
                    in_string = True
                    string_char = char
                    current_arg += char
                elif char == '(':
                    paren_depth += 1
                    current_arg += char
                elif char == ')':
                    paren_depth -= 1
                    current_arg += char
                elif char == '[':
                    bracket_depth += 1
                    current_arg += char
                elif char == ']':
                    bracket_depth -= 1
                    current_arg += char
                elif char == ',' and paren_depth == 0 and bracket_depth == 0:
                    # 只在顶层（括号和方括号外）的逗号才分割参数
                    args.append(self._parse_single_arg(current_arg.strip()))
                    current_arg = ""
                else:
                    current_arg += char
            else:
                current_arg += char
                if char == string_char and (i == 0 or args_str[i-1] != '\\'):
                    in_string = False
                    string_char = None

            i += 1

        # 添加最后一个参数
        if current_arg.strip():
            args.append(self._parse_single_arg(current_arg.strip()))

        return func_name, args
    
    def _parse_single_arg(self, arg_str: str):
        """解析单个参数"""
        arg_str = arg_str.strip()
        
        # 如果是字符串字面量
        if (arg_str.startswith('"') and arg_str.endswith('"')) or \
           (arg_str.startswith("'") and arg_str.endswith("'")):
            # 移除外层引号并处理转义字符
            inner_str = arg_str[1:-1]
            # 处理常见的转义字符
            inner_str = inner_str.replace('\\"', '"').replace("\\'", "'")
            inner_str = inner_str.replace('\\n', '\n').replace('\\t', '\t')
            inner_str = inner_str.replace('\\r', '\r').replace('\\\\', '\\')
            return inner_str
        
        # 尝试使用 ast.literal_eval 解析其他类型
        try:
            return ast.literal_eval(arg_str)
        except (SyntaxError, ValueError):
            # 如果解析失败，返回原始字符串
            return arg_str

    def get_operating_system_name(self):
        os_map = {
            "Darwin": "macOS",
            "Windows": "Windows",
            "Linux": "Linux"
        }

        return os_map.get(platform.system(), "Unknown")


def read_file(file_path):
    """用于读取文件内容"""
    with open(file_path, "r", encoding="utf-8") as f:
        return f.read()

def write_to_file(file_path, content):
    """将指定内容写入指定文件"""
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(content.replace("\\n", "\n"))
    return "写入成功"

def run_terminal_command(command):
    """用于执行终端命令"""
    import subprocess
    run_result = subprocess.run(command, shell=True, capture_output=True, text=True)
    return "执行成功" if run_result.returncode == 0 else run_result.stderr

def talk(message: str) -> str:
    """与用户对话，返回 AI 的回复"""
    return message

def websearch(query: str) -> str:
    """模拟网络搜索（实际项目中需接入真实搜索 API）"""
    return f"[搜索结果] 关于 '{query}' 的信息：这是一个常见问题，建议采取相应措施。"

def up_todolist(items: list) -> str:
    """更新待办清单，参数: items (list) - 任务列表 ["任务1", "任务2", ...]"""
    # project_id 通过 functools.partial 在 service.py 中绑定
    # 这个函数会被包装，实际调用时 project_id 已经绑定
    raise NotImplementedError("此函数需要通过 service.py 中的 partial 绑定 project_id 后使用")

def task_breaker(task: str, project_id: int) -> str:
    """调用任务拆解助手"""
    import sys
    import os
    sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
    from database import get_db

    # 启动 taskbreaker 角色的 agent
    tools = [talk, up_todolist, read_file, write_to_file]
    agent = ReActAgent(tools=tools, model="deepseek-chat", project_directory=os.getcwd(), role='taskbreaker')

    # 运行任务拆解
    result = agent.run(f"请将以下任务拆解成具体的子任务：{task}")

    return f"任务 '{task}' 已拆解完成"

@click.command()
@click.option('--role', type=click.Choice(['psychology', 'taskbreaker']),
              default='psychology', help='选择 AI 角色：psychology(心理咨询师) 或 taskbreaker(任务拆解器)')
@click.argument(
    'project_directory',
    type=click.Path(exists=True, file_okay=False, dir_okay=True),
    required=False
)
def main(role, project_directory):
    # 没传路径就用当前目录
    if project_directory is None:
        project_dir = os.path.abspath(".")
    else:
        project_dir = os.path.abspath(project_directory)

    # 根据角色选择工具集
    if role == 'psychology':
        tools = [talk, websearch, task_breaker, read_file, write_to_file]
    else:  # taskbreaker
        tools = [talk, up_todolist, read_file, write_to_file]

    agent = ReActAgent(tools=tools, model="deepseek-chat", project_directory=project_dir, role=role)

    print(f"\n🤖 当前角色：{'心理咨询师' if role == 'psychology' else '任务拆解器'}")
    task = input("\n请输入任务：")

    final_answer = agent.run(task)

    print(f"\n\n✅ Final Answer：{final_answer}")

if __name__ == "__main__":
    main()