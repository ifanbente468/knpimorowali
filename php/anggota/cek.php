<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib.php';
require_once dirname(__DIR__) . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$q = trim((string) ($_GET['q'] ?? ''));
$member = null;
$error = null;

if ($q !== '') {
    $stmt = db()->prepare('SELECT m.*, u.name, u.avatarUrl FROM `Member` m JOIN `User` u ON u.id = m.userId WHERE m.`memberNo` = ? OR m.`nik` = ? LIMIT 1');
    $stmt->execute([$q, $q]);
    $member = $stmt->fetch() ?: null;
    if (!$member) {
        $error = 'Data anggota tidak ditemukan. Periksa nomor anggota atau NIK.';
    }
}

$statusLabel = ['PENDING' => 'Menunggu verifikasi', 'ACTIVE' => 'Aktif', 'REJECTED' => 'Ditolak', 'SUSPENDED' => 'Ditangguhkan'];
page_header('Cek Kartu Anggota', $settings);
?>
<section class="container-page py-12">
  <div class="mx-auto max-w-3xl">
    <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Keanggotaan</div>
    <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Cek kartu anggota</h1>
    <p class="mt-2 text-sm text-muted">Masukkan nomor anggota atau NIK untuk memeriksa keaslian kartu.</p>
    <form method="get" class="surface mt-6 flex flex-wrap items-end gap-3 p-5">
      <div class="min-w-[240px] flex-1"><label class="label" for="q">Nomor anggota / NIK</label><input class="input" id="q" name="q" value="<?= e($q) ?>" required placeholder="KNPI-2026-0001 atau NIK"></div>
      <button class="btn-primary" type="submit">Cek</button>
    </form>

    <?php if ($error): ?><div class="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>

    <?php if ($member): ?>
      <?php $active = (string) $member['status'] === 'ACTIVE'; ?>
      <div class="mt-6 <?= $active ? 'rounded-3xl bg-gradient-to-br from-navy via-brand-800 to-brand-600 p-2' : 'surface p-6' ?>">
        <?php if ($active): ?>
          <div class="rounded-[20px] bg-white p-6">
            <div class="flex items-start justify-between gap-4">
              <div class="flex items-center gap-3">
                <img src="<?= e($member['avatarUrl'] ?: '/images/logo.jpg') ?>" alt="<?= e($member['name']) ?>" class="h-16 w-16 rounded-xl object-cover">
                <div><div class="text-[11px] font-bold uppercase tracking-widest text-brand-600">Kartu Anggota</div><div class="text-lg font-extrabold text-navy"><?= e($member['name']) ?></div><div class="text-xs text-muted"><?= e($member['memberNo']) ?></div></div>
              </div>
              <img src="/images/logo.jpg" alt="Logo KNPI" class="h-10 w-14 object-contain">
            </div>
            <div class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] sm:items-end">
              <div class="grid grid-cols-2 gap-2 text-xs text-muted">
                <div><div class="text-[10px] uppercase">Kecamatan</div><div class="font-semibold text-navy"><?= e($member['district']) ?></div></div>
                <div><div class="text-[10px] uppercase">OKP</div><div class="font-semibold text-navy"><?= e($member['okp'] ?: '—') ?></div></div>
                <div><div class="text-[10px] uppercase">Status</div><div class="font-semibold text-success">Aktif</div></div>
                <div><div class="text-[10px] uppercase">Bergabung</div><div class="font-semibold text-navy"><?= e(tanggal((string) $member['joinedAt'])) ?></div></div>
              </div>
              <div id="qrcode" class="mx-auto h-[112px] w-[112px] rounded-xl bg-white p-1"></div>
            </div>
          </div>
        <?php else: ?>
          <div class="flex items-center justify-between gap-3"><div><div class="font-bold text-navy"><?= e($member['name']) ?></div><div class="text-xs text-muted"><?= e($member['memberNo'] ?: 'Nomor anggota belum terbit') ?></div></div><span class="<?= e(badge_for((string) $member['status'])) ?>"><?= e($statusLabel[$member['status']] ?? $member['status']) ?></span></div>
          <p class="mt-3 text-sm text-muted">Kartu digital hanya aktif setelah pendaftaran diverifikasi pengurus.</p>
        <?php endif; ?>
      </div>
      <?php if ($active): ?>
        <div class="mt-4 flex gap-2"><button class="btn-outline" type="button" onclick="window.print()">Cetak kartu</button></div>
        <script src="https://cdn.jsdelivr.net/npm/qrcodejs@1.0.0/qrcode.min.js"></script>
        <script>
          if (window.QRCode) {
            new QRCode(document.getElementById('qrcode'), {
              text: <?= json_encode('https://knpimorowali.com/anggota/cek?q=' . $member['memberNo']) ?>,
              width: 104, height: 104, correctLevel: QRCode.CorrectLevel.M
            });
          }
        </script>
      <?php endif; ?>
    <?php endif; ?>
  </div>
</section>
<?php page_footer($settings); ?>
