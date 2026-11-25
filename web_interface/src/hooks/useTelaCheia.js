import { useCallback, useEffect, useState } from 'react';

// Tela cheia do navegador (Fullscreen API). O navegador só aceita entrar por um gesto do usuário
// (clique ou tecla); sair é sempre possível, e o Esc do próprio navegador também sai.
// Safari antigo usa os nomes com prefixo webkit.
const elementoCheio = () => document.fullscreenElement || document.webkitFullscreenElement || null;

export function telaCheiaSuportada() {
  return typeof document !== 'undefined' && Boolean(document.fullscreenEnabled || document.webkitFullscreenEnabled);
}

export function useTelaCheia() {
  const [cheia, setCheia] = useState(() => (typeof document !== 'undefined' ? Boolean(elementoCheio()) : false));

  useEffect(() => {
    const atualizar = () => setCheia(Boolean(elementoCheio()));
    document.addEventListener('fullscreenchange', atualizar);
    document.addEventListener('webkitfullscreenchange', atualizar);
    return () => {
      document.removeEventListener('fullscreenchange', atualizar);
      document.removeEventListener('webkitfullscreenchange', atualizar);
    };
  }, []);

  const alternar = useCallback(() => {
    const raiz = document.documentElement;
    const pedido = elementoCheio()
      ? (document.exitFullscreen || document.webkitExitFullscreen)?.call(document)
      : (raiz.requestFullscreen || raiz.webkitRequestFullscreen)?.call(raiz);
    // O navegador pode recusar (política da página, iframe): a tela segue como estava.
    Promise.resolve(pedido).catch(() => {});
  }, []);

  return { cheia, alternar, suportada: telaCheiaSuportada() };
}
