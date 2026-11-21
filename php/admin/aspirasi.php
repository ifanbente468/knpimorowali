<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

$pdo = db();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $id = post('id');
    try {
        $status = post('status');
        if (!in_array($status, ['NEW', 'IN_PROGRESS', 'RESOLVED', 'REJECTED'], true)) {
            throw new RuntimeException('Status tidak valid.');
        }
        $response = post('response');
        $isPublic = isset($_POST['isPublic']) ? 1 : 0;
        $update = $pdo->prepare("UPDATE `Aspiration` SET `status` = ?, `response` = ?, `isPublic` = ?, `respondedAt` = NOW(3), `respondedById` = ?, `updatedAt` = NOW(3) WHERE `id` = ?");
        $update->execute([$status, $response === '' ? null : $response, $isPublic, $user['id'], $id]);
        flash('Aspirasi diperbarui.');
    } catch (Throwable $exception) {
        flash($exception->getMessage(), 'err');
    }
    redirect('aspirasi.php');
}

$rows = $pdo->query('SELECT * FROM `Aspiration` ORDER BY `createdAt` DESC LIMIT 200')->fetchAll();

admin_header('Aspirasi', 'aspirasi');
?>
<div class="mb-6"><h1 class="text-2xl font-extrabold tracking-tight text-navy">Aspirasi</h1><p class="mt-1 text-sm text-muted">Tinjau dan tanggapi aspirasi masyarakat.</p></div>
<div class="space-y-3">
  <?php if (!$rows): ?><div class="surface p-8 text-center text-sm text-muted">Belum ada aspirasi masuk.</div><?php endif; ?>
  <?php foreach ($rows as $row): ?>
    <div class="surface p-4">
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div class="flex items-center gap-2">
          <span class="font-mono text-[11px] text-muted"><?= e($row['trackingCode']) ?></span>
          <span class="<?= e(badge_for((string) $row['status'])) ?>"><?= e($row['status']) ?></span>
          <?php if ((int) $row['isPublic'] === 1): ?><span class="badge bg-brand-50 text-brand-700">Publik</span><?php endif; ?>
        </div>
        <span class="text-xs text-muted"><?= e(tanggal((string) $row['createdAt'])) ?></span>
      </div>
      <h3 class="mt-2 font-bold text-navy"><?= e($row['subject']) ?></h3>
      <p class="mt-1 text-sm text-muted"><?= e($row['message']) ?></p>
      <div class="mt-2 text-xs text-muted">Dari <?= e($row['name']) ?><?= $row['email'] ? ' · ' . e($row['email']) : '' ?> · <?= e($row['category']) ?></div>
      <?php if ($row['response']): ?><div class="mt-3 rounded-xl bg-canvas p-3 text-sm"><span class="font-semibold text-navy">Tanggapan: </span><?= e($row['response']) ?></div><?php endif; ?>
      <details class="mt-3">
        <summary class="btn-outline inline-flex min-h-8 cursor-pointer px-3 text-xs">Tanggapi</summary>
        <form method="post" class="mt-3 grid gap-2">
          <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>"><input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
          <textarea class="input" name="response" rows="4" placeholder="Tulis tanggapan..."><?= e((string) ($row['response'] ?? '')) ?></textarea>
          <div class="flex flex-wrap items-center gap-3">
            <select class="input min-h-10 w-48 py-2 text-sm" name="status">
              <?php foreach (['NEW' => 'Baru', 'IN_PROGRESS' => 'Diproses', 'RESOLVED' => 'Selesai', 'REJECTED' => 'Ditolak'] as $value => $label): ?>
                <option value="<?= e($value) ?>" <?= $row['status'] === $value ? 'selected' : '' ?>><?= e($label) ?></option>
              <?php endforeach; ?>
            </select>
            <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="isPublic" value="1" class="h-4 w-4" <?= (int) $row['isPublic'] === 1 ? 'checked' : '' ?>> Tampilkan publik</label>
            <button class="btn-primary min-h-9 px-4 text-xs" type="submit">Simpan</button>
          </div>
        </form>
      </details>
    </div>
  <?php endforeach; ?>
</div>
<?php admin_footer(); ?>
