const API_BASE = 'http://localhost:9999/api';

const api = {
  async getUsers() {
    const res = await fetch(`${API_BASE}/users`);
    return res.json();
  },

  async createUser(username, email) {
    const res = await fetch(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    return res.json();
  },

  async getTodos(userId) {
    const res = await fetch(`${API_BASE}/todos/${userId}`);
    return res.json();
  },

  async createTodo(userId, title, angle, tasks) {
    const res = await fetch(`${API_BASE}/todos`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, title, position_angle: angle, tasks })
    });
    return res.json();
  },

  async updateTodo(todoId, title, angle, tasks) {
    const res = await fetch(`${API_BASE}/todos/${todoId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, position_angle: angle, tasks })
    });
    return res.json();
  },

  async deleteTodo(todoId) {
    const res = await fetch(`${API_BASE}/todos/${todoId}`, {
      method: 'DELETE'
    });
    return res.json();
  }
};
