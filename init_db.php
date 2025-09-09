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

