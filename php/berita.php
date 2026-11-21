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
    $stmt = $pdo->prepare("SELECT * FROM `News` WHERE `slug` = ? AND `status` = 'PUBLISHED' LIMIT 1");
    $stmt->execute([$slug]);
    $item = $stmt->fetch();
    if (!$item) {
        http_response_code(404);
        page_header('Berita tidak ditemukan', $settings);
        echo '<section class="container-page py-20"><div class="surface p-10 text-center"><h1 class="text-2xl font-extrabold text-navy">Berita tidak ditemukan</h1><p class="mt-2 text-sm text-muted">Tulisan mungkin sudah dihapus atau belum terbit.</p><a class="btn-primary mt-5" href="/berita">Kembali ke berita</a></div></section>';
        page_footer($settings);
        exit;
    }
    $paragraphs = preg_split('/\n{2,}/', trim((string) $item['content'])) ?: [];
    page_header((string) $item['title'], $settings);
    ?>
    <article class="container-page max-w-3xl py-12">
      <a href="/berita" class="text-sm font-bold text-brand-600 hover:underline">&larr; Semua berita</a>
      <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted">
        <span class="badge bg-yellow-100 text-navy"><?= e($item['category']) ?></span>
        <span><?= e(tanggal((string) $item['publishedAt'])) ?></span>
      </div>
      <h1 class="mt-3 text-3xl font-extrabold leading-tight tracking-tight text-navy sm:text-4xl"><?= e($item['title']) ?></h1>
      <p class="mt-3 text-base text-muted"><?= e($item['excerpt']) ?></p>
      <div class="mt-6 overflow-hidden rounded-2xl"><img src="<?= e(image_src((string) ($item['coverImage'] ?? ''))) ?>" alt="<?= e($item['title']) ?>" class="h-[360px] w-full object-cover"></div>
      <div class="mt-8 space-y-4 text-[15px] leading-7 text-navy">
        <?php foreach ($paragraphs as $paragraph): ?>
          <p><?= nl2br(e($paragraph)) ?></p>
        <?php endforeach; ?>
      </div>
    </article>
    <?php
    page_footer($settings);
    exit;
}

$q = trim((string) ($_GET['q'] ?? ''));
if ($q !== '') {
    $stmt = $pdo->prepare("SELECT * FROM `News` WHERE `status` = 'PUBLISHED' AND (`title` LIKE ? OR `excerpt` LIKE ?) ORDER BY `publishedAt` DESC LIMIT 60");
    $stmt->execute(['%' . $q . '%', '%' . $q . '%']);
    $rows = $stmt->fetchAll();
} else {
    $rows = $pdo->query("SELECT * FROM `News` WHERE `status` = 'PUBLISHED' ORDER BY `publishedAt` DESC LIMIT 60")->fetchAll();
}
page_header('Berita', $settings);
?>
<section class="container-page py-12">
  <div class="flex flex-wrap items-end justify-between gap-4">
    <div><div class="text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Kabar terbaru</div><h1 class="mt-1 text-3xl font-extrabold tracking-tight text-navy">Berita &amp; kegiatan</h1></div>
    <form method="get" class="flex gap-2"><input class="input min-h-10 w-56 py-2 text-sm" type="search" name="q" value="<?= e($q) ?>" placeholder="Cari berita..."><button class="btn-outline min-h-10 px-4 text-sm" type="submit">Cari</button></form>
  </div>
  <div class="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
    <?php if (!$rows): ?><div class="surface p-8 text-sm text-muted sm:col-span-2 lg:col-span-3">Belum ada berita terbit.</div><?php endif; ?>
    <?php foreach ($rows as $item): ?>
      <a href="/berita/<?= e($item['slug']) ?>" class="surface group overflow-hidden transition hover:border-brand-200">
        <div class="h-48 overflow-hidden"><img src="<?= e(image_src((string) ($item['coverImage'] ?? ''))) ?>" alt="<?= e($item['title']) ?>" class="h-full w-full object-cover transition duration-300 group-hover:scale-105"></div>
        <div class="p-5">
          <div class="flex items-center gap-2 text-[11px] font-bold uppercase tracking-wide text-brand-600"><span><?= e($item['category']) ?></span><span class="text-muted">&middot; <?= e(tanggal((string) $item['publishedAt'])) ?></span></div>
          <h2 class="mt-2 text-base font-extrabold leading-snug text-navy group-hover:text-brand-600"><?= e($item['title']) ?></h2>
          <p class="mt-2 line-clamp-3 text-sm text-muted"><?= e($item['excerpt']) ?></p>
        </div>
      </a>
    <?php endforeach; ?>
  </div>
</section>
<?php page_footer($settings); ?>
