# SHELTER

心理健康与专注力管理 Web 应用，结合 AI 陪伴、任务管理和专注环境功能。

## 功能特性

- **AI 宠物陪伴** - 心理慰问、任务拆解建议、情绪支持
- **圆形轨道任务管理** - 可视化项目管理，拖拽式交互
- **待办清单系统** - 支持键盘快捷操作的任务列表
- **专注时间记录** - Fire 模块记录专注时长，生成可视化图表
- **白噪音播放** - 沉浸式工作环境，配合虚拟窗景

## 技术栈

**前端**
- 原生 JavaScript (ES6+)
- CSS3 (渐变、动画)
- HTML5

**后端**
- Python 3.x
- Flask (Web 框架)
- SQLite (数据库)
- DeepSeek API (AI 功能)

## 快速开始

### 环境要求

- Python 3.8+
- 现代浏览器 (Chrome/Firefox/Safari)

### 安装步骤

1. 克隆仓库
```bash
git clone <repository-url>
cd shelter
```

2. 配置后端环境
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\Scripts\activate
pip install -r requirements.txt
```

3. 配置环境变量

在 `backend/.env` 文件中添加：
```bash
DEEPSEEK_API_KEY=your_api_key_here
```

4. 启动后端服务
```bash
python server.py
# 服务器将在 http://localhost:9999 启动
```

5. 打开前端

直接在浏览器中打开 `index.html` 或使用本地服务器。

## 项目结构

```
shelter/
├── index.html              # 主页面
├── server.py               # 服务器启动入口
├── css/                    # 样式文件
├── js/                     # 前端脚本
│   ├── main.js            # 主入口
│   ├── circle.js          # 圆形轨道系统
│   ├── todo.js            # 待办清单
│   ├── api.js             # API 调用
│   └── planet.js          # 星球交互
├── backend/
│   ├── app.py             # Flask 应用
│   ├── database.py        # 数据库连接
│   └── routes/            # API 路由
└── database/
    └── user.db            # SQLite 数据库
```

## 开发指南

### 前端开发

- 使用 ES6+ 模块化
- 遵循 camelCase 命名规范
- 保持代码简洁，避免冗余

### 后端开发

- 遵循 PEP 8 规范
- 使用类型注解
- 函数/变量使用 snake_case，类使用 PascalCase

## License

MIT
