<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib.php';

if (!config() || !is_installed()) {
    redirect('../install.php');
}
if (current_user()) {
    $existing = current_user();
    if (in_array($existing['role'], ['ADMIN', 'EDITOR'], true)) {
        redirect('index.php');
    }
    redirect('../akun.php');
}

$error = null;
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!csrf_ok($_POST['csrf'] ?? null)) {
            throw new RuntimeException('Sesi kedaluwarsa. Muat ulang halaman.');
        }
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');
        if ($email === '' || $password === '') {
            throw new RuntimeException('Email dan kata sandi wajib diisi.');
        }
        $stmt = db()->prepare('SELECT `id`, `passwordHash`, `isActive`, `role` FROM `User` WHERE `email` = ? LIMIT 1');
        $stmt->execute([$email]);
        $user = $stmt->fetch();
        if (!$user || (int) $user['isActive'] !== 1 || !password_verify($password, (string) $user['passwordHash'])) {
            throw new RuntimeException('Email atau kata sandi salah.');
        }
        if (!in_array((string) $user['role'], ['ADMIN', 'EDITOR'], true)) {
            throw new RuntimeException('Akun ini bukan akun staf. Masuk lewat /login.php');
        }
        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];
        $update = db()->prepare('UPDATE `User` SET `lastLoginAt` = NOW(3) WHERE `id` = ?');
        $update->execute([$user['id']]);
        redirect('index.php');
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Masuk Admin — KNPI Morowali</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="../images/logo.jpg">
<link rel="stylesheet" href="../assets/app.css">
</head>
<body class="min-h-screen bg-navy">
<div class="flex min-h-screen items-center justify-center px-4 py-12">
  <div class="w-full max-w-md rounded-2xl bg-white p-7 shadow-2xl">
    <div class="flex items-center gap-3">
      <img src="../images/logo.jpg" alt="Logo KNPI" class="h-10 w-14 object-contain">
      <div><div class="text-sm font-extrabold text-navy">KNPI Morowali</div><div class="text-[11px] text-muted">Panel Admin</div></div>
    </div>
    <h1 class="mt-5 text-2xl font-extrabold text-navy">Masuk Admin</h1>
    <p class="mt-1 text-sm text-muted">Khusus administrator dan editor.</p>
    <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="mt-5">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <label class="label" for="email">Email</label>
      <input class="input" id="email" type="email" name="email" required autocomplete="email">
      <label class="label mt-4" for="password">Kata sandi</label>
      <input class="input" id="password" type="password" name="password" required autocomplete="current-password">
      <button type="submit" class="btn-primary mt-5 w-full">Masuk</button>
    </form>
    <p class="mt-4 text-center text-sm"><a class="font-semibold text-brand-600 hover:underline" href="../login.php">Login anggota</a></p>
  </div>
</div>
</body>
</html>
