// Ajuda contextual: o botão Ajuda, no topo da tela, abre a explicação da funcionalidade aberta.
// Cada tela tem um título e os passos, em ajuda.tela.<tela>.* nos arquivos de idioma.
export const AJUDA_POR_TELA = {
  inicio: 4,
  extracao: 5,
  repositorio: 5,
  estudo: 5,
  materiais: 4,
  'visao-geral': 2,
  monitor: 2,
  admin: 3,
};

/** Passos da tela (chaves de tradução) ou null se a tela não tiver ajuda própria. */
export function ajudaDaTela(tela) {
  const n = AJUDA_POR_TELA[tela];
  if (!n) return null;
  return {
    titulo: `ajuda.tela.${tela}.titulo`,
    passos: Array.from({ length: n }, (_, i) => `ajuda.tela.${tela}.passo${i + 1}`),
  };
}
