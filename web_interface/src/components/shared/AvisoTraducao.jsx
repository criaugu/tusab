/**
 * Aviso para quem tem o navegador num idioma que o Tusab não traz pronto (ex.: francês).
 * A tela abre em inglês e oferece baixar uma tradução feita pelo próprio navegador, neste computador
 * (services/traducaoAutomatica.js). Sem o tradutor embutido, sugere a tradução de página do navegador.
 * Os textos daqui ficam em inglês de propósito: ainda não existe tradução para mostrar.
 */
import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Languages, X } from 'lucide-react';
import { BTN_FOCUS } from '../../constants';
import {
  avisoDispensado, dispensarAviso, idiomaSemTraducaoPronta, nomeDoIdioma, situacaoDoTradutor, traduzirTela, traducaoBaixada,
} from '../../services/traducaoAutomatica';

export default function AvisoTraducao({ darkMode }) {
  const alvo = idiomaSemTraducaoPronta();
  const [situacao, setSituacao] = useState(null); // resposta do navegador
  const [estado, setEstado] = useState('oferta'); // oferta | trabalhando | pronto | erro
  const [progresso, setProgresso] = useState('');
  const cancelar = useRef(null);
  const [fechado, setFechado] = useState(() => !alvo || avisoDispensado(alvo) || traducaoBaixada(alvo));

  useEffect(() => {
    if (fechado || !alvo) return;
    situacaoDoTradutor(alvo).then(setSituacao);
  }, [alvo, fechado]);

  if (fechado || !alvo || situacao === null) return null;

  const nomeLocal = nomeDoIdioma(alvo, alvo);
  const nomeIngles = nomeDoIdioma(alvo, 'en');
  const podeTraduzir = !['sem-tradutor', 'unavailable'].includes(situacao);

  const fechar = () => { dispensarAviso(alvo); setFechado(true); };
  const traduzir = async () => {
    setEstado('trabalhando');
    cancelar.current = new AbortController();
    setProgresso(situacao === 'available' ? 'Translating…' : 'Downloading the translation model…');
    try {
      await traduzirTela(alvo, cancelar.current.signal, (p) => {
        if (p.fase === 'baixando') setProgresso(`Downloading the translation model… ${Math.round((p.parte || 0) * 100)}%`);
        else setProgresso(`Translating… ${p.feitos} / ${p.total}`);
      });
      setEstado('pronto');
      setTimeout(() => setFechado(true), 4000);
    } catch (e) {
      setEstado(e?.name === 'AbortError' ? 'oferta' : 'erro');
    }
  };

  const caixa = darkMode ? 'bg-[#0C1122] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900';
  const sec = darkMode ? 'text-slate-300' : 'text-slate-600';
  const botao = `px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${BTN_FOCUS}`;

  // Direto no <body> e acima de tudo (a tela de entrada e a apresentação ficam em camadas altas):
  // o aviso precisa aparecer antes delas, para a apresentação já sair traduzida.
  return createPortal(
    <section role="region" aria-label="Translation" aria-live="polite" lang="en"
      className={`fixed bottom-5 left-5 z-[10002] w-[min(26rem,calc(100vw-2.5rem))] rounded-2xl border shadow-2xl p-4 space-y-3 ${caixa}`}>
      <div className="flex items-start gap-3">
        <Languages size={18} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
        <div className="space-y-1 flex-1">
          <p className="text-sm font-bold">
            Tusab in <span lang={alvo}>{nomeLocal}</span>{nomeLocal !== nomeIngles ? ` (${nomeIngles})` : ''}
          </p>
          {estado === 'oferta' && (podeTraduzir ? (
            <p className={`text-xs leading-relaxed ${sec}`}>
              Tusab comes in Portuguese, English and Spanish, so this screen is in English. Your browser can translate it
              into <span lang={alvo}>{nomeLocal}</span> on this computer: nothing is sent anywhere, and the translation is
              kept for next time. It is automatic, so some phrases may sound odd.
            </p>
          ) : (
            <p className={`text-xs leading-relaxed ${sec}`}>
              Tusab comes in Portuguese, English and Spanish, so this screen is in English. To read it
              in <span lang={alvo}>{nomeLocal}</span>, use your browser&apos;s page translation (right-click › Translate).
            </p>
          ))}
          {estado === 'trabalhando' && <p className={`text-xs ${sec}`}>{progresso}</p>}
          {estado === 'trabalhando' && (
            <button onClick={() => cancelar.current?.abort()} className={`${botao} ${darkMode ? 'text-slate-300 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-100'}`}>
              Cancel
            </button>
          )}
          {estado === 'pronto' && <p className={`text-xs ${sec}`}>Done. You can switch languages any time in Admin.</p>}
          {estado === 'erro' && <p className={`text-xs ${sec}`}>The translation could not be completed. Try your browser&apos;s page translation (right-click › Translate).</p>}
        </div>
        {estado !== 'trabalhando' && (
          <button onClick={fechar} aria-label="Close" className={`p-1 rounded-lg shrink-0 ${BTN_FOCUS} ${darkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
            <X size={14} />
          </button>
        )}
      </div>
      {estado === 'oferta' && (
        <div className="flex flex-wrap gap-2 justify-end">
          <button onClick={fechar} className={`${botao} ${darkMode ? 'text-slate-300 hover:bg-white/8' : 'text-slate-600 hover:bg-slate-100'}`}>
            {podeTraduzir ? 'Keep English' : 'Got it'}
          </button>
          {podeTraduzir && (
            <button onClick={traduzir} className={`${botao} bg-primary-button text-white hover:bg-primary-button/85`}>
              Download and translate
            </button>
          )}
        </div>
      )}
    </section>,
    document.body,
  );
}

