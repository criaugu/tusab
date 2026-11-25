// Tradução automática da tela para idiomas que o Tusab não traz prontos.
//
// Usa o tradutor embutido do navegador (Translator API do Chrome e do Edge): o modelo de tradução é
// baixado UMA vez pelo próprio navegador e roda neste computador, sem mandar texto para a internet.
// A tela é traduzida a partir do inglês, frase por frase, e o resultado fica guardado neste
// navegador (localStorage) para as próximas vezes. Partes que não podem mudar ({{variáveis}}, tags)
// são protegidas antes e conferidas depois: se o tradutor estragar alguma, a frase fica em inglês.
// Navegador sem esse tradutor (Firefox, Safari, Chrome antigo): o aviso sugere a tradução da página.
import i18n, { IDIOMAS_DO_TUSAB, PREFIXO_TRADUCAO } from '../i18n';

const raiz = (codigo) => String(codigo || '').toLowerCase().split('-')[0];
const PROTEGER = /\{\{[^}]+\}\}|<\/?[a-zA-Z][^>]*>|\{[a-zA-Z_]+\}/g;
const LOTE = 8;

/** Idioma do navegador que o Tusab não tem (ex.: 'fr'), ou null. */
export function idiomaSemTraducaoPronta() {
  const lng = raiz(typeof navigator !== 'undefined' ? navigator.language : '');
  return lng && !IDIOMAS_DO_TUSAB.includes(lng) ? lng : null;
}

/** Nome do idioma escrito num idioma (ex.: nomeDoIdioma('fr', 'en') = 'French'). */
export function nomeDoIdioma(codigo, emQual = codigo) {
  try { return new Intl.DisplayNames([emQual], { type: 'language' }).of(codigo) || codigo; } catch { return codigo; }
}

export function traducaoBaixada(codigo) {
  return Boolean(i18n.hasResourceBundle(codigo, 'translation') && !IDIOMAS_DO_TUSAB.includes(codigo));
}

/** 'sem-tradutor' | 'unavailable' | 'downloadable' | 'downloading' | 'available' */
export async function situacaoDoTradutor(alvo) {
  if (typeof self === 'undefined' || !('Translator' in self)) return 'sem-tradutor';
  try {
    return await self.Translator.availability({ sourceLanguage: 'en', targetLanguage: alvo });
  } catch {
    return 'unavailable';
  }
}

/**
 * Baixa (se preciso) o modelo do navegador e traduz a tela para `alvo`.
 * aoProgredir({ fase: 'baixando', parte }) e ({ fase: 'traduzindo', feitos, total }).
 * Precisa ser chamada a partir de um clique (o navegador exige gesto do usuário para baixar).
 * `sinal` (AbortSignal) cancela o download ou a tradução.
 */
export async function traduzirTela(alvo, sinal, aoProgredir = () => {}) {
  const tradutor = await self.Translator.create({
    sourceLanguage: 'en',
    targetLanguage: alvo,
    signal: sinal,
    monitor(m) { m.addEventListener('downloadprogress', (e) => aoProgredir({ fase: 'baixando', parte: e.loaded })); },
  });
  const ingles = i18n.getResourceBundle('en', 'translation') || {};
  const chaves = Object.keys(ingles).filter((k) => typeof ingles[k] === 'string' && ingles[k].trim());
  const textos = {};
  let feitos = 0;
  for (let i = 0; i < chaves.length; i += LOTE) {
    if (sinal?.aborted) { tradutor.destroy?.(); throw new DOMException('Cancelado', 'AbortError'); }
    await Promise.all(chaves.slice(i, i + LOTE).map(async (chave) => {
      const original = ingles[chave];
      const marcas = [];
      const protegido = original.replace(PROTEGER, (m) => { marcas.push(m); return `⟦${marcas.length - 1}⟧`; });
      try {
        const traduzido = (await tradutor.translate(protegido))
          .replace(/⟦\s*(\d+)\s*⟧/g, (_, n) => marcas[Number(n)] ?? '');
        if (marcas.every((m) => traduzido.includes(m))) textos[chave] = traduzido;
      } catch { /* esta frase fica em inglês */ }
      feitos += 1;
    }));
    aoProgredir({ fase: 'traduzindo', feitos, total: chaves.length });
  }
  tradutor.destroy?.();
  try {
    localStorage.setItem(PREFIXO_TRADUCAO + alvo, JSON.stringify({ versao: typeof __APP_VERSION__ === 'string' ? __APP_VERSION__ : '', textos }));
  } catch { /* sem espaço: a tradução vale só nesta visita */ }
  i18n.addResourceBundle(alvo, 'translation', textos, true, true);
  await i18n.changeLanguage(alvo);
  return Object.keys(textos).length;
}

const CHAVE_DISPENSA = 'tusab_traducao_dispensada';
export function avisoDispensado(alvo) {
  try { return localStorage.getItem(CHAVE_DISPENSA) === alvo; } catch { return false; }
}
export function dispensarAviso(alvo) {
  try { localStorage.setItem(CHAVE_DISPENSA, alvo); } catch { /* idem */ }
}
