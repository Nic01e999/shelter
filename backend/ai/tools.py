import json
import sqlite3
import sys
import os

# 添加父目录到路径以导入 config
sys.path.insert(0, os.path.dirname(os.path.dirname(__file__)))
from config import DATABASE_PATH


def update_todolist(project_id: int, items: list) -> str:
    """更新待办清单

    Args:
        project_id: 项目 ID
        items: 任务列表 ["任务1", "任务2", ...]

    Returns:
        更新结果消息
    """
    # 确保 items 是字符串列表
    if isinstance(items, list) and len(items) > 0 and isinstance(items[0], list):
        items = items[0]

    # 转换为数据库格式
    tasks_json = [{"text": item, "completed": False} for item in items]

    print(f"\n🔍 使用数据库：{DATABASE_PATH}")
    print(f"🔍 project_id={project_id}")

    conn = sqlite3.connect(str(DATABASE_PATH))
    conn.row_factory = sqlite3.Row
    conn.isolation_level = None

    cursor = conn.execute(
        'UPDATE todo_lists SET tasks = ? WHERE id = ?',
        (json.dumps(tasks_json, ensure_ascii=False), project_id)
    )
    affected_rows = cursor.rowcount

    # 验证
    after = conn.execute('SELECT tasks FROM todo_lists WHERE id = ?', (project_id,)).fetchone()
    print(f"🔍 更新后验证：{after['tasks'] if after else 'NOT FOUND'}")

    conn.close()

    print(f"📝 已更新 {affected_rows} 行")
    return "待办清单已更新"
