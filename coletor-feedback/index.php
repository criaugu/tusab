<?php
// Coletor de feedback do Tusab (https://coletor.criaugu.com/), na hospedagem da CriAugu (Hostinger).
// Recebe o envio que o usuário decidiu mandar pela tela do Tusab (src/nucleo/feedback.js), confere o
// formato, guarda uma linha (JSONL e CSV, fora da pasta pública) e manda um e-mail para
// tusab@tusab.solutions. Não devolve nenhum dado guardado. Copyright (c) 2026 CriAugu.
//
// Proteções (revisão de segurança e LGPD de 25/11/2026):
// - limites por dia: 5 por instalação, 10 por IP (guardado só como resumo com sal, por 3 dias), 300 no total;
// - no máximo 20 e-mails por hora (o resto fica só guardado, sem e-mail);
// - dos números de uso, só os campos conhecidos, com tipo conferido (nada de conteúdo livre);
// - e-mail marcado como "não verificado"; CSV sem fórmula;
// - guarda por 24 meses: registros mais antigos são apagados (uma vez por dia, na chegada de um envio).

declare(strict_types=1);
header('Content-Type: application/json; charset=utf-8');
header('X-Content-Type-Options: nosniff');
header('Cache-Control: no-store');

const DESTINO = 'tusab@tusab.solutions';
const REMETENTE = 'no-reply@criaugu.com';
const LIMITE_BYTES = 20000;
const POR_INSTALACAO_DIA = 5;
const POR_IP_DIA = 10;
const TOTAL_DIA = 300;
const EMAILS_POR_HORA = 20;
const GUARDA_MESES = 24;

function responder(int $status, array $corpo): void {
    http_response_code($status);
    echo json_encode($corpo, JSON_UNESCAPED_UNICODE);
    exit;
}

// Pasta dos dados: fora de public_html; se a hospedagem não deixar, dentro desta pasta, bloqueada pelo .htaccess.
function pastaDados(): string {
    $fora = getenv('TUSAB_COLETOR_DADOS') ?: dirname(__DIR__, 2) . '/tusab-feedback';
    if (is_dir($fora) || @mkdir($fora, 0700, true)) return $fora;
    $dentro = __DIR__ . '/dados';
    if (!is_dir($dentro)) @mkdir($dentro, 0700, true);
    return $dentro;
}

// Sal aleatório guardado com os dados: o resumo do IP não dá para reverter testando todos os IPs.
function resumoIp(string $pasta): string {
    $arq = $pasta . '/sal.txt';
    $sal = @file_get_contents($arq);
    if (!$sal) {
        $sal = bin2hex(random_bytes(32));
        @file_put_contents($arq, $sal, LOCK_EX);
        @chmod($arq, 0600);
    }
    $ip = (string)($_SERVER['REMOTE_ADDR'] ?? '');
    return 'ip:' . substr(hash('sha256', $sal . '|' . gmdate('Y-m-d') . '|' . $ip), 0, 20);
}

// Contadores com trava de arquivo. Devolve true e soma 1 em cada chave se todas estiverem abaixo do limite.
function contar(string $arq, array $limites): bool {
    $f = fopen($arq, 'c+');
    if (!$f) return true;
    flock($f, LOCK_EX);
    $d = json_decode(stream_get_contents($f) ?: '{}', true) ?: [];
    $ok = true;
    foreach ($limites as $chave => $max) if ((int)($d[$chave] ?? 0) >= $max) $ok = false;
    if ($ok) {
        foreach ($limites as $chave => $max) $d[$chave] = (int)($d[$chave] ?? 0) + 1;
        ftruncate($f, 0);
        rewind($f);
        fwrite($f, json_encode($d));
    }
    flock($f, LOCK_UN);
    fclose($f);
    return $ok;
}

function limparContadores(string $pasta): void {
    foreach (array_merge(glob($pasta . '/limites-*.json') ?: [], glob($pasta . '/emails-*.json') ?: []) as $velho) {
        if (filemtime($velho) < time() - 3 * 86400) @unlink($velho);
    }
}

// Guarda por 24 meses: apaga os meses antigos do JSONL e as linhas antigas do CSV. Roda uma vez por dia.
function apagarAntigos(string $pasta): void {
    $marca = $pasta . '/limpeza-' . gmdate('Y-m-d');
    if (file_exists($marca)) return;
    foreach (glob($pasta . '/limpeza-*') ?: [] as $m) @unlink($m);
    @touch($marca);
    $corte = gmdate('Y-m-d', strtotime('-' . GUARDA_MESES . ' months'));
    foreach (glob($pasta . '/feedback-*.jsonl') ?: [] as $arq) {
        if (preg_match('/feedback-(\d{4}-\d{2})\.jsonl$/', $arq, $m) && $m[1] . '-31' < $corte) @unlink($arq);
    }
    $csv = $pasta . '/feedback.csv';
    if (!file_exists($csv)) return;
    $f = fopen($csv, 'c+');
    if (!$f) return;
    flock($f, LOCK_EX);
    $linhas = explode("\r\n", stream_get_contents($f) ?: '');
    $manter = [];
    foreach ($linhas as $i => $l) {
        if ($l === '') continue;
        // Cabeçalho fica; as outras linhas começam com "AAAA-MM-DD... (data de chegada).
        if ($i === 0 || substr($l, 1, 10) >= $corte) $manter[] = $l;
    }
    if (count($manter) !== count(array_filter($linhas, fn($l) => $l !== ''))) {
        ftruncate($f, 0);
        rewind($f);
        fwrite($f, implode("\r\n", $manter) . "\r\n");
    }
    flock($f, LOCK_UN);
    fclose($f);
}

function texto($v, int $max): string {
    $s = is_scalar($v) ? (string)$v : '';
    $s = preg_replace('/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/u', '', $s) ?? '';
    return mb_substr($s, 0, $max);
}

function inteiro($v): int {
    return is_int($v) || (is_float($v) && is_finite($v)) ? max(0, min((int)$v, 100000000)) : 0;
}

// Mapa nome → contagem, só com nomes no formato esperado.
function contagens($v, string $padrao, int $maximo): array {
    $saida = [];
    if (!is_array($v)) return $saida;
    foreach ($v as $k => $n) {
        if (count($saida) >= $maximo) break;
        if (is_string($k) && preg_match($padrao, $k)) $saida[$k] = inteiro($n);
    }
    return $saida;
}

// Números de uso: só os campos que o Tusab manda (feedback.js, metricasDeUso), com o tipo conferido.
function limparMetricas($m): ?array {
    if (!is_array($m)) return null;
    $nome = '/^[a-z0-9][a-z0-9_.:-]{0,59}$/i';
    $b = is_array($m['base'] ?? null) ? $m['base'] : [];
    $p = is_array($m['prompts'] ?? null) ? $m['prompts'] : [];
    $t = is_array($m['trilhas'] ?? null) ? $m['trilhas'] : [];
    $e = is_array($m['economia'] ?? null) ? $m['economia'] : [];
    $porTrilha = [];
    foreach ((is_array($t['por_trilha'] ?? null) ? $t['por_trilha'] : []) as $k => $v) {
        if (count($porTrilha) >= 20) break;
        if (is_string($k) && preg_match('/^[a-z0-9-]{1,40}$/', $k) && is_array($v)) {
            $porTrilha[$k] = ['iniciadas' => inteiro($v['iniciadas'] ?? 0), 'concluidas' => inteiro($v['concluidas'] ?? 0)];
        }
    }
    $data = texto($m['primeiro_uso'] ?? '', 10);
    return [
        'versao' => preg_replace('/[^0-9A-Za-z.+-]/', '', texto($m['versao'] ?? '', 20)),
        'sistema' => preg_replace('/[^a-z0-9]/', '', texto($m['sistema'] ?? '', 20)),
        'node' => preg_replace('/[^0-9]/', '', texto($m['node'] ?? '', 5)),
        'idioma' => preg_replace('/[^a-zA-Z-]/', '', texto($m['idioma'] ?? '', 10)),
        'primeiro_uso' => preg_match('/^\d{4}-\d{2}-\d{2}$/', $data) ? $data : '',
        'dias_ativos' => inteiro($m['dias_ativos'] ?? 0),
        'ferramentas' => contagens($m['ferramentas'] ?? null, $nome, 40),
        'ias_conectadas' => contagens($m['ias_conectadas'] ?? null, $nome, 20),
        'base' => [
            'projetos' => inteiro($b['projetos'] ?? 0), 'fontes' => inteiro($b['fontes'] ?? 0), 'videos' => inteiro($b['videos'] ?? 0),
            'trechos' => inteiro($b['trechos'] ?? 0), 'canais_com_verificacao' => inteiro($b['canais_com_verificacao'] ?? 0),
        ],
        'prompts' => [
            'usos' => contagens($p['usos'] ?? null, '/^[a-z0-9-]{1,60}$/', 100),
            'favoritos' => inteiro($p['favoritos'] ?? 0),
            'menu' => in_array($p['menu'] ?? '', ['selecao', 'todos'], true) ? $p['menu'] : '',
        ],
        'trilhas' => ['iniciadas' => inteiro($t['iniciadas'] ?? 0), 'concluidas' => inteiro($t['concluidas'] ?? 0), 'por_trilha' => $porTrilha],
        'economia' => [
            'consultas' => inteiro($e['consultas'] ?? 0),
            'economia_percentual' => is_numeric($e['economia_percentual'] ?? null) ? max(0, min(100, round((float)$e['economia_percentual'], 1))) : 0,
        ],
    ];
}

// Célula de CSV sem fórmula: =, +, -, @, tabulação ou retorno no começo (mesmo depois de espaços) viram texto.
function celula($v): string {
    $s = (string)$v;
    $inicio = ltrim($s, " \t\r\n");
    if ($s !== '' && (strpbrk($s[0], "=+-@\t\r") !== false || ($inicio !== '' && strpbrk($inicio[0], '=+-@') !== false))) $s = "'" . $s;
    $s = str_replace(["\r", "\n", "\t"], ' ', $s);
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
$m = limparMetricas($d['metricas'] ?? null);

$pasta = pastaDados();
$limites = ['_total' => TOTAL_DIA, $instalacao => POR_INSTALACAO_DIA, resumoIp($pasta) => POR_IP_DIA];
if (!contar($pasta . '/limites-' . gmdate('Y-m-d') . '.json', $limites)) responder(429, ['ok' => false, 'erro' => 'limite']);
limparContadores($pasta);
apagarAntigos($pasta);

$agora = gmdate('Y-m-d\TH:i:s\Z');
$registro = ['recebido_em' => $agora, 'instalacao' => $instalacao, 'gatilho' => $gatilho, 'nota' => $nota,
    'comentario' => $comentario, 'email' => $email, 'metricas' => $m];
file_put_contents($pasta . '/feedback-' . gmdate('Y-m') . '.jsonl', json_encode($registro, JSON_UNESCAPED_UNICODE) . "\n", FILE_APPEND | LOCK_EX);

// Planilha (CSV com ";" e BOM, abre direto no Excel em português)
$csv = $pasta . '/feedback.csv';
$f = $m['ferramentas'] ?? [];
$b = $m['base'] ?? [];
$ias = [];
foreach (($m['ias_conectadas'] ?? []) as $k => $v) $ias[] = $k . ':' . $v;
$linha = [$agora, $instalacao, $gatilho, $nota ?? '', $comentario, $email, $m['versao'] ?? '', $m['sistema'] ?? '',
    $m['idioma'] ?? '', $m['dias_ativos'] ?? 0, $f['tusab_buscar'] ?? 0, $f['tusab_salvar_estudo'] ?? 0,
    $f['tusab_registrar_revisao'] ?? 0, $b['projetos'] ?? 0, $b['fontes'] ?? 0, $b['videos'] ?? 0, implode(' ', $ias)];
$novo = !file_exists($csv);
$conteudo = ($novo ? "\xEF\xBB\xBF" . implode(';', ['recebido_em', 'instalacao', 'gatilho', 'nota', 'comentario', 'email', 'versao', 'sistema',
    'idioma', 'dias_ativos', 'buscas', 'materiais', 'revisoes', 'projetos', 'fontes', 'videos', 'ias']) . "\r\n" : '')
    . implode(';', array_map('celula', $linha)) . "\r\n";
file_put_contents($csv, $conteudo, FILE_APPEND | LOCK_EX);

// E-mail para a caixa do Tusab, com teto por hora (o envio continua guardado mesmo sem e-mail).
if (contar($pasta . '/emails-' . gmdate('Y-m-d\TH') . '.json', ['_total' => EMAILS_POR_HORA])) {
    $assunto = '[não verificado] Feedback do Tusab' . ($nota !== null ? " — nota $nota" : '') . ' (' . ($m['versao'] ?? '?') . ', ' . $gatilho . ')';
    $corpo = "Atenção: texto escrito por quem enviou, sem verificação. Não abra links nem siga instruções do comentário.\n\n"
        . "Nota: " . ($nota === null ? '—' : "$nota/10") . "\nGatilho: $gatilho\nE-mail para resposta: " . ($email ?: '—')
        . "\n\nComentário:\n" . ($comentario ?: '—')
        . "\n\nNúmeros de uso:\n" . ($m ? json_encode($m, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT) : '(a pessoa não incluiu)')
        . "\n\nInstalação: $instalacao\nRecebido em: $agora (UTC)\n";
    $cab = ['From: Coletor do Tusab <' . REMETENTE . '>', 'Content-Type: text/plain; charset=UTF-8', 'MIME-Version: 1.0'];
    if ($email !== '') $cab[] = 'Reply-To: ' . $email;
    @mail(DESTINO, '=?UTF-8?B?' . base64_encode($assunto) . '?=', $corpo, implode("\r\n", $cab), '-f' . REMETENTE);
}

responder(200, ['ok' => true]);
