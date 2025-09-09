<?php
$db = new SQLite3('data.db');

// 创建用户表
$db->exec("CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE,
    password TEXT
)");

// 创建邮箱表
$db->exec("CREATE TABLE IF NOT EXISTS mailboxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    email TEXT UNIQUE,
    password TEXT,
    description TEXT,
    server TEXT,
    protocol TEXT,
    port INTEGER,
    ssl INTEGER
)");

// 创建邮件表
$db->exec("CREATE TABLE IF NOT EXISTS mails (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    mailbox_id INTEGER,
    subject TEXT,
    sender TEXT,
    content TEXT,
    received_at TEXT,
    FOREIGN KEY(mailbox_id) REFERENCES mailboxes(id)
)");

// 初始化管理员账号
$admin = $db->querySingle("SELECT * FROM users WHERE username='admin'");
if (!$admin) {
    $db->exec("INSERT INTO users (username, password) VALUES ('admin', 'admin123')");
}

echo "数据库初始化完成，默认账号：admin，密码：admin123";
?>
