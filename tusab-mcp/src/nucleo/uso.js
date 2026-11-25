// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
// Contadores de uso, só neste computador (data/config/uso.json). Servem a dois fins: o convite de
// feedback na hora certa (feedback.js) e os números que o usuário pode decidir enviar junto com o
// feedback. Guardam só contagens: nada de conteúdo, consultas, nomes de projeto, títulos ou pastas.
//
// Quem grava é o processo principal (as ferramentas dos mensageiros rodam nele; ver coordenacao.js).

import path from 'node:path';
import { caminhos, lerJson, salvarJson } from './caminhos.js';

const NOME_SEGURO = /^[a-z0-9][a-z0-9_.:-]{0,59}$/i; // nome de ferramenta, de cliente de IA ou de evento

const arquivo = (raiz) => path.join(caminhos(raiz).config, 'uso.json');
const hoje = () => new Date().toISOString().slice(0, 10);

/** → { primeiro_uso, ultimo_dia, dias_ativos, ferramentas: {}, clientes: {}, eventos: {} } */
export function lerUso(raiz) {
  const d = (raiz && lerJson(arquivo(raiz), null)) || {};
  const contagens = (o) => Object.fromEntries(Object.entries(o && typeof o === 'object' ? o : {})
    .filter(([k, v]) => NOME_SEGURO.test(k) && Number.isInteger(v) && v > 0));
  return {
    primeiro_uso: typeof d.primeiro_uso === 'string' ? d.primeiro_uso : null,
    ultimo_dia: typeof d.ultimo_dia === 'string' ? d.ultimo_dia : null,
    dias_ativos: Number.isInteger(d.dias_ativos) ? d.dias_ativos : 0,
    ferramentas: contagens(d.ferramentas),
    clientes: contagens(d.clientes),
    eventos: contagens(d.eventos),
  };
}

function contar(raiz, grupo, nome) {
  if (!raiz || !NOME_SEGURO.test(String(nome))) return;
  try {
    const u = lerUso(raiz);
    const dia = hoje();
    u.primeiro_uso ??= dia;
    if (u.ultimo_dia !== dia) { u.dias_ativos += 1; u.ultimo_dia = dia; }
    u[grupo][nome] = (u[grupo][nome] || 0) + 1;
    salvarJson(arquivo(raiz), u, 2);
  } catch { /* contador nunca atrapalha o uso */ }
}

/** A IA chamou uma ferramenta do Tusab. */
export const contarFerramenta = (raiz, nome) => contar(raiz, 'ferramentas', nome);
/** Uma ferramenta de IA se conectou (nome que ela informa: claude-ai, cursor, vscode…). */
export const contarCliente = (raiz, nome) => contar(raiz, 'clientes', String(nome || 'desconhecido').toLowerCase().replace(/[^a-z0-9_.:-]+/g, '-').slice(0, 60) || 'desconhecido');
/** Um marco do uso (ex.: trilha_concluida). */
export const contarEvento = (raiz, nome) => contar(raiz, 'eventos', nome);
