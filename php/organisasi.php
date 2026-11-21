<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$pdo = db();
$rows = $pdo->query('SELECT * FROM `Organization` WHERE `isActive` = 1 ORDER BY `sortOrder` ASC, `name` ASC LIMIT 100')->fetchAll();
$counts = ['DPD' => 0, 'OKP' => 0, 'SAYAP' => 0];
foreach ($rows as $row) {
    $counts[$row['type']] = ($counts[$row['type']] ?? 0) + 1;
}
page_header('Organisasi', $settings);
?>
<section class="container-page py-12">
  <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Organisasi</div>
  <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">OKP &amp; sayap KNPI</h1>
  <p class="mt-2 max-w-2xl text-sm text-muted">Organisasi kepemudaan yang berhimpun di DPD KNPI Kabupaten Morowali.</p>

  <div class="mt-6 grid gap-3 sm:grid-cols-3">
    <div class="surface p-4"><div class="text-2xl font-extrabold text-brand-600"><?= (int) $counts['OKP'] ?></div><div class="text-xs text-muted">OKP anggota</div></div>
    <div class="surface p-4"><div class="text-2xl font-extrabold text-brand-600"><?= (int) $counts['SAYAP'] ?></div><div class="text-xs text-muted">Sayap kepemudaan</div></div>
    <div class="surface p-4"><div class="text-2xl font-extrabold text-brand-600"><?= (int) $counts['DPD'] ?></div><div class="text-xs text-muted">DPD</div></div>
  </div>

  <div class="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    <?php if (!$rows): ?><div class="surface p-8 text-sm text-muted lg:col-span-3">Belum ada organisasi.</div><?php endif; ?>
    <?php foreach ($rows as $org): ?>
      <div class="surface p-5">
        <div class="flex items-center gap-3">
          <span class="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-50 text-brand-700"><?= icon('users', 'h-5 w-5') ?></span>
          <div class="min-w-0">
            <div class="truncate font-bold text-navy"><?= e($org['name']) ?></div>
            <div class="text-[11px] text-muted"><?= $org['type'] === 'OKP' ? 'OKP' : ($org['type'] === 'SAYAP' ? 'Sayap' : 'DPD') ?></div>
          </div>
        </div>
        <?php if ($org['leader']): ?><p class="mt-3 text-xs text-muted">Ketua: <?= e($org['leader']) ?></p><?php endif; ?>
        <p class="mt-2 text-sm leading-6 text-muted"><?= e($org['description'] ?: 'Organisasi kepemudaan mitra KNPI Morowali.') ?></p>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<?php page_footer($settings); ?>
