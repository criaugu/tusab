// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
// Várias ferramentas de IA na mesma base: um Tusab principal, os outros mensageiros.
//
// Cada ferramenta de IA (Claude Desktop, Claude Code, Cursor, ChatGPT…) inicia o seu próprio
// processo do Tusab. Se dois processos gravassem a mesma pasta ao mesmo tempo, o índice e os
// arquivos podiam se corromper. Por isso:
// - o primeiro processo a abrir a pasta vira o PRINCIPAL: só ele lê e grava a base. Ele deixa
//   em data/config/principal.json o próprio PID e, quando a tela local sobe, a porta e a chave;
// - os seguintes viram MENSAGEIROS: atendem a sua IA normalmente, mas repassam cada chamada de
//   ferramenta ao principal pela API local (127.0.0.1, mesma chave da tela) e devolvem a resposta;
// - se o principal fecha (a IA dele fechou) ou morre, um mensageiro percebe e assume.
//
// O arquivo é criado com abertura exclusiva ('wx'): só um processo ganha a eleição. A chave ali
// é a mesma da tela, muda a cada sessão e só vale para 127.0.0.1; o arquivo fica na pasta do
// próprio usuário, que já guarda a base inteira.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { escreverAtomico } from './nucleo/caminhos.js';

const ESPERA_PORTA_MS = 60_000; // o principal pode levar um tempo abrindo um índice grande
const PRAZO_CHAMADA_MS = 180_000; // extrair um PDF grande ou ler um original pode demorar
const IDADE_SEM_PORTA_MS = 120_000; // principal que nunca publicou a porta: considerado travado

const dormir = (ms) => new Promise((r) => setTimeout(r, ms));

export function arquivoPrincipal(raiz) {
  return path.join(raiz, 'data', 'config', 'principal.json');
}

/** O processo ainda existe? (Windows e macOS: process.kill com sinal 0 só consulta.) */
export function processoVivo(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return e.code === 'EPERM'; // existe, mas é de outro usuário
  }
}

/** Falha de conexão (o principal sumiu), diferente de um erro dentro da ferramenta. */
export class SemPrincipal extends Error {}

export class Coordenacao {
  constructor(raiz, versao, { intervaloVigia = 3000 } = {}) {
    this.raiz = raiz;
    this.versao = versao;
    this.arquivo = arquivoPrincipal(raiz);
    this.id = crypto.randomUUID();
    this.papel = null; // 'principal' | 'mensageiro'
    this.principal = null; // o que o principal publicou (mensageiro)
    this.intervaloVigia = intervaloVigia;
    this._vigia = null;
  }

  get souPrincipal() {
    return this.papel === 'principal';
  }

  _ler() {
    try {
      return JSON.parse(fs.readFileSync(this.arquivo, 'utf8'));
    } catch {
      return null;
    }
  }

  _registro(extra = {}) {
    return { pid: process.pid, id: this.id, versao: this.versao, desde: new Date().toISOString(), ...extra };
  }

  _valido(info) {
    if (!info || !processoVivo(info.pid)) return false;
    if (!info.porta && Date.now() - Date.parse(info.desde || 0) > IDADE_SEM_PORTA_MS) return false;
    return true;
  }

  /** Remove o registro de um principal que já não existe (só se ainda for o mesmo registro). */
  _descartar(info) {
    const atual = this._ler();
    if (atual && info && atual.id !== info.id) return; // outro processo já assumiu
    const velho = `${this.arquivo}.${this.id}.velho`;
    try {
      fs.renameSync(this.arquivo, velho);
      fs.rmSync(velho, { force: true });
    } catch { /* outro mensageiro chegou antes */ }
  }

  /**
   * Disputa o papel de principal. true: este processo é o principal (deve abrir a base e chamar
   * publicar() quando a tela subir). false: há um principal vivo e este processo é mensageiro.
   */
  async eleger() {
    fs.mkdirSync(path.dirname(this.arquivo), { recursive: true });
    for (let tentativa = 0; tentativa < 5; tentativa++) {
      try {
        fs.writeFileSync(this.arquivo, JSON.stringify(this._registro()), { flag: 'wx' });
        this.papel = 'principal';
        this.principal = null;
        this.pararVigia();
        return true;
      } catch (e) {
        if (e.code !== 'EEXIST') throw e;
      }
      const info = this._ler();
      if (this._valido(info)) {
        this.papel = 'mensageiro';
        this.principal = info;
        return false;
      }
      this._descartar(info);
      await dormir(20 + Math.floor(Math.random() * 200)); // desencontra mensageiros que chegam juntos
    }
    throw new Error('Não foi possível coordenar o acesso à base do Tusab.');
  }

  /** Principal: grava a porta e a chave da tela, para os mensageiros acharem. */
  publicar({ porta, chave }) {
    const atual = this._ler();
    escreverAtomico(this.arquivo, JSON.stringify(this._registro({ desde: atual?.desde, porta, chave })));
  }

  /** Principal saindo: libera a base para um mensageiro assumir. */
  sair() {
    this.pararVigia();
    if (!this.souPrincipal) return;
    const atual = this._ler();
    if (atual?.id === this.id) fs.rmSync(this.arquivo, { force: true });
    this.papel = null;
  }

  /** Mensageiro: espera o principal publicar a porta (ele pode estar abrindo a base). */
  async _endereco() {
    const limite = Date.now() + ESPERA_PORTA_MS;
    for (;;) {
      const info = this._ler();
      if (!info || info.id !== this.principal?.id || !processoVivo(info.pid)) throw new SemPrincipal('principal saiu');
      if (info.porta && info.chave) {
        this.principal = info;
        return info;
      }
      if (Date.now() > limite) throw new SemPrincipal('principal sem porta');
      await dormir(200);
    }
  }

  async _post(rota, corpo, prazo = PRAZO_CHAMADA_MS) {
    const { porta, chave } = await this._endereco();
    let resposta;
    try {
      resposta = await fetch(`http://127.0.0.1:${porta}/api/coordenacao/${rota}`, {
        method: 'POST',
        headers: { 'content-type': 'application/json', 'x-tusab-chave': chave },
        body: JSON.stringify(corpo),
        signal: AbortSignal.timeout(prazo),
      });
    } catch (e) {
      if (e.name === 'TimeoutError') throw new Error('O Tusab principal demorou demais para responder.');
      throw new SemPrincipal(e.message); // conexão recusada: o principal fechou
    }
    const json = await resposta.json().catch(() => null);
    if (!resposta.ok) throw new Error(json?.message || `HTTP ${resposta.status}`);
    return json;
  }

  /** Mensageiro: executa uma ferramenta MCP no principal e devolve o resultado MCP. */
  ferramenta(nome, argumentos) {
    return this._post('ferramenta', { nome, argumentos, de: this.id, versao: this.versao });
  }

  /** Mensageiro: conta ao principal qual IA está conectada aqui (aparece na tela). Nunca falha. */
  async avisar(evento, cliente = null) {
    try {
      await this._post('cliente', { evento, cliente, de: this.id }, 5000);
    } catch { /* o principal pode estar subindo ou saindo; o próximo aviso corrige */ }
  }

  /**
   * Mensageiro: confere de tempos em tempos se o principal continua vivo; se não,
   * chama aoPerder (que tenta assumir). Também renova o "estou aqui" na tela do principal.
   */
  vigiar(aoPerder, aoRenovar = () => {}) {
    this.pararVigia();
    this._vigia = setInterval(async () => {
      if (this.souPrincipal) return this.pararVigia();
      const info = this._ler();
      if (!info || info.id !== this.principal?.id || !processoVivo(info.pid)) {
        this.pararVigia();
        try { await aoPerder(); } catch (e) { process.stderr.write(`[tusab] coordenação: ${e.message}\n`); }
        return;
      }
      aoRenovar();
    }, this.intervaloVigia);
    this._vigia.unref?.();
  }

  pararVigia() {
    if (this._vigia) clearInterval(this._vigia);
    this._vigia = null;
  }
}
