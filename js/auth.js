const API_BASE = 'http://localhost:9999';

// 表单切换
document.querySelectorAll('[data-form]').forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        const targetForm = e.target.dataset.form;
        document.querySelectorAll('.auth-form').forEach(form => form.classList.remove('active'));
        document.getElementById(`${targetForm}-form`).classList.add('active');
        hideError();
    });
});

// 显示错误/成功消息
function showError(message, isSuccess = false) {
    const errorEl = document.getElementById('error-message');
    errorEl.textContent = message;
    errorEl.classList.add('show');
    errorEl.style.color = isSuccess ? '#4ade80' : '#ef4444';
}

function hideError() {
    const errorEl = document.getElementById('error-message');
    errorEl.classList.remove('show');
}

// 登录
document.getElementById('login-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-username').value.trim();
    const password = document.getElementById('login-password').value;

    try {
        const response = await fetch(`${API_BASE}/api/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('email', data.user.email);
            window.location.href = '/index.html';
        } else {
            showError(data.error || '登录失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
    }
});

// 注册（发送验证码）
let pendingEmail = '';
let pendingPassword = '';
let isResetMode = false;

document.getElementById('register-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('register-username').value.trim();
    const password = document.getElementById('register-password').value;
    const confirm = document.getElementById('register-confirm').value;

    if (password !== confirm) {
        showError('两次密码输入不一致');
        return;
    }

    if (password.length < 6) {
        showError('密码至少6位');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, is_register: true })
        });
        const data = await response.json();

        if (data.success) {
            pendingEmail = email;
            pendingPassword = password;
            isResetMode = false;
            document.getElementById('verify-email').value = email;
            document.getElementById('verify-password').style.display = 'none';
            document.getElementById('verify-password').required = false;
            showError('验证码已发送到邮箱，请查收', true);
            setTimeout(() => {
                document.querySelector('[data-form="verify"]').click();
            }, 1000);
        } else {
            showError(data.error || '发送失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
    }
});

// 重置密码（发送验证码）
document.getElementById('reset-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('reset-username').value.trim();

    try {
        const response = await fetch(`${API_BASE}/api/auth/forgot-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });
        const data = await response.json();

        if (data.success) {
            pendingEmail = email;
            pendingPassword = '';
            isResetMode = true;
            document.getElementById('verify-email').value = email;
            document.getElementById('verify-password').style.display = 'block';
            document.getElementById('verify-password').required = true;
            showError('验证码已发送到邮箱，请查收', true);
            setTimeout(() => {
                document.querySelector('[data-form="verify"]').click();
            }, 1000);
        } else {
            showError(data.error || '发送失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
    }
});

// 验证码确认
document.getElementById('verify-form').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('verify-email').value.trim();
    const code = document.getElementById('verify-code').value.trim();
    const password = isResetMode ? document.getElementById('verify-password').value : pendingPassword;

    if (!password) {
        showError('密码不能为空');
        return;
    }

    try {
        const response = await fetch(`${API_BASE}/api/auth/reset-password`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, code, password, is_register: !isResetMode })
        });
        const data = await response.json();

        if (data.success) {
            localStorage.setItem('authToken', data.token);
            localStorage.setItem('userId', data.user.id);
            localStorage.setItem('email', data.user.email);
            pendingEmail = '';
            pendingPassword = '';
            isResetMode = false;
            window.location.href = '/index.html';
        } else {
            showError(data.error || '验证失败');
        }
    } catch (error) {
        showError('网络错误，请稍后重试');
    }
});
