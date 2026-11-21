<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$user = current_user();
if (!$user) {
    redirect('/login.php');
}
if (in_array($user['role'], ['ADMIN', 'EDITOR'], true)) {
    redirect('/admin/index.php');
}

$settings = settings_map();
$member = null;
try {
    $stmt = db()->prepare('SELECT * FROM `Member` WHERE `userId` = ? LIMIT 1');
    $stmt->execute([$user['id']]);
    $member = $stmt->fetch() ?: null;
} catch (Throwable $exception) {
    $member = null;
}

page_header('Akun Anggota', $settings);
?>
<section class="container-page py-12">
  <div class="mx-auto max-w-2xl">
    <div class="surface p-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Akun anggota</div>
          <h1 class="mt-1 text-2xl font-extrabold text-navy"><?= e($user['name']) ?></h1>
          <p class="text-sm text-muted"><?= e($user['email']) ?></p>
        </div>
        <a href="/logout.php" class="btn-outline">Keluar</a>
      </div>

      <?php if (!$member): ?>
        <div class="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-warning">Belum ada data keanggotaan untuk akun ini.</div>
      <?php else: ?>
        <?php
          $statusLabel = ['PENDING' => 'Menunggu verifikasi', 'ACTIVE' => 'Aktif', 'REJECTED' => 'Ditolak', 'SUSPENDED' => 'Ditangguhkan'][$member['status']] ?? $member['status'];
        ?>
        <div class="mt-6 grid gap-3 sm:grid-cols-2">
          <div class="rounded-xl border border-line p-4"><div class="text-xs text-muted">Status</div><div class="mt-1"><span class="<?= e(badge_for((string) $member['status'])) ?>"><?= e($statusLabel) ?></span></div></div>
          <div class="rounded-xl border border-line p-4"><div class="text-xs text-muted">Nomor anggota</div><div class="mt-1 font-bold text-navy"><?= e($member['memberNo'] ?: '—') ?></div></div>
          <div class="rounded-xl border border-line p-4"><div class="text-xs text-muted">Kecamatan</div><div class="mt-1 font-semibold text-navy"><?= e($member['district']) ?></div></div>
          <div class="rounded-xl border border-line p-4"><div class="text-xs text-muted">OKP</div><div class="mt-1 font-semibold text-navy"><?= e($member['okp'] ?: '—') ?></div></div>
        </div>
        <?php if ((string) $member['status'] === 'ACTIVE'): ?>
          <div class="mt-4 rounded-xl bg-brand-50 p-4 text-sm text-brand-800">Kartu anggota digital: nomor <strong><?= e($member['memberNo']) ?></strong>. Tunjukkan nomor ini saat verifikasi di sekretariat.</div>
        <?php endif; ?>
      <?php endif; ?>
    </div>
    <p class="mt-4 text-center text-sm"><a class="font-semibold text-brand-600 hover:underline" href="/">Kembali ke beranda</a></p>
  </div>
</section>
<?php page_footer($settings); ?>
