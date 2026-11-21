<?php
declare(strict_types=1);

if (session_status() !== PHP_SESSION_ACTIVE) {
    // Hosting ini punya session.save_path global yang tidak ada; pakai folder sendiri.
    $sessionDir = dirname(__DIR__) . '/.php-sessions';
    if (!is_dir($sessionDir)) {
        @mkdir($sessionDir, 0700, true);
    }
    if (is_dir($sessionDir) && is_writable($sessionDir)) {
        ini_set('session.save_path', $sessionDir);
    }

    session_set_cookie_params([
        'httponly' => true,
        'samesite' => 'Lax',
        'secure' => (($_SERVER['HTTPS'] ?? '') === 'on') || (($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https'),
    ]);
    session_start();
}

const APP_NAME = 'KNPI Morowali';

function config_file(): string
{
    return __DIR__ . '/config.php';
}

function config(): ?array
{
    static $config = false;
    if ($config === false) {
        $config = is_file(config_file()) ? (require config_file()) : null;
    }
    return $config;
}

function cfg(string $key, mixed $default = null): mixed
{
    $config = config();
    if (!$config) {
        return $default;
    }
    $parts = explode('.', $key);
    $value = $config;
    foreach ($parts as $part) {
        if (!is_array($value) || !array_key_exists($part, $value)) {
            return $default;
        }
        $value = $value[$part];
    }
    return $value;
}

function db(): PDO
{
    static $pdo = null;
    if ($pdo instanceof PDO) {
        return $pdo;
    }
    $config = config();
    if (!$config) {
        throw new RuntimeException('config.php belum ada.');
    }
    $db = $config['db'];
    $dsn = sprintf('mysql:host=%s;dbname=%s;charset=utf8mb4', $db['host'], $db['name']);
    $pdo = new PDO($dsn, $db['user'], $db['pass'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    return $pdo;
}

function e(mixed $value): string
{
    return htmlspecialchars((string) $value, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

function is_installed(): bool
{
    try {
        return (int) db()->query('SELECT COUNT(*) FROM `User`')->fetchColumn() > 0;
    } catch (Throwable $error) {
        return false;
    }
}

function current_user(): ?array
{
    if (empty($_SESSION['user_id'])) {
        return null;
    }
    try {
        $stmt = db()->prepare('SELECT id, email, name, role, isActive FROM `User` WHERE id = ? LIMIT 1');
        $stmt->execute([$_SESSION['user_id']]);
        $user = $stmt->fetch();
        return ($user && (int) $user['isActive'] === 1) ? $user : null;
    } catch (Throwable $error) {
        return null;
    }
}

function redirect(string $path): never
{
    header('Location: ' . $path, true, 302);
    exit;
}

function csrf_token(): string
{
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(24));
    }
    return $_SESSION['csrf'];
}

function csrf_ok(?string $token): bool
{
    return is_string($token) && !empty($_SESSION['csrf']) && hash_equals($_SESSION['csrf'], $token);
}

function settings_map(): array
{
    try {
        $rows = db()->query('SELECT `key`, `value` FROM `Setting`')->fetchAll();
        $map = [];
        foreach ($rows as $row) {
            $map[$row['key']] = $row['value'];
        }
        return $map;
    } catch (Throwable $error) {
        return [];
    }
}

function setting(array $map, string $key, string $default = ''): string
{
    $value = $map[$key] ?? '';
    return $value !== '' ? $value : $default;
}

function tanggal(?string $value): string
{
    if (!$value) {
        return '';
    }
    $time = strtotime($value);
    if ($time === false) {
        return '';
    }
    $bulan = [1 => 'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];
    return date('j', $time) . ' ' . $bulan[(int) date('n', $time)] . ' ' . date('Y', $time);
}

function rupiah(int|float $value): string
{
    return 'Rp ' . number_format((float) $value, 0, ',', '.');
}

function image_src(string $value): string
{
    if ($value === '') {
        return '/images/hero.jpg';
    }
    return str_starts_with($value, 'http') ? $value : '/' . ltrim($value, '/');
}

function tracking_code(): string
{
    return 'ASP-' . strtoupper(substr(bin2hex(random_bytes(4)), 0, 8));
}

function upload_file(string $field, string $subdir, array $allowed = ['jpg', 'jpeg', 'png', 'webp', 'pdf'], int $maxBytes = 5242880): ?string
{
    if (empty($_FILES[$field]) || ($_FILES[$field]['error'] ?? UPLOAD_ERR_NO_FILE) === UPLOAD_ERR_NO_FILE) {
        return null;
    }
    $file = $_FILES[$field];
    if (($file['error'] ?? UPLOAD_ERR_OK) !== UPLOAD_ERR_OK) {
        throw new RuntimeException('Upload gagal (kode ' . (int) $file['error'] . ').');
    }
    if (($file['size'] ?? 0) > $maxBytes) {
        throw new RuntimeException('Ukuran file maksimal ' . round($maxBytes / 1048576, 1) . ' MB.');
    }
    $ext = strtolower(pathinfo((string) $file['name'], PATHINFO_EXTENSION));
    if (!in_array($ext, $allowed, true)) {
        throw new RuntimeException('Tipe file tidak diizinkan. Gunakan: ' . implode(', ', $allowed) . '.');
    }
    if (!is_uploaded_file((string) $file['tmp_name'])) {
        throw new RuntimeException('File upload tidak valid.');
    }
    $subdir = trim(preg_replace('/[^a-z0-9_-]/i', '', $subdir) ?? 'misc', '/');
    $dir = dirname(__DIR__) . '/uploads/' . $subdir;
    if (!is_dir($dir) && !@mkdir($dir, 0755, true)) {
        throw new RuntimeException('Folder upload tidak dapat dibuat.');
    }
    $name = date('Ymd') . '-' . bin2hex(random_bytes(8)) . '.' . $ext;
    if (!move_uploaded_file((string) $file['tmp_name'], $dir . '/' . $name)) {
        throw new RuntimeException('Gagal menyimpan file upload.');
    }
    return '/uploads/' . $subdir . '/' . $name;
}

function new_id(): string
{
    return 'c' . bin2hex(random_bytes(12));
}

function badge_for(string $value): string
{
    $map = [
        'PUBLISHED' => 'bg-emerald-50 text-success', 'DRAFT' => 'bg-amber-50 text-warning', 'ARCHIVED' => 'bg-canvas text-muted',
        'ACTIVE' => 'bg-emerald-50 text-success', 'PENDING' => 'bg-amber-50 text-warning', 'REJECTED' => 'bg-red-50 text-danger', 'SUSPENDED' => 'bg-canvas text-muted',
        'NEW' => 'bg-amber-50 text-warning', 'IN_PROGRESS' => 'bg-brand-50 text-brand-700', 'RESOLVED' => 'bg-emerald-50 text-success',
        'INCOME' => 'bg-emerald-50 text-success', 'EXPENSE' => 'bg-red-50 text-danger',
        'RECEIVED' => 'bg-brand-50 text-brand-700', 'PROCESSED' => 'bg-brand-50 text-brand-700', 'ARCHIVED_LETTER' => 'bg-canvas text-muted',
        'SCHEDULED' => 'bg-brand-50 text-brand-700', 'COMPLETED' => 'bg-emerald-50 text-success', 'CANCELLED' => 'bg-red-50 text-danger',
        'OKP' => 'bg-brand-50 text-brand-700', 'SAYAP' => 'bg-yellow-100 text-navy', 'DPD' => 'bg-canvas text-muted',
    ];
    return 'badge ' . ($map[$value] ?? 'bg-canvas text-muted');
}
