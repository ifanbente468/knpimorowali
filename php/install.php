<?php
declare(strict_types=1);
require __DIR__ . '/lib.php';

$config = config();
$error = null;
$done = false;

if (!$config) {
    http_response_code(500);
    $message = 'File config.php belum ada. Salin config.sample.php menjadi config.php di folder public_html, isi kredensial database, lalu buka lagi halaman ini.';
    $installed = false;
} else {
    $installed = is_installed();
}

if ($config && !$installed && $_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!csrf_ok($_POST['csrf'] ?? null)) {
            throw new RuntimeException('Sesi kedaluwarsa. Muat ulang halaman.');
        }
        if (!hash_equals((string) cfg('install_key'), (string) ($_POST['install_key'] ?? ''))) {
            throw new RuntimeException('Kunci instalasi salah.');
        }
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $password = (string) ($_POST['password'] ?? '');
        $confirm = (string) ($_POST['confirm'] ?? '');

        if ($name === '' || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Nama dan email wajib diisi dengan benar.');
        }
        if (strlen($password) < 8 || $password !== $confirm) {
            throw new RuntimeException('Kata sandi minimal 8 karakter dan harus sama dengan konfirmasi.');
        }

        $pdo = db();
        $pdo->beginTransaction();

        $id = 'c' . bin2hex(random_bytes(12));
        $hash = password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]);

        $stmt = $pdo->prepare('INSERT INTO `User` (`id`, `email`, `passwordHash`, `name`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, 1, NOW(3), NOW(3))');
        $stmt->execute([$id, $email, $hash, $name, 'ADMIN']);

        $settings = [
            'site_name' => (string) ($_POST['site_name'] ?? cfg('site_name', APP_NAME)),
            'site_tagline' => 'Pemuda Morowali Bergerak, Berkarya, Berdaya.',
            'contact_email' => $email,
            'contact_phone' => '+62 461 000 000',
            'address' => 'Sekretariat DPD KNPI Kabupaten Morowali, Bungku Tengah, Sulawesi Tengah',
            'chairman_name' => '',
            'chairman_title' => 'Ketua DPD KNPI Kabupaten Morowali',
            'chairman_message' => '',
            'instagram' => '',
            'facebook' => '',
            'youtube' => '',
            'map_url' => 'https://maps.google.com/?q=Morowali',
            'hero_image' => '/images/hero.jpg',
        ];
        $settingStmt = $pdo->prepare('INSERT INTO `Setting` (`key`, `value`, `updatedAt`) VALUES (?, ?, NOW(3)) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updatedAt` = NOW(3)');
        foreach ($settings as $key => $value) {
            $settingStmt->execute([$key, $value]);
        }

        $organizations = [
            ['DPD KNPI Kabupaten Morowali', 'DPD', 'H. Abdul Rahman, S.Pd., M.Si.', 'Dewan Pengurus Daerah KNPI Kabupaten Morowali.', 0],
            ['Pemuda Pancasila', 'OKP', 'Irfan Saputra', 'Organisasi kepemudaan berbasis nasionalisme dan bela negara.', 1],
            ['Ansor Morowali', 'OKP', 'Muh. Fajar', 'Barisan Ansor Serbaguna Nahdlatul Ulama Kabupaten Morowali.', 2],
            ['Pemuda Muhammadiyah', 'OKP', 'Rizky Pratama', 'Kader muda Muhammadiyah untuk dakwah dan pemberdayaan.', 3],
            ['HMI Morowali', 'OKP', 'Andi Wijaya', 'Himpunan Mahasiswa Islam cabang Morowali.', 4],
            ['PMII Morowali', 'OKP', 'Nurul Hidayah', 'Pergerakan Mahasiswa Islam Indonesia cabang Morowali.', 5],
            ['KNPI Morowali Muda', 'SAYAP', 'Fauzan Akbar', 'Sayap kepemudaan untuk kaderisasi dan kegiatan sosial.', 6],
        ];
        $orgStmt = $pdo->prepare('INSERT INTO `Organization` (`id`, `name`, `type`, `leader`, `description`, `sortOrder`, `isActive`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, 1, NOW(3), NOW(3)) ON DUPLICATE KEY UPDATE `leader` = VALUES(`leader`), `description` = VALUES(`description`)');
        foreach ($organizations as [$orgName, $type, $leader, $description, $sort]) {
            $orgStmt->execute(['c' . bin2hex(random_bytes(12)), $orgName, $type, $leader, $description, $sort]);
        }

        $pdo->commit();

        $_SESSION['user_id'] = $id;
        $done = true;
    } catch (Throwable $exception) {
        if (isset($pdo) && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error = $exception->getMessage();
    }
}
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Instalasi — <?= e(APP_NAME) ?></title>
<style>
:root{--navy:#0b2545;--blue:#0a3bc4;--muted:#5b6b82;--line:#dde5f0;--bg:#f4f6fb}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--navy);font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif}
.wrap{max-width:640px;margin:48px auto;padding:0 16px}.card{background:#fff;border:1px solid var(--line);border-radius:14px;padding:28px;box-shadow:0 10px 30px rgba(11,37,69,.06)}
h1{font-size:22px;margin:0 0 6px}p.sub{margin:0 0 22px;color:var(--muted);font-size:14px}
label{display:block;font-size:13px;font-weight:700;margin:14px 0 6px}
input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:9px;font-size:14px}
button{margin-top:20px;width:100%;padding:12px;border:0;border-radius:9px;background:var(--blue);color:#fff;font-weight:700;font-size:15px;cursor:pointer}
.alert{padding:12px 14px;border-radius:9px;font-size:14px;margin-bottom:16px}
.err{background:#fdecec;color:#a11a1a;border:1px solid #f5c2c2}.ok{background:#e9f8ef;color:#136b34;border:1px solid #bfe8cd}
a{color:var(--blue)}code{background:#eef2fa;padding:2px 5px;border-radius:5px;font-size:12px}
</style>
</head>
<body>
<div class="wrap"><div class="card">
<h1>Instalasi <?= e(APP_NAME) ?></h1>
<p class="sub">Halaman satu kali pakai. Terkunci otomatis setelah admin dibuat.</p>

<?php if (!$config): ?>
  <div class="alert err"><?= e($message) ?></div>
  <p style="font-size:14px;color:#5b6b82">Lokasi file: <code>public_html/config.php</code>. Contoh isi ada di <code>config.sample.php</code>.</p>
<?php elseif ($installed || $done): ?>
  <div class="alert ok">Aplikasi sudah terpasang.</div>
  <p style="margin:16px 0 0"><a href="index.php">Buka beranda</a> · <a href="login.php">Masuk admin</a></p>
<?php else: ?>
  <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
  <form method="post">
    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
    <label>Kunci instalasi</label>
    <input type="password" name="install_key" required autocomplete="off">
    <label>Nama situs</label>
    <input type="text" name="site_name" value="<?= e((string) cfg('site_name', APP_NAME)) ?>" required>
    <label>Nama admin</label>
    <input type="text" name="name" required>
    <label>Email admin</label>
    <input type="email" name="email" required>
    <label>Kata sandi (min. 8 karakter)</label>
    <input type="password" name="password" minlength="8" required>
    <label>Ulangi kata sandi</label>
    <input type="password" name="confirm" minlength="8" required>
    <button type="submit">Instal sekarang</button>
  </form>
<?php endif; ?>
</div></div>
</body>
</html>
