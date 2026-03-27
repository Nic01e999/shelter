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

  async getProjects(userId) {
    const res = await fetch(`${API_BASE}/projects/${userId}`);
    return res.json();
  },

  async createProject(userId, title, angle, tasks) {
    const res = await fetch(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, title, position_angle: angle, tasks })
    });
    return res.json();
  },

  async updateProject(projectId, title, angle, tasks) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, position_angle: angle, tasks })
    });
    return res.json();
  },

  async deleteProject(projectId) {
    const res = await fetch(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  async saveFocus(startTime, endTime, duration) {
    const res = await fetch(`${API_BASE}/modefire/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_time: startTime, end_time: endTime, duration })
    });
    return res.json();
  },

  async getFocusHistory(days = 7) {
    const res = await fetch(`${API_BASE}/modefire/history?days=${days}`);
    return res.json();
  }
};
