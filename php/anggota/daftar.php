<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib.php';
require_once dirname(__DIR__) . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
if (current_user()) {
    redirect('/akun.php');
}

$settings = settings_map();
$error = null;
$districts = ['Bahodopi', 'Bungku Barat', 'Bungku Pesisir', 'Bungku Selatan', 'Bungku Tengah', 'Bungku Timur', 'Bungku Utara', 'Lembo', 'Menui Kepulauan', 'Soyo Jaya', 'Witaponda'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!csrf_ok($_POST['csrf'] ?? null)) {
            throw new RuntimeException('Sesi kedaluwarsa. Muat ulang halaman.');
        }
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $nik = preg_replace('/\D+/', '', (string) ($_POST['nik'] ?? '')) ?? '';
        $birthDate = trim((string) ($_POST['birthDate'] ?? ''));
        $gender = (string) ($_POST['gender'] ?? '');
        $address = trim((string) ($_POST['address'] ?? ''));
        $district = (string) ($_POST['district'] ?? '');
        $okp = trim((string) ($_POST['okp'] ?? ''));
        $occupation = trim((string) ($_POST['occupation'] ?? ''));
        $password = (string) ($_POST['password'] ?? '');
        $confirm = (string) ($_POST['confirm'] ?? '');

        if ($name === '' || $email === '' || $address === '') {
            throw new RuntimeException('Nama, email, dan alamat wajib diisi.');
        }
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Format email tidak valid.');
        }
        if (strlen($nik) !== 16) {
            throw new RuntimeException('NIK harus 16 digit angka.');
        }
        if (!in_array($gender, ['Laki-laki', 'Perempuan'], true)) {
            throw new RuntimeException('Pilih jenis kelamin.');
        }
        if (!in_array($district, $districts, true)) {
            throw new RuntimeException('Pilih kecamatan.');
        }
        $birth = DateTimeImmutable::createFromFormat('Y-m-d', $birthDate);
        if (!$birth || $birth->format('Y-m-d') !== $birthDate) {
            throw new RuntimeException('Tanggal lahir tidak valid.');
        }
        if (strlen($password) < 8 || $password !== $confirm) {
            throw new RuntimeException('Kata sandi minimal 8 karakter dan harus sama dengan konfirmasi.');
        }

        $pdo = db();
        $check = $pdo->prepare('SELECT 1 FROM `User` WHERE `email` = ? LIMIT 1');
        $check->execute([$email]);
        if ($check->fetch()) {
            throw new RuntimeException('Email sudah terdaftar. Gunakan email lain atau masuk.');
        }
        $check = $pdo->prepare('SELECT 1 FROM `Member` WHERE `nik` = ? LIMIT 1');
        $check->execute([$nik]);
        if ($check->fetch()) {
            throw new RuntimeException('NIK sudah terdaftar.');
        }

        $avatar = upload_file('photo', 'members', ['jpg', 'jpeg', 'png', 'webp']);

        $pdo->beginTransaction();
        $userId = new_id();
        $userStmt = $pdo->prepare('INSERT INTO `User` (`id`, `email`, `passwordHash`, `name`, `phone`, `avatarUrl`, `role`, `isActive`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, \'MEMBER\', 1, NOW(3), NOW(3))');
        $userStmt->execute([$userId, $email, password_hash($password, PASSWORD_BCRYPT, ['cost' => 12]), $name, $phone === '' ? null : $phone, $avatar]);
        $memberStmt = $pdo->prepare('INSERT INTO `Member` (`id`, `userId`, `nik`, `birthDate`, `gender`, `address`, `district`, `okp`, `occupation`, `status`, `joinedAt`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, \'PENDING\', NOW(3), NOW(3), NOW(3))');
        $memberStmt->execute([new_id(), $userId, $nik, $birthDate . ' 00:00:00', $gender, $address, $district, $okp === '' ? null : $okp, $occupation === '' ? null : $occupation]);
        $pdo->commit();

        session_regenerate_id(true);
        $_SESSION['user_id'] = $userId;
        redirect('/akun.php');
    } catch (Throwable $exception) {
        if (isset($pdo) && $pdo instanceof PDO && $pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $error = $exception->getMessage();
    }
}

page_header('Daftar Anggota', $settings);
?>
<section class="container-page py-12">
  <div class="mx-auto max-w-3xl">
    <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Keanggotaan</div>
    <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Daftar jadi anggota</h1>
    <p class="mt-2 text-sm text-muted">Pendaftaran gratis. Setelah diverifikasi pengurus, Anda mendapat nomor anggota dan kartu digital.</p>
    <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>
    <form method="post" enctype="multipart/form-data" class="surface mt-6 p-6">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <div class="grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="m-name">Nama lengkap</label><input class="input" id="m-name" name="name" required value="<?= e($_POST['name'] ?? '') ?>"></div>
        <div><label class="label" for="m-email">Email</label><input class="input" id="m-email" type="email" name="email" required value="<?= e($_POST['email'] ?? '') ?>"></div>
        <div><label class="label" for="m-phone">Telepon</label><input class="input" id="m-phone" name="phone" value="<?= e($_POST['phone'] ?? '') ?>"></div>
        <div><label class="label" for="m-nik">NIK (16 digit)</label><input class="input" id="m-nik" name="nik" inputmode="numeric" maxlength="16" required value="<?= e($_POST['nik'] ?? '') ?>"></div>
        <div><label class="label" for="m-birth">Tanggal lahir</label><input class="input" id="m-birth" type="date" name="birthDate" required value="<?= e($_POST['birthDate'] ?? '') ?>"></div>
        <div><label class="label" for="m-gender">Jenis kelamin</label><select class="input" id="m-gender" name="gender"><option value="Laki-laki">Laki-laki</option><option value="Perempuan">Perempuan</option></select></div>
        <div><label class="label" for="m-district">Kecamatan</label><select class="input" id="m-district" name="district"><?php foreach ($districts as $district): ?><option value="<?= e($district) ?>"><?= e($district) ?></option><?php endforeach; ?></select></div>
        <div><label class="label" for="m-okp">OKP / organisasi</label><input class="input" id="m-okp" name="okp" value="<?= e($_POST['okp'] ?? '') ?>"></div>
        <div><label class="label" for="m-occupation">Pekerjaan</label><input class="input" id="m-occupation" name="occupation" value="<?= e($_POST['occupation'] ?? '') ?>"></div>
        <div><label class="label" for="m-photo">Foto (opsional)</label><input class="input" id="m-photo" type="file" name="photo" accept="image/*"></div>
      </div>
      <div class="mt-4"><label class="label" for="m-address">Alamat</label><textarea class="input" id="m-address" name="address" rows="3" required><?= e($_POST['address'] ?? '') ?></textarea></div>
      <div class="mt-4 grid gap-4 sm:grid-cols-2">
        <div><label class="label" for="m-password">Kata sandi (min. 8)</label><input class="input" id="m-password" type="password" name="password" required minlength="8"></div>
        <div><label class="label" for="m-confirm">Ulangi kata sandi</label><input class="input" id="m-confirm" type="password" name="confirm" required minlength="8"></div>
      </div>
      <button class="btn-primary mt-5" type="submit">Daftar sekarang</button>
      <p class="mt-3 text-xs text-muted">Sudah punya akun? <a class="font-semibold text-brand-600 hover:underline" href="/login.php">Masuk di sini</a>.</p>
    </form>
  </div>
</section>
<?php page_footer($settings); ?>
