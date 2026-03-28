"""输入验证工具函数"""
import re


def validate_email(email: str) -> bool:
    """验证邮箱格式"""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def validate_password(password: str) -> bool:
    """验证密码长度（≥6）"""
    return len(password) >= 6


def validate_code(code: str) -> bool:
    """验证验证码格式（6 位数字）"""
    return bool(re.match(r'^\d{6}$', code))
