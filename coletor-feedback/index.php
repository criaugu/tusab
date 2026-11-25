<?php
// Coletor de feedback do Tusab (https://coletor.criaugu.com/), na hospedagem da CriAugu (Hostinger).
// Recebe o envio que o usuário decidiu mandar pela tela do Tusab (src/nucleo/feedback.js), confere o
// formato, guarda uma linha (JSONL e CSV, fora da pasta pública) e manda um e-mail para
// tusab@tusab.solutions. Não devolve nenhum dado guardado. Copyright (c) 2026 CriAugu.

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const DESTINO = 'tusab@tusab.solutions';
const REMETENTE = 'no-reply@criaugu.com';
const LIMITE_BYTES = 20000;
const POR_INSTALACAO_DIA = 5;
const TOTAL_DIA = 300;

function responder(int $status, array $corpo): void {
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
    exit;
}

// Pasta dos dados: fora de public_html; se a hospedagem não deixar, dentro desta pasta, bloqueada pelo .htaccess.
function pastaDados(): string {
    $fora = dirname(__DIR__, 2) . '/tusab-feedback';
    if (is_dir($fora) || @mkdir($fora, 0700, true)) return $fora;
    $dentro = __DIR__ . '/dados';
    if (!is_dir($dentro)) @mkdir($dentro, 0700, true);
    return $dentro;
}

// Contador por dia com trava de arquivo: no máximo 5 envios por instalação e 300 no total.
function dentroDoLimite(string $pasta, string $instalacao): bool {
    $arq = $pasta . '/limites-' . gmdate('Y-m-d') . '.json';
    $f = fopen($arq, 'c+');
    if (!$f) return true;
    flock($f, LOCK_EX);
    $d = json_decode(stream_get_contents($f) ?: '{}', true) ?: [];
    $total = (int)($d['_total'] ?? 0);
    $deste = (int)($d[$instalacao] ?? 0);
    $ok = $total < TOTAL_DIA && $deste < POR_INSTALACAO_DIA;
    if ($ok) {
        $d['_total'] = $total + 1;
        $d[$instalacao] = $deste + 1;
        ftruncate($f, 0);
        rewind($f);
        fwrite($f, json_encode($d));
    }
    flock($f, LOCK_UN);
    fclose($f);
    foreach (glob($pasta . '/limites-*.json') ?: [] as $velho) {
        if ($velho !== $arq && filemtime($velho) < time() - 3 * 86400) @unlink($velho);
    }
    return $ok;
}

function texto($v, int $max): string {
    $s = is_scalar($v) ? (string)$v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

// Célula de CSV sem fórmula (=, +, -, @ no começo viram texto).
function celula($v): string {
    $s = str_replace(["\r", "\n"], ' ', (string)$v);
    if ($s !== '' && strpbrk($s[0], '=+-@') !== false) $s = "'" . $s;
    return '"' . str_replace('"', '""', $s) . '"';
}

if ($_SERVER['REQUEST_METHOD'] === 'GET') responder(200, ['ok' => true, 'servico' => 'tusab-feedback']);
if ($_SERVER['REQUEST_METHOD'] !== 'POST') responder(405, ['ok' => false, 'erro' => 'metodo']);

$bruto = file_get_contents('php://input', false, null, 0, LIMITE_BYTES + 1);
if ($bruto === false || $bruto === '' || strlen($bruto) > LIMITE_BYTES) responder(413, ['ok' => false, 'erro' => 'tamanho']);
$d = json_decode($bruto, true);
if (!is_array($d) || ($d['tipo'] ?? '') !== 'tusab-feedback' || ($d['formato'] ?? 0) !== 1) responder(400, ['ok' => false, 'erro' => 'formato']);
$instalacao = (string)($d['instalacao'] ?? '');
if (!preg_match('/^[0-9a-f-]{36}$/', $instalacao)) responder(400, ['ok' => false, 'erro' => 'instalacao']);
$nota = $d['nota'] ?? null;
if ($nota !== null && !(is_int($nota) && $nota >= 0 && $nota <= 10)) responder(400, ['ok' => false, 'erro' => 'nota']);
$comentario = texto($d['comentario'] ?? '', 1500);
$email = texto($d['email'] ?? '', 200);
if ($email !== '' && !filter_var($email, FILTER_VALIDATE_EMAIL)) $email = '';
$gatilho = preg_replace('/[^a-z_]/', '', texto($d['gatilho'] ?? 'manual', 40)) ?: 'manual';
if ($nota === null && $comentario === '') responder(400, ['ok' => false, 'erro' => 'vazio']);
$m = is_array($d['metricas'] ?? null) ? $d['metricas'] : null;

$pasta = pastaDados();
if (!dentroDoLimite($pasta, $instalacao)) responder(429, ['ok' => false, 'erro' => 'limite']);

$agora = gmdate('Y-m-d\TH:i:s\Z');
$registro = ['recebido_em' => $agora, 'instalacao' => $instalacao, 'gatilho' => $gatilho, 'nota' => $nota,
    'comentario' => $comentario, 'email' => $email, 'metricas' => $m];
file_put_contents($pasta . '/feedback-' . gmdate('Y-m') . '.jsonl', json_encode($registro, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// Planilha (CSV com ";" e BOM, abre direto no Excel em português)
$csv = $pasta . '/feedback.csv';
$f = $m['ferramentas'] ?? [];
$b = $m['base'] ?? [];
$ias = [];
foreach (($m['ias_conectadas'] ?? []) as $k => $v) $ias[] = texto($k, 40) . ':' . (int)$v;
$linha = [$agora, $instalacao, $gatilho, $nota ?? '', $comentario, $email, texto($m['versao'] ?? '', 20), texto($m['sistema'] ?? '', 20),
    texto($m['idioma'] ?? '', 10), (int)($m['dias_ativos'] ?? 0), (int)($f['tusab_buscar'] ?? 0), (int)($f['tusab_salvar_estudo'] ?? 0),
    (int)($f['tusab_registrar_revisao'] ?? 0), (int)($b['projetos'] ?? 0), (int)($b['fontes'] ?? 0), (int)($b['videos'] ?? 0), implode(' ', $ias)];
$novo = !file_exists($csv);
$conteudo = ($novo ? "\xEF\xBB\xBF" . implode(';', ['recebido_em', 'instalacao', 'gatilho', 'nota', 'comentario', 'email', 'versao', 'sistema',
    'idioma', 'dias_ativos', 'buscas', 'materiais', 'revisoes', 'projetos', 'fontes', 'videos', 'ias']) . "\r\n" : '')
    . implode(';', array_map('celula', $linha)) . "\r\n";
file_put_contents($csv, $conteudo, FILE_APPEND | LOCK_EX);

// E-mail para a caixa do Tusab
$assunto = 'Feedback do Tusab' . ($nota !== null ? " — nota $nota" : '') . ' (' . texto($m['versao'] ?? '?', 20) . ', ' . $gatilho . ')';
$corpo = "Nota: " . ($nota === null ? '—' : "$nota/10") . "\nGatilho: $gatilho\nE-mail para resposta: " . ($email ?: '—')
    . "\n\nComentário:\n" . ($comentario ?: '—')
    . "\n\nNúmeros de uso:\n" . ($m ? json_encode($m, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : '(a pessoa não incluiu)')
    . "\n\nInstalação: $instalacao\nRecebido em: $agora (UTC)\n";
$cab = ['From: Coletor do Tusab <' . REMETENTE . '>', 'Content-Type: text/plain; charset=UTF-8', 'MIME-Version: 1.0'];
if ($email !== '') $cab[] = 'Reply-To: ' . $email;
@mail(DESTINO, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, implode("\r\n", $cab), '-f' . REMETENTE);

responder(200, ['ok' => true]);
