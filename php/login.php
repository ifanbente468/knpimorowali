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

        if ((string) $user['role'] !== 'MEMBER') {
            throw new RuntimeException('Akun staf/admin harus masuk lewat halaman /admin/login.php');
        }
        redirect('/akun.php');
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}

page_header('Masuk', $settings);
?>
<section class="container-page py-16">
  <div class="mx-auto w-full max-w-md surface p-7">
    <h1 class="text-2xl font-extrabold text-navy">Masuk Anggota</h1>
    <p class="mt-1 text-sm text-muted">Gunakan akun anggota Anda. Admin/editor masuk lewat /admin/login.php.</p>
    <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>
    <form method="post" class="mt-5">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <label class="label" for="email">Email</label>
      <input class="input" id="email" type="email" name="email" required autocomplete="email">
      <label class="label mt-4" for="password">Kata sandi</label>
      <input class="input" id="password" type="password" name="password" required autocomplete="current-password">
      <button type="submit" class="btn-primary mt-5 w-full">Masuk</button>
    </form>
    <p class="mt-4 text-sm"><a class="font-semibold text-brand-600 hover:underline" href="index.php">Kembali ke beranda</a></p>
  </div>
</section>
<?php page_footer($settings); ?>
