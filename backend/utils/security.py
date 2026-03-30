"""安全工具函数"""
import bcrypt
import secrets
from datetime import datetime, timedelta


def hash_password(password: str) -> str:
    """使用 bcrypt 哈希密码（12 rounds）"""
    salt = bcrypt.gensalt(rounds=12)
    return bcrypt.hashpw(password.encode('utf-8'), salt).decode('utf-8')


def verify_password(password: str, hashed: str) -> bool:
    """验证密码"""
    return bcrypt.checkpw(password.encode('utf-8'), hashed.encode('utf-8'))


def generate_token() -> str:
    """生成 32 字节安全令牌"""
    return secrets.token_urlsafe(32)


def generate_code() -> str:
    """生成 6 位数字验证码"""
    return f"{secrets.randbelow(1000000):06d}"


def get_token_expiry() -> datetime:
    """获取令牌过期时间（30 天后）"""
    return datetime.now() + timedelta(days=30)


def get_code_expiry() -> datetime:
    """获取验证码过期时间（10 分钟后）"""
    return datetime.now() + timedelta(minutes=10)
