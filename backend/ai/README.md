# AI Agent 使用说明

## 概述

基于 DeepSeek API 的 ReAct（Reasoning + Acting）模式代理，能够通过思考-行动循环自主完成任务。

## 快速开始

```bash
# 激活虚拟环境
source .venv/bin/activate

# 安装依赖
uv sync

# 运行（当前目录）
python agent.py

# 运行（指定目录）
python agent.py /path/to/project
```

## 环境配置

在 `.env` 文件中配置：

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

## 可用工具

- `read_file(file_path)` - 读取文件内容
- `write_to_file(file_path, content)` - 写入文件（会覆盖原内容）
- `run_terminal_command(command)` - 执行终端命令（需用户确认）

## 工作流程

1. 用户输入任务
2. Agent 输出 `<thought>` 思考过程
3. Agent 选择 `<action>` 调用工具
4. 系统返回 `<observation>` 结果
5. 重复 2-4 直到得出 `<final_answer>`

## 注意事项

- 工具参数必须使用双引号或单引号，不能用反引号
- 多行内容使用 `\n` 表示换行
- 文件路径使用绝对路径
- 长文件内容建议分多次写入（每次不超过 50 行）
- 终端命令执行前会要求用户确认

## 参数解析

Agent 使用自定义解析器（`agent.py:130-200`）：
- 支持嵌套括号和多行字符串
- 处理转义字符（`\n`, `\t`, `\\`, `\"`, `\'`）
- 避免使用 `eval()` 确保安全性
