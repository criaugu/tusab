// Atalhos de teclado da tela do Tusab (conector local) — fonte única para o teclado (App.jsx) e
// para a lista da Ajuda (GuideModal.jsx).
//
// Regra: só números, letras e sinais, NUNCA com Ctrl, Alt, ⌘ ou Option. Todo atalho do Windows, do
// macOS e dos navegadores usa um desses modificadores (ou F1–F12); tecla pura, fora de caixa de texto,
// não briga com nenhum. Navegação por número, na ordem da barra lateral: uma tecla, igual em qualquer
// idioma (letras como "R" de Repositório não fazem sentido em inglês ou espanhol). Podem ser desligados
// na Ajuda (WCAG 2.1.4, atalhos de uma tecla): preferência em localStorage, que persiste porque a tela
// usa sempre a mesma porta por base.

/** Número: ir para uma aba (aba null = tela inicial). O teclado numérico também vale. */
export const ATALHOS_NAVEGACAO = [
  { tecla: '0', aba: null, rotulo: 'guide.atalho_inicio' },
  { tecla: '1', aba: 'extracao', rotulo: 'guide.shortcut_tab_extraction' },
  { tecla: '2', aba: 'repositorio', rotulo: 'guide.shortcut_tab_repo' },
  { tecla: '3', aba: 'estudo', rotulo: 'guide.atalho_prompts' },
  { tecla: '4', aba: 'materiais', rotulo: 'guide.atalho_materiais' },
  { tecla: '5', aba: 'visao-geral', rotulo: 'guide.shortcut_tab_overview' },
  { tecla: '6', aba: 'monitor', rotulo: 'guide.shortcut_tab_monitor' },
  { tecla: '7', aba: 'admin', rotulo: 'guide.shortcut_tab_admin' },
];

/** Uma tecla: ações. */
export const ATALHOS_ACOES = [
  { tecla: '/', acao: 'buscar', rotulo: 'guide.atalho_buscar' },
  { tecla: 'f', acao: 'telaCheia', rotulo: 'guide.atalho_tela_cheia' },
  { tecla: 't', acao: 'tema', rotulo: 'guide.atalho_tema' },
  { tecla: '?', acao: 'ajuda', rotulo: 'guide.atalho_ajuda' },
];

/**
 * N: a ação de criar da tela aberta ("novo", "new", "nuevo": a mesma inicial nos três idiomas).
 * Na Extração abre uma nova extração; nas outras telas clica no botão marcado com data-atalho-novo.
 */
export const TECLA_NOVO = 'n';
export const ATALHO_NOVO_POR_TELA = {
  extracao: 'guide.atalho_nova_extracao',
  repositorio: 'guide.atalho_novo_projeto',
  estudo: 'guide.atalho_novo_prompt',
};

const CHAVE_PREFERENCIA = 'tusab_atalhos';

export function atalhosLigados() {
  try { return localStorage.getItem(CHAVE_PREFERENCIA) !== 'desligados'; } catch { return true; }
}

export function definirAtalhosLigados(ligados) {
  try { localStorage.setItem(CHAVE_PREFERENCIA, ligados ? 'ligados' : 'desligados'); } catch { /* sem armazenamento: vale só nesta visita */ }
}

/**
 * A tecla vale como atalho? Não, se houver Ctrl, Alt, ⌘ ou Option (atalho de outro dono), se o foco
 * estiver num campo de texto, ou se uma janela estiver aberta (o Esc e o Tab são dela).
 * AltGr (Ctrl+Alt juntos, no Windows) passa: em alguns teclados, "/" e "?" saem com ele.
 */
export function teclaDeAtalho(e) {
  if (e.metaKey) return false;
  if (e.ctrlKey !== e.altKey) return false;
  const alvo = document.activeElement;
  const tag = alvo?.tagName?.toLowerCase();
  if (tag === 'input' || tag === 'textarea' || tag === 'select' || alvo?.isContentEditable) return false;
  if (document.querySelector('[role="dialog"][aria-modal="true"]')) return false;
  return true;
}
