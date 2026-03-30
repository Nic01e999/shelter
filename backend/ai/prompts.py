"""提示词管理模块 - 统一导出所有 AI 角色的提示词"""

from prompt_psychology import react_system_prompt_template as psychology_prompt
from prompt_taskbreaker import react_system_prompt_template as taskbreaker_prompt

PROMPTS = {
    'psychology': psychology_prompt,
    'taskbreaker': taskbreaker_prompt
}

def get_prompt(role: str) -> str:
    """根据角色名称获取对应的提示词模板"""
    if role not in PROMPTS:
        raise ValueError(f"未知角色: {role}，可用角色: {list(PROMPTS.keys())}")
    return PROMPTS[role]
