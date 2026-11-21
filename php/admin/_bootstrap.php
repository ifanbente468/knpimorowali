<?php
declare(strict_types=1);
require_once dirname(__DIR__) . '/lib.php';
require_once dirname(__DIR__) . '/theme.php';

if (!config() || !is_installed()) {
    redirect('../install.php');
}
$user = current_user();
if (!$user) {
    redirect('login.php');
}
if (!in_array($user['role'], ['ADMIN', 'EDITOR'], true)) {
    redirect('../akun.php');
}

function is_admin(): bool
{
    global $user;
    return ($user['role'] ?? '') === 'ADMIN';
}

function admin_require_admin(): void
{
    if (!is_admin()) {
        http_response_code(403);
        exit('Hanya administrator yang boleh mengakses halaman ini.');
    }
}

function flash(string $message, string $type = 'ok'): void
{
    $_SESSION['admin_flash'] = ['message' => $message, 'type' => $type];
}

function take_flash(): ?array
{
    $flash = $_SESSION['admin_flash'] ?? null;
    unset($_SESSION['admin_flash']);
    return is_array($flash) ? $flash : null;
}

function post(string $key, string $default = ''): string
{
    $value = $_POST[$key] ?? $default;
    return is_string($value) ? trim($value) : $default;
}

function require_post_csrf(): void
{
    if (!csrf_ok($_POST['csrf'] ?? null)) {
        flash('Sesi kedaluwarsa. Coba lagi.', 'err');
        redirect(basename($_SERVER['PHP_SELF']) . (isset($_GET['m']) ? '?m=' . urlencode((string) $_GET['m']) : ''));
    }
}

function new_id(): string
{
    return 'c' . bin2hex(random_bytes(12));
}

function slugify(string $value): string
{
    $value = strtolower(trim($value));
    $value = preg_replace('/[^a-z0-9]+/', '-', $value) ?? '';
    return trim($value, '-');
}

function admin_header(string $title, string $active = ''): void
{
    global $user;
    $settings = settings_map();
    $firstName = explode(' ', trim((string) $user['name']))[0];
    $roleLabel = $user['role'] === 'ADMIN' ? 'Administrator' : 'Editor';
    $nav = [
        ['index.php', 'Ringkasan', 'gauge', 'ringkasan', true],
        ['anggota.php', 'Anggota', 'users', 'anggota', true],
        ['crud.php?m=berita', 'Berita', 'newspaper', 'berita', true],
        ['crud.php?m=agenda', 'Agenda', 'calendar', 'agenda', true],
        ['crud.php?m=galeri', 'Galeri', 'images', 'galeri', true],
        ['aspirasi.php', 'Aspirasi', 'message', 'aspirasi', true],
        ['crud.php?m=persuratan', 'Persuratan', 'mail-open', 'persuratan', is_admin()],
        ['crud.php?m=keuangan', 'Keuangan', 'banknote', 'keuangan', is_admin()],
        ['crud.php?m=organisasi', 'Organisasi', 'building', 'organisasi', is_admin()],
        ['crud.php?m=pengguna', 'Pengguna', 'user-square', 'pengguna', is_admin()],
        ['pengaturan.php', 'Pengaturan', 'settings', 'pengaturan', is_admin()],
    ];
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?> — Panel Admin</title>
<meta name="robots" content="noindex,nofollow">
<link rel="icon" href="../images/logo.jpg">
<link rel="stylesheet" href="../assets/app.css">
</head>
<body class="min-h-screen bg-canvas">
<div class="lg:pl-[250px]">
  <aside class="fixed inset-y-0 left-0 z-50 hidden w-[250px] flex-col bg-navy text-white lg:flex" aria-label="Navigasi admin">
    <div class="flex items-center justify-between gap-3 px-4 py-5">
      <a href="index.php" class="flex items-center gap-2.5">
        <span class="rounded-lg bg-white p-1"><img src="../images/logo.jpg" alt="Logo KNPI" width="120" height="72" class="h-8 w-12 object-contain"></span>
        <span><span class="block text-sm font-extrabold leading-tight">KNPI Morowali</span><span class="block text-[11px] text-slate-400">Panel Admin</span></span>
      </a>
    </div>
    <nav class="flex-1 space-y-1 overflow-y-auto px-3 pb-4">
      <?php foreach ($nav as [$href, $label, $ico, $key, $allowed]): ?>
        <?php if (!$allowed) continue; ?>
        <a href="<?= e($href) ?>" class="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition <?= $active === $key ? 'bg-accent text-navy' : 'text-slate-300 hover:bg-white/10 hover:text-white' ?>"><?= icon($ico, 'h-4 w-4 shrink-0') ?><?= e($label) ?></a>
      <?php endforeach; ?>
    </nav>
    <div class="border-t border-white/10 p-3">
      <div class="mb-2 flex items-center gap-2 px-2">
        <span class="flex h-9 w-9 items-center justify-center rounded-full bg-accent text-xs font-extrabold text-navy"><?= e(strtoupper(substr($firstName, 0, 1))) ?></span>
        <div class="min-w-0"><div class="truncate text-xs font-bold"><?= e($user['name']) ?></div><div class="text-[10px] text-slate-400"><?= e($roleLabel) ?></div></div>
      </div>
      <a href="../index.php" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10"><?= icon('external', 'h-3.5 w-3.5') ?>Lihat situs publik</a>
      <a href="../logout.php" class="flex items-center gap-2 rounded-lg px-3 py-2 text-xs text-slate-300 hover:bg-white/10"><?= icon('logout', 'h-3.5 w-3.5') ?>Keluar</a>
    </div>
  </aside>
  <div class="flex items-center justify-between gap-3 border-b border-line bg-white px-4 py-3 lg:hidden">
    <a href="index.php" class="flex items-center gap-2"><img src="../images/logo.jpg" alt="Logo" class="h-8 w-12 object-contain"><span class="text-sm font-extrabold text-navy">Panel Admin</span></a>
    <div class="flex items-center gap-2"><a href="../index.php" class="btn-outline min-h-9 px-3 text-xs">Situs</a><a href="../logout.php" class="btn-outline min-h-9 px-3 text-xs">Keluar</a></div>
  </div>
  <main class="px-4 py-6 sm:px-6 lg:px-8">
<?php
    $flash = take_flash();
    if ($flash) {
        $cls = ($flash['type'] ?? 'ok') === 'err' ? 'border-red-200 bg-red-50 text-danger' : 'border-emerald-200 bg-emerald-50 text-success';
        echo '<div class="mb-4 rounded-xl border ' . $cls . ' px-4 py-3 text-sm">' . e($flash['message']) . '</div>';
    }
}

function admin_footer(): void
{
    ?>
  </main>
</div>
</body>
</html>
<?php
}

function badge_for(string $value): string
{
    $map = [
        'PUBLISHED' => 'bg-emerald-50 text-success', 'DRAFT' => 'bg-amber-50 text-warning', 'ARCHIVED' => 'bg-canvas text-muted',
        'ACTIVE' => 'bg-emerald-50 text-success', 'PENDING' => 'bg-amber-50 text-warning', 'REJECTED' => 'bg-red-50 text-danger', 'SUSPENDED' => 'bg-canvas text-muted',
        'NEW' => 'bg-amber-50 text-warning', 'IN_PROGRESS' => 'bg-brand-50 text-brand-700', 'RESOLVED' => 'bg-emerald-50 text-success',
        'INCOME' => 'bg-emerald-50 text-success', 'EXPENSE' => 'bg-red-50 text-danger',
        'RECEIVED' => 'bg-brand-50 text-brand-700', 'SENT' => 'bg-emerald-50 text-success', 'ARCHIVED_LETTER' => 'bg-canvas text-muted',
    ];
    return 'badge ' . ($map[$value] ?? 'bg-canvas text-muted');
}
