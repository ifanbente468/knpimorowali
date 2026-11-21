<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('install.php');
}
if (current_user()) {
    redirect('index.php');
}

$settings = settings_map();
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

        session_regenerate_id(true);
        $_SESSION['user_id'] = $user['id'];

        $update = db()->prepare('UPDATE `User` SET `lastLoginAt` = NOW(3) WHERE `id` = ?');
        $update->execute([$user['id']]);

        if (in_array((string) $user['role'], ['ADMIN', 'EDITOR'], true)) {
            redirect('admin/index.php');
        }
        redirect('index.php');
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}

page_header('Masuk', $settings);
?>
<div class="auth"><div class="box">
  <h1 style="font-size:22px;margin:0 0 6px">Masuk</h1>
  <p style="margin:0;color:#5b6b82;font-size:14px">Gunakan akun admin yang dibuat saat instalasi.</p>
  <?php if ($error): ?><div class="alert err" style="margin-top:16px"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <label for="email">Email</label>
    <input id="email" type="email" name="email" required autocomplete="email">
    <label for="password">Kata sandi</label>
    <input id="password" type="password" name="password" required autocomplete="current-password">
    <button type="submit">Masuk</button>
  </form>
  <p style="margin:16px 0 0;font-size:13px"><a href="index.php">Kembali ke beranda</a></p>
</div></div>
<?php page_footer($settings); ?>
