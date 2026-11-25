/**
 * @file TrilhasPainel.jsx
 * @description Aba "Trilhas" da Biblioteca de Prompts: prompts em sequência, com o passo guardado por
 *   projeto no plugin (GET /api/trilhas, POST /api/trilhas/andamento). Aqui o usuário copia o passo
 *   atual e marca como feito; no Claude, o atalho "Trilha: …" do menu "+" segue o mesmo andamento.
 * @copyright © 2026 CriAugu — CNPJ 65.131.075/0001-57
 */
import React, { useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { Check, Copy, RotateCcw, Undo2, Play, CircleDot, Circle } from 'lucide-react';
import { API_BASE, BTN_FOCUS } from '../../constants';

export default function TrilhasPainel({ darkMode, projeto, onCopiarPasso }) {
  const { t, i18n } = useTranslation();
  const [trilhas, setTrilhas] = useState([]);
  const [temas, setTemas] = useState({});
  const [aviso, setAviso] = useState('');

  const carregar = useCallback(() => axios.get(`${API_BASE}/trilhas`, { params: { projeto } })
    .then((r) => setTrilhas(r.data?.trilhas || []))
    .catch(() => setAviso(t('ext.trilhas.erro'))), [projeto, t]);
  useEffect(() => { carregar(); }, [carregar, i18n.resolvedLanguage]);

  const mudar = async (trilha, acao) => {
    try {
      const r = await axios.post(`${API_BASE}/trilhas/andamento`, { projeto, trilha: trilha.id, acao, tema: temas[trilha.id] || '' });
      if (r.data?.error) throw new Error(r.data.message);
      setTrilhas((l) => l.map((x) => (x.id === trilha.id ? r.data.trilha : x)));
      const a = r.data.trilha.andamento;
      setAviso(a.concluida ? t('ext.trilhas.aviso_concluida', { titulo: trilha.titulo })
        : t('ext.trilhas.aviso_passo', { n: a.passo + 1, total: trilha.passos.length, passo: trilha.passos[a.passo].titulo }));
    } catch (e) {
      setAviso(e?.response?.data?.message || e.message);
    }
  };

  const textoSec = darkMode ? 'text-slate-400' : 'text-slate-500';
  const cartao = darkMode ? 'bg-white/4 border-white/10' : 'bg-white border-slate-200 shadow-sm';
  const btnSec = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold border disabled:opacity-40 disabled:cursor-not-allowed ${BTN_FOCUS} ${darkMode ? 'border-white/15 text-slate-300 hover:bg-white/8' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`;
  const btnPri = `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-button text-white hover:bg-primary-button/85 disabled:opacity-40 disabled:cursor-not-allowed ${BTN_FOCUS}`;
  const semProjeto = !projeto;

  return (
    <div className="space-y-3">
      <p className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-600'}`}>{t('ext.trilhas.dica')}</p>
      <p role="status" aria-live="polite" className={`text-xs min-h-[1rem] ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{aviso}</p>
      <div className="grid gap-3 lg:grid-cols-2">
        {trilhas.map((tr) => {
          const a = tr.andamento;
          const atual = a && !a.concluida ? a.passo : -1;
          return (
            <article key={tr.id} data-trilha={tr.id} className={`rounded-2xl border p-4 flex flex-col gap-3 ${cartao}`}>
              <header>
                <h3 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-800'}`}>
                  <span aria-hidden="true">{tr.icone}</span> {tr.titulo}
                </h3>
                <p className={`text-xs mt-0.5 ${textoSec}`}>{tr.descricao}</p>
                {a?.tema && <p className={`text-[11px] mt-1 ${textoSec}`}>{t('ext.trilhas.tema_atual', { tema: a.tema })}</p>}
              </header>
              <ol className="space-y-1" aria-label={t('ext.trilhas.passos_de', { titulo: tr.titulo })}>
                {tr.passos.map((p, i) => {
                  const feito = a && (a.concluida || i < a.passo);
                  const Icone = feito ? Check : i === atual ? CircleDot : Circle;
                  return (
                    <li key={p.id} aria-current={i === atual ? 'step' : undefined}
                      className={`flex items-center gap-2 text-xs ${i === atual ? 'font-bold text-primary' : feito ? textoSec : darkMode ? 'text-slate-300' : 'text-slate-700'}`}>
                      <Icone size={13} aria-hidden="true" className="shrink-0" />
                      <span>{i + 1}. {p.titulo}</span>
                      <span className="sr-only">{feito ? t('ext.trilhas.feito') : i === atual ? t('ext.trilhas.atual') : ''}</span>
                    </li>
                  );
                })}
              </ol>
              <div className="flex flex-wrap gap-2 mt-auto items-end">
                {!a && (
                  <>
                    <label className="flex flex-col gap-1 flex-1 min-w-[160px]">
                      <span className={`text-[11px] font-bold ${textoSec}`}>{t('ext.trilhas.tema_opcional')}</span>
                      <input value={temas[tr.id] || ''} maxLength={200} data-campo="tema-trilha"
                        onChange={(e) => setTemas((x) => ({ ...x, [tr.id]: e.target.value }))}
                        className={`rounded-xl border px-3 py-1.5 text-xs ${BTN_FOCUS} ${darkMode ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-800'}`} />
                    </label>
                    <button onClick={() => mudar(tr, 'iniciar')} disabled={semProjeto} className={btnPri} data-acao="comecar-trilha">
                      <Play size={13} aria-hidden="true" /> {t('ext.trilhas.comecar')}
                    </button>
                  </>
                )}
                {a && !a.concluida && (
                  <>
                    <button onClick={() => onCopiarPasso(tr.passos[a.passo].id, a.tema)} disabled={semProjeto} className={btnPri} data-acao="copiar-passo">
                      <Copy size={13} aria-hidden="true" /> {t('ext.trilhas.copiar_passo', { n: a.passo + 1 })}
                    </button>
                    <button onClick={() => mudar(tr, 'concluir')} className={btnSec} data-acao="concluir-passo">
                      <Check size={13} aria-hidden="true" /> {t('ext.trilhas.concluir_passo')}
                    </button>
                    {a.passo > 0 && (
                      <button onClick={() => mudar(tr, 'voltar')} className={btnSec} data-acao="voltar-passo">
                        <Undo2 size={13} aria-hidden="true" /> {t('ext.trilhas.voltar')}
                      </button>
                    )}
                  </>
                )}
                {a?.concluida && <span className={`text-xs font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>✓ {t('ext.trilhas.concluida')}</span>}
                {a && (
                  <button onClick={() => mudar(tr, 'reiniciar')} className={`${btnSec} ml-auto`} data-acao="recomecar-trilha"
                    aria-label={t('ext.trilhas.recomecar_rotulo', { titulo: tr.titulo })}>
                    <RotateCcw size={13} aria-hidden="true" /> {t('ext.trilhas.recomecar')}
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>
    </div>
  );
}
