// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
// Busca por significado, OPÇÃO AVANÇADA: embeddings feitos NESTE computador pelo Ollama.
// O caminho principal é a própria IA do usuário (variações e trecho esperado em tusab_buscar);
// isto só soma para quem já usa o Ollama. Ninguém é convidado a instalá-lo: sem configuração
// explícita, o status nem menciona o recurso.
//
// Se o usuário tem o Ollama aberto (127.0.0.1:11434) com o modelo de embeddings, o Tusab
// transforma cada trecho da base num vetor e, na busca, junta duas listas pela fusão por
// posição (RRF, em indice.js): a das palavras (FTS5/BM25) e a dos trechos de sentido parecido.
// Sem Ollama, nada muda: a busca é só por palavras (com as variações da IA).
//
// - Privacidade: o texto só vai para um endereço local (127.0.0.1, localhost, ::1); qualquer
//   outro endereço desliga o recurso.
// - Os .txt continuam sendo a fonte da verdade: os vetores são um cache em data/vetores/,
//   chaveado pelo hash do texto do trecho, que pode ser apagado e refeito.
// - Formato: data/vetores/<modelo>.bin = cabeçalho (8 bytes "TUSABV01" + uint32 dimensão) e
//   registros [16 bytes do sha-256 do texto][dimensão × float32], vetores normalizados.
// - Só o processo principal preenche (ver coordenacao.js): iniciar() liga o preenchimento.
//
// Variáveis: TUSAB_EMBEDDINGS=0 desliga; TUSAB_OLLAMA_URL (só local) e TUSAB_EMBEDDINGS_MODELO.

import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { caminhos, escreverAtomico } from './caminhos.js';

const URL_PADRAO = 'http://127.0.0.1:11434';
const MODELO_PADRAO = 'nomic-embed-text';
const MAGICO = Buffer.from('TUSABV01');
const CABECALHO = MAGICO.length + 4;
const BYTES_HASH = 16;
const LOTE = 32;
const PAUSA_APOS_FALHA_MS = 60_000;
const ESPERA_CONSULTA_MS = 10_000; // a 1ª chamada carrega o modelo na memória e demora mais
const ESPERA_LOTE_MS = 120_000;
const SEMELHANTES = 20;
const PISO_SEMELHANCA = 0.3; // abaixo disso o trecho não tem a ver com a consulta

/** Lê as variáveis de ambiente. `motivo` explica por que está desligado (vai para o status). */
export function configuracaoVetores(env = process.env) {
  const desligado = /^(0|false|nao|não|off|no)$/i.test(String(env.TUSAB_EMBEDDINGS ?? '').trim());
  // Alguém configurou de propósito: aí o status explica o que falta, se faltar.
  const explicita = ['TUSAB_EMBEDDINGS', 'TUSAB_OLLAMA_URL', 'TUSAB_EMBEDDINGS_MODELO'].some((k) => String(env[k] ?? '').trim());
  const modelo = String(env.TUSAB_EMBEDDINGS_MODELO || MODELO_PADRAO).trim();
  const bruto = String(env.TUSAB_OLLAMA_URL || URL_PADRAO).trim().replace(/\/+$/, '');
  let url = null;
  try {
    const u = new URL(bruto);
    if (['http:', 'https:'].includes(u.protocol) && ['127.0.0.1', 'localhost', '[::1]'].includes(u.hostname)) url = u.origin;
  } catch { /* endereço inválido: fica desligado */ }
  if (desligado) return { ligado: false, motivo: 'desligada', url, modelo, explicita };
  if (!url) return { ligado: false, motivo: 'endereco', url: null, modelo, explicita };
  if (!/^[\w.:/-]{1,100}$/.test(modelo)) return { ligado: false, motivo: 'modelo', url, modelo, explicita };
  return { ligado: true, motivo: null, url, modelo, explicita };
}

function hashDe(texto) {
  return crypto.createHash('sha256').update(texto).digest().subarray(0, BYTES_HASH).toString('hex');
}

function normalizar(v) {
  const f = Float32Array.from(v, Number);
  let soma = 0;
  for (let i = 0; i < f.length; i++) soma += f[i] * f[i];
  const n = Math.sqrt(soma);
  if (!n || !Number.isFinite(n)) return null;
  for (let i = 0; i < f.length; i++) f[i] /= n;
  return f;
}

function produto(a, b) {
  let s = 0;
  for (let i = 0; i < a.length; i++) s += a[i] * b[i];
  return s;
}

export class Vetores {
  constructor(raiz, indice, config = configuracaoVetores()) {
    this.raiz = raiz;
    this.indice = indice;
    this.config = config;
    this.arquivo = path.join(caminhos(raiz).data, 'vetores', `${config.modelo.replace(/[^\w.-]/g, '_')}.bin`);
    this.dimensao = 0;
    this.memoria = null; // Map hash → Float32Array (lido do disco na primeira vez)
    this.mapa = null; // { versao, itens: [{ id, projeto, hash }] } dos trechos do índice
    this.iniciado = false;
    this.fechado = false;
    this.preenchendo = null;
    this.pausaAte = 0;
    this.ultimoErro = null;
  }

  /** Liga o preenchimento em segundo plano (só no processo principal). */
  iniciar() {
    if (!this.config.ligado || this.fechado) return;
    this.iniciado = true;
    this.agendar();
  }

  fechar() {
    this.fechado = true;
  }

  /** Esquece o cache (reset total da base): apaga o arquivo e a memória. */
  esquecer() {
    fs.rmSync(path.dirname(this.arquivo), { recursive: true, force: true });
    this.memoria = new Map();
    this.dimensao = 0;
    this.mapa = null;
  }

  /** Para o status: ligada? quantos trechos já têm vetor? */
  estado() {
    const explicita = !!this.config.explicita;
    if (!this.config.ligado) return { ligada: false, motivo: this.config.motivo, modelo: this.config.modelo, explicita };
    const itens = this._itens();
    const mem = this._memoria();
    const cobertos = itens.filter((x) => mem.has(x.hash)).length;
    const disponivel = !this.ultimoErro || Date.now() >= this.pausaAte;
    return {
      ligada: this.iniciado && disponivel, motivo: !this.iniciado ? 'parada' : disponivel ? null : 'sem_ollama',
      modelo: this.config.modelo, cobertos, total: itens.length, preenchendo: !!this.preenchendo, explicita,
    };
  }

  /**
   * Trechos de sentido parecido com a consulta, do mais ao menos parecido (só ids).
   * Qualquer falha (Ollama fechado, modelo ausente, demora) devolve [] e a busca segue por palavras.
   */
  async semelhantes(consulta, { projeto = null, limite = SEMELHANTES } = {}) {
    if (!this.iniciado || this.fechado || Date.now() < this.pausaAte) return [];
    this.agendar();
    const mem = this._memoria();
    if (!mem.size) return [];
    let q;
    try {
      [q] = await this._embeddings([this._prefixo('search_query: ') + String(consulta)], ESPERA_CONSULTA_MS);
    } catch (e) {
      this._falhou(e);
      return [];
    }
    if (!q || q.length !== this.dimensao) return [];
    const proj = projeto ? String(projeto) : null;
    const notas = [];
    for (const x of this._itens()) {
      if (proj && x.projeto !== proj) continue;
      const v = mem.get(x.hash);
      if (!v) continue;
      const s = produto(q, v);
      if (s >= PISO_SEMELHANCA) notas.push({ id: x.id, s });
    }
    return notas.sort((a, b) => b.s - a.s).slice(0, limite).map((x) => x.id);
  }

  /** Começa a preencher os trechos sem vetor, se ainda não estiver preenchendo. */
  agendar() {
    if (!this.iniciado || this.fechado || this.preenchendo || Date.now() < this.pausaAte) return this.preenchendo;
    this.preenchendo = this._preencher()
      .catch((e) => this._falhou(e))
      .finally(() => { this.preenchendo = null; });
    return this.preenchendo;
  }

  /** Para os testes: espera o preenchimento em andamento terminar. */
  async aguardar() {
    while (this.preenchendo) await this.preenchendo;
  }

  // ── interno ───────────────────────────────────────────────────────────────

  _prefixo(p) {
    // Os modelos nomic pedem o tipo do texto no começo; os outros (bge-m3, mxbai...) não.
    return /nomic/i.test(this.config.modelo) ? p : '';
  }

  _falhou(e) {
    this.pausaAte = Date.now() + PAUSA_APOS_FALHA_MS;
    const msg = e?.message ?? String(e);
    if (msg !== this.ultimoErro) process.stderr.write(`[tusab] busca por significado indisponível (${this.config.modelo}): ${msg}\n`);
    this.ultimoErro = msg;
  }

  async _embeddings(textos, esperaMs) {
    const r = await fetch(`${this.config.url}/api/embed`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: this.config.modelo, input: textos, truncate: true }),
      signal: AbortSignal.timeout(esperaMs),
    });
    if (!r.ok) throw new Error(`Ollama respondeu ${r.status}${r.status === 404 ? ` (rode: ollama pull ${this.config.modelo})` : ''}`);
    const corpo = await r.json();
    const lista = Array.isArray(corpo?.embeddings) ? corpo.embeddings : [];
    if (lista.length !== textos.length) throw new Error('Ollama devolveu um número diferente de vetores');
    const vetores = lista.map((v) => (Array.isArray(v) ? normalizar(v) : null));
    if (vetores.some((v) => !v || v.length !== vetores[0].length)) throw new Error('Ollama devolveu vetor inválido');
    this.ultimoErro = null;
    this.pausaAte = 0;
    return vetores;
  }

  /** Lista (id, projeto, hash) dos trechos do índice; refeita quando o índice muda. */
  _itens() {
    this.indice.atualizarSeMudou();
    const versao = this.indice.mtimeCarregado;
    if (this.mapa?.versao === versao && this.mapa.db === this.indice.db) return this.mapa.itens;
    const itens = this.indice.db.selectObjects(
      'SELECT t.id, f.projeto, t.texto, COALESCE(t.titulo, f.titulo) AS titulo FROM trechos t JOIN fontes f ON f.id = t.fonte_id',
    ).map((r) => ({ id: r.id, projeto: r.projeto, hash: hashDe(this._textoDoTrecho(r)) }));
    this.mapa = { versao, db: this.indice.db, itens };
    return itens;
  }

  _textoDoTrecho(r) {
    return `${this._prefixo('search_document: ')}${r.titulo ? `${r.titulo}\n` : ''}${r.texto}`;
  }

  _memoria() {
    if (this.memoria) return this.memoria;
    this.memoria = new Map();
    let buf;
    try { buf = fs.readFileSync(this.arquivo); } catch { return this.memoria; }
    if (buf.length < CABECALHO || !buf.subarray(0, MAGICO.length).equals(MAGICO)) return this.memoria;
    const dim = buf.readUInt32LE(MAGICO.length);
    const tam = BYTES_HASH + dim * 4;
    if (!dim) return this.memoria;
    const copia = new Uint8Array(buf).buffer; // alinhado para o Float32Array
    // Registro cortado no fim (gravação interrompida) é ignorado.
    for (let p = CABECALHO; p + tam <= buf.length; p += tam) {
      this.memoria.set(buf.subarray(p, p + BYTES_HASH).toString('hex'), new Float32Array(copia, p + BYTES_HASH, dim));
    }
    this.dimensao = dim;
    return this.memoria;
  }

  _registro(hash, v) {
    return Buffer.concat([Buffer.from(hash, 'hex'), Buffer.from(v.buffer, v.byteOffset, v.byteLength)]);
  }

  _cabecalho(dim) {
    const c = Buffer.alloc(CABECALHO);
    MAGICO.copy(c);
    c.writeUInt32LE(dim, MAGICO.length);
    return c;
  }

  async _preencher() {
    for (;;) {
      if (this.fechado) return;
      let mem = this._memoria();
      const itens = this._itens();
      const vivos = new Set(itens.map((x) => x.hash));
      // Vetor de trecho que saiu da base (fonte apagada ou editada) não fica no disco.
      if ([...mem.keys()].some((h) => !vivos.has(h))) this._compactar(vivos);
      const faltam = [...new Map(itens.filter((x) => !mem.has(x.hash)).map((x) => [x.hash, x.id])).values()].slice(0, LOTE);
      if (!faltam.length) return;
      const linhas = this.indice.db.selectObjects(
        `SELECT t.id, t.texto, COALESCE(t.titulo, f.titulo) AS titulo FROM trechos t JOIN fontes f ON f.id = t.fonte_id
          WHERE t.id IN (${faltam.map(() => '?').join(',')})`, faltam,
      );
      if (!linhas.length) return;
      const textos = linhas.map((r) => this._textoDoTrecho(r));
      const vetores = await this._embeddings(textos, ESPERA_LOTE_MS);
      if (this.fechado) return;
      const dim = vetores[0].length;
      if (this.dimensao && dim !== this.dimensao) {
        // O modelo mudou de tamanho (outra versão): o cache antigo não serve mais.
        this.esquecer();
        mem = this._memoria();
      }
      const novo = !this.dimensao || !fs.existsSync(this.arquivo);
      const partes = novo ? [this._cabecalho(dim)] : [];
      textos.forEach((txt, i) => {
        const h = hashDe(txt);
        mem.set(h, vetores[i]);
        partes.push(this._registro(h, vetores[i]));
      });
      fs.mkdirSync(path.dirname(this.arquivo), { recursive: true });
      if (novo) fs.writeFileSync(this.arquivo, Buffer.concat(partes));
      else fs.appendFileSync(this.arquivo, Buffer.concat(partes));
      this.dimensao = dim;
      await new Promise((ok) => setImmediate(ok)); // deixa a busca e a tela respirarem entre os lotes
    }
  }

  _compactar(vivos) {
    const mem = this._memoria();
    for (const h of [...mem.keys()]) if (!vivos.has(h)) mem.delete(h);
    if (!this.dimensao) return;
    const partes = [this._cabecalho(this.dimensao)];
    for (const [h, v] of mem) partes.push(this._registro(h, v));
    escreverAtomico(this.arquivo, Buffer.concat(partes));
  }
}
