<?php
declare(strict_types=1);
require_once __DIR__ . '/_bootstrap.php';

$modules = [
    'berita' => [
        'table' => 'News', 'label' => 'Berita', 'owner' => 'authorId', 'updated' => true,
        'order' => 'createdAt DESC',
        'list' => ['title' => 'Judul', 'category' => 'Kategori', 'status' => 'Status', 'createdAt' => 'Dibuat'],
        'fields' => [
            'title' => ['label' => 'Judul', 'type' => 'text', 'required' => true],
            'slug' => ['label' => 'Slug', 'type' => 'text', 'hint' => 'Kosongkan untuk otomatis dari judul'],
            'excerpt' => ['label' => 'Ringkasan', 'type' => 'textarea', 'rows' => 3, 'required' => true],
            'content' => ['label' => 'Isi berita (Markdown)', 'type' => 'textarea', 'rows' => 12, 'required' => true],
            'category' => ['label' => 'Kategori', 'type' => 'select', 'options' => ['KEGIATAN' => 'Kegiatan', 'ORGANISASI' => 'Organisasi', 'PRESTASI' => 'Prestasi', 'PENGUMUMAN' => 'Pengumuman']],
            'coverImage' => ['label' => 'URL gambar sampul', 'type' => 'text', 'hint' => 'Contoh /images/hero.jpg'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['DRAFT' => 'Draf', 'PUBLISHED' => 'Terbit', 'ARCHIVED' => 'Arsip']],
            'publishedAt' => ['label' => 'Tanggal terbit', 'type' => 'datetime'],
        ],
    ],
    'agenda' => [
        'table' => 'Agenda', 'label' => 'Agenda', 'owner' => 'createdById', 'updated' => true,
        'order' => 'startsAt DESC',
        'list' => ['title' => 'Judul', 'location' => 'Lokasi', 'startsAt' => 'Mulai', 'isPublished' => 'Terbit'],
        'fields' => [
            'title' => ['label' => 'Judul', 'type' => 'text', 'required' => true],
            'slug' => ['label' => 'Slug', 'type' => 'text', 'hint' => 'Kosongkan untuk otomatis'],
            'description' => ['label' => 'Deskripsi', 'type' => 'textarea', 'rows' => 5, 'required' => true],
            'location' => ['label' => 'Lokasi', 'type' => 'text', 'required' => true],
            'startsAt' => ['label' => 'Mulai', 'type' => 'datetime', 'required' => true],
            'endsAt' => ['label' => 'Selesai', 'type' => 'datetime'],
            'capacity' => ['label' => 'Kapasitas', 'type' => 'number'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['SCHEDULED' => 'Terjadwal', 'COMPLETED' => 'Selesai', 'CANCELLED' => 'Dibatalkan']],
            'isPublished' => ['label' => 'Terbitkan', 'type' => 'checkbox'],
        ],
    ],
    'galeri' => [
        'table' => 'GalleryItem', 'label' => 'Galeri', 'owner' => 'createdById', 'updated' => false,
        'order' => 'createdAt DESC',
        'list' => ['title' => 'Judul', 'album' => 'Album', 'sortOrder' => 'Urutan', 'createdAt' => 'Dibuat'],
        'fields' => [
            'title' => ['label' => 'Judul', 'type' => 'text', 'required' => true],
            'album' => ['label' => 'Album', 'type' => 'text', 'required' => true],
            'imageUrl' => ['label' => 'URL gambar', 'type' => 'text', 'required' => true, 'hint' => 'Contoh /images/hero.jpg'],
            'caption' => ['label' => 'Keterangan', 'type' => 'textarea', 'rows' => 3],
            'sortOrder' => ['label' => 'Urutan', 'type' => 'number'],
        ],
    ],
    'persuratan' => [
        'table' => 'Letter', 'label' => 'Persuratan', 'owner' => 'createdById', 'updated' => true, 'adminOnly' => true,
        'order' => 'date DESC',
        'list' => ['number' => 'Nomor', 'subject' => 'Perihal', 'type' => 'Jenis', 'status' => 'Status', 'date' => 'Tanggal'],
        'fields' => [
            'number' => ['label' => 'Nomor surat', 'type' => 'text', 'required' => true],
            'type' => ['label' => 'Jenis', 'type' => 'select', 'options' => ['INCOMING' => 'Masuk', 'OUTGOING' => 'Keluar']],
            'subject' => ['label' => 'Perihal', 'type' => 'text', 'required' => true],
            'sender' => ['label' => 'Pengirim', 'type' => 'text', 'required' => true],
            'recipient' => ['label' => 'Penerima', 'type' => 'text', 'required' => true],
            'date' => ['label' => 'Tanggal', 'type' => 'date', 'required' => true],
            'fileUrl' => ['label' => 'URL file', 'type' => 'text'],
            'status' => ['label' => 'Status', 'type' => 'select', 'options' => ['RECEIVED' => 'Diterima', 'PROCESSED' => 'Diproses', 'ARCHIVED' => 'Arsip']],
            'notes' => ['label' => 'Catatan', 'type' => 'textarea', 'rows' => 3],
        ],
    ],
    'keuangan' => [
        'table' => 'Finance', 'label' => 'Keuangan', 'owner' => 'createdById', 'updated' => false, 'adminOnly' => true,
        'order' => 'date DESC',
        'list' => ['date' => 'Tanggal', 'type' => 'Jenis', 'category' => 'Kategori', 'description' => 'Keterangan', 'amount' => 'Jumlah'],
        'fields' => [
            'date' => ['label' => 'Tanggal', 'type' => 'date', 'required' => true],
            'type' => ['label' => 'Jenis', 'type' => 'select', 'options' => ['INCOME' => 'Pemasukan', 'EXPENSE' => 'Pengeluaran']],
            'category' => ['label' => 'Kategori', 'type' => 'text', 'required' => true],
            'description' => ['label' => 'Keterangan', 'type' => 'textarea', 'rows' => 3, 'required' => true],
            'amount' => ['label' => 'Jumlah (Rp)', 'type' => 'number', 'required' => true],
            'reference' => ['label' => 'Referensi', 'type' => 'text'],
        ],
    ],
    'organisasi' => [
        'table' => 'Organization', 'label' => 'Organisasi', 'owner' => 'createdById', 'updated' => true, 'adminOnly' => true,
        'order' => 'sortOrder ASC, name ASC',
        'list' => ['name' => 'Nama', 'type' => 'Jenis', 'leader' => 'Ketua', 'isActive' => 'Aktif'],
        'fields' => [
            'name' => ['label' => 'Nama organisasi', 'type' => 'text', 'required' => true],
            'type' => ['label' => 'Jenis', 'type' => 'select', 'options' => ['DPD' => 'DPD', 'OKP' => 'OKP', 'SAYAP' => 'Sayap']],
            'leader' => ['label' => 'Ketua', 'type' => 'text'],
            'address' => ['label' => 'Alamat', 'type' => 'text'],
            'phone' => ['label' => 'Telepon', 'type' => 'text'],
            'email' => ['label' => 'Email', 'type' => 'text'],
            'website' => ['label' => 'Website', 'type' => 'text'],
            'logoUrl' => ['label' => 'URL logo', 'type' => 'text'],
            'description' => ['label' => 'Deskripsi', 'type' => 'textarea', 'rows' => 4],
            'sortOrder' => ['label' => 'Urutan', 'type' => 'number'],
            'isActive' => ['label' => 'Aktif', 'type' => 'checkbox'],
        ],
    ],
    'pengguna' => [
        'table' => 'User', 'label' => 'Pengguna', 'owner' => null, 'updated' => true, 'adminOnly' => true,
        'order' => 'createdAt DESC',
        'list' => ['name' => 'Nama', 'email' => 'Email', 'role' => 'Peran', 'isActive' => 'Aktif'],
        'fields' => [
            'name' => ['label' => 'Nama', 'type' => 'text', 'required' => true],
            'email' => ['label' => 'Email', 'type' => 'text', 'required' => true],
            'password' => ['label' => 'Kata sandi', 'type' => 'password', 'hint' => 'Kosongkan saat edit bila tidak diubah'],
            'role' => ['label' => 'Peran', 'type' => 'select', 'options' => ['ADMIN' => 'Administrator', 'EDITOR' => 'Editor', 'MEMBER' => 'Anggota']],
            'phone' => ['label' => 'Telepon', 'type' => 'text'],
            'isActive' => ['label' => 'Aktif', 'type' => 'checkbox'],
        ],
    ],
];

$key = (string) ($_GET['m'] ?? '');
if (!isset($modules[$key])) {
    http_response_code(404);
    exit('Modul tidak ditemukan.');
}
$module = $modules[$key];
if (!empty($module['adminOnly'])) {
    admin_require_admin();
}
$table = $module['table'];
$action = (string) ($_GET['action'] ?? 'list');

function fmt_value(string $column, mixed $value): string
{
    if ($value === null || $value === '') {
        return '—';
    }
    if (in_array($column, ['createdAt', 'updatedAt', 'publishedAt', 'startsAt', 'endsAt', 'date'], true)) {
        return tanggal(substr((string) $value, 0, 10));
    }
    if ($column === 'amount') {
        return rupiah((int) $value);
    }
    return (string) $value;
}

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    require_post_csrf();
    $op = post('op');
    try {
        if ($op === 'delete') {
            $id = post('id');
            $stmt = db()->prepare("DELETE FROM `$table` WHERE `id` = ?");
            $stmt->execute([$id]);
            flash($module['label'] . ' dihapus.');
            redirect('crud.php?m=' . $key);
        }

        $id = post('id');
        $data = [];
        foreach ($module['fields'] as $name => $field) {
            $type = $field['type'];
            if ($type === 'checkbox') {
                $data[$name] = isset($_POST[$name]) ? 1 : 0;
                continue;
            }
            $value = post($name);
            if ($type === 'password') {
                if ($value !== '') {
                    $data['passwordHash'] = password_hash($value, PASSWORD_BCRYPT, ['cost' => 12]);
                }
                continue;
            }
            if (($field['required'] ?? false) && $value === '') {
                throw new RuntimeException($field['label'] . ' wajib diisi.');
            }
            if ($type === 'number') {
                $data[$name] = $value === '' ? null : (int) $value;
                continue;
            }
            if ($type === 'datetime') {
                $data[$name] = $value === '' ? null : str_replace('T', ' ', $value) . (strlen($value) === 16 ? ':00' : '');
                continue;
            }
            if ($type === 'date') {
                $data[$name] = $value === '' ? null : $value . ' 00:00:00';
                continue;
            }
            $data[$name] = $value === '' ? null : $value;
        }

        if ($key === 'berita' && empty($data['slug'])) {
            $data['slug'] = slugify((string) ($data['title'] ?? ''));
        }
        if ($key === 'agenda' && empty($data['slug'])) {
            $data['slug'] = slugify((string) ($data['title'] ?? ''));
        }
        if ($key === 'berita' && ($data['status'] ?? '') === 'PUBLISHED' && empty($data['publishedAt'])) {
            $data['publishedAt'] = date('Y-m-d H:i:s');
        }

        if ($id !== '') {
            $sets = [];
            $values = [];
            foreach ($data as $column => $value) {
                $sets[] = "`$column` = ?";
                $values[] = $value;
            }
            if ($module['updated']) {
                $sets[] = '`updatedAt` = NOW(3)';
            }
            $values[] = $id;
            $stmt = db()->prepare("UPDATE `$table` SET " . implode(', ', $sets) . ' WHERE `id` = ?');
            $stmt->execute($values);
            flash($module['label'] . ' diperbarui.');
        } else {
            if ($key === 'pengguna' && empty($data['passwordHash'])) {
                throw new RuntimeException('Kata sandi wajib diisi untuk pengguna baru.');
            }
            $columns = ['`id`'];
            $marks = ['?'];
            $values = [new_id()];
            foreach ($data as $column => $value) {
                $columns[] = "`$column`";
                $marks[] = '?';
                $values[] = $value;
            }
            if ($module['owner']) {
                $columns[] = '`' . $module['owner'] . '`';
                $marks[] = '?';
                $values[] = $user['id'];
            }
            $columns[] = '`createdAt`';
            $marks[] = 'NOW(3)';
            if ($module['updated']) {
                $columns[] = '`updatedAt`';
                $marks[] = 'NOW(3)';
            }
            $stmt = db()->prepare("INSERT INTO `$table` (" . implode(', ', $columns) . ') VALUES (' . implode(', ', $marks) . ')');
            $stmt->execute($values);
            flash($module['label'] . ' ditambahkan.');
        }
        redirect('crud.php?m=' . $key);
    } catch (Throwable $exception) {
        flash($exception->getMessage(), 'err');
        redirect('crud.php?m=' . $key . ($id !== '' ? '&action=edit&id=' . urlencode($id) : '&action=new'));
    }
}

$editing = null;
if ($action === 'edit' || $action === 'new') {
    if ($action === 'edit') {
        $stmt = db()->prepare("SELECT * FROM `$table` WHERE `id` = ? LIMIT 1");
        $stmt->execute([(string) ($_GET['id'] ?? '')]);
        $editing = $stmt->fetch();
        if (!$editing) {
            flash('Data tidak ditemukan.', 'err');
            redirect('crud.php?m=' . $key);
        }
    }

    admin_header(($action === 'edit' ? 'Edit ' : 'Tambah ') . $module['label'], $key);
    ?>
    <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div><h1 class="text-2xl font-extrabold tracking-tight text-navy"><?= $action === 'edit' ? 'Edit' : 'Tambah' ?> <?= e($module['label']) ?></h1><p class="mt-1 text-sm text-muted">Isi data lalu simpan.</p></div>
      <a href="crud.php?m=<?= e($key) ?>" class="btn-outline">Kembali</a>
    </div>
    <form method="post" class="surface max-w-3xl p-6">
      <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
      <input type="hidden" name="op" value="save">
      <input type="hidden" name="id" value="<?= e((string) ($editing['id'] ?? '')) ?>">
      <?php foreach ($module['fields'] as $name => $field): ?>
        <?php
          $type = $field['type'];
          $value = $editing[$name] ?? '';
          if ($type === 'datetime' && $value) { $value = str_replace(' ', 'T', substr((string) $value, 0, 16)); }
          if ($type === 'date' && $value) { $value = substr((string) $value, 0, 10); }
          $required = $field['required'] ?? false;
        ?>
        <div class="mb-4">
          <label class="label" for="f-<?= e($name) ?>"><?= e($field['label']) ?><?= $required ? ' *' : '' ?></label>
          <?php if ($type === 'textarea'): ?>
            <textarea class="input" id="f-<?= e($name) ?>" name="<?= e($name) ?>" rows="<?= (int) ($field['rows'] ?? 4) ?>" <?= $required ? 'required' : '' ?>><?= e((string) $value) ?></textarea>
          <?php elseif ($type === 'select'): ?>
            <select class="input" id="f-<?= e($name) ?>" name="<?= e($name) ?>">
              <?php foreach ($field['options'] as $optionValue => $optionLabel): ?>
                <option value="<?= e((string) $optionValue) ?>" <?= (string) $value === (string) $optionValue ? 'selected' : '' ?>><?= e($optionLabel) ?></option>
              <?php endforeach; ?>
            </select>
          <?php elseif ($type === 'checkbox'): ?>
            <label class="inline-flex items-center gap-2 text-sm"><input type="checkbox" name="<?= e($name) ?>" value="1" <?= (int) $value === 1 ? 'checked' : '' ?> class="h-4 w-4"> <?= e($field['label']) ?></label>
          <?php elseif ($type === 'password'): ?>
            <input class="input" type="password" id="f-<?= e($name) ?>" name="<?= e($name) ?>" autocomplete="new-password">
          <?php else: ?>
            <input class="input" type="<?= e($type) ?>" id="f-<?= e($name) ?>" name="<?= e($name) ?>" value="<?= e((string) $value) ?>" <?= $required ? 'required' : '' ?>>
          <?php endif; ?>
          <?php if (!empty($field['hint'])): ?><p class="mt-1 text-xs text-muted"><?= e($field['hint']) ?></p><?php endif; ?>
        </div>
      <?php endforeach; ?>
      <div class="flex gap-2"><button type="submit" class="btn-primary">Simpan</button><a href="crud.php?m=<?= e($key) ?>" class="btn-outline">Batal</a></div>
    </form>
    <?php
    admin_footer();
    exit;
}

$rows = db()->query("SELECT * FROM `$table` ORDER BY " . $module['order'] . ' LIMIT 200')->fetchAll();
admin_header($module['label'], $key);
?>
<div class="mb-6 flex flex-wrap items-end justify-between gap-3">
  <div><h1 class="text-2xl font-extrabold tracking-tight text-navy"><?= e($module['label']) ?></h1><p class="mt-1 text-sm text-muted"><?= count($rows) ?> data ditampilkan.</p></div>
  <a href="crud.php?m=<?= e($key) ?>&action=new" class="btn-primary"><?= icon('plus', 'h-4 w-4') ?>Tambah <?= e($module['label']) ?></a>
</div>
<div class="surface overflow-hidden">
  <div class="overflow-x-auto">
    <table class="w-full min-w-[720px] border-collapse text-sm">
      <thead><tr class="bg-canvas text-left text-xs font-bold uppercase tracking-wide text-muted">
        <?php foreach ($module['list'] as $label): ?><th class="px-4 py-3"><?= e($label) ?></th><?php endforeach; ?>
        <th class="px-4 py-3 text-right">Aksi</th>
      </tr></thead>
      <tbody>
        <?php if (!$rows): ?><tr><td colspan="<?= count($module['list']) + 1 ?>" class="px-4 py-8 text-center text-sm text-muted">Belum ada data.</td></tr><?php endif; ?>
        <?php foreach ($rows as $row): ?>
          <tr class="border-t border-line align-top">
            <?php foreach (array_keys($module['list']) as $column): ?>
              <?php $raw = $row[$column] ?? null; ?>
              <td class="px-4 py-3">
                <?php if (in_array($column, ['status', 'type', 'role'], true)): ?>
                  <span class="<?= e(badge_for((string) $raw)) ?>"><?= e(fmt_value($column, $raw)) ?></span>
                <?php elseif ($column === 'isActive' || $column === 'isPublished'): ?>
                  <span class="<?= e(badge_for((int) $raw === 1 ? 'ACTIVE' : 'SUSPENDED')) ?>"><?= (int) $raw === 1 ? 'Ya' : 'Tidak' ?></span>
                <?php else: ?>
                  <span class="<?= in_array($column, ['title', 'name', 'subject', 'number', 'description', 'email'], true) ? 'font-semibold text-navy' : 'text-muted' ?>"><?= e(fmt_value($column, $raw)) ?></span>
                <?php endif; ?>
              </td>
            <?php endforeach; ?>
            <td class="whitespace-nowrap px-4 py-3 text-right">
              <a href="crud.php?m=<?= e($key) ?>&action=edit&id=<?= e((string) $row['id']) ?>" class="btn-outline min-h-8 px-2.5 text-xs">Edit</a>
              <form method="post" class="inline" onsubmit="return confirm('Hapus data ini?')">
                <input type="hidden" name="csrf" value="<?= e(csrf_token()) ?>">
                <input type="hidden" name="op" value="delete">
                <input type="hidden" name="id" value="<?= e((string) $row['id']) ?>">
                <button type="submit" class="btn min-h-8 rounded-xl border border-red-200 px-2.5 text-xs text-danger hover:bg-red-50">Hapus</button>
              </form>
            </td>
          </tr>
        <?php endforeach; ?>
      </tbody>
    </table>
  </div>
</div>
<?php admin_footer(); ?>
