import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import pt from './locales/pt.json';
import en from './locales/en.json';
import es from './locales/es.json';
import { MODO_EXTENSAO } from './constants';

// Modo extensão: o espaço do "Estudo" vira a "Biblioteca de Prompts" (a IA do usuário gera
// cards, quizzes e resumos; o Tusab entrega o pedido certo). Só os rótulos mudam aqui.
const EXTENSAO = {
  pt: {
    'repo.hint_body': 'Aqui ficam os arquivos do YouTube e tudo que você adicionar. A sua IA consulta esta base pelo Tusab, sempre com a fonte de cada trecho.',
    'tabs.estudo': 'Biblioteca de Prompts',
    'home.section_study': 'Pedir à sua IA',
    'home.card_estudo_title': 'Biblioteca de Prompts',
    'home.card_estudo_desc': 'Pedidos prontos para a sua IA criar flashcards, quizzes, resumos e mais, citando a sua base',
  },
  en: {
    'repo.hint_body': 'This is where YouTube files and everything else you add live. Your AI queries this base through Tusab, always citing the source of each excerpt.',
    'tabs.estudo': 'Prompt Library',
    'home.section_study': 'Ask your AI',
    'home.card_estudo_title': 'Prompt Library',
    'home.card_estudo_desc': 'Ready requests for your AI to create flashcards, quizzes, summaries and more, citing your base',
  },
  es: {
    'repo.hint_body': 'Aquí quedan los archivos de YouTube y todo lo que agregues. Tu IA consulta esta base a través de Tusab, siempre con la fuente de cada fragmento.',
    'tabs.estudo': 'Biblioteca de prompts',
    'home.section_study': 'Pedir a tu IA',
    'home.card_estudo_title': 'Biblioteca de prompts',
    'home.card_estudo_desc': 'Pedidos listos para que tu IA cree flashcards, quizzes, resúmenes y más, citando tu base',
  },
};
const traducao = (lng, base) => (MODO_EXTENSAO ? { ...base, ...EXTENSAO[lng] } : base);

// Idiomas que o Tusab traz prontos. Para os outros, a tela abre em inglês e oferece baixar uma
// tradução feita pelo próprio navegador (services/traducaoAutomatica.js), guardada neste navegador.
export const IDIOMAS_DO_TUSAB = ['pt', 'en', 'es'];
export const PREFIXO_TRADUCAO = 'tusab_traducao_';
const CHAVE_IDIOMA = 'i18nextLng';

const raiz = (codigo) => String(codigo || '').toLowerCase().split('-')[0];

/** Traduções automáticas já baixadas neste navegador: { codigo: textos }. */
function traducoesSalvas() {
  const saida = {};
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const chave = localStorage.key(i);
      if (!chave?.startsWith(PREFIXO_TRADUCAO)) continue;
      const textos = JSON.parse(localStorage.getItem(chave))?.textos;
      if (textos && typeof textos === 'object') saida[chave.slice(PREFIXO_TRADUCAO.length)] = textos;
    }
  } catch { /* sem armazenamento: só os três idiomas do Tusab */ }
  return saida;
}

const salvas = traducoesSalvas();

/** Idioma ao abrir: o escolhido antes; se não houver, o do navegador; se o Tusab não tiver, inglês. */
function idiomaInicial() {
  let escolhido = '';
  try { escolhido = raiz(localStorage.getItem(CHAVE_IDIOMA)); } catch { /* idem */ }
  if (IDIOMAS_DO_TUSAB.includes(escolhido) || salvas[escolhido]) return escolhido;
  const navegador = raiz(typeof navigator !== 'undefined' ? navigator.language : '');
  return IDIOMAS_DO_TUSAB.includes(navegador) ? navegador : 'en';
}

const recursos = {
  pt: { translation: traducao('pt', pt) },
  en: { translation: traducao('en', en) },
  es: { translation: traducao('es', es) },
};
for (const [codigo, textos] of Object.entries(salvas)) {
  if (!IDIOMAS_DO_TUSAB.includes(codigo)) recursos[codigo] = { translation: textos };
}

/** Atributo lang da página: leitores de tela e a tradução do navegador dependem dele. */
const marcarIdiomaDaPagina = (lng) => {
  if (typeof document !== 'undefined') document.documentElement.lang = lng === 'pt' ? 'pt-BR' : lng;
};

i18n.use(initReactI18next).init({
  resources: recursos,
  lng: idiomaInicial(),
  fallbackLng: 'en', // frase que faltar numa tradução automática aparece em inglês
  interpolation: { escapeValue: false },
});
marcarIdiomaDaPagina(i18n.language);
i18n.on('languageChanged', (lng) => {
  try { localStorage.setItem(CHAVE_IDIOMA, lng); } catch { /* idem */ }
  marcarIdiomaDaPagina(lng);
});

/** Opções dos seletores de idioma: os três do Tusab e as traduções baixadas neste navegador. */
export function idiomasDaTela() {
  const nome = (codigo) => {
    try { return new Intl.DisplayNames([codigo], { type: 'language' }).of(codigo); } catch { return codigo; }
  };
  const fixos = [
    { codigo: 'pt', curto: 'PT', nome: 'Português' },
    { codigo: 'en', curto: 'EN', nome: 'English' },
    { codigo: 'es', curto: 'ES', nome: 'Español' },
  ];
  const baixados = Object.keys(i18n.options.resources || {})
    .filter((c) => !IDIOMAS_DO_TUSAB.includes(c))
    .map((c) => ({ codigo: c, curto: c.toUpperCase(), nome: nome(c), automatico: true }));
  return [...fixos, ...baixados];
}

/** Código do idioma atual entre as opções (traduções automáticas incluídas). */
export function idiomaAtual() {
  const lng = raiz(i18n.language);
  return idiomasDaTela().some((o) => o.codigo === lng) ? lng : 'en';
}

export default i18n;
