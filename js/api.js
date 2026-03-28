const API_BASE = 'http://localhost:9999/api';

/**
 * 获取认证令牌
 * @returns {string|null}
 */
function getAuthToken() {
  return localStorage.getItem('authToken');
}

/**
 * 带认证的 fetch 请求
 * @param {string} url - 请求 URL
 * @param {object} options - fetch 选项
 * @returns {Promise<Response>}
 */
async function fetchWithAuth(url, options = {}) {
  const token = getAuthToken();

  const res = await fetch(url, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': token ? `Bearer ${token}` : ''
    }
  });

  if (res.status === 401) {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userId');
    window.location.href = '/login.html';
    return;
  }

  return res;
}

const api = {
  /**
   * 获取所有用户
   * @returns {Promise<Array>}
   */
  async getUsers() {
    const res = await fetchWithAuth(`${API_BASE}/users`);
    return res.json();
  },

  /**
   * 创建用户
   * @param {string} username - 用户名
   * @param {string} email - 邮箱
   * @returns {Promise<object>}
   */
  async createUser(username, email) {
    const res = await fetchWithAuth(`${API_BASE}/users`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email })
    });
    return res.json();
  },

  /**
   * 获取项目列表
   * @param {number} userId - 用户ID
   * @returns {Promise<Array>}
   */
  async getProjects(userId) {
    const res = await fetchWithAuth(`${API_BASE}/projects/${userId}`);
    return res.json();
  },

  /**
   * 创建项目
   * @param {number} userId - 用户ID
   * @param {string} title - 项目标题
   * @param {number} angle - 角度
   * @param {Array} tasks - 任务列表
   * @returns {Promise<object>}
   */
  async createProject(userId, title, angle, tasks) {
    const res = await fetchWithAuth(`${API_BASE}/projects`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ user_id: userId, title, position_angle: angle, tasks })
    });
    return res.json();
  },

  /**
   * 更新项目
   * @param {number} projectId - 项目ID
   * @param {string} title - 项目标题
   * @param {number} angle - 角度
   * @param {Array} tasks - 任务列表
   * @returns {Promise<object>}
   */
  async updateProject(projectId, title, angle, tasks) {
    const res = await fetchWithAuth(`${API_BASE}/projects/${projectId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, position_angle: angle, tasks })
    });
    return res.json();
  },

  /**
   * 删除项目
   * @param {number} projectId - 项目ID
   * @returns {Promise<object>}
   */
  async deleteProject(projectId) {
    const res = await fetchWithAuth(`${API_BASE}/projects/${projectId}`, {
      method: 'DELETE'
    });
    return res.json();
  },

  /**
   * 保存专注时间
   * @param {string} startTime - 开始时间
   * @param {string} endTime - 结束时间
   * @param {number} duration - 持续时间
   * @returns {Promise<object>}
   */
  async saveFocus(startTime, endTime, duration) {
    const res = await fetchWithAuth(`${API_BASE}/modefire/save`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ start_time: startTime, end_time: endTime, duration })
    });
    return res.json();
  },

  /**
   * 获取专注历史
   * @param {number} days - 天数
   * @returns {Promise<Array>}
   */
  async getFocusHistory(days = 7) {
    const res = await fetchWithAuth(`${API_BASE}/modefire/history?days=${days}`);
    return res.json();
  }
};

export default api;
