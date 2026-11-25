// Busca com as variações escritas pela IA (sinônimos, termo técnico, outro idioma) e fusão RRF.
import './_ambiente.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Tusab } from '../src/nucleo/tusab.js';
import { criarServidor } from '../src/servidor.js';
import { Painel } from '../src/painel.js';

async function base() {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'tusab-variacoes-'));
  const tusab = await Tusab.abrir(raiz);
  tusab.salvarTexto({ titulo: 'Cardiologia', conteudo: 'O infarto agudo do miocárdio ocorre quando uma artéria coronária é obstruída.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Pronto-socorro', conteudo: 'Dor no peito que irradia para o braço pede atendimento imediato; pode ser infarto.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Nutrição', conteudo: 'Fibras ajudam o intestino e controlam a glicose.', projeto: 'Saude' });
  tusab.salvarTexto({ titulo: 'Heart attack', conteudo: 'A heart attack happens when blood flow to the heart is blocked.', projeto: 'Saude' });
  tusab.sincronizar();
  return tusab;
}

test('variações acham o trecho que usa outras palavras; sem elas, a busca é a de sempre', async () => {
  const tusab = await base();
  try {
    const { indice } = tusab;
    const so = indice.buscar('ataque cardíaco', { projeto: 'Saude' });
    assert.ok(!so.some((a) => a.titulo_trecho === 'Cardiologia'), 'só por palavras, o texto técnico não aparece');
    const com = indice.buscarComVariacoes('ataque cardíaco', ['infarto do miocárdio', 'heart attack'], { projeto: 'Saude' });
    const titulos = com.map((a) => a.titulo_trecho);
    assert.ok(titulos.includes('Cardiologia') && titulos.includes('Heart attack') && titulos.includes('Pronto-socorro'));
    assert.ok(!titulos.includes('Nutrição'));
    assert.equal(new Set(com.map((a) => a.trecho_id)).size, com.length, 'sem trecho repetido');

    // RRF: o trecho que aparece em mais de uma busca sobe
    const rrf = indice.buscarComVariacoes('infarto', ['infarto do miocárdio coronária'], { projeto: 'Saude' });
    assert.equal(rrf[0].titulo_trecho, 'Cardiologia');

    assert.deepEqual(indice.buscarComVariacoes('infarto', [], { projeto: 'Saude' }).map((a) => a.trecho_id),
      indice.buscar('infarto', { projeto: 'Saude' }).map((a) => a.trecho_id), 'sem variações = busca comum');
    assert.deepEqual(indice.buscarComVariacoes('infarto', ['infarto', ' infarto '], { projeto: 'Saude' }).map((a) => a.trecho_id),
      indice.buscar('infarto', { projeto: 'Saude' }).map((a) => a.trecho_id), 'variação igual à consulta não conta duas vezes');
    assert.equal(indice.buscarComVariacoes('infarto', ['heart attack', 'miocárdio'], { projeto: 'Saude', limite: 1 }).length, 1);
  } finally {
    tusab.fechar();
  }
});

test('tusab_buscar aceita variacoes (até 4) e recusa mais', async () => {
  const tusab = await base();
  const painel = new Painel(tusab);
  const servidor = criarServidor(tusab, { painel });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await servidor.connect(b);
  const cliente = new Client({ name: 'teste', version: '1' });
  await cliente.connect(a);
  try {
    const r = await cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'ataque cardíaco', variacoes: ['infarto do miocárdio'], projeto: 'Saude' } });
    assert.match(r.content[0].text, /Cardiologia/);
    const demais = await cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'x', variacoes: ['a', 'b', 'c', 'd', 'e'] } });
    assert.equal(demais.isError, true);
    const { tools } = await cliente.listTools();
    assert.ok(tools.find((t) => t.name === 'tusab_buscar').inputSchema.properties.variacoes);
  } finally {
    await cliente.close();
    painel.fechar();
    tusab.fechar();
  }
});
