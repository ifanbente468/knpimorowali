<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';
admin_require_admin();

$pdo = db();
$fields = [
    'site_name' => ['label' => 'Nama situs', 'type' => 'text'],
    'site_tagline' => ['label' => 'Tagline', 'type' => 'text'],
    'contact_email' => ['label' => 'Email kontak', 'type' => 'text'],
    'contact_phone' => ['label' => 'Telepon kontak', 'type' => 'text'],
    'address' => ['label' => 'Alamat sekretariat', 'type' => 'textarea'],
    'chairman_name' => ['label' => 'Nama ketua', 'type' => 'text'],
    'chairman_title' => ['label' => 'Jabatan ketua', 'type' => 'text'],
    'chairman_message' => ['label' => 'Sambutan ketua', 'type' => 'textarea'],
    'instagram' => ['label' => 'URL Instagram', 'type' => 'text'],
    'facebook' => ['label' => 'URL Facebook', 'type' => 'text'],
    'youtube' => ['label' => 'URL YouTube', 'type' => 'text'],
    'map_url' => ['label' => 'URL peta', 'type' => 'text'],
    'hero_image' => ['label' => 'URL foto hero', 'type' => 'text'],
];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    try {
        $stmt = $pdo->prepare('INSERT INTO `Setting` (`key`, `value`, `updatedAt`) VALUES (?, ?, NOW(3)) ON DUPLICATE KEY UPDATE `value` = VALUES(`value`), `updatedAt` = NOW(3)');
        foreach ($fields as $key => $field) {
            $stmt->execute([$key, post($key)]);
        }
        flash('Pengaturan disimpan.');
    } catch (Throwable $exception) {
        flash($exception->getMessage(), 'err');
    }
    redirect('pengaturan.php');
}

$settingsMap = settings_map();

admin_header('Pengaturan', 'pengaturan');
?>
<div class="mb-6"><h1 class="text-2xl font-extrabold tracking-tight text-navy">Pengaturan</h1><p class="mt-1 text-sm text-muted">Identitas situs, kontak, dan media sosial.</p></div>
<form method="post" class="surface max-w-3xl p-6">
  <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
  <?php foreach ($fields as $key => $field): ?>
    <div class="mb-4">
      <label class="label" for="s-<?= e($key) ?>"><?= e($field['label']) ?></label>
      <?php if ($field['type'] === 'textarea'): ?>
        <textarea class="input" id="s-<?= e($key) ?>" name="<?= e($key) ?>" rows="4"><?= e((string) ($settingsMap[$key] ?? '')) ?></textarea>
      <?php else: ?>
        <input class="input" id="s-<?= e($key) ?>" name="<?= e($key) ?>" value="<?= e((string) ($settingsMap[$key] ?? '')) ?>">
      <?php endif; ?>
    </div>
  <?php endforeach; ?>
  <button type="submit" class="btn-primary">Simpan pengaturan</button>
</form>
<?php admin_footer(); ?>
