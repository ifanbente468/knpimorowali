<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$user = current_user();
$error = null;
$success = null;
$categories = ['Pendidikan', 'Ketenagakerjaan', 'Ekonomi Kreatif', 'Olahraga', 'Kesehatan', 'Infrastruktur', 'Sosial & Budaya', 'Lainnya'];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    try {
        if (!csrf_ok($_POST['csrf'] ?? null)) {
            throw new RuntimeException('Sesi kedaluwarsa. Muat ulang halaman.');
        }
        if (trim((string) ($_POST['website'] ?? '')) !== '') {
            throw new RuntimeException('Permintaan ditolak.');
        }
        $name = trim((string) ($_POST['name'] ?? ''));
        $email = strtolower(trim((string) ($_POST['email'] ?? '')));
        $phone = trim((string) ($_POST['phone'] ?? ''));
        $category = (string) ($_POST['category'] ?? '');
        $subject = trim((string) ($_POST['subject'] ?? ''));
        $message = trim((string) ($_POST['message'] ?? ''));

        if ($name === '' || $subject === '' || $message === '') {
            throw new RuntimeException('Nama, subjek, dan isi aspirasi wajib diisi.');
        }
        if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new RuntimeException('Format email tidak valid.');
        }
        if (!in_array($category, $categories, true)) {
            throw new RuntimeException('Kategori tidak valid.');
        }
        if (mb_strlen($message) > 5000) {
            throw new RuntimeException('Isi aspirasi maksimal 5000 karakter.');
        }

        $pdo = db();
        do {
            $tracking = tracking_code();
            $check = $pdo->prepare('SELECT 1 FROM `Aspiration` WHERE `trackingCode` = ? LIMIT 1');
            $check->execute([$tracking]);
        } while ($check->fetch());

        $authorId = ($user && $user['role'] === 'MEMBER') ? $user['id'] : null;
        $stmt = $pdo->prepare('INSERT INTO `Aspiration` (`id`, `trackingCode`, `name`, `email`, `phone`, `category`, `subject`, `message`, `status`, `isPublic`, `authorId`, `createdAt`, `updatedAt`) VALUES (?, ?, ?, ?, ?, ?, ?, ?, \'NEW\', 0, ?, NOW(3), NOW(3))');
        $stmt->execute([new_id(), $tracking, $name, $email === '' ? null : $email, $phone === '' ? null : $phone, $category, $subject, $message, $authorId]);
        $success = $tracking;
    } catch (Throwable $exception) {
        $error = $exception->getMessage();
    }
}

page_header('Kirim Aspirasi', $settings);
?>
<section class="container-page py-12">
  <div class="mx-auto max-w-3xl">
    <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Suara pemuda</div>
    <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Kirim aspirasi</h1>
    <p class="mt-2 text-sm text-muted">Sampaikan aspirasi ke DPD KNPI Kabupaten Morowali. Setiap aspirasi mendapat kode pelacakan.</p>

    <?php if ($success): ?>
      <div class="surface mt-6 p-6">
        <div class="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-success">Aspirasi terkirim. Simpan kode pelacakan berikut.</div>
        <div class="mt-4 rounded-xl bg-canvas p-4 text-center"><div class="text-xs text-muted">Kode pelacakan</div><div class="mt-1 font-mono text-2xl font-extrabold text-navy"><?= e($success) ?></div></div>
        <div class="mt-4 flex flex-wrap gap-2">
          <a class="btn-primary" href="/aspirasi/lacak?kode=<?= urlencode($success) ?>">Lacak aspirasi</a>
          <a class="btn-outline" href="/aspirasi">Kirim aspirasi lain</a>
        </div>
      </div>
    <?php else: ?>
      <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>
      <form method="post" class="surface mt-6 p-6">
        <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
        <input type="text" name="website" value="" class="hidden" tabindex="-1" autocomplete="off">
        <div class="grid gap-4 sm:grid-cols-2">
          <div><label class="label" for="a-name">Nama</label><input class="input" id="a-name" name="name" required value="<?= e($user['name'] ?? '') ?>"></div>
          <div><label class="label" for="a-email">Email</label><input class="input" id="a-email" type="email" name="email" value="<?= e($user['email'] ?? '') ?>"></div>
          <div><label class="label" for="a-phone">Telepon</label><input class="input" id="a-phone" name="phone"></div>
          <div><label class="label" for="a-category">Kategori</label><select class="input" id="a-category" name="category"><?php foreach ($categories as $category): ?><option value="<?= e($category) ?>"><?= e($category) ?></option><?php endforeach; ?></select></div>
        </div>
        <div class="mt-4"><label class="label" for="a-subject">Subjek</label><input class="input" id="a-subject" name="subject" required maxlength="160"></div>
        <div class="mt-4"><label class="label" for="a-message">Isi aspirasi</label><textarea class="input" id="a-message" name="message" rows="6" required maxlength="5000"></textarea></div>
        <button class="btn-primary mt-4" type="submit">Kirim aspirasi</button>
      </form>
    <?php endif; ?>
  </div>
</section>
<?php page_footer($settings); ?>
