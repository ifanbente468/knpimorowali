<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib.php';
require_once dirname(__DIR__) . '/theme.php';

if (!config() || !is_installed()) {
    redirect('../install.php');
}

$user = current_user();
if (!$user) {
    redirect('../login.php');
}
if (!in_array($user['role'], ['ADMIN', 'EDITOR'], true)) {
    redirect('../index.php');
}

$settings = settings_map();
$pdo = db();
$error = null;

$stats = [
    'active' => 0, 'pending' => 0, 'published' => 0, 'draft' => 0,
    'aspiration_new' => 0, 'aspiration_open' => 0, 'agenda_upcoming' => 0,
    'income' => 0, 'expense' => 0,
];
$pendingList = [];
$agendaList = [];
$aspirationList = [];
$growth = [];

$monthStart = date('Y-m-01 00:00:00');
$sixMonthsAgo = date('Y-m-01 00:00:00', strtotime('-5 months'));

try {
    $stats['active'] = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `status` = 'ACTIVE'")->fetchColumn();
    $stats['pending'] = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `status` = 'PENDING'")->fetchColumn();
    $stats['published'] = (int) $pdo->query("SELECT COUNT(*) FROM `News` WHERE `status` = 'PUBLISHED'")->fetchColumn();
    $stats['draft'] = (int) $pdo->query("SELECT COUNT(*) FROM `News` WHERE `status` = 'DRAFT'")->fetchColumn();
    $stats['aspiration_new'] = (int) $pdo->query("SELECT COUNT(*) FROM `Aspiration` WHERE `status` = 'NEW'")->fetchColumn();
    $stats['aspiration_open'] = (int) $pdo->query("SELECT COUNT(*) FROM `Aspiration` WHERE `status` IN ('NEW','IN_PROGRESS')")->fetchColumn();
    $stats['agenda_upcoming'] = (int) $pdo->query("SELECT COUNT(*) FROM `Agenda` WHERE `startsAt` >= NOW() AND `status` = 'SCHEDULED' AND `isPublished` = 1")->fetchColumn();

    $stmt = $pdo->prepare("SELECT COALESCE(SUM(`amount`),0) FROM `Finance` WHERE `type` = 'INCOME' AND `date` >= ?");
    $stmt->execute([$monthStart]);
    $stats['income'] = (int) $stmt->fetchColumn();
    $stmt = $pdo->prepare("SELECT COALESCE(SUM(`amount`),0) FROM `Finance` WHERE `type` = 'EXPENSE' AND `date` >= ?");
    $stmt->execute([$monthStart]);
    $stats['expense'] = (int) $stmt->fetchColumn();

    $pendingList = $pdo->query("SELECT m.id, u.name, u.email, m.district, m.createdAt FROM `Member` m JOIN `User` u ON u.id = m.userId WHERE m.status = 'PENDING' ORDER BY m.createdAt DESC LIMIT 5")->fetchAll();
    $agendaList = $pdo->query("SELECT `title`, `location`, `startsAt` FROM `Agenda` WHERE `startsAt` >= NOW() AND `status` = 'SCHEDULED' ORDER BY `startsAt` ASC LIMIT 3")->fetchAll();
    $aspirationList = $pdo->query("SELECT `trackingCode`, `subject`, `status`, `createdAt` FROM `Aspiration` ORDER BY `createdAt` DESC LIMIT 5")->fetchAll();

    $stmt = $pdo->prepare('SELECT `createdAt` FROM `Member` WHERE `createdAt` >= ?');
    $stmt->execute([$sixMonthsAgo]);
    $growth = $stmt->fetchAll(PDO::FETCH_COLUMN);
} catch (Throwable $exception) {
    $error = $exception->getMessage();
}

$months = [];
for ($i = 5; $i >= 0; $i--) {
    $time = strtotime(date('Y-m-01') . " -{$i} months");
    $key = date('Y-m', $time);
    $count = 0;
    $counts = [];
    foreach ($growth as $created) {
        $ym = substr((string) $created, 0, 7);
        $counts[$ym] = ($counts[$ym] ?? 0) + 1;
    }
    $months[] = ['label' => date('M', $time), 'count' => $counts[$key] ?? 0];
}
$maxGrowth = 1;
foreach ($months as $month) {
    $maxGrowth = max($maxGrowth, $month['count']);
}
$balance = $stats['income'] - $stats['expense'];
$firstName = explode(' ', trim((string) $user['name']))[0];
$initials = strtoupper(substr($firstName, 0, 1)) . strtoupper(substr((string) ($user['name'] ?? 'A'), -1, 1));
$roleLabel = $user['role'] === 'ADMIN' ? 'Administrator' : 'Editor';

$nav = [
    ['#ringkasan', 'Ringkasan', 'gauge', true, in_array($user['role'], ['ADMIN', 'EDITOR'], true)],
    ['#anggota', 'Anggota', 'users', false, true],
    ['#berita', 'Berita', 'newspaper', false, true],
    ['#agenda', 'Agenda', 'calendar', false, true],
    ['#galeri', 'Galeri', 'images', false, true],
    ['#aspirasi', 'Aspirasi', 'message', false, true],
    ['#persuratan', 'Persuratan', 'mail-open', false, $user['role'] === 'ADMIN'],
    ['#keuangan', 'Keuangan', 'banknote', false, $user['role'] === 'ADMIN'],
    ['#pengguna', 'Pengguna', 'user-square', false, $user['role'] === 'ADMIN'],
    ['#pengaturan', 'Pengaturan', 'settings', false, $user['role'] === 'ADMIN'],
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Panel Admin — KNPI Morowali</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="../images/logo.jpg">
<link rel="stylesheet" href="../assets/app.css">
</head>
<body class="min-h-screen bg-canvas">
<div class="lg:pl-[250px]">
  <aside class="fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col bg-navy text-white lg:flex" aria-label="Navigasi admin">
    <div class="flex items-center justify-between gap-3 px-4 py-5">
      <a href="index.php" class="flex items-center gap-2.5">
        <span class="rounded-lg bg-white p-1"><img src="../images/logo.jpg" alt="Logo KNPI" width="120" height="72" class="h-8 w-12 object-contain"></span>
        <span>
          <span class="block text-sm font-extrabold leading-tight">KNPI Morowali</span>
          <span class="block text-[11px] text-slate-400">Panel Admin</span>
        </span>
      </a>
    </div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
      <?php foreach ($nav as [$href, $label, $ico, $active, $allowed]): ?>
        <?php if (!$allowed) continue; ?>
        <a href="<?= e($href) ?>" class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition <?= $active ? 'bg-accent text-navy' : 'text-slate-300 hover:bg-white/10 hover:text-white' ?>">
          <?= icon($ico, 'h-4 w-4 shrink-0') ?><?= e($label) ?>
        </a>
      <?php endforeach; ?>
    </nav>
    <div class="border-t border-white/10 p-3">
      <div class="mb-2 flex items-center gap-2 px-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-navy"><?= e(substr($initials, 0, 2)) ?></span>
        <div class="min-w-0">
          <div class="truncate text-xs font-bold"><?= e($user['name']) ?></div>
          <div class="text-[10px] text-slate-400"><?= e($roleLabel) ?></div>
        </div>
      </div>
      <a href="../index.php" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10"><?= icon('external', 'h-3.5 w-3.5') ?>Lihat situs publik</a>
      <a href="../logout.php" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10"><?= icon('logout', 'h-3.5 w-3.5') ?>Keluar</a>
    </div>
  </aside>

  <div class="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
    <a href="index.php" class="flex items-center gap-2"><img src="../images/logo.jpg" alt="Logo" class="h-8 w-12 object-contain"><span class="text-sm font-extrabold text-navy">Panel Admin</span></a>
    <div class="flex items-center gap-2"><a href="../index.php" class="btn-outline min-h-9 px-3 text-xs">Situs</a><a href="../logout.php" class="btn-outline min-h-9 px-3 text-xs">Keluar</a></div>
  </div>

  <main id="ringkasan" class="px-4 py-6 sm:px-6 lg:px-8">
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 class="text-2xl font-extrabold tracking-tight text-navy">Ringkasan, <?= e($firstName) ?></h1>
        <p class="mt-1 text-sm text-muted">Data per <?= e(tanggal(date('Y-m-d'))) ?> — DPD KNPI Kabupaten Morowali</p>
      </div>
      <div class="flex flex-wrap gap-2">
        <a href="#berita" class="btn-primary"><?= icon('plus', 'h-4 w-4') ?>Tulis berita</a>
        <a href="#agenda" class="btn-outline"><?= icon('calendar', 'h-4 w-4') ?>Agenda baru</a>
      </div>
    </div>

    <?php if ($error): ?><div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>

    <div class="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <div class="surface p-5"><div class="text-[13px] text-muted">Anggota aktif</div><div class="mt-1 text-3xl font-extrabold tracking-tight text-brand-600"><?= number_format($stats['active'], 0, ',', '.') ?></div><div class="mt-1 text-xs text-muted"><?= number_format($stats['pending'], 0, ',', '.') ?> menunggu verifikasi</div></div>
      <div class="surface p-5"><div class="text-[13px] text-muted">Berita terbit</div><div class="mt-1 text-3xl font-extrabold tracking-tight text-brand-600"><?= number_format($stats['published'], 0, ',', '.') ?></div><div class="mt-1 text-xs text-muted"><?= number_format($stats['draft'], 0, ',', '.') ?> draf</div></div>
      <div class="surface p-5"><div class="text-[13px] text-muted">Aspirasi baru</div><div class="mt-1 text-3xl font-extrabold tracking-tight text-warning"><?= number_format($stats['aspiration_new'], 0, ',', '.') ?></div><div class="mt-1 text-xs text-muted"><?= number_format($stats['aspiration_open'], 0, ',', '.') ?> belum selesai</div></div>
      <div class="surface p-5"><div class="text-[13px] text-muted">Agenda mendatang</div><div class="mt-1 text-3xl font-extrabold tracking-tight text-success"><?= number_format($stats['agenda_upcoming'], 0, ',', '.') ?></div><div class="mt-1 text-xs text-muted">Terjadwal &amp; terbit</div></div>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section class="surface p-5">
        <div class="flex items-center justify-between"><h2 class="font-extrabold text-navy">Pertumbuhan anggota (6 bulan)</h2><span class="text-xs text-muted">Berdasarkan tanggal daftar</span></div>
        <div class="mt-6 flex h-52 items-end gap-4">
          <?php foreach ($months as $month): ?>
            <?php $height = max(4, (int) round(($month['count'] / $maxGrowth) * 100)); ?>
            <div class="flex flex-1 flex-col items-center gap-2">
              <div class="text-xs font-bold text-brand-600"><?= (int) $month['count'] ?></div>
              <div class="flex h-40 w-full items-end rounded-lg bg-canvas"><div class="w-full rounded-lg bg-brand-600" style="height:<?= $height ?>%"></div></div>
              <div class="text-xs text-muted"><?= e($month['label']) ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </section>

      <section class="surface p-5" id="agenda">
        <div class="flex items-center justify-between"><h2 class="font-extrabold text-navy">Agenda mendatang</h2><a href="#agenda" class="text-xs font-bold text-brand-600 hover:underline">Kelola</a></div>
        <div class="mt-4 space-y-2">
          <?php if (!$agendaList): ?><p class="rounded-xl bg-canvas p-4 text-sm text-muted">Belum ada agenda mendatang.</p><?php endif; ?>
          <?php foreach ($agendaList as $agenda): ?>
            <div class="rounded-xl border border-line p-3">
              <div class="text-sm font-bold text-navy"><?= e($agenda['title']) ?></div>
              <div class="mt-1 text-xs text-muted"><?= e(tanggal((string) $agenda['startsAt'])) ?> · <?= e($agenda['location']) ?></div>
            </div>
          <?php endforeach; ?>
        </div>
      </section>
    </div>

    <div class="mt-5 grid gap-5 lg:grid-cols-[1.4fr_1fr]">
      <section class="surface overflow-hidden" id="anggota">
        <div class="flex items-center justify-between border-b border-line px-5 py-4">
          <h2 class="font-extrabold text-navy">Pendaftar menunggu verifikasi</h2>
          <a href="#anggota" class="text-xs font-bold text-brand-600 hover:underline">Lihat semua</a>
        </div>
        <div class="overflow-x-auto">
          <table class="w-full min-w-[640px] border-collapse text-sm">
            <thead><tr class="bg-canvas text-left text-xs font-bold uppercase tracking-wide text-muted"><th class="px-4 py-3">Nama</th><th class="px-4 py-3">Wilayah</th><th class="px-4 py-3">Tanggal daftar</th><th class="px-4 py-3"></th></tr></thead>
            <tbody>
              <?php if (!$pendingList): ?><tr><td colspan="4" class="px-4 py-8 text-center text-sm text-muted">Tidak ada pendaftar menunggu verifikasi.</td></tr><?php endif; ?>
              <?php foreach ($pendingList as $member): ?>
                <tr class="border-t border-line">
                  <td class="px-4 py-3"><div class="font-semibold text-navy"><?= e($member['name']) ?></div><div class="text-xs text-muted"><?= e($member['email']) ?></div></td>
                  <td class="px-4 py-3 text-muted"><?= e($member['district']) ?></td>
                  <td class="whitespace-nowrap px-4 py-3 text-muted"><?= e(tanggal((string) $member['createdAt'])) ?></td>
                  <td class="px-4 py-3"><a href="#anggota" class="btn-outline min-h-9 px-3 text-xs">Tinjau</a></td>
                </tr>
              <?php endforeach; ?>
            </tbody>
          </table>
        </div>
      </section>

      <div class="space-y-5">
        <section class="surface p-5" id="aspirasi">
          <div class="flex items-center justify-between"><h2 class="font-extrabold text-navy">Aspirasi terbaru</h2><a href="#aspirasi" class="text-xs font-bold text-brand-600 hover:underline">Semua</a></div>
          <div class="mt-4 space-y-3">
            <?php if (!$aspirationList): ?><p class="rounded-xl bg-canvas p-4 text-sm text-muted">Belum ada aspirasi masuk.</p><?php endif; ?>
            <?php foreach ($aspirationList as $aspiration): ?>
              <?php
                $tone = 'bg-canvas text-muted';
                $label = $aspiration['status'];
                if ($aspiration['status'] === 'NEW') { $tone = 'bg-amber-50 text-warning'; $label = 'Baru'; }
                elseif ($aspiration['status'] === 'IN_PROGRESS') { $tone = 'bg-brand-50 text-brand-700'; $label = 'Diproses'; }
                elseif ($aspiration['status'] === 'RESOLVED') { $tone = 'bg-emerald-50 text-success'; $label = 'Selesai'; }
                elseif ($aspiration['status'] === 'REJECTED') { $tone = 'bg-red-50 text-danger'; $label = 'Ditolak'; }
              ?>
              <a href="#aspirasi" class="block rounded-xl border border-line p-3 hover:border-brand-200">
                <div class="flex items-center justify-between gap-2">
                  <span class="font-mono text-[10px] text-muted"><?= e($aspiration['trackingCode']) ?></span>
                  <span class="badge <?= e($tone) ?>"><?= e($label) ?></span>
                </div>
                <div class="mt-1 line-clamp-2 text-sm font-semibold text-navy"><?= e($aspiration['subject']) ?></div>
                <div class="mt-1 text-xs text-muted"><?= e(tanggal((string) $aspiration['createdAt'])) ?></div>
              </a>
            <?php endforeach; ?>
          </div>
        </section>

        <?php if ($user['role'] === 'ADMIN'): ?>
        <section class="surface p-5" id="keuangan">
          <div class="flex items-center gap-2 text-navy"><?= icon('banknote', 'h-4 w-4 text-brand-600') ?><h2 class="font-extrabold">Keuangan bulan ini</h2></div>
          <div class="mt-4 grid grid-cols-2 gap-3 text-sm">
            <div class="rounded-xl bg-emerald-50 p-3"><div class="text-[11px] font-semibold uppercase text-success">Pemasukan</div><div class="mt-1 font-bold text-success"><?= e(rupiah($stats['income'])) ?></div></div>
            <div class="rounded-xl bg-red-50 p-3"><div class="text-[11px] font-semibold uppercase text-danger">Pengeluaran</div><div class="mt-1 font-bold text-danger"><?= e(rupiah($stats['expense'])) ?></div></div>
          </div>
          <div class="mt-3 flex items-center justify-between rounded-xl border border-line p-3 text-sm"><span class="text-muted">Saldo bulan ini</span><span class="font-extrabold <?= $balance >= 0 ? 'text-success' : 'text-danger' ?>"><?= e(rupiah($balance)) ?></span></div>
          <a href="#keuangan" class="btn-outline mt-3 w-full text-xs">Kelola keuangan <?= icon('arrow', 'h-3.5 w-3.5') ?></a>
        </section>
        <?php endif; ?>
      </div>
    </div>

    <p class="mt-6 text-xs text-muted">Menu Anggota, Berita, Agenda, Galeri, dan lainnya masih ringkasan; halaman CRUD menyusul di tahap berikutnya.</p>
  </main>
</div>
</body>
</html>
