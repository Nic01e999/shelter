-- 添加认证字段到 users 表
CREATE TABLE users_new (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_login_at TIMESTAMP
);

INSERT INTO users_new (id, username, email, password_hash, created_at)
SELECT id, username, email, '', created_at FROM users;

DROP TABLE users;

ALTER TABLE users_new RENAME TO users;
