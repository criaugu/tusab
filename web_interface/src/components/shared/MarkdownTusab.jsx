// Copyright (c) 2026 CriAugu — CNPJ 65.131.075/0001-57
/**
 * MarkdownTusab — Markdown dos materiais que a IA guardou (resumos e documentos): tabelas
 * (GFM) e blocos ```mermaid desenhados como diagrama (mapa mental, fluxograma, linha do tempo).
 *
 * A biblioteca Mermaid é pesada: só é carregada (import dinâmico, pedaço separado do pacote)
 * quando aparece um bloco mermaid. securityLevel 'strict': o texto vem da IA, então o SVG sai
 * sanitizado (DOMPurify da própria Mermaid), sem scripts nem links clicáveis. Se o código não
 * for um diagrama válido, mostra o código como veio, com um aviso.
 */
import React, { useEffect, useId, useLayoutEffect, useMemo, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTranslation } from 'react-i18next';

let carregando = null;
// Desenhos prontos (código + tema → SVG): a lista de materiais se atualiza sozinha e a janela
// re-renderiza; sem isto o diagrama voltaria a "Desenhando…" a cada atualização.
const desenhos = new Map();
const carregarMermaid = () => {
  if (!carregando) carregando = import('mermaid').then((m) => m.default);
  return carregando;
};

function DiagramaMermaid({ codigo, darkMode }) {
  const { t } = useTranslation();
  const id = `mermaid-${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const chave = `${darkMode ? 'e' : 'c'}:${codigo}`;
  const [svg, setSvg] = useState(() => desenhos.get(chave) || null);
  const [falhou, setFalhou] = useState(false);
  const caixa = useRef(null);

  // A Mermaid às vezes calcula a moldura (viewBox) deslocada do desenho (visto no mapa mental:
  // bordas cortadas). Com o SVG já na página, a moldura é refeita a partir do desenho real.
  useLayoutEffect(() => {
    const el = caixa.current?.querySelector('svg');
    if (!el?.getBBox) return;
    try {
      const b = el.getBBox();
      if (!b.width || !b.height) return;
      const m = 16;
      el.setAttribute('viewBox', `${b.x - m} ${b.y - m} ${b.width + 2 * m} ${b.height + 2 * m}`);
      el.style.maxWidth = `${Math.ceil(b.width + 2 * m)}px`;
      el.setAttribute('width', '100%');
      el.removeAttribute('height');
    } catch { /* SVG sem medida (ex.: oculto): fica como veio */ }
  }, [svg]);

  useEffect(() => {
    let vivo = true;
    if (desenhos.has(chave)) { setSvg(desenhos.get(chave)); return undefined; }
    setSvg(null);
    setFalhou(false);
    carregarMermaid()
      .then(async (mermaid) => {
        mermaid.initialize(darkMode
          ? { startOnLoad: false, securityLevel: 'strict', theme: 'base', fontFamily: 'inherit', themeVariables: TEMA_DIAGRAMA_ESCURO }
          : { startOnLoad: false, securityLevel: 'strict', theme: 'default', fontFamily: 'inherit' });
        const { svg: desenho } = await mermaid.render(id, codigo);
        desenhos.set(chave, desenho);
        if (vivo) setSvg(desenho);
      })
      .catch(() => {
        // A Mermaid deixa um elemento de erro no body quando o render falha.
        document.getElementById(`d${id}`)?.remove();
        if (vivo) setFalhou(true);
      });
    return () => { vivo = false; };
  }, [chave, codigo, darkMode, id]);

  if (falhou) {
    return (
      <div data-diagrama="erro">
        <p style={{ fontSize: '11px', opacity: 0.75 }}>{t('ext.materiais.diagrama_invalido')}</p>
        <pre><code>{codigo}</code></pre>
      </div>
    );
  }
  if (!svg) return <p style={{ fontSize: '11px', opacity: 0.75 }} data-diagrama="carregando">{t('ext.materiais.diagrama_carregando')}</p>;
  return (
    <figure data-diagrama="ok" style={{ margin: '0 0 0.8rem' }}>
      {/* role=img + rótulo: o leitor de tela anuncia o diagrama; o código fica logo abaixo, em "ver código". */}
      <div ref={caixa} role="img" aria-label={t('ext.materiais.diagrama_rotulo')} style={{ overflowX: 'auto' }}
        dangerouslySetInnerHTML={{ __html: svg }} />
      <details style={{ marginTop: '0.4rem', fontSize: '11px' }}>
        <summary style={{ cursor: 'pointer', opacity: 0.8 }}>{t('ext.materiais.diagrama_codigo')}</summary>
        <pre><code>{codigo}</code></pre>
      </details>
    </figure>
  );
}


// Tema escuro dos diagramas: o "dark" da Mermaid pinta os ramos do mapa mental de vermelho-escuro
// com linhas quase pretas (pouco contraste no fundo da tela). Aqui: tons médios com texto claro
// (contraste acima de 7:1) e linhas cinza-azuladas visíveis.
const CORES_RAMOS = ['#1e3a5f', '#134e4a', '#3b2f63', '#5b3a1a', '#164e63', '#4a1d3f', '#1f4f2e', '#4c3a0f', '#334155', '#1e40af', '#065f46', '#6b21a8'];
const TEMA_DIAGRAMA_ESCURO = {
  darkMode: true,
  background: '#0f172a',
  primaryColor: '#1e3a5f',
  primaryTextColor: '#f1f5f9',
  primaryBorderColor: '#4B9FE8',
  secondaryColor: '#134e4a',
  tertiaryColor: '#3b2f63',
  lineColor: '#94a3b8',
  textColor: '#e2e8f0',
  mainBkg: '#1e3a5f',
  nodeBorder: '#4B9FE8',
  ...Object.fromEntries(CORES_RAMOS.flatMap((cor, i) => [[`cScale${i}`, cor], [`cScaleLabel${i}`, '#f1f5f9']])),
};

export default function MarkdownTusab({ texto, darkMode }) {
  // Objeto estável: se mudasse a cada render, o ReactMarkdown remontaria o diagrama.
  const componentes = useMemo(() => ({
    // ```mermaid vira <pre><code class="language-mermaid">: troca o <pre> inteiro pelo diagrama.
    pre({ node, children }) {
      const code = node?.children?.[0];
      const classes = code?.properties?.className || [];
      if (code?.tagName === 'code' && classes.includes('language-mermaid')) {
        const codigo = (code.children || []).map((c) => c.value || '').join('').trim();
        return <DiagramaMermaid codigo={codigo} darkMode={darkMode} />;
      }
      return <pre>{children}</pre>;
    },
  }), [darkMode]);
  return (
    <div className="tusab-md">
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={componentes}>{String(texto || '')}</ReactMarkdown>
    </div>
  );
}
