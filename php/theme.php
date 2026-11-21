<?php
declare(strict_types=1);

function icon(string $name, string $class = 'h-4 w-4'): string
{
    $paths = [
        'arrow' => '<path d="M5 12h14M13 6l6 6-6 6"/>',
        'check' => '<path d="M20 6 9 17l-5-5"/>',
        'calendar' => '<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 11h18"/>',
        'pin' => '<path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 1 1 16 0Z"/><circle cx="12" cy="10" r="3"/>',
        'users' => '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        'megaphone' => '<path d="m3 11 18-5v12L3 14v-3Z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
        'mail' => '<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 6-10 7L2 6"/>',
        'phone' => '<path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.8 19.8 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.12 4.18 2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.13.96.36 1.9.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.9.34 1.85.57 2.81.7A2 2 0 0 1 22 16.92Z"/>',
        'menu' => '<path d="M4 6h16M4 12h16M4 18h16"/>',
        'x' => '<path d="M18 6 6 18M6 6l12 12"/>',
        'gauge' => '<path d="m12 14 4-4"/><path d="M3.34 19a10 10 0 1 1 17.32 0"/>',
        'newspaper' => '<path d="M4 22h16a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H8a2 2 0 0 0-2 2v16a2 2 0 0 1-4 0V5"/><path d="M18 14h-8M15 18h-5M10 6h8v4h-8V6Z"/>',
        'images' => '<rect x="2" y="2" width="20" height="20" rx="2"/><circle cx="12" cy="8" r="2"/><path d="m22 13-1.3-1.3a2.4 2.4 0 0 0-3.4 0L11 18"/>',
        'message' => '<path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>',
        'mail-open' => '<path d="M21.2 8.4c.5.38.8.97.8 1.6v10a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V10a2 2 0 0 1 .8-1.6l8-6a2 2 0 0 1 2.4 0l8 6Z"/><path d="m22 10-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 10"/>',
        'banknote' => '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2"/><path d="M6 12h.01M18 12h.01"/>',
        'building' => '<rect x="4" y="2" width="16" height="20" rx="2"/><path d="M9 22v-4h6v4M8 6h.01M16 6h.01M8 10h.01M16 10h.01M8 14h.01M16 14h.01"/>',
        'user-square' => '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="12" cy="10" r="3"/><path d="M7 21v-2a5 5 0 0 1 10 0v2"/>',
        'settings' => '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .34 1.87l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06A1.7 1.7 0 0 0 15 19.4a1.7 1.7 0 0 0-1 1.55V21a2 2 0 1 1-4 0v-.09A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.87.34l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.55-1H3a2 2 0 1 1 0-4h.09A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.34-1.87l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.55V3a2 2 0 1 1 4 0v.09A1.7 1.7 0 0 0 15 4.6a1.7 1.7 0 0 0 1.87-.34l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.7 1.7 0 0 0 19.4 9c.14.6.66 1.05 1.29 1.05H21a2 2 0 1 1 0 4h-.09A1.7 1.7 0 0 0 19.4 15Z"/>',
        'external' => '<path d="M15 3h6v6M10 14 21 3M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>',
        'logout' => '<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><path d="m16 17 5-5-5-5M21 12H9"/>',
        'plus' => '<circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/>',
    ];
    $path = $paths[$name] ?? '';
    return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="' . e($class) . '" aria-hidden="true">' . $path . '</svg>';
}

function page_header(string $title, array $settings = []): void
{
    $siteName = setting($settings, 'site_name', APP_NAME);
    $tagline = setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.');
    $user = current_user();
    $nav = [
        ['/', 'Beranda'],
        ['/profil', 'Profil'],
        ['/organisasi', 'Organisasi'],
        ['/berita', 'Berita'],
        ['/agenda', 'Agenda'],
        ['/galeri', 'Galeri'],
    ];
    $currentPath = rtrim((string) parse_url((string) ($_SERVER['REQUEST_URI'] ?? '/'), PHP_URL_PATH), '/');
    if ($currentPath === '') {
        $currentPath = '/';
    }
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?> — <?= e($siteName) ?></title>
<meta name="description" content="<?= e($tagline) ?>">
<link rel="icon" href="/images/logo.jpg">
<link rel="stylesheet" href="/assets/app.css">
</head>
<body>
<a href="#konten" class="skip-link">Lewati ke konten utama</a>
<header class="sticky top-0 z-40 border-b border-line bg-white/95 backdrop-blur">
  <div class="container-page flex h-[76px] items-center justify-between gap-4">
    <a href="/" class="flex shrink-0 items-center gap-3" aria-label="<?= e($siteName) ?> beranda">
      <span class="flex h-12 w-[72px] items-center justify-center rounded-lg border border-line bg-white p-1">
        <img src="/images/logo.jpg" alt="Logo KNPI" class="h-full w-full object-contain" width="120" height="72">
      </span>
      <span class="hidden sm:block">
        <span class="block text-sm font-extrabold leading-tight text-navy"><?= e($siteName) ?></span>
        <span class="block text-[11px] font-medium text-muted">Komite Nasional Pemuda Indonesia</span>
      </span>
    </a>

    <nav aria-label="Navigasi utama" class="hidden items-center gap-1 lg:flex">
      <?php foreach ($nav as [$href, $label]): ?>
        <?php $active = $href === '/' ? $currentPath === '/' : str_starts_with($currentPath, $href); ?>
        <a href="<?= e($href) ?>" class="rounded-lg px-3 py-2 text-sm font-semibold transition <?= $active ? 'bg-brand-50 text-brand-700' : 'text-navy hover:bg-canvas hover:text-brand-600' ?>"><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>

    <div class="hidden items-center gap-2 lg:flex">
      <?php if ($user): ?>
        <?php if (in_array($user['role'], ['ADMIN', 'EDITOR'], true)): ?>
          <a href="admin/index.php" class="btn-outline">Dashboard</a>
        <?php endif; ?>
        <a href="logout.php" class="btn-ghost">Keluar</a>
      <?php else: ?>
        <a href="/login.php" class="btn-ghost">Masuk</a>
        <a href="index.php#aspirasi" class="btn-accent">Kirim Aspirasi</a>
      <?php endif; ?>
    </div>

    <a href="/login.php" class="btn-outline lg:hidden">Masuk</a>
  </div>
</header>
<main id="konten">
<?php
}

function page_footer(array $settings = []): void
{
    $fullName = 'DPD KNPI Kabupaten Morowali';
    $email = setting($settings, 'contact_email', 'sekretariat@knpi-morowali.or.id');
    $phone = setting($settings, 'contact_phone', '+62 461 000 000');
    $address = setting($settings, 'address', 'Sekretariat DPD KNPI Kabupaten Morowali, Bungku Tengah, Sulawesi Tengah');
    ?>
</main>
<footer class="mt-16 bg-navy text-white">
  <div class="container-page grid gap-10 py-14 md:grid-cols-4">
    <div class="md:col-span-2">
      <div class="text-lg font-extrabold"><?= e($fullName) ?></div>
      <p class="mt-2 max-w-md text-sm leading-6 text-slate-300">
        <?= e(setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.')) ?>
        Wadah berhimpun pemuda dan organisasi kepemudaan Kabupaten Morowali.
      </p>
      <div class="mt-5 space-y-2 text-sm text-slate-300">
        <p class="flex items-start gap-2"><?= icon('pin', 'mt-0.5 h-4 w-4 shrink-0 text-accent') ?><span><?= e($address) ?></span></p>
        <p class="flex items-center gap-2"><?= icon('mail', 'h-4 w-4 text-accent') ?><a href="mailto:<?= e($email) ?>" class="hover:underline"><?= e($email) ?></a></p>
        <p class="flex items-center gap-2"><?= icon('phone', 'h-4 w-4 text-accent') ?><a href="tel:<?= e(preg_replace('/\s+/', '', $phone)) ?>" class="hover:underline"><?= e($phone) ?></a></p>
      </div>
    </div>
    <div>
      <div class="text-sm font-bold uppercase tracking-wider text-accent">Tautan</div>
      <ul class="mt-4 space-y-2 text-sm text-slate-300">
        <li><a href="/" class="hover:text-white">Beranda</a></li>
        <li><a href="/berita" class="hover:text-white">Berita</a></li>
        <li><a href="/agenda" class="hover:text-white">Agenda</a></li>
        <li><a href="/organisasi" class="hover:text-white">OKP &amp; Sayap</a></li>
        <li><a href="/galeri" class="hover:text-white">Galeri</a></li>
      </ul>
    </div>
    <div>
      <div class="text-sm font-bold uppercase tracking-wider text-accent">Layanan</div>
      <ul class="mt-4 space-y-2 text-sm text-slate-300">
        <li><a href="/login.php" class="hover:text-white">Masuk / Akun</a></li>
        <li><a href="index.php#aspirasi" class="hover:text-white">Kirim Aspirasi</a></li>
        <li><a href="install.php" class="hover:text-white">Instalasi</a></li>
      </ul>
    </div>
  </div>
  <div class="border-t border-white/10">
    <div class="container-page flex flex-wrap items-center justify-between gap-2 py-5 text-xs text-slate-400">
      <span>© <?= date('Y') ?> <?= e($fullName) ?>. Seluruh hak dilindungi.</span>
      <span>Dibangun untuk pemuda Morowali.</span>
    </div>
  </div>
</footer>
</body>
</html>
<?php
}
