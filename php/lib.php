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

function base_url(string $path = ''): string
{
    $base = rtrim((string) cfg('app_url', ''), '/');
    return $base . '/' . ltrim($path, '/');
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
