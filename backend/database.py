import sqlite3
import os
from sqlite3 import Connection
from contextlib import contextmanager

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DB_PATH = os.path.join(BASE_DIR, 'database', 'user.db')

@contextmanager
def get_db():
    """数据库连接上下文管理器，自动处理连接关闭"""
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()
