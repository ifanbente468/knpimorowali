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
    $organizations = $pdo->query('SELECT `name`, `type`, `leader`, `description` FROM `Organization` WHERE `isActive` = 1 ORDER BY `sortOrder` ASC, `name` ASC LIMIT 6')->fetchAll();
    $gallery = $pdo->query('SELECT `title`, `imageUrl` FROM `GalleryItem` ORDER BY `sortOrder` ASC, `createdAt` DESC LIMIT 4')->fetchAll();
} catch (Throwable $exception) {
    $error = 'Data belum dapat dimuat: ' . $exception->getMessage();
}

$featured = $news[0] ?? null;
$rest = array_slice($news, 1);
$tagline = setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.');
$taglineParts = array_map('trim', explode(',', $tagline));
$chairmanName = setting($settings, 'chairman_name', '');
$chairmanTitle = setting($settings, 'chairman_title', 'Ketua DPD KNPI Kabupaten Morowali');
$heroImage = image_src(setting($settings, 'hero_image', '/images/hero.jpg'));

page_header('Beranda', $settings);
?>
<section class="relative overflow-hidden bg-navy text-white">
  <div class="absolute inset-0" style="background:radial-gradient(circle at 20% 20%, rgba(58,99,214,.55), transparent 45%), radial-gradient(circle at 85% 10%, rgba(255,210,31,.18), transparent 40%)"></div>
  <div class="container-page relative grid gap-12 py-16 lg:grid-cols-[1.1fr_0.9fr] lg:items-center lg:py-24">
    <div>
      <div class="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white/85">
        <span class="h-2 w-2 rounded-full bg-accent" aria-hidden="true"></span>
        DPD KNPI Kabupaten Morowali
      </div>
      <h1 class="mt-5 max-w-2xl text-4xl font-extrabold leading-[1.1] tracking-tight sm:text-5xl lg:text-[56px]">
        <?php foreach ($taglineParts as $index => $part): ?>
          <span class="<?= $index === count($taglineParts) - 1 ? 'text-accent' : '' ?>"><?= e($part) ?><?= $index < count($taglineParts) - 1 ? ',' : '' ?></span>
        <?php endforeach; ?>
      </h1>
      <p class="mt-5 max-w-xl text-base leading-7 text-slate-300">
        Wadah berhimpun pemuda dan organisasi kepemudaan Kabupaten Morowali. Daftar anggota,
        ikuti kegiatan, dan sampaikan aspirasi dalam satu platform.
      </p>
      <div class="mt-8 flex flex-wrap gap-3">
        <a href="/anggota/daftar" class="btn-accent px-6">Daftar Jadi Anggota <?= icon('arrow', 'h-4 w-4') ?></a>
        <a href="/anggota/cek" class="btn border border-white/25 bg-white/5 px-6 text-white hover:bg-white/10">Cek Kartu Anggota</a>
      </div>
      <div class="mt-8 flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-300">
        <span class="flex items-center gap-1.5"><?= icon('check', 'h-4 w-4 text-accent') ?>Pendaftaran gratis</span>
        <span class="flex items-center gap-1.5"><?= icon('check', 'h-4 w-4 text-accent') ?>Kartu anggota digital</span>
        <span class="flex items-center gap-1.5"><?= icon('check', 'h-4 w-4 text-accent') ?>Aspirasi ditindaklanjuti</span>
      </div>
    </div>

    <div class="relative">
      <div class="absolute -inset-3 rounded-[28px] bg-accent/15 blur-xl" aria-hidden="true"></div>
      <div class="relative overflow-hidden rounded-[24px] border border-white/15 bg-white/5 p-2 shadow-2xl">
        <div class="relative aspect-[4/5] overflow-hidden rounded-[18px] sm:aspect-[5/4] lg:aspect-[4/5]">
          <img src="<?= e($heroImage) ?>" alt="Pengurus DPD KNPI Kabupaten Morowali" class="h-full w-full object-cover object-top">
          <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/95 via-navy/40 to-transparent p-5 pt-16">
            <div class="text-base font-extrabold"><?= e($chairmanName) ?></div>
            <div class="text-xs text-slate-300"><?= e($chairmanTitle) ?></div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="relative z-10 -mt-8 pb-4">
  <div class="container-page grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div class="surface px-5 py-5"><div class="text-3xl font-extrabold tracking-tight text-brand-600"><?= number_format($stats['member'], 0, ',', '.') ?></div><div class="mt-1 text-sm text-muted">Anggota terdaftar</div></div>
    <div class="surface px-5 py-5"><div class="text-3xl font-extrabold tracking-tight text-brand-600">11</div><div class="mt-1 text-sm text-muted">Kecamatan terjangkau</div></div>
    <div class="surface px-5 py-5"><div class="text-3xl font-extrabold tracking-tight text-brand-600"><?= number_format($stats['okp'], 0, ',', '.') ?></div><div class="mt-1 text-sm text-muted">OKP &amp; sayap anggota</div></div>
    <div class="surface px-5 py-5"><div class="text-3xl font-extrabold tracking-tight text-brand-600"><?= number_format($stats['agenda'], 0, ',', '.') ?></div><div class="mt-1 text-sm text-muted">Kegiatan tahun ini</div></div>
  </div>
</section>

<section class="container-page py-14" id="berita">
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Kabar terbaru</div>
      <h2 class="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Berita &amp; kegiatan pemuda</h2>
      <p class="mt-2 max-w-2xl text-sm text-muted">Informasi resmi kegiatan, pernyataan organisasi, dan capaian pemuda Morowali.</p>
    </div>
    <a href="/berita" class="btn-outline">Lihat semua <?= icon('arrow', 'h-4 w-4') ?></a>
  </div>

  <?php if ($error): ?><div class="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-danger"><?= e($error) ?></div><?php endif; ?>

  <?php if ($featured): ?>
    <div class="grid gap-5 lg:grid-cols-[1.35fr_0.65fr]">
      <a href="/berita/<?= e($featured['slug']) ?>" class="group relative overflow-hidden rounded-2xl bg-navy text-white shadow-card">
        <div class="relative aspect-[16/9] w-full">
          <img src="<?= e(image_src((string) ($featured['coverImage'] ?? ''))) ?>" alt="<?= e($featured['title']) ?>" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
          <div class="absolute inset-0 bg-gradient-to-t from-navy via-navy/55 to-transparent"></div>
        </div>
        <div class="absolute inset-x-0 bottom-0 p-6">
          <span class="badge bg-yellow-100 text-navy"><?= e($featured['category']) ?></span>
          <h3 class="mt-3 text-2xl font-extrabold leading-snug sm:text-3xl"><?= e($featured['title']) ?></h3>
          <p class="mt-2 line-clamp-2 max-w-2xl text-sm text-slate-300"><?= e($featured['excerpt']) ?></p>
          <div class="mt-3 flex items-center gap-2 text-xs text-slate-300"><?= icon('calendar', 'h-4 w-4') ?><?= e(tanggal((string) $featured['publishedAt'])) ?></div>
        </div>
      </a>

      <div class="grid gap-4">
        <?php if ($rest): ?>
          <?php foreach ($rest as $item): ?>
            <a href="/berita/<?= e($item['slug']) ?>" class="surface group flex gap-4 p-4 transition hover:border-brand-200">
              <div class="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                <img src="<?= e(image_src((string) ($item['coverImage'] ?? ''))) ?>" alt="" class="h-full w-full object-cover transition duration-300 group-hover:scale-105">
              </div>
              <div class="min-w-0">
                <div class="text-[11px] font-bold uppercase tracking-wide text-brand-600"><?= e($item['category']) ?></div>
                <h3 class="mt-1 line-clamp-3 text-sm font-bold leading-snug text-navy group-hover:text-brand-600"><?= e($item['title']) ?></h3>
                <div class="mt-2 text-xs text-muted"><?= e(tanggal((string) $item['publishedAt'])) ?></div>
              </div>
            </a>
          <?php endforeach; ?>
        <?php else: ?>
          <div class="surface flex h-full items-center justify-center p-8 text-sm text-muted">Belum ada berita lain.</div>
        <?php endif; ?>
      </div>
    </div>
  <?php else: ?>
    <div class="surface p-10 text-center text-sm text-muted">Belum ada berita terbit.</div>
  <?php endif; ?>
</section>

<section class="bg-canvas py-14" id="agenda">
  <div class="container-page grid gap-6 lg:grid-cols-[1.05fr_0.95fr]">
    <div>
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Agenda</div>
          <h2 class="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Kegiatan terdekat</h2>
        </div>
        <a href="/agenda" class="text-sm font-bold text-brand-600 hover:underline">Semua agenda</a>
      </div>
      <div class="space-y-3">
        <?php if (!$agendas): ?><div class="surface p-8 text-center text-sm text-muted">Belum ada agenda terjadwal.</div><?php endif; ?>
        <?php foreach ($agendas as $agenda): ?>
          <?php $start = strtotime((string) $agenda['startsAt']); ?>
          <a href="/agenda/<?= e($agenda['slug']) ?>" class="surface flex items-center gap-4 p-4 transition hover:border-brand-200">
            <div class="flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-brand-50 text-brand-700">
              <span class="text-xl font-extrabold leading-none"><?= $start ? date('j', $start) : '' ?></span>
              <span class="mt-1 text-[11px] font-bold uppercase"><?= $start ? date('M', $start) : '' ?></span>
            </div>
            <div class="min-w-0">
              <div class="truncate font-bold text-navy"><?= e($agenda['title']) ?></div>
              <div class="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted">
                <span class="flex items-center gap-1"><?= icon('pin', 'h-3.5 w-3.5') ?><?= e($agenda['location']) ?></span>
                <span><?= e($start ? date('H:i', $start) : '') ?> WITA</span>
              </div>
            </div>
          </a>
        <?php endforeach; ?>
      </div>
    </div>

    <div id="organisasi">
      <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Organisasi</div>
          <h2 class="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">OKP &amp; sayap KNPI</h2>
        </div>
        <a href="/organisasi" class="text-sm font-bold text-brand-600 hover:underline">Semua OKP</a>
      </div>
      <div class="grid gap-3 sm:grid-cols-2">
        <?php foreach ($organizations as $organization): ?>
          <div class="surface p-4">
            <div class="flex items-center gap-2">
              <span class="flex h-9 w-9 items-center justify-center rounded-lg bg-brand-50 text-brand-700"><?= icon('users', 'h-4 w-4') ?></span>
              <div class="min-w-0">
                <div class="truncate text-sm font-bold text-navy"><?= e($organization['name']) ?></div>
                <div class="text-[11px] text-muted"><?= $organization['type'] === 'OKP' ? 'OKP' : ($organization['type'] === 'SAYAP' ? 'Sayap' : 'DPD') ?></div>
              </div>
            </div>
            <p class="mt-2 line-clamp-2 text-xs leading-5 text-muted"><?= e($organization['description'] ?: 'Organisasi kepemudaan mitra KNPI Morowali.') ?></p>
          </div>
        <?php endforeach; ?>
        <?php if (!$organizations): ?><div class="surface p-6 text-sm text-muted">Belum ada organisasi.</div><?php endif; ?>
      </div>
    </div>
  </div>
</section>

<?php if ($gallery): ?>
<section class="container-page py-14" id="galeri">
  <div class="mb-6 flex flex-wrap items-end justify-between gap-4">
    <div>
      <div class="mb-1 text-xs font-bold uppercase tracking-[0.18em] text-brand-600">Galeri</div>
      <h2 class="text-2xl font-extrabold tracking-tight text-navy sm:text-3xl">Potret kegiatan</h2>
    </div>
    <a href="/galeri" class="btn-outline">Buka galeri</a>
  </div>
  <div class="grid grid-cols-2 gap-3 lg:grid-cols-4">
    <?php foreach ($gallery as $item): ?>
      <div class="group relative aspect-square overflow-hidden rounded-2xl bg-canvas">
        <img src="<?= e(image_src((string) $item['imageUrl'])) ?>" alt="<?= e($item['title']) ?>" class="h-full w-full object-cover transition duration-500 group-hover:scale-105">
        <div class="absolute inset-x-0 bottom-0 bg-gradient-to-t from-navy/85 to-transparent p-3 pt-10">
          <div class="line-clamp-1 text-xs font-semibold text-white"><?= e($item['title']) ?></div>
        </div>
      </div>
    <?php endforeach; ?>
  </div>
</section>
<?php endif; ?>

<section class="container-page pb-6" id="aspirasi">
  <div class="relative overflow-hidden rounded-2xl bg-brand-600 px-6 py-10 text-white sm:px-10">
    <div class="absolute -right-16 -top-16 h-64 w-64 rounded-full bg-accent/20 blur-2xl" aria-hidden="true"></div>
    <div class="relative flex flex-wrap items-center justify-between gap-6">
      <div>
        <div class="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-accent"><?= icon('megaphone', 'h-4 w-4') ?>Suara pemuda</div>
        <h2 class="mt-2 max-w-2xl text-2xl font-extrabold sm:text-3xl">Punya aspirasi untuk pemuda Morowali?</h2>
        <p class="mt-2 max-w-xl text-sm text-brand-100">Sampaikan langsung ke DPD KNPI Kabupaten Morowali. Setiap aspirasi dicatat dan ditindaklanjuti oleh pengurus.</p>
      </div>
      <a href="/aspirasi" class="btn-accent px-6">Kirim Aspirasi <?= icon('arrow', 'h-4 w-4') ?></a>
    </div>
  </div>
</section>

<?php page_footer($settings); ?>
