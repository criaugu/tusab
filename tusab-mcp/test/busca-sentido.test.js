// Busca por significado (embeddings no Ollama local) somada à busca por palavras pela RRF,
// e a volta para a busca só por palavras quando o Ollama falha. Usa um Ollama falso.
import './_ambiente.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import os from 'node:os';
import path from 'node:path';
import { Tusab } from '../src/nucleo/tusab.js';
import { Vetores, configuracaoVetores } from '../src/nucleo/vetores.js';
import { resetTotal } from '../src/nucleo/repositorio.js';

// Vetor de "sentido" do Ollama falso: eixo 0 = coração, eixo 1 = digestão, eixo 2 = resto.
const CORACAO = /infarto|coração|cardíac|heart|peito|coronária/i;
const DIGESTAO = /fibra|glicose|intestino|digest/i;
function vetorFalso(texto) {
  return [CORACAO.test(texto) ? 1 : 0, DIGESTAO.test(texto) ? 1 : 0, 0.1];
}

async function ollamaFalso({ status = 200 } = {}) {
  const pedidos = [];
  const srv = http.createServer((req, res) => {
    let corpo = '';
    req.on('data', (c) => { corpo += c; });
    req.on('end', () => {
      const j = JSON.parse(corpo || '{}');
      pedidos.push({ url: req.url, ...j });
      if (status !== 200 || req.url !== '/api/embed') { res.writeHead(status === 200 ? 404 : status).end('{}'); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ model: j.model, embeddings: j.input.map(vetorFalso) }));
    });
  });
  await new Promise((ok) => srv.listen(0, '127.0.0.1', ok));
  return { url: `http://127.0.0.1:${srv.address().port}`, pedidos, fechar: () => new Promise((ok) => srv.close(ok)) };
}

async function base(raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'tusab-sentido-'))) {
  const tusab = await Tusab.abrir(raiz);
  tusab.salvarTexto({ titulo: 'Cardiologia', conteudo: 'O infarto agudo do miocárdio ocorre quando uma artéria coronária é obstruída.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Nutrição', conteudo: 'Fibras ajudam o intestino e controlam a glicose.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Problemas', conteudo: 'Lista de problemas comuns na escola.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Outro projeto', conteudo: 'Dor no peito pede atendimento.', projeto: 'Outro' });
  tusab.sincronizar();
  return tusab;
}

function ligar(tusab, url) {
  tusab.vetores = new Vetores(tusab.raiz, tusab.indice, { ligado: true, url, modelo: 'teste-embed' });
  tusab.vetores.iniciar();
  return tusab.vetores;
}

test('configuração: desligada por variável, e só aceita Ollama neste computador', () => {
  assert.equal(configuracaoVetores({}).ligado, true);
  assert.equal(configuracaoVetores({}).url, 'http://127.0.0.1:11434');
  assert.equal(configuracaoVetores({}).modelo, 'nomic-embed-text');
  assert.equal(configuracaoVetores({ TUSAB_EMBEDDINGS: '0' }).motivo, 'desligada');
  for (const u of ['http://localhost:11434', 'http://[::1]:11434', 'http://127.0.0.1:9999/']) {
    assert.equal(configuracaoVetores({ TUSAB_OLLAMA_URL: u }).ligado, true, u);
  }
  for (const u of ['https://api.exemplo.com', 'http://192.168.0.10:11434', 'http://127.0.0.1.exemplo.com', 'ftp://127.0.0.1/arquivo', 'lixo']) {
    const c = configuracaoVetores({ TUSAB_OLLAMA_URL: u });
    assert.equal(c.ligado, false, u);
    assert.equal(c.motivo, 'endereco', u);
  }
  assert.equal(configuracaoVetores({ TUSAB_EMBEDDINGS_MODELO: 'a b; rm' }).motivo, 'modelo');
});

test('com Ollama: acha o trecho pelo sentido, sem palavra em comum, e junta com a busca por palavras', async () => {
  const ollama = await ollamaFalso();
  const tusab = await base();
  try {
    const v = ligar(tusab, ollama.url);
    await v.aguardar();
    const e = v.estado();
    assert.equal(e.ligada, true);
    assert.equal(e.cobertos, e.total);
    assert.equal(e.total, 4);

    const consulta = 'problemas do coração';
    const soPalavras = tusab.indice.buscar(consulta, { projeto: 'Saude' }).map((a) => a.titulo_trecho);
    assert.ok(!soPalavras.includes('Cardiologia'), 'por palavras, o texto técnico não aparece');
    assert.ok(soPalavras.includes('Problemas'));

    const hibrida = (await tusab.buscar(consulta, [], { projeto: 'Saude' })).map((a) => a.titulo_trecho);
    assert.ok(hibrida.includes('Cardiologia'), 'pelo sentido, aparece');
    assert.ok(hibrida.includes('Problemas'), 'o que a busca por palavras achou continua');
    assert.ok(!hibrida.includes('Nutrição'), 'sentido diferente fica de fora');
    assert.ok(!hibrida.includes('Outro projeto'), 'respeita o projeto');

    const achado = (await tusab.buscar(consulta, [], { projeto: 'Saude' })).find((a) => a.titulo_trecho === 'Cardiologia');
    assert.ok(achado.fonte_id && achado.texto.includes('infarto') && 'minuto' in achado && 'link' in achado, 'mesmo formato da busca comum');

    // Consulta com o prefixo do tipo de texto só nos modelos nomic; aqui não há prefixo.
    assert.ok(ollama.pedidos.every((p) => p.model === 'teste-embed' && p.input.every((x) => !x.startsWith('search_'))));

    // Cache no disco: outra instância lê os vetores e não pede de novo os trechos.
    const antes = ollama.pedidos.length;
    const v2 = ligar(tusab, ollama.url);
    await v2.aguardar();
    assert.equal(v2.estado().cobertos, 4);
    assert.equal(ollama.pedidos.length, antes, 'nada a refazer');
  } finally {
    tusab.fechar();
    await ollama.fechar();
  }
});

test('fonte apagada: o vetor dela sai do disco; reset total apaga o cache', async () => {
  const ollama = await ollamaFalso();
  const tusab = await base();
  try {
    const v = ligar(tusab, ollama.url);
    await v.aguardar();
    const tamanhoAntes = fs.statSync(v.arquivo).size;
    const pasta = path.join(tusab.raiz, 'data', 'neural', 'Outro', 'texts');
    for (const f of fs.readdirSync(pasta)) if (f.endsWith('.txt')) fs.rmSync(path.join(pasta, f));
    tusab.sincronizar();
    await v.agendar();
    await v.aguardar();
    assert.ok(fs.statSync(v.arquivo).size < tamanhoAntes, 'arquivo compactado');
    assert.equal(v.estado().total, 3);
    assert.equal(new Vetores(tusab.raiz, tusab.indice, v.config)._memoria().size, 3);

    resetTotal(tusab.raiz);
    assert.equal(fs.existsSync(path.dirname(v.arquivo)), false);
  } finally {
    tusab.fechar();
    await ollama.fechar();
  }
});

test('sem Ollama (fechado ou com erro): a busca segue só por palavras, sem travar nem repetir a tentativa', async () => {
  const fechado = await ollamaFalso();
  const urlFechada = fechado.url;
  await fechado.fechar();
  const comErro = await ollamaFalso({ status: 500 });
  const tusab = await base();
  try {
    for (const url of [urlFechada, comErro.url]) {
      const v = ligar(tusab, url);
      await v.aguardar();
      assert.equal(v.estado().ligada, false);
      assert.equal(v.estado().motivo, 'sem_ollama');
      const r = await tusab.buscar('infarto', [], { projeto: 'Saude' });
      assert.deepEqual(r.map((a) => a.trecho_id), tusab.indice.buscar('infarto', { projeto: 'Saude' }).map((a) => a.trecho_id));
    }
    assert.equal(comErro.pedidos.length, 1, 'depois da falha, espera um minuto antes de tentar de novo');

    // Ollama que funcionou e depois caiu: os vetores guardados não bastam sem o vetor da consulta.
    const bom = await ollamaFalso();
    const v = ligar(tusab, bom.url);
    await v.aguardar();
    await bom.fechar();
    const r = await tusab.buscar('problemas do coração', [], { projeto: 'Saude' });
    assert.deepEqual(r.map((a) => a.titulo_trecho), tusab.indice.buscar('problemas do coração', { projeto: 'Saude' }).map((a) => a.titulo_trecho));
  } finally {
    tusab.fechar();
    await comErro.fechar();
  }
});

test('desligada por padrão nos testes, e o processo que não é o principal não preenche', async () => {
  const tusab = await base();
  try {
    assert.equal(tusab.vetores.estado().ligada, false);
    assert.equal(tusab.vetores.estado().motivo, 'desligada');
    const ollama = await ollamaFalso();
    try {
      const v = new Vetores(tusab.raiz, tusab.indice, { ligado: true, url: ollama.url, modelo: 'teste-embed' });
      assert.deepEqual(await v.semelhantes('coração'), [], 'sem iniciar(), nada');
      assert.equal(v.agendar(), null);
      assert.equal(ollama.pedidos.length, 0);
    } finally {
      await ollama.fechar();
    }
  } finally {
    tusab.fechar();
  }
});

test('opção avançada: quem não configurou nada não ouve falar do Ollama; quem configurou vê o que falta', async () => {
  const { Client } = await import('@modelcontextprotocol/sdk/client/index.js');
  const { InMemoryTransport } = await import('@modelcontextprotocol/sdk/inMemory.js');
  const { criarServidor } = await import('../src/servidor.js');
  const { Painel } = await import('../src/painel.js');
  const tusab = await base();
  const painel = new Painel(tusab);
  const servidor = criarServidor(tusab, { painel });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await servidor.connect(b);
  const cliente = new Client({ name: 'teste', version: '1' });
  await cliente.connect(a);
  const status = async () => (await cliente.callTool({ name: 'tusab_status', arguments: {} })).content[0].text;
  try {
    assert.equal(configuracaoVetores({}).explicita, false);
    // Padrão (nada configurado) e sem Ollama na máquina: nenhuma menção.
    const fechado = await ollamaFalso();
    await fechado.fechar();
    tusab.vetores = new Vetores(tusab.raiz, tusab.indice, { ...configuracaoVetores({}), url: fechado.url });
    tusab.vetores.iniciar();
    await tusab.vetores.aguardar();
    assert.doesNotMatch(await status(), /significado|Ollama/);

    // Configurado de propósito e sem Ollama: o status explica o que falta.
    tusab.vetores = new Vetores(tusab.raiz, tusab.indice, { ...configuracaoVetores({ TUSAB_EMBEDDINGS_MODELO: 'bge-m3' }), url: fechado.url });
    tusab.vetores.iniciar();
    await tusab.vetores.aguardar();
    assert.match(await status(), /Busca por significado: desligada\. Para ligar, instale o Ollama .* ollama pull bge-m3/);

    // Ollama funcionando (mesmo sem configurar): aparece como ligada.
    const ollama = await ollamaFalso();
    try {
      tusab.vetores = new Vetores(tusab.raiz, tusab.indice, { ...configuracaoVetores({}), url: ollama.url });
      tusab.vetores.iniciar();
      await tusab.vetores.aguardar();
      assert.match(await status(), /Busca por significado: ligada \(nomic-embed-text; 4 de 4 trechos prontos\)/);
    } finally {
      await ollama.fechar();
    }
  } finally {
    await cliente.close();
    painel.fechar();
    tusab.fechar();
  }
});
