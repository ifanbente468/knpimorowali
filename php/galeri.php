<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$pdo = db();
$album = trim((string) ($_GET['album'] ?? ''));

$albums = $pdo->query('SELECT DISTINCT `album` FROM `GalleryItem` ORDER BY `album` ASC')->fetchAll(PDO::FETCH_COLUMN);
if ($album !== '') {
    $stmt = $pdo->prepare('SELECT * FROM `GalleryItem` WHERE `album` = ? ORDER BY `sortOrder` ASC, `createdAt` DESC LIMIT 100');
    $stmt->execute([$album]);
    $rows = $stmt->fetchAll();
} else {
    $rows = $pdo->query('SELECT * FROM `GalleryItem` ORDER BY `album` ASC, `sortOrder` ASC, `createdAt` DESC LIMIT 100')->fetchAll();
}
page_header('Galeri', $settings);
?>
<section class="container-page py-12">
  <div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Galeri</div>
  <h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Potret kegiatan</h1>
  <p class="mt-2 max-w-2xl text-sm text-muted">Dokumentasi kegiatan dan program DPD KNPI Kabupaten Morowali.</p>

  <?php if ($albums): ?>
  <div class="mt-6 flex flex-wrap gap-2">
    <a href="/galeri" class="rounded-full border px-4 py-2 text-xs font-bold <?= $album === '' ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-navy hover:border-brand-200' ?>">Semua album</a>
    <?php foreach ($albums as $name): ?>
      <a href="/galeri?album=<?= urlencode((string) $name) ?>" class="rounded-full border px-4 py-2 text-xs font-bold <?= $album === $name ? 'border-brand-600 bg-brand-600 text-white' : 'border-line bg-white text-navy hover:border-brand-200' ?>"><?= e((string) $name) ?></a>
    <?php endforeach; ?>
  </div>
  <?php endif; ?>

  <div class="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
    <?php if (!$rows): ?><div class="surface col-span-2 p-8 text-sm text-muted lg:col-span-4">Belum ada foto di galeri.</div><?php endif; ?>
    <?php foreach ($rows as $item): ?>
      <figure class="group relative aspect-square overflow-hidden rounded-2xl bg-canvas">
        <img src="<?= e(image_src((string) $item['imageUrl'])) ?>" alt="<?= e($item['title']) ?>" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
        <figcaption class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-3 pt-10">
          <div class="line-clamp-1 text-xs font-semibold text-white"><?= e($item['title']) ?></div>
          <div class="text-[10px] text-slate-300"><?= e($item['album']) ?></div>
        </figcaption>
      </figure>
    <?php endforeach; ?>
  </div>
</section>
<?php page_footer($settings); ?>
