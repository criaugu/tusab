// Feedback voluntário: contadores locais, quando convidar, o que vai (sem conteúdo) e o envio.
import './_ambiente.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { Tusab } from '../src/nucleo/tusab.js';
import { atenderApi } from '../src/api.js';
import { lerUso } from '../src/nucleo/uso.js';
import { mudarAndamento } from '../src/nucleo/trilhas.js';
import { registrarUso, salvarPromptUsuario } from '../src/nucleo/prompts.js';
import {
  EMAIL_FEEDBACK, conviteFeedback, enviarFeedback, metricasDeUso, montarEnvio, registrarConvite, registrarEnvioPorEmail, urlColetor,
} from '../src/nucleo/feedback.js';

const DIA = 24 * 60 * 60 * 1000;
const novaBase = async () => Tusab.abrir(fs.mkdtempSync(path.join(os.tmpdir(), 'tusab-feedback-')));
const escreverUso = (raiz, uso) => fs.writeFileSync(path.join(raiz, 'data', 'config', 'uso.json'), JSON.stringify(uso));

test('contadores: ferramentas, IAs conectadas e trilha concluída; nomes estranhos não entram', async () => {
  const tusab = await novaBase();
  try {
    tusab.registrarUsoMcp('tusab_buscar');
    tusab.registrarUsoMcp('tusab_buscar');
    tusab.registrarUsoMcp('__proto__ / ../x');
    tusab.conectarMcp({ name: 'Claude AI' }, { id: 'a' });
    tusab.conectarMcp({ name: 'Claude AI' }, { id: 'a' }); // a mesma conexão não conta de novo
    for (let i = 0; i < 3; i++) mudarAndamento(tusab.raiz, { projeto: 'P', trilha: 'checar-texto', acao: 'concluir' });
    mudarAndamento(tusab.raiz, { projeto: 'P', trilha: 'checar-texto', acao: 'concluir' }); // já concluída: não conta
    const u = lerUso(tusab.raiz);
    assert.deepEqual(u.ferramentas, { tusab_buscar: 2 });
    assert.deepEqual(u.clientes, { 'claude-ai': 1 });
    assert.equal(u.eventos.trilha_concluida, 1);
    assert.equal(u.dias_ativos, 1);
  } finally {
    tusab.fechar();
  }
});

test('convite: nunca no começo; gatilhos na ordem; 30 dias entre convites; "agora não" e "não perguntar mais"', async () => {
  const tusab = await novaBase();
  const raiz = tusab.raiz;
  try {
    const agora = Date.parse('2026-12-20T12:00:00Z');
    assert.equal(conviteFeedback(raiz, '2.0.0', agora).mostrar, false, 'base nova: nada');

    escreverUso(raiz, { primeiro_uso: '2026-12-01', ultimo_dia: '2026-12-19', dias_ativos: 3, ferramentas: { tusab_buscar: 10 } });
    assert.deepEqual(conviteFeedback(raiz, '2.0.0', agora), { mostrar: true, gatilho: 'uso_semana' });
    escreverUso(raiz, { primeiro_uso: '2026-12-01', dias_ativos: 3, ferramentas: { tusab_buscar: 10, tusab_salvar_estudo: 5 }, eventos: { trilha_concluida: 1 } });
    assert.equal(conviteFeedback(raiz, '2.0.0', agora).gatilho, 'trilha_concluida', 'trilha concluída vem primeiro');

    registrarConvite(raiz, { acao: 'mostrado', gatilho: 'trilha_concluida' }, '2.0.0', agora);
    assert.equal(conviteFeedback(raiz, '2.0.0', agora + 10 * DIA).mostrar, false, 'menos de 30 dias');
    assert.equal(conviteFeedback(raiz, '2.0.0', agora + 31 * DIA).gatilho, 'materiais', 'a mesma trilha não convida de novo');

    registrarConvite(raiz, { acao: 'adiar' }, '2.0.0', agora + 31 * DIA);
    assert.equal(conviteFeedback(raiz, '2.0.0', agora + 40 * DIA).mostrar, false, 'adiado por 14 dias');
    assert.equal(conviteFeedback(raiz, '2.0.0', agora + 46 * DIA).mostrar, true);

    registrarEnvioPorEmail(raiz, { gatilho: 'materiais' }, '2.0.0', agora + 46 * DIA);
    escreverUso(raiz, { primeiro_uso: '2026-12-01', dias_ativos: 3, ferramentas: { tusab_buscar: 10, tusab_salvar_estudo: 5 }, eventos: { trilha_concluida: 1 } });
    registrarConvite(raiz, { acao: 'mostrado', gatilho: 'materiais' }, '2.0.0', agora + 46 * DIA);
    registrarConvite(raiz, { acao: 'mostrado', gatilho: 'uso_semana' }, '2.0.0', agora + 46 * DIA);
    assert.equal(conviteFeedback(raiz, '2.0.0', agora + 80 * DIA).mostrar, false, 'tudo já convidado');
    assert.equal(conviteFeedback(raiz, '2.1.0', agora + 80 * DIA).gatilho, 'nova_versao', 'versão nova de quem já mandou feedback');

    registrarConvite(raiz, { acao: 'nunca' }, '2.1.0', agora + 80 * DIA);
    assert.equal(conviteFeedback(raiz, '2.1.0', agora + 400 * DIA).mostrar, false, 'não perguntar mais');
    assert.equal(registrarConvite(raiz, { acao: 'apagar' }).error, true);
  } finally {
    tusab.fechar();
  }
});

test('o que vai: só contagens — nenhum nome de projeto, título, texto ou pasta', async () => {
  const tusab = await novaBase();
  try {
    tusab.salvarTexto({ titulo: 'TituloSecreto', conteudo: 'conteudo sigiloso sobre ProjetoSecreto', projeto: 'ProjetoSecreto' });
    tusab.sincronizar();
    tusab.registrarUsoMcp('tusab_buscar');
    registrarUso(tusab.raiz, 'resumo');
    const meu = salvarPromptUsuario(tusab.raiz, { titulo: 'PromptSecreto', pedido: 'faça algo secreto' });
    registrarUso(tusab.raiz, meu.prompt.id);
    mudarAndamento(tusab.raiz, { projeto: 'ProjetoSecreto', trilha: 'concurso', acao: 'iniciar', tema: 'TemaSecreto' });
    const m = metricasDeUso(tusab, '2.0.0');
    const json = JSON.stringify(m);
    for (const segredo of ['Secreto', 'sigiloso', tusab.raiz, os.userInfo().username]) assert.ok(!json.includes(segredo), segredo);
    assert.deepEqual(m.prompts.usos, { resumo: 1, meus: 1 });
    assert.equal(m.base.projetos, 1);
    assert.equal(m.base.fontes, 1);
    assert.deepEqual(m.trilhas, { iniciadas: 1, concluidas: 0, por_trilha: { concurso: { iniciadas: 1, concluidas: 0 } } });
    assert.equal(m.ferramentas.tusab_buscar, 1);

    const sem = montarEnvio(tusab, '2.0.0', { nota: 9, incluir_metricas: false });
    assert.equal(sem.metricas, null, 'o usuário pode mandar sem os números');
    assert.match(sem.instalacao, /^[0-9a-f-]{36}$/);
    assert.equal(montarEnvio(tusab, '2.0.0', { nota: 8 }).instalacao, sem.instalacao, 'o código de instalação fica o mesmo');
  } finally {
    tusab.fechar();
  }
});

test('validação da resposta', async () => {
  const tusab = await novaBase();
  try {
    assert.throws(() => montarEnvio(tusab, '2.0.0', {}), /nota ou escreva/);
    assert.throws(() => montarEnvio(tusab, '2.0.0', { nota: 11 }), /0 a 10/);
    assert.throws(() => montarEnvio(tusab, '2.0.0', { nota: 7.5 }), /0 a 10/);
    assert.throws(() => montarEnvio(tusab, '2.0.0', { comentario: 'x'.repeat(1501) }), /1500/);
    assert.throws(() => montarEnvio(tusab, '2.0.0', { nota: 5, email: 'não é e-mail' }), /e-mail/);
    assert.equal(montarEnvio(tusab, '2.0.0', { nota: 0 }).nota, 0);
    assert.equal(montarEnvio(tusab, '2.0.0', { comentario: ' ótimo ', email: 'a@b.co' }).comentario, 'ótimo');
  } finally {
    tusab.fechar();
  }
});

test('endereço do coletor: só o da CriAugu (ou http local nos testes)', () => {
  const antes = process.env.TUSAB_FEEDBACK_URL;
  try {
    for (const [url, esperado] of [
      ['https://coletor.criaugu.com/', 'https://coletor.criaugu.com/'],
      ['https://script.google.com/macros/s/ABC/exec', null],
      ['https://exemplo.com/coletor', null],
      ['http://coletor.criaugu.com/', null],
      ['http://127.0.0.1:9/x', 'http://127.0.0.1:9/x'],
      ['http://192.168.0.2/x', null],
      ['lixo', null],
    ]) {
      process.env.TUSAB_FEEDBACK_URL = url;
      assert.equal(urlColetor(), esperado, url);
    }
  } finally {
    if (antes === undefined) delete process.env.TUSAB_FEEDBACK_URL; else process.env.TUSAB_FEEDBACK_URL = antes;
  }
});

test('envio: chega ao coletor; sem coletor, recusado ou fora do ar → e-mail pronto', async () => {
  const tusab = await novaBase();
  const recebidos = [];
  let responder = { ok: true };
  const coletor = http.createServer((req, res) => {
    let corpo = '';
    req.on('data', (p) => { corpo += p; });
    req.on('end', () => { recebidos.push(JSON.parse(corpo)); res.setHeader('content-type', 'application/json'); res.end(JSON.stringify(responder)); });
  });
  await new Promise((r) => coletor.listen(0, '127.0.0.1', r));
  const antes = process.env.TUSAB_FEEDBACK_URL;
  try {
    process.env.TUSAB_FEEDBACK_URL = ''; // vazio = sem coletor
    const semColetor = await enviarFeedback(tusab, '2.0.0', { nota: 9, comentario: 'Gostei' });
    assert.equal(semColetor.ok, false);
    assert.equal(semColetor.alternativa.email, EMAIL_FEEDBACK);
    assert.match(semColetor.alternativa.mailto, /^mailto:tusab@tusab\.solutions\?subject=/);
    assert.match(semColetor.alternativa.corpo, /Nota: 9\/10[\s\S]+Gostei[\s\S]+"tipo":"tusab-feedback"/);

    process.env.TUSAB_FEEDBACK_URL = `http://127.0.0.1:${coletor.address().port}/exec`;
    const r = await enviarFeedback(tusab, '2.0.0', { nota: 10, gatilho: 'materiais' });
    assert.deepEqual(r, { ok: true, canal: 'planilha' });
    assert.equal(recebidos.length, 1);
    assert.deepEqual([recebidos[0].tipo, recebidos[0].formato, recebidos[0].nota, recebidos[0].gatilho], ['tusab-feedback', 1, 10, 'materiais']);
    assert.equal(recebidos[0].metricas.versao, '2.0.0');
    assert.equal(conviteFeedback(tusab.raiz, '2.0.0').mostrar, false, 'depois de enviar, não convida logo');

    responder = { ok: false, erro: 'limite' };
    assert.equal((await enviarFeedback(tusab, '2.0.0', { nota: 1 })).ok, false);

    process.env.TUSAB_FEEDBACK_URL = 'http://127.0.0.1:9/fora-do-ar';
    const fora = await enviarFeedback(tusab, '2.0.0', { nota: 1 }, { tempoLimiteMs: 2000 });
    assert.equal(fora.ok, false);
    assert.ok(fora.alternativa.mailto);

    // Pela API da tela
    const api = (metodo, caminho, corpo) => atenderApi(tusab, metodo, caminho, new URLSearchParams(), async () => corpo);
    assert.deepEqual((await api('GET', '/feedback/convite')).corpo, { mostrar: false, gatilho: null });
    assert.equal((await api('POST', '/feedback/previa', { nota: 12 })).corpo.error, true);
    assert.equal((await api('POST', '/feedback/previa', { nota: 8 })).corpo.envio.nota, 8);
  } finally {
    if (antes === undefined) delete process.env.TUSAB_FEEDBACK_URL; else process.env.TUSAB_FEEDBACK_URL = antes;
    coletor.close();
    tusab.fechar();
  }
});
