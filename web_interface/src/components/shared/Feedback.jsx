/**
 * @file Feedback.jsx
 * @description Feedback voluntário: o convite em momentos certos (o plugin decide quando, em
 *   GET /api/feedback/convite) e o formulário. Nada sai sem o usuário ver e clicar em Enviar; a
 *   prévia mostra exatamente o que vai; o plugin envia ao coletor da CriAugu (coletor.criaugu.com).
 *   Se o envio falhar, oferece o e-mail pronto.
 *   Também abre pelo botão "Enviar feedback" da Ajuda (evento EVENTO_ABRIR_FEEDBACK).
 * @copyright © 2026 CriAugu — CNPJ 65.131.075/0001-57
 */
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useTranslation } from 'react-i18next';
import axios from 'axios';
import { MessageSquareHeart, X, Mail, Copy, Check } from 'lucide-react';
import { API_BASE, BTN_FOCUS } from '../../constants';
import ModalWrapper from './ModalWrapper';

export const EVENTO_ABRIR_FEEDBACK = 'tusab:abrir-feedback';
export const abrirFeedback = () => window.dispatchEvent(new CustomEvent(EVENTO_ABRIR_FEEDBACK));

const ESPERA_INICIAL_MS = 30_000; // nunca logo ao abrir a tela
const CHAVE_SESSAO = 'tusab_convite_feedback_visto';
const GATILHOS = ['trilha_concluida', 'materiais', 'uso_semana', 'nova_versao'];
const haJanelaAberta = () => !!document.querySelector('[aria-modal="true"]');

export default function Feedback({ darkMode, tela }) {
  const { t } = useTranslation();
  const [convite, setConvite] = useState(null); // gatilho do convite visível
  const [aberto, setAberto] = useState(null); // gatilho do formulário aberto
  const prontoParaConvidar = useRef(false);

  // Convite: depois de 30 s de uso e a cada troca de tela; no máximo um por sessão do navegador.
  const verificar = useCallback(() => {
    if (!prontoParaConvidar.current || convite || aberto || haJanelaAberta()) return;
    try { if (sessionStorage.getItem(CHAVE_SESSAO)) return; } catch { /* sem armazenamento: segue */ }
    axios.get(`${API_BASE}/feedback/convite`).then((r) => {
      if (!r.data?.mostrar || haJanelaAberta()) return;
      setConvite(r.data.gatilho);
      try { sessionStorage.setItem(CHAVE_SESSAO, '1'); } catch { /* idem */ }
      axios.post(`${API_BASE}/feedback/convite`, { acao: 'mostrado', gatilho: r.data.gatilho }).catch(() => {});
    }).catch(() => {});
  }, [convite, aberto]);
  useEffect(() => {
    const id = setTimeout(() => { prontoParaConvidar.current = true; verificar(); }, ESPERA_INICIAL_MS);
    return () => clearTimeout(id);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { const id = setTimeout(verificar, 3000); return () => clearTimeout(id); }, [tela, verificar]);

  useEffect(() => {
    const ao = () => { setConvite(null); setAberto('manual'); };
    window.addEventListener(EVENTO_ABRIR_FEEDBACK, ao);
    return () => window.removeEventListener(EVENTO_ABRIR_FEEDBACK, ao);
  }, []);

  const responderConvite = (acao) => {
    axios.post(`${API_BASE}/feedback/convite`, { acao, gatilho: convite }).catch(() => {});
    setConvite(null);
  };

  const cartao = darkMode ? 'bg-[#0C1122] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900';
  const sec = darkMode ? 'text-slate-300' : 'text-slate-600';
  const btnSec = `px-3 py-1.5 rounded-lg text-xs font-bold border ${BTN_FOCUS} ${darkMode ? 'border-white/15 text-slate-300 hover:bg-white/8' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`;
  const btnPri = `px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-button text-white hover:bg-primary-button/85 disabled:opacity-40 disabled:cursor-not-allowed ${BTN_FOCUS}`;

  return (
    <>
      {convite && createPortal(
        <section role="region" aria-labelledby="convite-feedback-titulo" data-convite-feedback={convite}
          className={`fixed bottom-4 right-4 left-4 sm:left-auto sm:w-[360px] z-30 rounded-2xl border shadow-2xl p-4 space-y-3 ${cartao}`}>
          <div className="flex items-start gap-3">
            <MessageSquareHeart size={20} className="text-primary shrink-0 mt-0.5" aria-hidden="true" />
            <div className="flex-1">
              <h2 id="convite-feedback-titulo" className="text-sm font-bold">{t(`feedback.convite_${GATILHOS.includes(convite) ? convite : 'padrao'}`)}</h2>
              <p className={`text-xs mt-1 ${sec}`}>{t('feedback.convite_texto')}</p>
            </div>
            <button onClick={() => responderConvite('adiar')} aria-label={t('feedback.agora_nao')} className={`p-1 rounded ${BTN_FOCUS} ${sec}`}>
              <X size={14} aria-hidden="true" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <button onClick={() => { setAberto(convite); setConvite(null); }} className={btnPri} data-acao="dar-feedback">{t('feedback.dar')}</button>
            <button onClick={() => responderConvite('adiar')} className={btnSec}>{t('feedback.agora_nao')}</button>
            <button onClick={() => responderConvite('nunca')} className={btnSec} data-acao="nunca-feedback">{t('feedback.nunca')}</button>
          </div>
        </section>,
        document.body,
      )}
      {aberto && <FormularioFeedback gatilho={aberto} darkMode={darkMode} onFechar={() => setAberto(null)} />}
    </>
  );
}

const SITE = 'https://tusab.solutions';

function FormularioFeedback({ gatilho, darkMode, onFechar }) {
  const { t, i18n } = useTranslation();
  const [nota, setNota] = useState(null);
  const [comentario, setComentario] = useState('');
  const [email, setEmail] = useState('');
  // Desmarcada: os números de uso só vão se a pessoa marcar (consentimento não vem pré-marcado).
  const [comMetricas, setComMetricas] = useState(false);
  const [previa, setPrevia] = useState(null);
  const [verPrevia, setVerPrevia] = useState(false);
  const [estado, setEstado] = useState('editando'); // editando | enviando | enviado | alternativa
  const [mensagem, setMensagem] = useState('');
  const [alternativa, setAlternativa] = useState(null);
  const [copiado, setCopiado] = useState(false);

  const corpo = { nota, comentario, email, incluir_metricas: comMetricas, gatilho };
  const podeEnviar = nota !== null || comentario.trim();

  useEffect(() => {
    if (!verPrevia || !podeEnviar) { setPrevia(null); return undefined; }
    const id = setTimeout(() => {
      axios.post(`${API_BASE}/feedback/previa`, corpo)
        .then((r) => setPrevia(r.data?.error ? r.data.message : JSON.stringify(r.data.envio, null, 2)))
        .catch(() => setPrevia(t('feedback.erro_previa')));
    }, 300);
    return () => clearTimeout(id);
  }, [verPrevia, nota, comentario, email, comMetricas]); // eslint-disable-line react-hooks/exhaustive-deps

  const enviar = async (e) => {
    e.preventDefault();
    setEstado('enviando');
    setMensagem('');
    try {
      const r = await axios.post(`${API_BASE}/feedback/enviar`, corpo);
      if (r.data?.error) { setEstado('editando'); setMensagem(r.data.message); return; }
      if (r.data?.ok) { setEstado('enviado'); return; }
      setAlternativa(r.data.alternativa);
      setMensagem(r.data.message);
      setEstado('alternativa');
    } catch (err) {
      setEstado('editando');
      setMensagem(err?.response?.data?.message || err.message);
    }
  };
  const registrarEmail = () => axios.post(`${API_BASE}/feedback/enviado-por-email`, { gatilho }).catch(() => {});
  const copiar = async () => {
    try {
      await navigator.clipboard.writeText(`${alternativa.email}\n${alternativa.assunto}\n\n${alternativa.corpo}`);
      setCopiado(true);
      registrarEmail();
    } catch { /* o texto continua visível para copiar à mão */ }
  };

  const sec = darkMode ? 'text-slate-400' : 'text-slate-500';
  const campo = `rounded-xl border px-3 py-2 text-sm w-full ${BTN_FOCUS} ${darkMode ? 'bg-white/5 border-white/15 text-white' : 'bg-white border-slate-300 text-slate-800'}`;
  const btnSec = `px-3 py-1.5 rounded-lg text-xs font-bold border ${BTN_FOCUS} ${darkMode ? 'border-white/15 text-slate-300 hover:bg-white/8' : 'border-slate-300 text-slate-600 hover:bg-slate-50'}`;
  const btnPri = `px-3 py-1.5 rounded-lg text-xs font-bold bg-primary-button text-white hover:bg-primary-button/85 disabled:opacity-40 disabled:cursor-not-allowed ${BTN_FOCUS}`;

  return (
    <ModalWrapper onClose={onFechar} label={t('feedback.titulo')}>
      <form onSubmit={enviar} data-formulario-feedback
        className={`m-auto rounded-2xl p-5 max-w-lg w-full shadow-2xl border space-y-4 ${darkMode ? 'bg-[#0C1122] border-white/15 text-white' : 'bg-white border-slate-200 text-slate-900'}`}>
        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-base font-bold">{t('feedback.titulo')}</h2>
            <p className={`text-xs mt-1 ${sec}`}>{t('feedback.intro')}</p>
          </div>
          <button type="button" onClick={onFechar} aria-label={t('ext.comum.cancelar')} className={`p-1.5 rounded-lg ${BTN_FOCUS} ${sec}`}>
            <X size={16} aria-hidden="true" />
          </button>
        </div>

        {estado === 'enviado' ? (
          <div role="status" className="space-y-3">
            <p className={`text-sm font-bold ${darkMode ? 'text-emerald-400' : 'text-emerald-700'}`}>{t('feedback.obrigado')}</p>
            <div className="flex justify-end"><button type="button" onClick={onFechar} className={btnPri}>{t('feedback.fechar')}</button></div>
          </div>
        ) : estado === 'alternativa' ? (
          <div className="space-y-3">
            <p role="status" className="text-sm">{mensagem}</p>
            <p className={`text-xs ${sec}`}>{t('feedback.alternativa_dica', { email: alternativa.email })}</p>
            <div className="flex flex-wrap gap-2">
              <a href={alternativa.mailto} onClick={registrarEmail} className={`inline-flex items-center gap-1.5 ${btnPri}`} data-acao="feedback-email">
                <Mail size={13} aria-hidden="true" /> {t('feedback.abrir_email')}
              </a>
              <button type="button" onClick={copiar} className={`inline-flex items-center gap-1.5 ${btnSec}`}>
                {copiado ? <Check size={13} aria-hidden="true" /> : <Copy size={13} aria-hidden="true" />} {copiado ? t('feedback.copiado') : t('feedback.copiar')}
              </button>
              <button type="button" onClick={onFechar} className={`${btnSec} ml-auto`}>{t('feedback.fechar')}</button>
            </div>
          </div>
        ) : (
          <>
            <fieldset className="space-y-2">
              <legend className="text-xs font-bold mb-1">{t('feedback.nota_pergunta')}</legend>
              <div className="flex flex-wrap gap-1">
                {Array.from({ length: 11 }, (_, n) => (
                  <label key={n} className={`relative w-9 h-9 flex items-center justify-center rounded-lg border text-xs font-bold cursor-pointer focus-within:ring-2 focus-within:ring-primary
                    ${nota === n ? 'bg-primary-button text-white border-transparent' : darkMode ? 'border-white/15 text-slate-200 hover:bg-white/8' : 'border-slate-300 text-slate-700 hover:bg-slate-50'}`}>
                    <input type="radio" name="nota" value={n} checked={nota === n} onChange={() => setNota(n)} className="sr-only" data-nota={n} />
                    {n}
                  </label>
                ))}
              </div>
              <p className={`flex justify-between text-[11px] ${sec}`}><span>{t('feedback.nota_0')}</span><span>{t('feedback.nota_10')}</span></p>
            </fieldset>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold">{t('feedback.comentario')}</span>
              <textarea value={comentario} onChange={(e) => setComentario(e.target.value)} maxLength={1500} rows={4}
                aria-describedby="feedback-comentario-dica" data-campo="feedback-comentario" className={campo} />
              <span id="feedback-comentario-dica" className={`text-[11px] ${sec}`}>{t('feedback.comentario_dica')}</span>
            </label>
            <label className="flex flex-col gap-1">
              <span className="text-xs font-bold">{t('feedback.email')}</span>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} autoComplete="email"
                aria-describedby="feedback-email-dica" className={campo} />
              <span id="feedback-email-dica" className={`text-[11px] ${sec}`}>{t('feedback.email_dica')}</span>
            </label>
            <label className="flex items-start gap-2 text-xs">
              <input type="checkbox" checked={comMetricas} onChange={(e) => setComMetricas(e.target.checked)} className="mt-0.5" data-campo="feedback-metricas" />
              <span><strong>{t('feedback.metricas')}</strong> <span className={sec}>{t('feedback.metricas_dica')}</span></span>
            </label>
            <details onToggle={(e) => setVerPrevia(e.currentTarget.open)}>
              <summary className={`text-xs font-bold cursor-pointer rounded ${BTN_FOCUS}`}>{t('feedback.ver_previa')}</summary>
              <pre className={`mt-2 max-h-56 overflow-auto rounded-lg p-3 text-[11px] whitespace-pre-wrap break-all ${darkMode ? 'bg-white/5 text-slate-300' : 'bg-slate-50 text-slate-700'}`} data-previa-feedback>
                {podeEnviar ? (previa || '…') : t('feedback.previa_precisa')}
              </pre>
            </details>
            <p className={`text-[11px] ${sec}`} data-quem-recebe>
              {t('feedback.quem_recebe')}{' '}
              <a href={i18n.resolvedLanguage === 'pt' ? `${SITE}/politica-de-privacidade#feedback-voluntario` : `${SITE}/en/politica-de-privacidade#feedback-voluntario`}
                target="_blank" rel="noopener noreferrer" className={`underline rounded ${BTN_FOCUS}`}>{t('feedback.politica')}</a>
            </p>
            {mensagem && <p role="alert" className={`text-xs ${darkMode ? 'text-red-300' : 'text-red-700'}`}>{mensagem}</p>}
            <div className="flex justify-end gap-2">
              <button type="button" onClick={onFechar} className={btnSec}>{t('ext.comum.cancelar')}</button>
              <button type="submit" disabled={!podeEnviar || estado === 'enviando'} className={btnPri} data-acao="enviar-feedback">
                {estado === 'enviando' ? t('feedback.enviando') : t('feedback.enviar')}
              </button>
            </div>
          </>
        )}
      </form>
    </ModalWrapper>
  );
}
