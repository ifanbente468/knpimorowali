<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$code = strtoupper(trim((string) ($_GET['kode'] ?? '')));
$item = null;
$error = null;

if ($code === '') {
    $error = 'Masukkan kode pelacakan.';
} else {
    $stmt = db()->prepare('SELECT * FROM `Aspiration` WHERE `trackingCode` = ? LIMIT 1');
    $stmt->execute([$code]);
    $item = $stmt->fetch() ?: null;
    if (!$item) {
        $error = 'Aspirasi dengan kode tersebut tidak ditemukan.';
    }
}

$statusLabel = [
    'NEW' => 'Baru diterima',
    'IN_PROGRESS' => 'Sedang diproses',
    'RESOLVED' => 'Selesai',
    'REJECTED' => 'Ditolak',
];
page_header('Lacak Aspirasi', $settings);
?>
<section class="container-page py-12">
  <div class="mx-auto max-w-3xl">
    <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Lacak aspirasi</div>
    <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Status aspirasi</h1>
    <form method="get" class="surface mt-6 flex flex-wrap items-end gap-3 p-5">
      <div class="min-w-[240px] flex-1"><label class="label" for="kode">Kode pelacakan</label><input class="input font-mono" id="kode" name="kode" value="<?= e($code) ?>" placeholder="ASP-XXXXXXXX" required></div>
      <button class="btn-primary" type="submit">Lacak</button>
    </form>

    <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>

    <?php if ($item): ?>
      <div class="surface mt-4 p-6">
        <div class="flex flex-wrap items-center justify-between gap-2">
          <span class="font-mono text-xs text-muted"><?= e($item['trackingCode']) ?></span>
          <span class="<?= e(badge_for((string) $item['status'])) ?>"><?= e($statusLabel[$item['status']] ?? $item['status']) ?></span>
        </div>
        <h2 class="mt-2 text-xl font-extrabold text-navy"><?= e($item['subject']) ?></h2>
        <p class="mt-2 text-sm text-muted">Kategori: <?= e($item['category']) ?> · <?= e(tanggal((string) $item['createdAt'])) ?></p>
        <div class="mt-4 rounded-xl bg-canvas p-4 text-sm text-navy"><?= nl2br(e($item['message'])) ?></div>
        <?php if (!empty($item['response']) && ((int) $item['isPublic'] === 1 || $item['status'] === 'RESOLVED')): ?>
          <div class="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-success"><div class="font-bold">Tanggapan KNPI</div><div class="mt-1"><?= nl2br(e($item['response'])) ?></div></div>
        <?php elseif ($item['status'] === 'NEW'): ?>
          <div class="mt-4 text-sm text-muted">Aspirasi sudah diterima dan menunggu ditindaklanjuti pengurus.</div>
        <?php endif; ?>
      </div>
    <?php endif; ?>
  </div>
</section>
<?php page_footer($settings); ?>
