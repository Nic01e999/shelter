# SHELTER 后端 API

## 快速启动

```bash
# 安装依赖
pip install -r requirements.txt

# 运行服务器
python app.py
```

服务器将在 `http://localhost:9999` 启动

## API 接口

### 用户接口

- `GET /api/users` - 获取所有用户
- `POST /api/users` - 创建用户
  ```json
  {"username": "user1", "email": "user@example.com"}
  ```

### 待办清单接口

- `GET /api/todos/<user_id>` - 获取用户的所有待办清单
- `POST /api/todos` - 创建待办清单
  ```json
  {
    "user_id": 1,
    "title": "项目A",
    "position_angle": 45.0,
    "tasks": ["任务1", "任务2"]
  }
  ```
- `PUT /api/todos/<todo_id>` - 更新待办清单
- `DELETE /api/todos/<todo_id>` - 删除待办清单
