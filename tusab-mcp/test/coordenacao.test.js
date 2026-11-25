// Várias ferramentas de IA na mesma base: um Tusab principal, os outros mensageiros.
import './_ambiente.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { Coordenacao, arquivoPrincipal, processoVivo } from '../src/coordenacao.js';

const ENTRADA = fileURLToPath(new URL('../src/index.js', import.meta.url));
const temp = (nome) => fs.mkdtempSync(path.join(os.tmpdir(), `tusab-coord-${nome}-`));
const dormir = (ms) => new Promise((r) => setTimeout(r, ms));
const lerPrincipal = (raiz) => JSON.parse(fs.readFileSync(arquivoPrincipal(raiz), 'utf8'));

test('eleição: o primeiro vira principal, o segundo vira mensageiro do primeiro', async () => {
  const raiz = temp('eleicao');
  const a = new Coordenacao(raiz, '9.9.9');
  const b = new Coordenacao(raiz, '9.9.9');
  assert.equal(await a.eleger(), true);
  assert.equal(await b.eleger(), false);
  assert.equal(b.principal.id, a.id);
  // O principal sai: o próximo assume.
  a.sair();
  assert.equal(fs.existsSync(arquivoPrincipal(raiz)), false);
  assert.equal(await b.eleger(), true);
  b.sair();
});

test('eleição: registro de um processo que já morreu é descartado', async () => {
  const raiz = temp('morto');
  fs.mkdirSync(path.dirname(arquivoPrincipal(raiz)), { recursive: true });
  let pidMorto = 4_000_000;
  while (processoVivo(pidMorto)) pidMorto++;
  fs.writeFileSync(arquivoPrincipal(raiz), JSON.stringify({ pid: pidMorto, id: 'velho', versao: '1.0.0', desde: new Date().toISOString(), porta: 1, chave: 'x' }));
  const c = new Coordenacao(raiz, '9.9.9');
  assert.equal(await c.eleger(), true);
  assert.equal(lerPrincipal(raiz).id, c.id);
  c.sair();
});

test('eleição: registro corrompido não trava a base', async () => {
  const raiz = temp('corrompido');
  fs.mkdirSync(path.dirname(arquivoPrincipal(raiz)), { recursive: true });
  fs.writeFileSync(arquivoPrincipal(raiz), '{ isto não é json');
  const c = new Coordenacao(raiz, '9.9.9');
  assert.equal(await c.eleger(), true);
  c.sair();
});

function abrirIa(raiz, nome) {
  const cliente = new Client({ name: nome, version: '1.0' });
  const transporte = new StdioClientTransport({
    command: process.execPath,
    args: [ENTRADA],
    stderr: 'ignore',
    env: { ...process.env, TUSAB_REPOSITORIO: raiz, TUSAB_SEM_BOAS_VINDAS: '1' },
  });
  return { cliente, transporte, conectar: () => cliente.connect(transporte) };
}

const textoDe = (r) => r.content.map((c) => c.text || '').join('\n');

test('duas IAs na mesma base: a segunda repassa ao principal, e assume quando ele fecha', { timeout: 120_000 }, async () => {
  const raiz = temp('duas-ias');
  const iaA = abrirIa(raiz, 'IA A');
  await iaA.conectar();
  await iaA.cliente.callTool({ name: 'tusab_listar_projetos', arguments: {} });
  const principalA = lerPrincipal(raiz);
  assert.equal(principalA.pid, iaA.transporte.pid);
  assert.ok(principalA.porta && principalA.chave, 'o principal publica a porta e a chave');

  const iaB = abrirIa(raiz, 'IA B');
  await iaB.conectar();
  try {
    // B vê as mesmas ferramentas e grava pela mão do principal.
    const { tools } = await iaB.cliente.listTools();
    assert.equal(tools.length, 16);
    const arquivo = path.join(temp('arquivo'), 'fotossintese.txt');
    fs.writeFileSync(arquivo, 'A fotossíntese transforma luz em energia química nos cloroplastos.');
    const add = await iaB.cliente.callTool({ name: 'tusab_adicionar_arquivo', arguments: { caminho: arquivo, projeto: 'Biologia' } });
    assert.ok(!add.isError, textoDe(add));
    assert.equal(lerPrincipal(raiz).pid, iaA.transporte.pid, 'B não vira principal enquanto A está aberto');

    // A encontra o que B gravou: é a mesma base, num processo só.
    const busca = await iaA.cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'cloroplastos' } });
    assert.match(textoDe(busca), /fotossintese/i);

    // A tela do principal mostra as duas IAs conectadas.
    let estado;
    for (let i = 0; i < 50; i++) {
      estado = await fetch(`http://127.0.0.1:${principalA.porta}/api/conexao`, { headers: { 'x-tusab-chave': principalA.chave } }).then((r) => r.json());
      if (estado.clientes.length === 2) break;
      await dormir(100);
    }
    assert.deepEqual(estado.clientes.map((c) => c.nome).sort(), ['IA A', 'IA B']);

    // Argumentos inválidos vindos de um mensageiro são recusados pelo principal.
    const invalido = await iaB.cliente.callTool({ name: 'tusab_adicionar_arquivo', arguments: { caminho: arquivo } }).catch((e) => ({ isError: true, content: [{ text: e.message }] }));
    assert.equal(invalido.isError, true);

    // A fecha: B assume a base e continua respondendo.
    await iaA.cliente.close();
    for (let i = 0; i < 50 && processoVivo(principalA.pid); i++) await dormir(100);
    const depois = await iaB.cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'cloroplastos' } });
    assert.match(textoDe(depois), /fotossintese/i);
    assert.equal(lerPrincipal(raiz).pid, iaB.transporte.pid);
  } finally {
    await iaB.cliente.close().catch(() => {});
    await iaA.cliente.close().catch(() => {});
  }
  // Com todas as IAs fechadas, a base fica livre.
  for (let i = 0; i < 50 && fs.existsSync(arquivoPrincipal(raiz)); i++) await dormir(100);
  assert.equal(fs.existsSync(arquivoPrincipal(raiz)), false);
});

test('três IAs: quando o principal fecha, uma assume e a outra passa a seguir a nova', { timeout: 120_000 }, async () => {
  const raiz = temp('tres-ias');
  const ias = [abrirIa(raiz, 'IA 1'), abrirIa(raiz, 'IA 2'), abrirIa(raiz, 'IA 3')];
  await ias[0].conectar();
  await ias[0].cliente.callTool({ name: 'tusab_listar_projetos', arguments: {} });
  await Promise.all([ias[1].conectar(), ias[2].conectar()]);
  try {
    const pasta = temp('arquivo3');
    const arquivo = path.join(pasta, 'mitose.txt');
    fs.writeFileSync(arquivo, 'Na mitose, a célula se divide em duas células-filhas idênticas.');
    const meiose = path.join(pasta, 'meiose.txt');
    fs.writeFileSync(meiose, 'Na meiose, a célula forma quatro gametas com metade dos cromossomos.');
    const criar = await ias[1].cliente.callTool({ name: 'tusab_adicionar_arquivo', arguments: { caminho: arquivo, projeto: 'Biologia' } });
    assert.ok(!criar.isError, textoDe(criar));
    // As duas mensageiras gravam ao mesmo tempo no projeto: tudo passa pelo principal, em ordem.
    const [r2, r3] = await Promise.all([
      ias[1].cliente.callTool({ name: 'tusab_adicionar_arquivo', arguments: { caminho: meiose, projeto: 'Biologia' } }),
      ias[2].cliente.callTool({ name: 'tusab_salvar_estudo', arguments: { projeto: 'Biologia', tipo: 'postits', conteudo: ['Mitose: 2 células iguais'] } }),
    ]);
    assert.ok(!r2.isError, textoDe(r2));
    assert.ok(!r3.isError, textoDe(r3));

    const pid1 = ias[0].transporte.pid;
    await ias[0].cliente.close();
    for (let i = 0; i < 50 && processoVivo(pid1); i++) await dormir(100);
    // As duas restantes continuam atendendo; uma delas virou a principal.
    const [b2, b3] = await Promise.all([
      ias[1].cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'mitose' } }),
      ias[2].cliente.callTool({ name: 'tusab_buscar', arguments: { consulta: 'meiose' } }),
    ]);
    assert.match(textoDe(b2), /mitose/i);
    assert.match(textoDe(b3), /meiose/i);
    assert.ok([ias[1].transporte.pid, ias[2].transporte.pid].includes(lerPrincipal(raiz).pid));
  } finally {
    for (const ia of ias) await ia.cliente.close().catch(() => {});
  }
});
