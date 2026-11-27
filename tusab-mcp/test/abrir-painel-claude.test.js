// No Claude Desktop (navegador próprio), "abrir o Tusab" não abre o navegador do computador:
// o Tusab devolve o link e pede à IA que abra no navegador dela, sem perguntar de novo.
import './_ambiente.js';
import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { InMemoryTransport } from '@modelcontextprotocol/sdk/inMemory.js';
import { Tusab } from '../src/nucleo/tusab.js';
import { criarServidor, temNavegadorProprio } from '../src/servidor.js';
import { Painel } from '../src/painel.js';

test('quem tem navegador próprio: Claude Desktop sim; Claude Code e as outras ferramentas não', () => {
  assert.equal(temNavegadorProprio({ name: 'claude-ai', version: '1.0' }), true);
  for (const name of ['claude-code', 'Claude Code', 'cursor-vscode', 'Visual Studio Code', 'gemini-cli-mcp-client', 'codex-mcp-client', '']) {
    assert.equal(temNavegadorProprio({ name }), false, name);
  }
  assert.equal(temNavegadorProprio(undefined), false);
});

test('Claude Desktop sem o parâmetro: devolve o link com o pedido para abrir no navegador dele', async () => {
  const raiz = fs.mkdtempSync(path.join(os.tmpdir(), 'tusab-abrir-'));
  const tusab = await Tusab.abrir(raiz);
  const painel = new Painel(tusab);
  const servidor = criarServidor(tusab, { painel });
  const [a, b] = InMemoryTransport.createLinkedPair();
  await servidor.connect(b);
  const cliente = new Client({ name: 'claude-ai', version: '1' });
  await cliente.connect(a);
  try {
    const r = (await cliente.callTool({ name: 'tusab_abrir_painel', arguments: {} })).content[0].text;
    assert.match(r, /http:\/\/127\.0\.0\.1:\d+\/\?chave=/);
    assert.match(r, /abra este link agora no seu navegador .* sem perguntar de novo/);
  } finally {
    await cliente.close();
    painel.fechar();
    tusab.fechar();
  }
});
