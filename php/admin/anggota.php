<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $op = post('op');
    $id = post('id');
    try {
        if ($op === 'approve') {
            $stmt = $pdo->prepare('SELECT `id` FROM `Member` WHERE `id` = ? LIMIT 1');
            $stmt->execute([$id]);
            if (!$stmt->fetch()) {
                throw new RuntimeException('Anggota tidak ditemukan.');
            }
            $year = date('Y');
            $seq = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `memberNo` IS NOT NULL")->fetchColumn() + 1;
            $memberNo = '';
            for ($i = 0; $i < 20; $i++) {
                $candidate = 'KNPI-' . $year . '-' . str_pad((string) ($seq + $i), 4, '0', STR_PAD_LEFT);
                $check = $pdo->prepare('SELECT 1 FROM `Member` WHERE `memberNo` = ? LIMIT 1');
                $check->execute([$candidate]);
                if (!$check->fetch()) {
                    $memberNo = $candidate;
                    break;
                }
            }
            if ($memberNo === '') {
                throw new RuntimeException('Gagal membuat nomor anggota unik.');
            }
            $update = $pdo->prepare("UPDATE `Member` SET `status` = 'ACTIVE', `memberNo` = ?, `verifiedAt` = NOW(3), `verifiedById` = ?, `cardIssuedAt` = NOW(3), `updatedAt` = NOW(3) WHERE `id` = ?");
            $update->execute([$memberNo, $user['id'], $id]);
            flash('Anggota disetujui dengan nomor ' . $memberNo . '.');
        } elseif ($op === 'reject') {
            $reason = post('reason', 'Tidak memenuhi syarat.');
            $update = $pdo->prepare("UPDATE `Member` SET `status` = 'REJECTED', `rejectionReason` = ?, `verifiedAt` = NOW(3), `verifiedById` = ?, `updatedAt` = NOW(3) WHERE `id` = ?");
            $update->execute([$reason, $user['id'], $id]);
            flash('Pendaftaran ditolak.');
        } elseif ($op === 'suspend') {
            $update = $pdo->prepare("UPDATE `Member` SET `status` = 'SUSPENDED', `updatedAt` = NOW(3) WHERE `id` = ?");
            $update->execute([$id]);
            flash('Anggota ditangguhkan.');
        } elseif ($op === 'activate') {
            $update = $pdo->prepare("UPDATE `Member` SET `status` = 'ACTIVE', `updatedAt` = NOW(3) WHERE `id` = ?");
            $update->execute([$id]);
            flash('Anggota diaktifkan.');
        }
    } catch (Throwable $exception) {
        flash($exception->getMessage(), 'err');
    }
    redirect('anggota.php' . (isset($_GET['status']) ? '?status=' . urlencode((string) $_GET['status']) : ''));
}

$filter = (string) ($_GET['status'] ?? '');
$sql = 'SELECT m.*, u.name, u.email FROM `Member` m JOIN `User` u ON u.id = m.userId';
$params = [];
if (in_array($filter, ['PENDING', 'ACTIVE', 'REJECTED', 'SUSPENDED'], true)) {
    $sql .= ' WHERE m.`status` = ?';
    $params[] = $filter;
}
$sql .= ' ORDER BY m.`createdAt` DESC LIMIT 200';
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$rows = $stmt->fetchAll();

admin_header('Anggota', 'anggota');
?>
<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
  <div><h1 class="text-2xl font-extrabold tracking-tight text-navy">Anggota</h1><p class="mt-1 text-sm text-muted">Verifikasi pendaftar dan kelola status keanggotaan.</p></div>
  <form method="get" class="flex items-center gap-2">
    <select name="status" class="input min-h-10 w-44 py-2 text-sm" onchange="this.form.submit()">
      <option value="">Semua status</option>
      <?php foreach (['PENDING' => 'Menunggu', 'ACTIVE' => 'Aktif', 'REJECTED' => 'Ditolak', 'SUSPENDED' => 'Ditangguhkan'] as $value => $label): ?>
        <option value="<?= e($value) ?>" <?= $filter === $value ? 'selected' : '' ?>><?= e($label) ?></option>
      <?php endforeach; ?>
    </select>
  </form>
</div>
<div class="surface overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full min-w-[820px] border-collapse text-sm">
      <thead><tr class="bg-canvas text-left text-xs font-bold uppercase tracking-wide text-muted">
        <th class="px-4 py-3">Nama</th><th class="px-4 py-3">Wilayah</th><th class="px-4 py-3">No. Anggota</th><th class="px-4 py-3">Status</th><th class="px-4 py-3 text-right">Aksi</th>
      </tr></thead>
      <tbody>
        <?php if (!$rows): ?><tr><td colspan="5" class="px-4 py-8 text-center text-sm text-muted">Belum ada data anggota.</td></tr><?php endif; ?>
        <?php foreach ($rows as $row): ?>
          <tr class="border-t border-line align-top">
            <td class="px-4 py-3"><div class="font-semibold text-navy"><?= e($row['name']) ?></div><div class="text-xs text-muted"><?= e($row['email']) ?> · NIK <?= e(substr((string) $row['nik'], 0, 6)) ?>******</div></td>
            <td class="px-4 py-3 text-muted"><?= e($row['district']) ?><div class="text-xs"><?= e($row['okp'] ?: '—') ?></div></td>
            <td class="px-4 py-3 text-muted"><?= e($row['memberNo'] ?: '—') ?></td>
            <td class="px-4 py-3"><span class="<?= e(badge_for((string) $row['status'])) ?>"><?= e($row['status']) ?></span></td>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <?php if ($row['status'] === 'PENDING'): ?>
                <form method="post" class="inline">
                  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="op" value="approve"><input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <button class="btn-primary min-h-8 px-3 text-xs" type="submit">Setujui</button>
                </form>
                <details class="inline-block text-left">
                  <summary class="btn-outline min-h-8 cursor-pointer px-3 text-xs">Tolak</summary>
                  <form method="post" class="mt-2 flex gap-1">
                    <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="op" value="reject"><input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                    <input class="input min-h-8 w-40 py-1 text-xs" name="reason" value="Tidak memenuhi syarat.">
                    <button class="btn min-h-8 rounded-xl border border-red-200 px-2 text-xs text-danger" type="submit">OK</button>
                  </form>
                </details>
              <?php elseif ($row['status'] === 'ACTIVE'): ?>
                <form method="post" class="inline">
                  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="op" value="suspend"><input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <button class="btn-outline min-h-8 px-3 text-xs" type="submit">Tangguhkan</button>
                </form>
              <?php else: ?>
                <form method="post" class="inline">
                  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="op" value="activate"><input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                  <button class="btn-outline min-h-8 px-3 text-xs" type="submit">Aktifkan</button>
                </form>
              <?php endif; ?>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
