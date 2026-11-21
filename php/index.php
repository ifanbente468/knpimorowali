<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config()) {
    redirect('install.php');
}
if (!is_installed()) {
    redirect('install.php');
}

$settings = settings_map();
$pdo = db();
$today = new DateTimeImmutable('now');
$yearStart = $today->setDate((int) $today->format('Y'), 1, 1)->format('Y-m-d 00:00:00');

$stats = ['member' => 0, 'okp' => 0, 'agenda' => 0];
$news = [];
$agendas = [];
$organizations = [];
$gallery = [];
$error = null;

try {
    $stats['member'] = (int) $pdo->query("SELECT COUNT(*) FROM `Member` WHERE `status` = 'ACTIVE'")->fetchColumn();
    $stats['okp'] = (int) $pdo->query("SELECT COUNT(*) FROM `Organization` WHERE `isActive` = 1 AND `type` IN ('OKP','SAYAP')")->fetchColumn();
    $stmt = $pdo->prepare('SELECT COUNT(*) FROM `Agenda` WHERE `createdAt` >= ?');
    $stmt->execute([$yearStart]);
    $stats['agenda'] = (int) $stmt->fetchColumn();

    $news = $pdo->query("SELECT `slug`, `title`, `excerpt`, `category`, `coverImage`, `publishedAt` FROM `News` WHERE `status` = 'PUBLISHED' AND `publishedAt` IS NOT NULL ORDER BY `publishedAt` DESC LIMIT 3")->fetchAll();

    $agendas = $pdo->query("SELECT `slug`, `title`, `location`, `startsAt` FROM `Agenda` WHERE `isPublished` = 1 AND `startsAt` >= NOW() AND `status` = 'SCHEDULED' ORDER BY `startsAt` ASC LIMIT 3")->fetchAll();

    $organizations = $pdo->query('SELECT `name`, `type`, `leader` FROM `Organization` WHERE `isActive` = 1 ORDER BY `sortOrder` ASC, `name` ASC LIMIT 6')->fetchAll();

    $gallery = $pdo->query('SELECT `title`, `imageUrl` FROM `GalleryItem` ORDER BY `sortOrder` ASC, `createdAt` DESC LIMIT 4')->fetchAll();
} catch (Throwable $exception) {
    $error = 'Data belum dapat dimuat: ' . $exception->getMessage();
}

$heroImage = setting($settings, 'hero_image', 'images/hero.jpg');
if (str_starts_with($heroImage, '/')) {
    $heroImage = ltrim($heroImage, '/');
}

page_header('Beranda', $settings);
?>
<section class="hero"><div class="container hero-grid">
  <div>
    <h1><?= e(setting($settings, 'site_name', APP_NAME)) ?></h1>
    <p><?= e(setting($settings, 'site_tagline', 'Wadah berhimpun pemuda dan organisasi kepemudaan di Kabupaten Morowali.')) ?></p>
    <div class="hero-actions">
      <a class="btn btn-primary" href="#berita">Baca berita</a>
      <a class="btn btn-outline" href="#organisasi">Lihat organisasi</a>
    </div>
  </div>
  <div class="hero-photo"><img src="<?= e($heroImage) ?>" alt="<?= e(setting($settings, 'site_name', APP_NAME)) ?>"></div>
</div></section>

<section class="block"><div class="container">
  <?php if ($error): ?><div class="alert err"><?= e($error) ?></div><?php endif; ?>
  <div class="stats">
    <div class="stat"><strong><?= number_format($stats['member'], 0, ',', '.') ?></strong><span>Anggota aktif</span></div>
    <div class="stat"><strong><?= number_format($stats['okp'], 0, ',', '.') ?></strong><span>OKP &amp; sayap</span></div>
    <div class="stat"><strong><?= number_format($stats['agenda'], 0, ',', '.') ?></strong><span>Kegiatan tahun ini</span></div>
    <div class="stat"><strong><?= count($organizations) ?></strong><span>Organisasi tampil</span></div>
  </div>
</div></section>

<section class="block" id="berita" style="padding-top:0"><div class="container">
  <div class="section-title"><div><h2>Berita terbaru</h2><p>Kabar kegiatan dan program KNPI Morowali.</p></div></div>
  <div class="grid-3">
    <?php if (!$news): ?>
      <div class="card"><div class="body"><h3>Belum ada berita</h3><p>Berita yang dipublikasikan akan tampil di sini.</p></div></div>
    <?php endif; ?>
    <?php foreach ($news as $item): ?>
      <?php $cover = (string) ($item['coverImage'] ?? ''); ?>
      <article class="card">
        <?php if ($cover !== ''): ?><img src="<?= e(str_starts_with($cover, '/') ? ltrim($cover, '/') : $cover) ?>" alt="<?= e($item['title']) ?>"><?php endif; ?>
        <div class="body">
          <div class="meta"><span class="chip"><?= e($item['category']) ?></span> · <?= e(tanggal((string) $item['publishedAt'])) ?></div>
          <h3><?= e($item['title']) ?></h3>
          <p><?= e($item['excerpt']) ?></p>
        </div>
      </article>
    <?php endforeach; ?>
  </div>
</div></section>

<section class="block" id="agenda" style="padding-top:0"><div class="container">
  <div class="section-title"><div><h2>Agenda mendatang</h2><p>Jadwal kegiatan yang akan datang.</p></div></div>
  <div class="list">
    <?php if (!$agendas): ?><div class="row"><div><h3>Belum ada agenda</h3><div class="meta">Agenda baru akan tampil di sini.</div></div></div><?php endif; ?>
    <?php foreach ($agendas as $item): ?>
      <div class="row">
        <div><h3><?= e($item['title']) ?></h3><div class="meta"><?= e($item['location']) ?></div></div>
        <div class="meta" style="white-space:nowrap"><?= e(tanggal((string) $item['startsAt'])) ?></div>
      </div>
    <?php endforeach; ?>
  </div>
</div></section>

<section class="block" id="organisasi" style="padding-top:0"><div class="container">
  <div class="section-title"><div><h2>Organisasi kepemudaan</h2><p>OKP dan sayap yang berhimpun di KNPI Morowali.</p></div></div>
  <div class="orgs">
    <?php foreach ($organizations as $org): ?>
      <div class="org"><?= e($org['name']) ?><?= $org['type'] !== 'DPD' ? ' · ' . e($org['type']) : '' ?></div>
    <?php endforeach; ?>
    <?php if (!$organizations): ?><div class="org">Belum ada organisasi</div><?php endif; ?>
  </div>
</div></section>

<?php if ($gallery): ?>
<section class="block" id="galeri" style="padding-top:0"><div class="container">
  <div class="section-title"><div><h2>Galeri</h2><p>Dokumentasi kegiatan.</p></div></div>
  <div class="gallery">
    <?php foreach ($gallery as $item): ?>
      <?php $src = (string) $item['imageUrl']; ?>
      <img src="<?= e(str_starts_with($src, '/') ? ltrim($src, '/') : $src) ?>" alt="<?= e($item['title']) ?>">
    <?php endforeach; ?>
  </div>
</div></section>
<?php endif; ?>

<?php page_footer($settings); ?>
