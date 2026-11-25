// Trilhas (prompts em sequência), favoritos, mais usados e o que aparece no "+" da IA.
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
import { atenderApi } from '../src/api.js';
import { PROMPTS, alternarFavorito, definirMenu, idsNoMenu, lerPreferencias, listarPrompts, registrarUso } from '../src/nucleo/prompts.js';
import { TRILHAS, listarTrilhas, mudarAndamento, pedidoDaTrilha } from '../src/nucleo/trilhas.js';

const novaRaiz = () => fs.mkdtempSync(path.join(os.tmpdir(), 'tusab-trilha-'));

async function conectar() {
  const raiz = novaRaiz();
  const tusab = await Tusab.abrir(raiz);
  const painel = new Painel(tusab);
  const servidor = criarServidor(tusab, { painel });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await servidor.connect(b);
  const cliente = new Client({ name: 'teste', version: '1' });
  await cliente.connect(a);
  return { raiz, tusab, cliente, fechar: async () => { await cliente.close(); painel.fechar(); tusab.fechar(); } };
}
const nomes = async (cliente) => (await cliente.listPrompts()).prompts.map((p) => p.name);
const texto = (r) => r.content.map((c) => c.text || '').join('\n');

test('biblioteca: 63 prompts, ids únicos, três idiomas e referências completas', () => {
  assert.equal(PROMPTS.length, 63);
  assert.equal(new Set(PROMPTS.map((p) => p.id)).size, PROMPTS.length);
  for (const p of PROMPTS) {
    for (const lng of ['pt', 'en', 'es']) {
      const x = p.textos[lng];
      assert.ok(x?.titulo && x?.descricao && x?.pedido, `${p.id} ${lng}`);
      for (const campo of ['{quantidade}']) if (p.textos.pt.pedido.includes(campo)) assert.ok(x.pedido.includes(campo), `${p.id} ${lng} ${campo}`);
      if (p.campos.includes('tema')) assert.ok(x.pedido.includes('{tema_frase}'), `${p.id} ${lng} sem {tema_frase}`);
    }
    if (p.referencia) assert.ok(p.referencia.autores && p.referencia.ano && p.referencia.obra && p.referencia.pratica, p.id);
  }
});

test('trilhas: só passos que existem, andamento por projeto, tema guardado e nome de projeto estranho', () => {
  const raiz = novaRaiz();
  for (const tr of TRILHAS) for (const id of tr.passos) assert.ok(PROMPTS.some((p) => p.id === id), `${tr.id}: ${id}`);
  assert.equal(listarTrilhas(raiz, 'Bio').every((tr) => tr.andamento === null), true);

  const r1 = mudarAndamento(raiz, { projeto: 'Bio', trilha: 'checar-texto', acao: 'iniciar', tema: 'vacinas' });
  assert.deepEqual([r1.trilha.andamento.passo, r1.trilha.andamento.tema], [0, 'vacinas']);
  mudarAndamento(raiz, { projeto: 'Bio', trilha: 'checar-texto', acao: 'iniciar', tema: 'outro' });
  assert.equal(listarTrilhas(raiz, 'Bio').find((x) => x.id === 'checar-texto').andamento.tema, 'vacinas', 'iniciar de novo não troca o tema');

  assert.match(pedidoDaTrilha(raiz, { projeto: 'Bio', trilha: 'checar-texto' }, 'pt'), /passo 1 de 3[\s\S]+"vacinas"[\s\S]+tusab_trilha/);
  for (let i = 0; i < 5; i++) mudarAndamento(raiz, { projeto: 'Bio', trilha: 'checar-texto', acao: 'concluir' });
  const fim = listarTrilhas(raiz, 'Bio').find((x) => x.id === 'checar-texto').andamento;
  assert.deepEqual([fim.passo, fim.concluida], [3, true], 'não passa do último passo');
  assert.match(pedidoDaTrilha(raiz, { projeto: 'Bio', trilha: 'checar-texto' }, 'pt'), /já foi concluída/);
  mudarAndamento(raiz, { projeto: 'Bio', trilha: 'checar-texto', acao: 'voltar' });
  assert.equal(listarTrilhas(raiz, 'Bio').find((x) => x.id === 'checar-texto').andamento.passo, 2);
  mudarAndamento(raiz, { projeto: 'Bio', trilha: 'checar-texto', acao: 'reiniciar', tema: 'novo' });
  assert.deepEqual(Object.values((({ passo, tema }) => ({ passo, tema }))(listarTrilhas(raiz, 'Bio').find((x) => x.id === 'checar-texto').andamento)), [0, 'novo']);

  assert.equal(listarTrilhas(raiz, 'Outro').every((tr) => tr.andamento === null), true, 'cada projeto tem o seu andamento');
  mudarAndamento(raiz, { projeto: '__proto__', trilha: 'concurso', acao: 'iniciar' });
  assert.equal(listarTrilhas(raiz, '__proto__').find((x) => x.id === 'concurso').andamento.passo, 0);
  assert.equal({}.passo, undefined);

  assert.throws(() => mudarAndamento(raiz, { projeto: 'Bio', trilha: 'nao-existe', acao: 'iniciar' }), /Trilha desconhecida/);
  assert.throws(() => mudarAndamento(raiz, { projeto: '', trilha: 'concurso', acao: 'iniciar' }), /projeto/);
  assert.throws(() => mudarAndamento(raiz, { projeto: 'Bio', trilha: 'concurso', acao: 'apagar' }), /inválida/);
});

test('favoritos e mais usados decidem o que entra no "+"; "todos" mostra tudo', () => {
  const raiz = novaRaiz();
  const inicial = idsNoMenu(raiz);
  assert.ok(inicial.has('resumo') && inicial.size === 8, 'sem uso: seleção inicial');
  assert.deepEqual(alternarFavorito(raiz, 'tutor-socratico'), { ok: true, favorito: true });
  assert.ok(!idsNoMenu(raiz).has('resumo') && idsNoMenu(raiz).has('tutor-socratico'), 'com favorito, a seleção inicial sai');
  for (let i = 0; i < 3; i++) registrarUso(raiz, 'notas-cornell');
  registrarUso(raiz, 'nao-existe');
  assert.deepEqual(lerPreferencias(raiz).usos, { 'notas-cornell': 3 });
  assert.ok(idsNoMenu(raiz).has('notas-cornell'));
  assert.equal(alternarFavorito(raiz, 'nao-existe').error, true);
  assert.equal(definirMenu(raiz, 'qualquer').error, true);
  definirMenu(raiz, 'todos');
  assert.equal(idsNoMenu(raiz).size, PROMPTS.length);
  const tela = listarPrompts(raiz, 'pt');
  assert.equal(tela.menu, 'todos');
  assert.equal(tela.prompts.find((p) => p.id === 'tutor-socratico').favorito, true);
  assert.equal(tela.prompts.find((p) => p.id === 'notas-cornell').usos, 3);
});

test('MCP: o "+" acompanha favoritos e uso, e a trilha anda pelo atalho e pela ferramenta', async () => {
  const { raiz, tusab, cliente, fechar } = await conectar();
  try {
    let lista = await nomes(cliente);
    assert.ok(lista.includes('resumo') && !lista.includes('rastro-origem'));
    assert.ok(TRILHAS.every((tr) => lista.includes(`trilha-${tr.id}`)), 'as trilhas aparecem sempre');

    // Favoritar pela tela (API) liga o prompt no "+" sem reiniciar
    const fav = await atenderApi(tusab, 'POST', '/prompts/favorito', new URLSearchParams(), async () => ({ id: 'rastro-origem' }));
    assert.equal(fav.corpo.favorito, true);
    lista = await nomes(cliente);
    assert.ok(lista.includes('rastro-origem') && !lista.includes('resumo'));

    // Usar um prompt pelo "+" conta uso e o coloca no menu
    await cliente.getPrompt({ name: 'rastro-origem', arguments: { projeto: 'Bio' } });
    assert.equal(lerPreferencias(raiz).usos['rastro-origem'], 1);

    const passo1 = await cliente.getPrompt({ name: 'trilha-checar-texto', arguments: { projeto: 'Bio', tema: 'vacinas' } });
    assert.match(passo1.messages[0].content.text, /passo 1 de 3[\s\S]+Inventário de afirmações[\s\S]+tusab_trilha/);
    const visto = texto(await cliente.callTool({ name: 'tusab_trilha', arguments: { projeto: 'Bio', acao: 'ver' } }));
    assert.match(visto, /passo 1 de 3/);
    const prox = texto(await cliente.callTool({ name: 'tusab_trilha', arguments: { projeto: 'Bio', acao: 'concluir', trilha: 'checar-texto' } }));
    assert.match(prox, /passo 2 de 3[\s\S]+Rastro da origem/);
    const semTrilha = await cliente.callTool({ name: 'tusab_trilha', arguments: { projeto: 'Bio', acao: 'concluir' } });
    assert.equal(semTrilha.isError, true);
  } finally {
    await fechar();
  }
});
