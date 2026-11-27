// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
// Feedback voluntário (24/11/2026). O Tusab não manda nada sozinho: em momentos certos a tela
// convida, o usuário vê exatamente o que vai (nota, comentário e, se quiser, os números de uso) e
// só então envia. Destino: o coletor da CriAugu (coletor.criaugu.com, na hospedagem da Hostinger; código
// em coletor-feedback/ na raiz do repositório), que guarda uma linha e manda um e-mail para
// tusab@tusab.solutions. Se o envio falhar, o usuário manda por e-mail (o texto já vai pronto).
//
// Estado em data/config/feedback.json; os números vêm de uso.js e dos módulos que já contam.

import crypto from 'node:crypto';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { caminhos, lerJson, salvarJson } from './caminhos.js';
import { idioma, t } from './idioma.js';
import { lerUso } from './uso.js';
import { lerPreferencias, PROMPTS } from './prompts.js';
import { resumoDasTrilhas } from './trilhas.js';
import { resumoEconomia } from './tokens.js';

/** Endereço do coletor da CriAugu (coletor-feedback/index.php, publicado em coletor.criaugu.com). */
export const URL_COLETOR = 'https://coletor.criaugu.com/';
export const EMAIL_FEEDBACK = 'tusab@tusab.solutions';
/** Versão do pacote (a mesma que o servidor usa: package.json). */
export const VERSAO = JSON.parse(fs.readFileSync(new URL('../../package.json', import.meta.url), 'utf8')).version;

const DIA = 24 * 60 * 60 * 1000;
const INTERVALO_ENTRE_CONVITES = 30 * DIA;
const ADIAR = 14 * DIA;
const LIMITES = { comentario: 1500, email: 200 };

const arquivo = (raiz) => path.join(caminhos(raiz).config, 'feedback.json');

function lerEstado(raiz) {
  const d = lerJson(arquivo(raiz), null) || {};
  return {
    instalacao: /^[0-9a-f-]{36}$/.test(d.instalacao) ? d.instalacao : crypto.randomUUID(),
    convites: Array.isArray(d.convites) ? d.convites.slice(-50) : [],
    enviados: Array.isArray(d.enviados) ? d.enviados.slice(-50) : [],
    adiado_ate: Number.isFinite(d.adiado_ate) ? d.adiado_ate : 0,
    nunca: d.nunca === true,
    trilhas_vistas: Number.isInteger(d.trilhas_vistas) ? d.trilhas_vistas : 0,
  };
}
const gravar = (raiz, estado) => salvarJson(arquivo(raiz), estado, 2);

/** Endereço do coletor: o do pacote, ou TUSAB_FEEDBACK_URL (testes e diagnóstico). Só https do coletor da CriAugu, ou http local nos testes. */
export function urlColetor() {
  const bruto = String(process.env.TUSAB_FEEDBACK_URL ?? URL_COLETOR).trim();
  if (!bruto) return null;
  try {
    const u = new URL(bruto);
    if (u.protocol === 'https:' && u.hostname === 'coletor.criaugu.com') return u.href;
    if (u.protocol === 'http:' && u.hostname === '127.0.0.1' && process.env.TUSAB_FEEDBACK_URL) return u.href;
  } catch { /* endereço inválido = sem coletor */ }
  return null;
}

// ── Quando convidar ─────────────────────────────────────────────────────────
// Momentos em que o usuário acabou de ter valor do Tusab, nunca no primeiro contato:
//   trilha_concluida — terminou uma trilha (cada nova conclusão pode convidar);
//   materiais        — a IA já guardou 5 materiais (uma vez);
//   uso_semana       — uma semana depois do primeiro uso, com 3 dias de uso e 10 consultas da IA (uma vez);
//   nova_versao      — já mandou feedback antes e está numa versão nova (uma vez por versão).
// Regras: nada se o usuário pediu para não perguntar; nada até a data do "agora não" (14 dias);
// no máximo um convite a cada 30 dias.

/** → { mostrar, gatilho } */
export function conviteFeedback(raiz, versao = VERSAO, agora = Date.now()) {
  const e = lerEstado(raiz);
  const nao = { mostrar: false, gatilho: null };
  if (e.nunca || agora < e.adiado_ate) return nao;
  const ultimo = Math.max(0, ...e.convites.map((c) => c.em || 0), ...e.enviados.map((c) => c.em || 0));
  if (agora - ultimo < INTERVALO_ENTRE_CONVITES) return nao;
  const u = lerUso(raiz);
  const jaConvidou = (g) => e.convites.some((c) => c.gatilho === g);
  const consultas = Object.values(u.ferramentas).reduce((a, b) => a + b, 0);
  const diasDesde = u.primeiro_uso ? (agora - Date.parse(u.primeiro_uso)) / DIA : 0;
  if ((u.eventos.trilha_concluida || 0) > e.trilhas_vistas) return { mostrar: true, gatilho: 'trilha_concluida' };
  if ((u.ferramentas.tusab_salvar_estudo || 0) >= 5 && !jaConvidou('materiais')) return { mostrar: true, gatilho: 'materiais' };
  if (diasDesde >= 7 && u.dias_ativos >= 3 && consultas >= 10 && !jaConvidou('uso_semana')) return { mostrar: true, gatilho: 'uso_semana' };
  const ultimoEnvio = e.enviados.at(-1);
  if (ultimoEnvio && versao && ultimoEnvio.versao !== versao && !e.convites.some((c) => c.gatilho === 'nova_versao' && c.versao === versao)) {
    return { mostrar: true, gatilho: 'nova_versao' };
  }
  return nao;
}

/** A tela mostrou o convite, ou o usuário respondeu "agora não" / "não perguntar mais". */
export function registrarConvite(raiz, { acao, gatilho } = {}, versao = VERSAO, agora = Date.now()) {
  if (!['mostrado', 'adiar', 'nunca'].includes(acao)) return { error: true, message: t('Ação inválida.') };
  const e = lerEstado(raiz);
  if (acao === 'mostrado') {
    e.convites.push({ gatilho: String(gatilho || 'manual').slice(0, 40), em: agora, versao });
    e.trilhas_vistas = lerUso(raiz).eventos.trilha_concluida || 0;
  }
  if (acao === 'adiar') e.adiado_ate = agora + ADIAR;
  if (acao === 'nunca') e.nunca = true;
  gravar(raiz, e);
  return { ok: true };
}

// ── O que vai ───────────────────────────────────────────────────────────────

/**
 * Números de uso para o envio: só contagens. Prompts do usuário entram somados como "meus";
 * projetos, fontes e trilhas entram como quantidades, sem nome.
 */
export function metricasDeUso(tusab, versao = VERSAO) {
  const raiz = tusab.raiz;
  const u = lerUso(raiz);
  const prefs = lerPreferencias(raiz);
  const daCasa = new Set(PROMPTS.map((p) => p.id));
  const prompts = {};
  for (const [id, n] of Object.entries(prefs.usos)) {
    const chave = daCasa.has(id) ? id : 'meus';
    prompts[chave] = (prompts[chave] || 0) + n;
  }
  let base = { projetos: 0, fontes: 0, videos: 0, trechos: 0 };
  try {
    for (const p of tusab.indice.listarProjetos()) {
      base = { projetos: base.projetos + 1, fontes: base.fontes + p.fontes, videos: base.videos + p.videos, trechos: base.trechos + p.trechos };
    }
  } catch { /* índice indisponível: segue sem a base */ }
  let canaisComVerificacao = 0;
  try { canaisComVerificacao = tusab.atualizacao.canaisAtivos().length; } catch { /* sem atualização */ }
  const eco = resumoEconomia(raiz);
  return {
    versao,
    sistema: os.platform(),
    node: process.versions.node.split('.')[0],
    idioma: idioma(),
    primeiro_uso: u.primeiro_uso,
    dias_ativos: u.dias_ativos,
    ferramentas: u.ferramentas,
    ias_conectadas: u.clientes,
    base: { ...base, canais_com_verificacao: canaisComVerificacao },
    prompts: { usos: prompts, favoritos: prefs.favoritos.length, menu: prefs.menu },
    trilhas: resumoDasTrilhas(raiz),
    economia: { consultas: eco.consultas, economia_percentual: eco.economia_percentual },
  };
}

function validarResposta({ nota, comentario, email } = {}) {
  const n = nota === null || nota === undefined || nota === '' ? null : Number(nota);
  if (n !== null && !(Number.isInteger(n) && n >= 0 && n <= 10)) throw new Error(t('A nota vai de 0 a 10.'));
  const c = String(comentario ?? '').trim();
  if (c.length > LIMITES.comentario) throw new Error(t('O comentário pode ter até {n} caracteres.', { n: LIMITES.comentario }));
  const m = String(email ?? '').trim();
  if (m && (m.length > LIMITES.email || !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(m))) throw new Error(t('Confira o e-mail.'));
  if (n === null && !c) throw new Error(t('Dê uma nota ou escreva um comentário.'));
  return { nota: n, comentario: c, email: m };
}

/** O envio completo, exatamente como sai (a tela mostra antes de enviar). */
export function montarEnvio(tusab, versao = VERSAO, corpo = {}) {
  const resposta = validarResposta(corpo);
  const e = lerEstado(tusab.raiz);
  gravar(tusab.raiz, e); // garante o código de instalação
  return {
    tipo: 'tusab-feedback',
    formato: 1,
    instalacao: e.instalacao,
    gatilho: String(corpo.gatilho || 'manual').slice(0, 40),
    ...resposta,
    metricas: corpo.incluir_metricas === false ? null : metricasDeUso(tusab, versao),
  };
}

/** Texto e link de e-mail com o mesmo envio (quando não há coletor ou ele falhou). */
export function alternativaEmail(envio) {
  const assunto = `Feedback do Tusab ${envio.metricas?.versao || ''}`.trim();
  const corpo = [
    envio.nota === null ? '' : `Nota: ${envio.nota}/10`,
    envio.comentario ? `\n${envio.comentario}` : '',
    '\n--- dados (não apague) ---',
    JSON.stringify(envio),
  ].filter(Boolean).join('\n');
  return { email: EMAIL_FEEDBACK, assunto, corpo, mailto: `mailto:${EMAIL_FEEDBACK}?subject=${encodeURIComponent(assunto)}&body=${encodeURIComponent(corpo)}` };
}

/**
 * Envia ao coletor. → { ok: true, canal: 'planilha' } ou { ok: false, message, alternativa }
 * (a alternativa é o e-mail pronto). Registra o envio só quando ele chega.
 */
export async function enviarFeedback(tusab, versao = VERSAO, corpo = {}, { agora = Date.now(), tempoLimiteMs = 15000 } = {}) {
  const envio = montarEnvio(tusab, versao, corpo);
  const url = urlColetor();
  const falha = (message) => ({ ok: false, message, alternativa: alternativaEmail(envio) });
  if (!url) return falha(t('O envio direto ainda não está disponível nesta versão. Mande por e-mail: o texto já está pronto.'));
  try {
    const r = await fetch(url, {
      method: 'POST', headers: { 'content-type': 'text/plain;charset=utf-8' }, body: JSON.stringify(envio),
      redirect: 'error', signal: AbortSignal.timeout(tempoLimiteMs),
    });
    const resposta = await r.json().catch(() => null);
    if (!r.ok || !resposta?.ok) return falha(t('O envio não foi aceito agora. Mande por e-mail: o texto já está pronto.'));
  } catch {
    return falha(t('Sem conexão com o destino do feedback. Mande por e-mail: o texto já está pronto.'));
  }
  const e = lerEstado(tusab.raiz);
  e.enviados.push({ em: agora, gatilho: envio.gatilho, versao, canal: 'planilha' });
  e.trilhas_vistas = lerUso(tusab.raiz).eventos.trilha_concluida || 0;
  gravar(tusab.raiz, e);
  return { ok: true, canal: 'planilha' };
}

/** O usuário mandou pelo e-mail (botão da alternativa): conta como envio, para não convidar de novo logo. */
export function registrarEnvioPorEmail(raiz, { gatilho } = {}, versao = VERSAO, agora = Date.now()) {
  const e = lerEstado(raiz);
  e.enviados.push({ em: agora, gatilho: String(gatilho || 'manual').slice(0, 40), versao, canal: 'email' });
  gravar(raiz, e);
  return { ok: true };
}
