<?php
declare(strict_types=1);
require_once __DIR__ . '/lib.php';
require_once __DIR__ . '/theme.php';

if (!config() || !is_installed()) {
    redirect('/install.php');
}
$settings = settings_map();
$chairmanName = setting($settings, 'chairman_name', '');
$chairmanTitle = setting($settings, 'chairman_title', 'Ketua DPD KNPI Kabupaten Morowali');
$chairmanMessage = setting($settings, 'chairman_message', '');
$address = setting($settings, 'address', 'Sekretariat DPD KNPI Kabupaten Morowali, Bungku Tengah, Sulawesi Tengah');
$mapUrl = setting($settings, 'map_url', 'https://maps.google.com/?q=Morowali');
page_header('Profil', $settings);
?>
<section class="bg-navy py-14 text-white">
  <div class="container-page">
    <div class="text-xs font-bold uppercase tracking-[0.18em] text-accent">Profil</div>
    <h1 class="mt-2 text-3xl font-extrabold tracking-tight sm:text-4xl">DPD KNPI Kabupaten Morowali</h1>
    <p class="mt-3 max-w-2xl text-sm leading-6 text-slate-300"><?= e(setting($settings, 'site_tagline', 'Pemuda Morowali Bergerak, Berkarya, Berdaya.')) ?> Wadah berhimpun pemuda dan organisasi kepemudaan Kabupaten Morowali.</p>
  </div>
</section>

<section class="container-page grid gap-6 py-12 lg:grid-cols-[1.1fr_0.9fr]">
  <div class="space-y-6">
    <div class="surface p-6">
      <h2 class="text-lg font-extrabold text-navy">Tentang kami</h2>
      <div class="mt-3 space-y-3 text-[15px] leading-7 text-navy">
        <p>DPD KNPI Kabupaten Morowali adalah wadah berhimpunnya pemuda dan organisasi kepemudaan di Kabupaten Morowali, Sulawesi Tengah.</p>
        <p>Kami mendorong kaderisasi, kegiatan sosial, olahraga, seni budaya, serta partisipasi pemuda dalam pembangunan daerah.</p>
      </div>
    </div>

    <?php if ($chairmanMessage !== ''): ?>
    <div class="surface p-6">
      <h2 class="text-lg font-extrabold text-navy">Sambutan ketua</h2>
      <div class="mt-3 space-y-3 text-[15px] leading-7 text-navy">
        <?php foreach (preg_split('/\n{2,}/', trim($chairmanMessage)) ?: [] as $paragraph): ?><p><?= nl2br(e($paragraph)) ?></p><?php endforeach; ?>
      </div>
      <div class="mt-4 border-t border-line pt-4"><div class="font-bold text-navy"><?= e($chairmanName ?: 'Ketua DPD KNPI') ?></div><div class="text-xs text-muted"><?= e($chairmanTitle) ?></div></div>
    </div>
    <?php endif; ?>
  </div>

  <div class="space-y-4">
    <div class="surface p-6">
      <h2 class="text-lg font-extrabold text-navy">Sekretariat</h2>
      <p class="mt-3 flex items-start gap-2 text-sm text-muted"><?= icon('pin', 'mt-0.5 h-4 w-4 shrink-0 text-brand-600') ?><span><?= e($address) ?></span></p>
      <p class="mt-2 flex items-center gap-2 text-sm text-muted"><?= icon('mail', 'h-4 w-4 text-brand-600') ?><a class="hover:underline" href="mailto:<?= e(setting($settings, 'contact_email', '')) ?>"><?= e(setting($settings, 'contact_email', '')) ?></a></p>
      <p class="mt-2 flex items-center gap-2 text-sm text-muted"><?= icon('phone', 'h-4 w-4 text-brand-600') ?><span><?= e(setting($settings, 'contact_phone', '')) ?></span></p>
      <a class="btn-outline mt-4 text-xs" href="<?= e($mapUrl) ?>" target="_blank" rel="noopener">Buka peta <?= icon('external', 'h-3.5 w-3.5') ?></a>
    </div>
    <div class="surface p-6">
      <h2 class="text-lg font-extrabold text-navy">Tautan</h2>
      <div class="mt-3 grid gap-2 text-sm">
        <a class="font-semibold text-brand-600 hover:underline" href="/organisasi">OKP &amp; sayap</a>
        <a class="font-semibold text-brand-600 hover:underline" href="/agenda">Agenda kegiatan</a>
        <a class="font-semibold text-brand-600 hover:underline" href="/berita">Berita</a>
        <a class="font-semibold text-brand-600 hover:underline" href="/galeri">Galeri</a>
      </div>
    </div>
  </div>
</section>
<?php page_footer($settings); ?>
