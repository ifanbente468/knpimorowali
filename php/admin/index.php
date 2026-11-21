<?php
declare(strict_types=1);
require dirname(__DIR__) . '/lib.php';

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
$stats = ['member' => 0, 'active' => 0, 'pending' => 0, 'news' => 0, 'agenda' => 0, 'aspiration' => 0, 'income' => 0, 'expense' => 0];
$pendingMembers = [];
$latestAspirations = [];
$latestNews = [];

try {
    $stats['member'] = (int) $pdo->query('SELECT COUNT(*) FROM `Member`')->fetchColumn();
    $stats['active'] = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `status` = 'ACTIVE'")->fetchColumn();
    $stats['pending'] = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `status` = 'PENDING'")->fetchColumn();
    $stats['news'] = (int) $pdo->query('SELECT COUNT(*) FROM `News`')->fetchColumn();
    $stats['agenda'] = (int) $pdo->query('SELECT COUNT(*) FROM `Agenda` WHERE `startsAt` >= NOW()')->fetchColumn();
    $stats['aspiration'] = (int) $pdo->query("SELECT COUNT(*) FROM `Aspiration` WHERE `status` = 'NEW'")->fetchColumn();
    $stats['income'] = (int) $pdo->query("SELECT COALESCE(SUM(`amount`),0) FROM `Finance` WHERE `type` = 'INCOME'")->fetchColumn();
    $stats['expense'] = (int) $pdo->query("SELECT COALESCE(SUM(`amount`),0) FROM `Finance` WHERE `type` = 'EXPENSE'")->fetchColumn();

    $pendingMembers = $pdo->query("SELECT m.id, u.name, m.district, m.createdAt FROM `Member` m JOIN `User` u ON u.id = m.userId WHERE m.status = 'PENDING' ORDER BY m.createdAt DESC LIMIT 5")->fetchAll();
    $latestAspirations = $pdo->query("SELECT `trackingCode`, `name`, `subject`, `createdAt` FROM `Aspiration` WHERE `status` = 'NEW' ORDER BY `createdAt` DESC LIMIT 5")->fetchAll();
    $latestNews = $pdo->query('SELECT `title`, `status`, `createdAt` FROM `News` ORDER BY `createdAt` DESC LIMIT 5')->fetchAll();
} catch (Throwable $exception) {
    $error = $exception->getMessage();
}

$menu = [
    ['Dashboard', 'index.php', true],
    ['Anggota', '#anggota', false],
    ['Berita', '#berita', false],
    ['Agenda', '#agenda', false],
    ['Aspirasi', '#aspirasi', false],
    ['Keuangan', '#keuangan', false],
];
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>Dashboard Admin — <?= e(setting($settings, 'site_name', APP_NAME)) ?></title>
<style>
:root{--navy:#0b2545;--blue:#0a3bc4;--muted:#5b6b82;--line:#dde5f0;--bg:#f1f4fa;--green:#0f7a3d;--red:#b42318;--gold:#b7791f}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--navy);font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.5}
a{color:var(--blue);text-decoration:none}
.layout{display:grid;grid-template-columns:240px 1fr;min-height:100vh}
aside{background:#081b33;color:#cfe0ff;padding:20px 16px;position:sticky;top:0;height:100vh}
.brand{font-weight:800;color:#fff;font-size:17px;margin-bottom:6px}
.brand small{display:block;color:#8fa9cc;font-weight:500;font-size:12px}
nav.menu{display:grid;gap:4px;margin-top:20px}
nav.menu a{padding:9px 12px;border-radius:8px;color:#cfe0ff;font-size:14px}
nav.menu a.active,nav.menu a:hover{background:rgba(255,255,255,.1);color:#fff}
main{padding:24px 28px}
.top{display:flex;justify-content:space-between;align-items:center;gap:16px;margin-bottom:22px;flex-wrap:wrap}
h1{font-size:22px;margin:0}.muted{color:var(--muted);font-size:13px;margin:4px 0 0}
.btn{display:inline-block;padding:9px 14px;border-radius:8px;font-weight:700;font-size:13px;border:1px solid var(--line);background:#fff;color:var(--navy)}
.btn-primary{background:var(--blue);color:#fff;border-color:var(--blue)}
.cards{display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:22px}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px}
.card .label{font-size:12px;color:var(--muted);font-weight:600}
.card .value{font-size:24px;font-weight:800;margin-top:4px}
.card .hint{font-size:12px;color:var(--muted);margin-top:2px}
.panel{background:#fff;border:1px solid var(--line);border-radius:12px;padding:18px;margin-bottom:18px}
.panel h2{font-size:15px;margin:0 0 12px}
table{width:100%;border-collapse:collapse;font-size:13px}
th{text-align:left;color:var(--muted);font-size:12px;padding:8px 6px;border-bottom:1px solid var(--line)}
td{padding:9px 6px;border-bottom:1px solid #eef2f8}
tr:last-child td{border-bottom:0}
.chip{display:inline-block;padding:2px 8px;border-radius:999px;font-size:11px;font-weight:700}
.chip.wait{background:#fff4e5;color:var(--gold)}.chip.ok{background:#e9f8ef;color:var(--green)}.chip.new{background:#e8efff;color:var(--blue)}
.grid-2{display:grid;grid-template-columns:1fr 1fr;gap:18px}
.empty{color:var(--muted);font-size:13px;padding:8px 0}
.alert{padding:12px 14px;border-radius:10px;font-size:13px;margin-bottom:16px;background:#fdecec;color:#a11a1a;border:1px solid #f5c2c2}
@media(max-width:900px){.layout{grid-template-columns:1fr}aside{position:static;height:auto}.cards{grid-template-columns:repeat(2,1fr)}.grid-2{grid-template-columns:1fr}}
</style>
</head>
<body>
<div class="layout">
  <aside>
    <div class="brand"><?= e(setting($settings, 'site_name', APP_NAME)) ?><small>Panel Admin</small></div>
    <nav class="menu">
      <?php foreach ($menu as [$label, $href, $active]): ?>
        <a href="<?= e($href) ?>" class="<?= $active ? 'active' : '' ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <nav class="menu" style="margin-top:24px">
      <a href="../index.php">Lihat situs</a>
      <a href="../logout.php">Keluar</a>
    </nav>
  </aside>
  <main>
    <div class="top">
      <div><h1>Dashboard</h1><p class="muted">Masuk sebagai <?= e($user['name']) ?> (<?= e($user['role']) ?>)</p></div>
      <a class="btn btn-primary" href="../index.php">+ Lihat beranda</a>
    </div>

    <?php if ($error): ?><div class="alert"><?= e($error) ?></div><?php endif; ?>

    <div class="cards">
      <div class="card"><div class="label">Anggota</div><div class="value"><?= number_format($stats['member'], 0, ',', '.') ?></div><div class="hint"><?= number_format($stats['active'], 0, ',', '.') ?> aktif · <?= number_format($stats['pending'], 0, ',', '.') ?> menunggu</div></div>
      <div class="card"><div class="label">Berita</div><div class="value"><?= number_format($stats['news'], 0, ',', '.') ?></div><div class="hint">total tulisan</div></div>
      <div class="card"><div class="label">Agenda</div><div class="value"><?= number_format($stats['agenda'], 0, ',', '.') ?></div><div class="hint">akan datang</div></div>
      <div class="card"><div class="label">Aspirasi baru</div><div class="value"><?= number_format($stats['aspiration'], 0, ',', '.') ?></div><div class="hint">belum ditanggapi</div></div>
    </div>

    <div class="grid-2">
      <div class="panel" id="anggota">
        <h2>Menunggu verifikasi</h2>
        <?php if (!$pendingMembers): ?><div class="empty">Tidak ada anggota menunggu.</div><?php endif; ?>
        <?php if ($pendingMembers): ?>
        <table><thead><tr><th>Nama</th><th>Kecamatan</th><th>Tanggal</th></tr></thead><tbody>
          <?php foreach ($pendingMembers as $row): ?>
            <tr><td><?= e($row['name']) ?></td><td><?= e($row['district']) ?></td><td><?= e(tanggal((string) $row['createdAt'])) ?></td></tr>
          <?php endforeach; ?>
        </tbody></table>
        <?php endif; ?>
      </div>

      <div class="panel" id="aspirasi">
        <h2>Aspirasi terbaru</h2>
        <?php if (!$latestAspirations): ?><div class="empty">Belum ada aspirasi baru.</div><?php endif; ?>
        <?php if ($latestAspirations): ?>
        <table><thead><tr><th>Kode</th><th>Subjek</th><th>Tanggal</th></tr></thead><tbody>
          <?php foreach ($latestAspirations as $row): ?>
            <tr><td><span class="chip new"><?= e($row['trackingCode']) ?></span></td><td><?= e($row['subject']) ?></td><td><?= e(tanggal((string) $row['createdAt'])) ?></td></tr>
          <?php endforeach; ?>
        </tbody></table>
        <?php endif; ?>
      </div>
    </div>

    <div class="grid-2">
      <div class="panel" id="berita">
        <h2>Berita terakhir</h2>
        <?php if (!$latestNews): ?><div class="empty">Belum ada berita.</div><?php endif; ?>
        <?php if ($latestNews): ?>
        <table><thead><tr><th>Judul</th><th>Status</th><th>Tanggal</th></tr></thead><tbody>
          <?php foreach ($latestNews as $row): ?>
            <tr>
              <td><?= e($row['title']) ?></td>
              <td><?php $cls = $row['status'] === 'PUBLISHED' ? 'ok' : 'wait'; ?><span class="chip <?= e($cls) ?>"><?= e($row['status']) ?></span></td>
              <td><?= e(tanggal((string) $row['createdAt'])) ?></td>
            </tr>
          <?php endforeach; ?>
        </tbody></table>
        <?php endif; ?>
      </div>

      <div class="panel" id="keuangan">
        <h2>Ringkasan keuangan</h2>
        <table>
          <tbody>
            <tr><td>Pemasukan</td><td style="text-align:right;font-weight:700;color:var(--green)"><?= e(rupiah($stats['income'])) ?></td></tr>
            <tr><td>Pengeluaran</td><td style="text-align:right;font-weight:700;color:var(--red)"><?= e(rupiah($stats['expense'])) ?></td></tr>
            <tr><td>Saldo</td><td style="text-align:right;font-weight:800"><?= e(rupiah($stats['income'] - $stats['expense'])) ?></td></tr>
          </tbody>
        </table>
        <p class="empty" style="margin-top:10px">Detail transaksi menyusul di tahap berikutnya.</p>
      </div>
    </div>
  </main>
</div>
</body>
</html>
