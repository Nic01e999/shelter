import os
from pathlib import Path

# 项目根目录
PROJECT_ROOT = Path(__file__).parent.parent

# 数据库配置
DATABASE_PATH = PROJECT_ROOT / 'database' / 'user.db'

# 服务器配置
API_PORT = 9999

# DeepSeek API 配置
DEEPSEEK_API_KEY = os.getenv('DEEPSEEK_API_KEY')
