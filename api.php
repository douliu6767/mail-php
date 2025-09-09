<?php
session_start();
$db = new SQLite3('data.db');
header('Content-Type: application/json');
function json($data) { echo json_encode($data); exit; }
$action = $_GET['action'] ?? '';
// 登录
if ($action == 'login') {
    $username = $_POST['username'] ?? '';
    $password = $_POST['password'] ?? '';
    $row = $db->querySingle("SELECT * FROM users WHERE username='$username' AND password='$password'", true);
    if ($row) {
        $_SESSION['user'] = $username;
        json(['success'=>true]);
    } else {
        json(['success'=>false, 'msg'=>'账号或密码错误']);
    }
}
// 检查登录
if ($action == 'check_login') {
    json(['logged_in'=>isset($_SESSION['user'])]);
}
// 退出登录
if ($action == 'logout') {
    session_destroy();
    json(['success'=>true]);
}
// 添加邮箱
if ($action == 'add_mailbox') {
    if (!isset($_SESSION['user'])) json(['success'=>false, 'msg'=>'未登录']);
    $email = $_POST['email'] ?? '';
    $password = $_POST['password'] ?? '';
    $desc = $_POST['description'] ?? '';
    $server = $_POST['server'] ?? '';
    $protocol = $_POST['protocol'] ?? '';
    $port = $_POST['port'] ?? '';
    $ssl = $_POST['ssl'] ?? 0;
    $db->exec("INSERT INTO mailboxes (email, password, description, server, protocol, port, ssl) VALUES ('$email', '$password', '$desc', '$server', '$protocol', '$port', '$ssl')");
    json(['success'=>true]);
}
// 删除邮箱
if ($action == 'delete_mailbox') {
    if (!isset($_SESSION['user'])) json(['success'=>false, 'msg'=>'未登录']);
    $id = $_POST['id'] ?? 0;
    $db->exec("DELETE FROM mailboxes WHERE id=$id");
    json(['success'=>true]);
}
// 获取邮箱列表
if ($action == 'list_mailboxes') {
    if (!isset($_SESSION['user'])) json(['success'=>false, 'msg'=>'未登录']);
    $res = $db->query("SELECT * FROM mailboxes");
    $arr = [];
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) $arr[] = $row;
    json(['success'=>true, 'data'=>$arr]);
}
// 获取收件内容
if ($action == 'list_mails') {
    $mailbox_id = $_GET['mailbox_id'] ?? 0;
    $res = $db->query("SELECT * FROM mails WHERE mailbox_id=$mailbox_id ORDER BY received_at DESC LIMIT 50");
    $arr = [];
    while ($row = $res->fetchArray(SQLITE3_ASSOC)) $arr[] = $row;
    json(['success'=>true, 'data'=>$arr]);
}
// 获取最新一封邮件（通过邮箱账号）
if ($action == 'get_latest_mail') {
    $email = $_GET['email'] ?? '';
    $mailbox = $db->querySingle("SELECT id FROM mailboxes WHERE email='$email'", true);
    if (!$mailbox) {
        json(['success'=>false, 'msg'=>'此账号不存在']);
    }
    $mail = $db->querySingle("SELECT subject, sender, content, received_at FROM mails WHERE mailbox_id={$mailbox['id']} ORDER BY received_at DESC LIMIT 1", true);
    if (!$mail) {
        json(['success'=>true, 'data'=>['subject'=>'无邮件','sender'=>'','content'=>'','received_at'=>'']]);
    }
    json(['success'=>true, 'data'=>$mail]);
}
json(['success'=>false, 'msg'=>'未知操作']);
?>
