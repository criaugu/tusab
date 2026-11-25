/**
 * @file GuideModal.jsx
 * @description Modal de ajuda com guia de uso e atalhos de teclado
 * @module components/shared/GuideModal
 * @author CriAugu <tusab@tusab.solutions>
 * @copyright © 2026 CriAugu — CNPJ 65.131.075/0001-57
 */
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';
import { HelpCircle, X, Keyboard, BookOpen, MessageSquareHeart } from 'lucide-react';
import ModalWrapper from './ModalWrapper';
import { abrirFeedback } from './Feedback';
import { MODO_EXTENSAO } from '../../constants';
import { ajudaDaTela } from '../../constants/ajudaPorTela';
import { ATALHOS_ACOES, ATALHOS_NAVEGACAO, ATALHO_NOVO_POR_TELA, TECLA_NOVO, atalhosLigados, definirAtalhosLigados } from '../../constants/atalhos';

// ─── Atalhos ─────────────────────────────────────────────────────────────────

// Lista em constants/atalhos.js (a mesma que o teclado usa). Teclas mostradas em maiúscula.
const nomeTecla = (k) => (k.length === 1 ? k.toUpperCase() : k);

function getShortcuts(t) {
  return [
    {
      group: t('guide.group_nav'),
      items: ATALHOS_NAVEGACAO.map((a) => ({ keys: [nomeTecla(a.tecla)], desc: t(a.rotulo) })),
    },
    {
      group: t('guide.group_acoes'),
      items: [
        { keys: [nomeTecla(TECLA_NOVO)], desc: t('guide.atalho_novo') },
        ...ATALHOS_ACOES.map((a) => ({ keys: [nomeTecla(a.tecla)], desc: t(a.rotulo) })),
        { keys: ['Esc'], desc: t('guide.atalho_fechar') },
      ],
    },
  ];
}

function Kbd({ children, darkMode }) {
  return (
    <kbd className={`inline-flex items-center justify-center min-w-[22px] h-5 px-1.5 rounded text-[10px] font-bold font-mono border
      ${darkMode ? 'bg-white/10 border-white/20 text-slate-300' : 'bg-slate-100 border-slate-300 text-slate-600'}`}>
      {children}
    </kbd>
  );
}

// ─── Component ───────────────────────────────────────────────────────────────

function GuideModal({ onClose, darkMode, tela = null, abaInicial = 'tela' }) {
  const { t } = useTranslation();
  const SHORTCUTS = getShortcuts(t);
  const ajudaTela = ajudaDaTela(tela);
  const [aba, setAba] = useState(abaInicial === 'tela' && !ajudaTela ? 'guia' : abaInicial); // 'tela' | 'guia' | 'atalhos'
  const [ligados, setLigados] = useState(atalhosLigados);

  const steps = [
    { step: 1,  color: 'primary',   text: t('guide.step1')  },
    { step: 2,  color: 'primary',   text: t('guide.step2')  },
    { step: 3,  color: 'accent',    text: t('guide.step3')  },
    { step: 4,  color: 'accent',    text: t('guide.step4')  },
    { step: 5,  color: 'secondary', text: t('guide.step5')  },
    { step: 6,  color: 'secondary', text: t('guide.step6')  },
    { step: 7,  color: 'secondary', text: t('guide.step7')  },
    { step: 8,  color: 'primary',   text: t('guide.step8')  },
    { step: 9,  color: 'primary',   text: t('guide.step9')  },
    { step: 10, color: 'accent',    text: t('guide.step10') },
  ];

  const tabCls = (id) =>
    `flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors border-b-2 ${
      aba === id
        ? darkMode
          ? 'border-primary text-primary'
          : 'border-violet-600 text-violet-700'
        : `border-transparent ${darkMode ? 'text-slate-400 hover:text-slate-200' : 'text-slate-400 hover:text-slate-600'}`
    }`;

  return (
    <ModalWrapper onClose={onClose} label={t('guide.title')}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 12 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className={`rounded-2xl p-6 max-w-3xl w-full shadow-2xl border ${darkMode ? 'bg-[#0C1122] border-white/15' : 'bg-white border-slate-200'}`}
      >
        {/* Header */}
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-primary/15 flex items-center justify-center shrink-0">
              <HelpCircle size={16} className="text-primary" />
            </div>
            <div>
              <h2 className={`text-sm font-bold ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t('guide.title')}</h2>
              <p className={`text-[11px] ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{t('guide.subtitle')}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            {/* Feedback voluntário: só existe no modo extensão (conector local) */}
            {MODO_EXTENSAO && (
              <button onClick={() => { onClose(); abrirFeedback(); }} data-acao="abrir-feedback"
                className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-bold border transition-colors ${darkMode ? 'border-white/15 text-slate-300 hover:bg-white/10' : 'border-slate-300 text-slate-600 hover:bg-slate-100'}`}>
                <MessageSquareHeart size={13} aria-hidden="true" /> {t('feedback.botao_ajuda')}
              </button>
            )}
            <button onClick={onClose} aria-label={t('feedback.fechar')}
              className={`p-1.5 rounded-lg transition-colors ${darkMode ? 'text-slate-400 hover:bg-white/10' : 'text-slate-500 hover:bg-slate-100'}`}>
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className={`flex items-center gap-1 mb-4 border-b ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
          {ajudaTela && (
            <button className={tabCls('tela')} onClick={() => setAba('tela')} aria-pressed={aba === 'tela'}>
              <HelpCircle size={12} />
              {t('ajuda.aba_tela')}
            </button>
          )}
          <button className={tabCls('guia')} onClick={() => setAba('guia')} aria-pressed={aba === 'guia'}>
            <BookOpen size={12} />
            {t('guide.tab_howto')}
          </button>
          <button className={tabCls('atalhos')} onClick={() => setAba('atalhos')} aria-pressed={aba === 'atalhos'}>
            <Keyboard size={12} />
            {t('guide.tab_shortcuts')}
          </button>
        </div>

        {/* ── Conteúdo: Nesta tela (ajuda da funcionalidade aberta) ───────── */}
        {aba === 'tela' && ajudaTela && (
          <div className="max-h-[60vh] overflow-y-auto pr-1">
            <h3 className={`text-sm font-bold mb-1 ${darkMode ? 'text-white' : 'text-slate-900'}`}>{t(ajudaTela.titulo)}</h3>
            {(() => {
              const numero = ATALHOS_NAVEGACAO.find((a) => (a.aba || 'inicio') === tela)?.tecla;
              const novo = ATALHO_NOVO_POR_TELA[tela];
              if (!numero && !novo) return null;
              return (
                <p className={`flex flex-wrap items-center gap-1.5 text-[11px] mb-3 ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
                  {numero && <><Kbd darkMode={darkMode}>{numero}</Kbd> {t('ajuda.atalho_ir')}</>}
                  {novo && <><span aria-hidden="true">·</span><Kbd darkMode={darkMode}>{nomeTecla(TECLA_NOVO)}</Kbd> {t(novo)}</>}
                </p>
              );
            })()}
            <ol className="space-y-2">
              {ajudaTela.passos.map((chave, i) => (
                <li key={chave} className={`flex gap-3 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                  <span className="w-5 h-5 rounded-full bg-primary/20 text-primary flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5" aria-hidden="true">{i + 1}</span>
                  <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{t(chave)}</p>
                </li>
              ))}
            </ol>
          </div>
        )}

        {/* ── Conteúdo: Como usar ─────────────────────────────────────────── */}
        {aba === 'guia' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[60vh] overflow-y-auto pr-1">
            {steps.map(({ step, color, text }) => (
              <div key={step} className={`flex gap-3 p-3 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-slate-50'}`}>
                <div className={`w-5 h-5 rounded-full bg-${color}/20 text-${color} flex items-center justify-center font-bold text-[10px] shrink-0 mt-0.5`}>{step}</div>
                <p className={`text-xs leading-relaxed ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{text}</p>
              </div>
            ))}
          </div>
        )}

        {/* ── Conteúdo: Atalhos ───────────────────────────────────────────── */}
        {aba === 'atalhos' && (
          <div className="max-h-[60vh] overflow-y-auto pr-1 space-y-5">
            <p className={`text-[11px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>
              {t('guide.shortcuts_hint')}
            </p>
            <label className={`flex items-center gap-2 text-xs font-bold cursor-pointer ${darkMode ? 'text-slate-200' : 'text-slate-700'}`}>
              <input type="checkbox" checked={ligados}
                onChange={(e) => { setLigados(e.target.checked); definirAtalhosLigados(e.target.checked); }}
                className="w-4 h-4 accent-[var(--color-primary)]" />
              {t('guide.atalhos_ligados')}
            </label>
            {SHORTCUTS.map(({ group, items }) => (
              <div key={group}>
                <p className={`text-[10px] font-bold uppercase tracking-widest mb-2 ${darkMode ? 'text-slate-500' : 'text-slate-400'}`}>{group}</p>
                <div className={`rounded-xl border overflow-hidden ${darkMode ? 'border-white/10' : 'border-slate-100'}`}>
                  {items.map(({ keys, desc }, i) => (
                    <div key={i} className={`flex items-center justify-between px-4 py-2.5 ${
                      i > 0 ? (darkMode ? 'border-t border-white/5' : 'border-t border-slate-50') : ''
                    } ${darkMode ? 'hover:bg-white/4' : 'hover:bg-slate-50'} transition-colors`}>
                      <span className={`text-xs ${darkMode ? 'text-slate-300' : 'text-slate-700'}`}>{desc}</span>
                      <div className="flex items-center gap-1">
                        {keys.map((k, j) => (
                          <React.Fragment key={k}>
                            {j > 0 && <span className={`text-[10px] ${darkMode ? 'text-slate-400' : 'text-slate-500'}`}>+</span>}
                            <Kbd darkMode={darkMode}>{k}</Kbd>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}
      </motion.div>
    </ModalWrapper>
  );
}

export default GuideModal;
