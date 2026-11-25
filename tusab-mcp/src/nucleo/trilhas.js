// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
// Trilhas: prompts da biblioteca em sequência (24/11/2026). As referências de prompts para
// NotebookLM e Gemini recomendam encadear pedidos, mas lá o usuário faz isso à mão e perde o fio
// entre conversas. No Tusab a trilha guarda em que passo cada projeto está (e o tema), e o
// resultado de cada passo fica em Materiais, como qualquer prompt.
//
// Andamento em data/config/trilhas.json: lista de { projeto, trilha, passo, tema, ... } (lista, não
// objeto com o nome do projeto como chave: um projeto chamado "__proto__" não estraga nada).

import path from 'node:path';
import { caminhos, lerJson, salvarJson } from './caminhos.js';
import { idioma, t } from './idioma.js';
import { montarPrompt, PROMPTS, exibir } from './prompts.js';
import { contarEvento } from './uso.js';

export const TRILHAS = [
  { id: 'aprender-do-zero', icone: '🌱',
    passos: ['pre-teste', 'trilha-de-trechos', 'notas-cornell', 'recordar-livre', 'simulado-diagnostico', 'revisar-hoje'],
    textos: {
      pt: { titulo: 'Aprender um tema do zero', descricao: 'Pré-teste, os trechos essenciais, anotações, lembrar sem olhar, simulado e revisão espaçada.' },
      en: { titulo: 'Learn a topic from scratch', descricao: 'Pre-test, the essential segments, notes, recall without looking, mock exam and spaced review.' },
      es: { titulo: 'Aprender un tema desde cero', descricao: 'Pretest, los tramos esenciales, apuntes, recordar sin mirar, simulacro y repaso espaciado.' },
    } },
  { id: 'concurso', icone: '🎓',
    passos: ['cobertura-edital', 'plano-estudo', 'notas-cornell', 'simulado-diagnostico', 'revisar-hoje'],
    textos: {
      pt: { titulo: 'Concurso e provas', descricao: 'Do edital ao simulado: o que a base cobre, o plano, as anotações e a revisão dos erros.' },
      en: { titulo: 'Exams and public tests', descricao: 'From the syllabus to the mock exam: what the base covers, the plan, the notes and the review of mistakes.' },
      es: { titulo: 'Oposiciones y exámenes', descricao: 'Del temario al simulacro: lo que cubre la base, el plan, los apuntes y el repaso de los errores.' },
    } },
  { id: 'revisao-pesquisa', icone: '🔎',
    passos: ['pergunta-pico', 'triagem-prisma', 'metodos-amostra', 'matriz-sintese', 'consenso-minoria', 'teste-estresse', 'nota-tecnica'],
    textos: {
      pt: { titulo: 'Revisão de pesquisa', descricao: 'Pergunta, triagem, métodos, síntese, consenso, teste da conclusão e nota técnica.' },
      en: { titulo: 'Research review', descricao: 'Question, screening, methods, synthesis, consensus, stress test of the conclusion and technical note.' },
      es: { titulo: 'Revisión de investigación', descricao: 'Pregunta, cribado, métodos, síntesis, consenso, prueba de la conclusión y nota técnica.' },
    } },
  { id: 'checar-texto', icone: '🛡️',
    passos: ['inventario-afirmacoes', 'rastro-origem', 'auditar-meu-texto'],
    textos: {
      pt: { titulo: 'Checar um texto antes de publicar', descricao: 'As afirmações das fontes, de onde vêm e a conferência do seu texto frase por frase.' },
      en: { titulo: 'Check a text before publishing', descricao: 'The claims in the sources, where they come from and a sentence-by-sentence check of your text.' },
      es: { titulo: 'Revisar un texto antes de publicar', descricao: 'Las afirmaciones de las fuentes, de dónde vienen y la revisión de tu texto frase por frase.' },
    } },
  { id: 'preparar-aula', icone: '🧑‍🏫',
    passos: ['objetivos-bloom', 'aula-de-um-video', 'checagem-formativa', 'rubrica'],
    textos: {
      pt: { titulo: 'Preparar uma aula', descricao: 'Objetivos por nível, aula a partir de um vídeo, checagem de fim de aula e rubrica.' },
      en: { titulo: 'Prepare a class', descricao: 'Objectives by level, a class from one video, an end-of-class check and a rubric.' },
      es: { titulo: 'Preparar una clase', descricao: 'Objetivos por nivel, clase a partir de un video, comprobación al final de la clase y rúbrica.' },
    } },
];

// Toda trilha só usa prompts que existem (falha ao carregar, não na mão do usuário).
for (const tr of TRILHAS) {
  for (const id of tr.passos) if (!PROMPTS.some((p) => p.id === id)) throw new Error(`Trilha ${tr.id}: prompt ${id} não existe`);
}

const arquivo = (raiz) => path.join(caminhos(raiz).config, 'trilhas.json');
const ler = (raiz) => {
  const l = lerJson(arquivo(raiz), []);
  return Array.isArray(l) ? l.filter((a) => a && typeof a.projeto === 'string' && TRILHAS.some((tr) => tr.id === a.trilha)) : [];
};
const limparProjeto = (p) => String(p ?? '').trim().slice(0, 120);
const limparTema = (x) => String(x ?? '').trim().slice(0, 200);

function trilhaOuErro(id) {
  const tr = TRILHAS.find((x) => x.id === id);
  if (!tr) throw new Error(t('Trilha desconhecida.'));
  return tr;
}

/** Trilha no idioma, com os passos (título e ícone de cada prompt). */
function exibirTrilha(tr, lng) {
  const txt = tr.textos[lng] || tr.textos.pt;
  return {
    id: tr.id, icone: tr.icone, ...txt,
    passos: tr.passos.map((id) => {
      const p = exibir(PROMPTS.find((x) => x.id === id), lng);
      return { id, titulo: p.titulo, icone: p.icone, campos: p.campos };
    }),
  };
}

const resumoAndamento = (a, tr) => (a ? {
  passo: a.passo, tema: a.tema || '', concluida: a.passo >= tr.passos.length,
  iniciada_em: a.iniciada_em, atualizada_em: a.atualizada_em,
} : null);

/** Para a tela e para tusab_trilha: as trilhas, com o andamento no projeto. */
export function listarTrilhas(raiz, projeto = '', lng = idioma()) {
  const proj = limparProjeto(projeto);
  const andamentos = proj ? ler(raiz).filter((a) => a.projeto === proj) : [];
  return TRILHAS.map((tr) => ({ ...exibirTrilha(tr, lng), andamento: resumoAndamento(andamentos.find((a) => a.trilha === tr.id), tr) }));
}

/**
 * Muda o andamento: 'iniciar' (começa, ou mantém se já começou; o tema só entra no começo),
 * 'concluir' (passo feito, vai para o próximo), 'voltar' e 'reiniciar' (do zero, com tema novo).
 * → { ok, trilha (com andamento) }
 */
export function mudarAndamento(raiz, { projeto, trilha, acao, tema } = {}, lng = idioma()) {
  const tr = trilhaOuErro(trilha);
  const proj = limparProjeto(projeto);
  if (!proj) throw new Error(t('Escolha um projeto.'));
  if (!['iniciar', 'concluir', 'voltar', 'reiniciar'].includes(acao)) throw new Error(t('Ação de trilha inválida.'));
  const lista = ler(raiz);
  const agora = new Date().toISOString();
  let a = lista.find((x) => x.projeto === proj && x.trilha === tr.id);
  if (!a || acao === 'reiniciar') {
    if (a) lista.splice(lista.indexOf(a), 1);
    a = { projeto: proj, trilha: tr.id, passo: 0, tema: limparTema(tema), iniciada_em: agora };
    lista.push(a);
  }
  if (acao === 'concluir') {
    const antes = a.passo;
    a.passo = Math.min(a.passo + 1, tr.passos.length);
    if (antes < tr.passos.length && a.passo === tr.passos.length) contarEvento(raiz, 'trilha_concluida');
  }
  if (acao === 'voltar') a.passo = Math.max(a.passo - 1, 0);
  a.atualizada_em = agora;
  salvarJson(arquivo(raiz), lista, 2);
  return { ok: true, trilha: { ...exibirTrilha(tr, lng), andamento: resumoAndamento(a, tr) } };
}

/**
 * Pedido do passo atual para a IA com o Tusab conectado (menu "+"): começa a trilha se preciso,
 * diz em que passo está e, no fim, pede para registrar o passo com tusab_trilha.
 */
export function pedidoDaTrilha(raiz, { projeto, trilha, tema } = {}, lng = idioma()) {
  const { trilha: tr } = mudarAndamento(raiz, { projeto, trilha, acao: 'iniciar', tema }, lng);
  const { andamento } = tr;
  if (andamento.concluida) {
    return t('A trilha "{titulo}" já foi concluída no projeto "{projeto}". Para fazer de novo, peça para reiniciá-la com tusab_trilha (acao reiniciar).', { titulo: tr.titulo, projeto: limparProjeto(projeto) }, lng);
  }
  const passo = tr.passos[andamento.passo];
  const cabecalho = t('Trilha "{titulo}" — passo {n} de {total}: {passo}.', { titulo: tr.titulo, n: andamento.passo + 1, total: tr.passos.length, passo: passo.titulo }, lng);
  const fim = t('Quando este passo terminar, pergunte se posso marcá-lo como feito e, se eu concordar, registre com tusab_trilha (projeto "{projeto}", trilha "{trilha}", acao concluir).', { projeto: limparProjeto(projeto), trilha: tr.id }, lng);
  const pedido = montarPrompt(passo.id, { projeto, tema: andamento.tema || tema }, raiz, lng);
  return `${cabecalho}\n\n${pedido}\n\n${fim}`;
}

/** Para as métricas de uso: quantas trilhas foram começadas e concluídas, sem nome de projeto. */
export function resumoDasTrilhas(raiz) {
  const por_trilha = {};
  let iniciadas = 0;
  let concluidas = 0;
  for (const a of ler(raiz)) {
    const tr = TRILHAS.find((x) => x.id === a.trilha);
    const fim = a.passo >= tr.passos.length;
    iniciadas += 1;
    if (fim) concluidas += 1;
    por_trilha[tr.id] ??= { iniciadas: 0, concluidas: 0 };
    por_trilha[tr.id].iniciadas += 1;
    if (fim) por_trilha[tr.id].concluidas += 1;
  }
  return { iniciadas, concluidas, por_trilha };
}
