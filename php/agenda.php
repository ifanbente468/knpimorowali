<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$pdo = db();
$slug = trim((string) ($_GET['slug'] ?? ''));

if ($slug !== '') {
    $stmt = $pdo->prepare('SELECT * FROM `Agenda` WHERE `slug` = ? AND `isPublished` = 1 LIMIT 1');
    $stmt->execute([$slug]);
    $item = $stmt->fetch();
    if (!$item) {
        http_response_code(404);
        page_header('Agenda tidak ditemukan', $settings);
        echo '<section class="container-page py-20"><div class="surface p-10 text-center"><h1 class="text-2xl font-extrabold text-navy">Agenda tidak ditemukan</h1><a class="btn-primary mt-5" href="/agenda">Kembali ke agenda</a></div></section>';
        page_footer($settings);
        exit;
    }
    $start = strtotime((string) $item['startsAt']);
    page_header((string) $item['title'], $settings);
    ?>
    <article class="container-page max-w-3xl py-12">
      <a href="/agenda" class="text-sm font-bold text-brand-600 hover:underline">&larr; Semua agenda</a>
      <div class="mt-4 flex items-center gap-3">
        <div class="flex h-16 w-16 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700"><span class="text-xl font-extrabold leading-none"><?= $start ? date('j', $start) : '' ?></span><span class="mt-1 text-[11px] font-bold uppercase"><?= $start ? date('M', $start) : '' ?></span></div>
        <div class="text-sm text-muted"><div class="font-semibold text-navy"><?= $start ? date('H:i', $start) : '' ?> WITA</div><div><?= e($item['location']) ?></div></div>
      </div>
      <h1 class="mt-4 text-3xl font-extrabold leading-tight tracking-tight text-navy"><?= e($item['title']) ?></h1>
      <div class="mt-6 space-y-4 text-[15px] leading-7 text-navy">
        <?php foreach (preg_split('/\n{2,}/', trim((string) $item['description'])) ?: [] as $paragraph): ?><p><?= nl2br(e($paragraph)) ?></p><?php endforeach; ?>
      </div>
    </article>
    <?php
    page_footer($settings);
    exit;
}

$upcoming = $pdo->query("SELECT * FROM `Agenda` WHERE `isPublished` = 1 AND `startsAt` >= NOW() ORDER BY `startsAt` ASC LIMIT 50")->fetchAll();
$past = $pdo->query("SELECT * FROM `Agenda` WHERE `isPublished` = 1 AND `startsAt` < NOW() ORDER BY `startsAt` DESC LIMIT 30")->fetchAll();
page_header('Agenda', $settings);
?>
<section class="container-page py-12">
  <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Agenda</div>
  <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Kegiatan KNPI Morowali</h1>

  <h2 class="mt-8 text-lg font-extrabold text-navy">Akan datang</h2>
  <div class="mt-3 grid gap-3">
    <?php if (!$upcoming): ?><div class="surface p-6 text-sm text-muted">Belum ada agenda terjadwal.</div><?php endif; ?>
    <?php foreach ($upcoming as $item): ?>
      <?php $start = strtotime((string) $item['startsAt']); ?>
      <a href="/agenda/<?= e($item['slug']) ?>" class="surface flex items-center gap-4 p-4 transition hover:border-brand-200">
        <div class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700"><span class="text-xl font-extrabold leading-none"><?= $start ? date('j', $start) : '' ?></span><span class="mt-1 text-[11px] font-bold uppercase"><?= $start ? date('M', $start) : '' ?></span></div>
        <div class="min-w-0"><div class="truncate font-bold text-navy"><?= e($item['title']) ?></div><div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted"><span class="flex items-center gap-1"><?= icon('pin', 'h-3.5 w-3.5') ?><?= e($item['location']) ?></span><span><?= $start ? date('H:i', $start) : '' ?> WITA</span></div></div>
      </a>
    <?php endforeach; ?>
  </div>

  <?php if ($past): ?>
  <h2 class="mt-10 text-lg font-extrabold text-navy">Sudah berlangsung</h2>
  <div class="mt-3 grid gap-3 sm:grid-cols-2">
    <?php foreach ($past as $item): ?>
      <a href="/agenda/<?= e($item['slug']) ?>" class="surface p-4 transition hover:border-brand-200">
        <div class="text-xs text-muted"><?= e(tanggal((string) $item['startsAt'])) ?></div>
        <div class="mt-1 font-bold text-navy"><?= e($item['title']) ?></div>
        <div class="mt-1 text-xs text-muted"><?= e($item['location']) ?></div>
      </a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>
</section>
<?php page_footer($settings); ?>
