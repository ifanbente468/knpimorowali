<?php
declare(strict_types=1);

function page_header(string $title, array $settings = []): void
{
    $siteName = setting($settings, 'site_name', APP_NAME);
    $tagline = setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.');
    $user = current_user();
    ?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title><?= e($title) ?> — <?= e($siteName) ?></title>
<meta name="description" content="<?= e($tagline) ?>">
<style>
:root{--navy:#0b2545;--blue:#0a3bc4;--blue2:#2f6bff;--muted:#5b6b82;--line:#dde5f0;--bg:#f4f6fb;--gold:#f4b740}
*{box-sizing:border-box}html{scroll-behavior:smooth}
body{margin:0;background:var(--bg);color:var(--navy);font-family:system-ui,Segoe UI,Roboto,Arial,sans-serif;line-height:1.55}
a{color:var(--blue);text-decoration:none}a:hover{text-decoration:underline}
img{max-width:100%;display:block}
.container{max-width:1120px;margin:0 auto;padding:0 20px}
.topbar{background:#081b33;color:#cfe0ff;font-size:13px;padding:8px 0}
.topbar .container{display:flex;justify-content:space-between;gap:12px;flex-wrap:wrap}
header.site{background:#fff;border-bottom:1px solid var(--line);position:sticky;top:0;z-index:20}
.nav{display:flex;align-items:center;justify-content:space-between;gap:16px;padding:12px 0}
.brand{display:flex;align-items:center;gap:12px;font-weight:800;color:var(--navy);font-size:18px}
.brand img{width:40px;height:40px;border-radius:10px;object-fit:cover}
.menu{display:flex;gap:18px;flex-wrap:wrap;font-size:14px;font-weight:600}
.menu a{color:var(--navy)}.menu a:hover{color:var(--blue)}
.btn{display:inline-block;padding:10px 16px;border-radius:9px;font-weight:700;font-size:14px}
.btn-primary{background:var(--blue);color:#fff}.btn-primary:hover{background:#0832a6;text-decoration:none}
.btn-outline{border:1px solid var(--line);color:var(--navy);background:#fff}.btn-outline:hover{border-color:var(--blue);text-decoration:none}
.hero{background:linear-gradient(135deg,#0a2a5e,#0a3bc4);color:#fff;padding:64px 0 56px}
.hero-grid{display:grid;grid-template-columns:1.2fr .8fr;gap:32px;align-items:center}
.hero h1{font-size:38px;line-height:1.15;margin:0 0 14px}
.hero p{margin:0 0 22px;color:#d7e3ff;max-width:52ch}
.hero-photo{border-radius:18px;overflow:hidden;border:1px solid rgba(255,255,255,.25);background:rgba(255,255,255,.08)}
.hero-photo img{width:100%;height:320px;object-fit:cover}
.hero-actions{display:flex;gap:10px;flex-wrap:wrap}
.hero-actions .btn-outline{background:transparent;color:#fff;border-color:rgba(255,255,255,.5)}
section.block{padding:48px 0}
.section-title{display:flex;align-items:end;justify-content:space-between;gap:16px;margin-bottom:22px}
.section-title h2{margin:0;font-size:24px}
.section-title p{margin:4px 0 0;color:var(--muted);font-size:14px}
.stats{display:grid;grid-template-columns:repeat(4,1fr);gap:14px}
.stat{background:#fff;border:1px solid var(--line);border-radius:14px;padding:18px}
.stat strong{display:block;font-size:26px}.stat span{color:var(--muted);font-size:13px}
.grid-3{display:grid;grid-template-columns:repeat(3,1fr);gap:18px}
.card{background:#fff;border:1px solid var(--line);border-radius:14px;overflow:hidden}
.card .body{padding:18px}.card h3{margin:0 0 8px;font-size:17px}
.card p{margin:0;color:var(--muted);font-size:14px}
.card .meta{font-size:12px;color:var(--muted);margin-bottom:8px}
.card img{height:170px;width:100%;object-fit:cover;background:#dfe7f5}
.chip{display:inline-block;background:#e8efff;color:#0a3bc4;border-radius:999px;padding:3px 10px;font-size:11px;font-weight:700}
.list{display:grid;gap:12px}
.row{background:#fff;border:1px solid var(--line);border-radius:12px;padding:16px;display:flex;justify-content:space-between;gap:16px;align-items:center}
.row h3{margin:0 0 4px;font-size:16px}.row .meta{color:var(--muted);font-size:13px}
.orgs{display:flex;flex-wrap:wrap;gap:10px}
.org{background:#fff;border:1px solid var(--line);border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600}
.gallery{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.gallery img{height:150px;width:100%;object-fit:cover;border-radius:12px;background:#dfe7f5}
footer.site{background:#081b33;color:#cfe0ff;padding:36px 0;margin-top:24px}
footer.site .cols{display:grid;grid-template-columns:2fr 1fr 1fr;gap:24px}
footer.site h4{margin:0 0 10px;color:#fff;font-size:14px}
footer.site a{color:#cfe0ff;font-size:13px}
footer.site .copy{border-top:1px solid rgba(255,255,255,.15);margin-top:24px;padding-top:14px;font-size:12px;color:#9fb6d8}
.alert{padding:12px 14px;border-radius:10px;font-size:14px;margin-bottom:16px}
.alert.err{background:#fdecec;color:#a11a1a;border:1px solid #f5c2c2}
.alert.ok{background:#e9f8ef;color:#136b34;border:1px solid #bfe8cd}
.auth{max-width:460px;margin:56px auto;padding:0 16px}
.auth .box{background:#fff;border:1px solid var(--line);border-radius:16px;padding:28px}
label{display:block;font-size:13px;font-weight:700;margin:14px 0 6px}
input{width:100%;padding:11px 12px;border:1px solid var(--line);border-radius:9px;font-size:14px}
button{margin-top:20px;width:100%;padding:12px;border:0;border-radius:9px;background:var(--blue);color:#fff;font-weight:700;font-size:15px;cursor:pointer}
@media(max-width:860px){.hero-grid{grid-template-columns:1fr}.stats{grid-template-columns:repeat(2,1fr)}.grid-3{grid-template-columns:1fr}.gallery{grid-template-columns:repeat(2,1fr)}footer.site .cols{grid-template-columns:1fr}.hero h1{font-size:30px}}
</style>
</head>
<body>
<div class="topbar"><div class="container">
  <span><?= e(setting($settings, 'address', 'Sekretariat DPD KNPI Kabupaten Morowali')) ?></span>
  <span><?= e(setting($settings, 'contact_email', 'sekretariat@knpi-morowali.or.id')) ?></span>
</div></div>
<header class="site"><div class="container nav">
  <a class="brand" href="index.php">
    <img src="images/logo.jpg" alt="Logo <?= e($siteName) ?>">
    <span><?= e($siteName) ?></span>
  </a>
  <nav class="menu">
    <a href="index.php">Beranda</a>
    <a href="index.php#berita">Berita</a>
    <a href="index.php#agenda">Agenda</a>
    <a href="index.php#organisasi">Organisasi</a>
    <a href="index.php#galeri">Galeri</a>
    <?php if ($user): ?>
      <a href="logout.php" class="btn btn-outline">Keluar</a>
    <?php else: ?>
      <a href="login.php" class="btn btn-primary">Masuk</a>
    <?php endif; ?>
  </nav>
</div></header>
<?php
}

function page_footer(array $settings = []): void
{
    $siteName = setting($settings, 'site_name', APP_NAME);
    ?>
<footer class="site"><div class="container">
  <div class="cols">
    <div>
      <h4><?= e($siteName) ?></h4>
      <p style="font-size:13px;color:#9fb6d8;margin:0"><?= e(setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.')) ?></p>
    </div>
    <div>
      <h4>Kontak</h4>
      <p style="font-size:13px;margin:0"><?= e(setting($settings, 'contact_email', '')) ?></p>
      <p style="font-size:13px;margin:4px 0 0"><?= e(setting($settings, 'contact_phone', '')) ?></p>
    </div>
    <div>
      <h4>Halaman</h4>
      <p style="margin:0"><a href="index.php">Beranda</a></p>
      <p style="margin:4px 0 0"><a href="login.php">Masuk</a></p>
    </div>
  </div>
  <div class="copy">© <?= date('Y') ?> <?= e($siteName) ?>. Semua hak dilindungi.</div>
</div></footer>
</body>
</html>
<?php
}
