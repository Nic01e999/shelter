# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 项目概述

SHELTER 是一个心理健康与专注力管理 Web 应用，结合 AI 陪伴、任务管理和专注环境功能。

**核心功能**：
- AI 宠物陪伴（心理慰问、任务拆解建议）
- 圆形轨道任务可视化（拖拽式任务管理）
- 待办清单系统（支持键盘快捷操作）
- 专注时间记录（fire 模块）
- 白噪音播放（沉浸式工作环境）

## 项目架构

```
shelter/
├── index.html          # 主页面
├── chart.html          # 专注时间图表页面
├── server.py           # 服务器启动入口
├── css/                # 样式文件（模块化）
│   ├── base.css       # 基础样式
│   ├── window.css     # 窗景样式
│   ├── circle.css     # 圆形轨道
│   ├── panel.css      # 侧边面板
│   ├── todo.css       # 待办清单
│   ├── fire.css       # 专注模式
│   ├── chat.css       # 聊天窗口
│   ├── audio.css      # 音频控制
│   ├── pet.css        # AI 宠物
│   └── space.css      # 太空背景
├── js/
│   ├── main.js        # 主入口
│   ├── api.js         # API 调用（ES6 模块）
│   ├── circle.js      # 圆形轨道系统
│   ├── todo.js        # 待办清单
│   ├── planet.js      # 星球交互
│   ├── pet.js         # AI 宠物交互
│   └── chart.js       # 图表可视化
├── backend/
│   ├── app.py         # Flask 应用
│   ├── database.py    # 数据库连接
│   └── routes/        # API 路由
│       ├── __init__.py
│       ├── users.py   # 用户管理
│       ├── projects.py # 项目管理
│       ├── modefire.py # 专注模式
│       ├── ai.py      # AI 接口
│       └── auth.py    # 认证
├── database/
│   └── user.db        # SQLite 数据库
└── docs/
    └── draft.md       # 需求文档
```

### 前端架构（模块化设计）

**主入口** (`js/main.js`)：
- 初始化应用，绑定全局事件
- 协调各模块交互

**圆形轨道系统** (`js/circle.js`)：
- 项目以圆形轨道方式排列，通过极坐标计算位置
- 管理项目加载、保存、选择状态
- 导出核心函数供其他模块使用

**待办清单系统** (`js/todo.js`)：
- 使用 `contenteditable` 实现内联编辑
- 键盘快捷键：
  - `Enter`：创建新待办项
  - `Backspace`（空行）：删除当前项并聚焦相邻项
- 动态创建/删除待办项，自动管理焦点

**拖拽交互** (`js/drag.js`)：
- 处理鼠标拖拽事件
- 实时计算项目在圆形轨道上的角度
- 拖拽结束后自动保存位置

### 后端架构（标准 Flask 结构）

**应用主文件** (`backend/app.py`)：
- Flask 应用初始化
- 注册蓝图（Blueprint）
- CORS 配置

**路由模块** (`backend/routes/`)：
- `users.py`：用户管理接口
- `projects.py`：项目和待办事项接口
- 使用蓝图组织路由，便于扩展

**数据库层** (`backend/database.py`)：
- SQLite 连接管理
- 统一的数据库访问接口

**ReAct Agent** (`backend/ai/agent.py`)：
- 基于 DeepSeek API 的 ReAct（Reasoning + Acting）模式
- 提供文件读写和终端命令执行能力

## 开发命令

### 启动后端服务器

```bash
# 方式 1：使用启动脚本（推荐）
python server.py

# 方式 2：直接运行 Flask 应用
python backend/app.py

# 服务器将在 http://localhost:9999 启动
```

### 前端开发

```bash
# 直接在浏览器打开 index.html
open index.html

# 注意：需要先启动后端服务器才能正常使用
```

### Python AI 代理

```bash
# 进入 AI 目录
cd backend/ai

# 激活虚拟环境
source .venv/bin/activate

# 安装依赖
uv sync

# 运行代理
python agent.py
```

### 数据库

```bash
# 查看数据库
sqlite3 database/user.db

# 导出数据库结构
sqlite3 database/user.db .schema
```

## 关键实现细节

### 圆形轨道位置计算

项目使用极坐标系统，圆心在 (300, 300)，半径 300px，通过角度计算每个项目的位置。

### 待办清单键盘交互

使用 `contenteditable` + `keydown` 事件实现：
- Enter 键在当前项后插入新项
- Backspace 在空行时删除当前项并智能聚焦

## 环境配置

### AI 代理环境变量

在 `ai/.env` 中配置：

```bash
DEEPSEEK_API_KEY=your_api_key_here
```

### Git 分支

- 主分支：`main`
- 当前分支：`nicole`

## 待实现功能

根据 `docs/draft.md`，以下模块尚未完全实现：

1. **fire 模块**：专注时间记录 + 条形图可视化
2. **white noise 模块**：白噪音播放器 + 虚拟窗景
3. **AI pet 集成**：将 `ai/agent.py` 与前端连接
4. **task breaker**：AI 驱动的大任务拆解功能
5. **info 模块**：系统信息/用户状态显示

## 代码风格约定

- **前端**：使用 `const`/`let`，避免 `var`
- **Python**：遵循 PEP 8，使用类型注解
- **命名**：
  - JavaScript：camelCase（函数、变量）
  - Python：snake_case（函数、变量），PascalCase（类）
- **不可变性**：优先创建新对象而非修改现有对象

## 已知问题（需修复）

### 前端问题

**CRITICAL**:
- `js/planet.js:1` - 重复声明 `longPressTimer` 变量，导致语法错误

**HIGH**:
- `js/planet.js` - 长按检测功能未正常工作
- `js/planet.js` - 鼠标悬停时未显示 pointer 光标

**MEDIUM**:
- `js/api.js:97` - 使用了 `export` 但未作为模块加载
- 多个文件存在未使用的变量和函数
- 部分事件监听器未正确清理

### 后端问题

**CRITICAL**:
- `backend/routes/ai.py` - 缺少 API 调用错误处理，失败时返回 500 错误

**HIGH**:
- 多处缺少类型注解（违反 PEP 8）
- `backend/routes/projects.py` - SQL 查询未使用参数化，存在注入风险

**MEDIUM**:
- 多个文件有未使用的导入
- 部分函数存在重复逻辑，可提取为工具函数

### CSS 问题

**MEDIUM**:
- `css/space.css` - 部分未使用的样式规则
- 多个文件存在重复的样式定义

## 数据持久化

- 前端状态：当前仅存储在内存中（刷新后丢失）
- 后端数据：SQLite 数据库 `database/user.db`
- 未来需要实现前后端数据同步机制
