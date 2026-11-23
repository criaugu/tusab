import clsx from 'clsx';
import Link from '@docusaurus/Link';
import Translate, {translate} from '@docusaurus/Translate';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';
import styles from './index.module.css';

// Textos inline = idioma padrão do site (pt-BR); a tradução em inglês fica em i18n/en/code.json.
// Ordem da página: o que é → como funciona → o que dá para fazer → onde funciona → privacidade → instalar.

// Botões de contorno em branco: o hero é preto nos dois temas (ver src/css/custom.css).
const contorno = {color: '#fff', borderColor: '#fff'};

function Cabecalho() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
        <Heading as="h1" className="hero__title">
          {siteConfig.title}
        </Heading>
        <p className={styles.heroLema}>
          <Translate id="homepage.hero.tagline">Seu caderno de estudo e pesquisa dentro da IA.</Translate>
        </p>
        <p className={styles.heroDescription}>
          <Translate id="homepage.hero.description">
            Um conector local para o Claude e outras IAs: guarda vídeos do YouTube, documentos e fontes públicas no
            seu computador e entrega à IA só os trechos certos, com citação do vídeo e minuto ou da página.
          </Translate>
        </p>
        <div className={styles.buttons}>
          <Link className="button button--secondary button--lg" to="/instalacao">
            <Translate id="homepage.hero.install">Instalar no Claude Desktop</Translate>
          </Link>
          <Link className="button button--outline button--lg" style={contorno} to="/outras-ias">
            <Translate id="homepage.hero.otherAis">Usar em outras IAs</Translate>
          </Link>
          <Link className="button button--outline button--lg" style={contorno} to="/primeiros-passos">
            <Translate id="homepage.hero.firstSteps">Primeiros passos</Translate>
          </Link>
        </div>
        <p className={styles.heroFatos}>
          <Translate id="homepage.hero.facts">Windows e macOS · sem conta e sem login · os arquivos ficam no seu computador</Translate>
        </p>
      </div>
    </header>
  );
}

const PASSOS = [
  {
    titulo: <Translate id="homepage.steps.1.title">Monte a base</Translate>,
    texto: (
      <Translate id="homepage.steps.1.text">
        Canais e vídeos do YouTube, PDFs, Word, planilhas, páginas web e buscas em fontes públicas (artigos, teses,
        leis, dados abertos). Tudo numa pasta do seu computador, organizado por projeto.
      </Translate>
    ),
  },
  {
    titulo: <Translate id="homepage.steps.2.title">Pergunte na sua IA</Translate>,
    texto: (
      <Translate id="homepage.steps.2.text">
        A IA busca na sua base e responde citando a fonte: o vídeo e o minuto exato, ou o documento e a página.
        Ela recebe só os trechos que consultou, não a base inteira.
      </Translate>
    ),
  },
  {
    titulo: <Translate id="homepage.steps.3.title">Estude e guarde</Translate>,
    texto: (
      <Translate id="homepage.steps.3.text">
        Flashcards, quiz, resumo, mapa mental, plano de aula. A IA gera a partir da sua base, o Tusab guarda e agenda
        a revisão espaçada. Tudo fica na aba Materiais.
      </Translate>
    ),
  },
];

function ComoFunciona() {
  return (
    <section className={styles.secao} aria-labelledby="como-funciona">
      <div className="container">
        <Heading as="h2" id="como-funciona">
          <Translate id="homepage.steps.heading">Como funciona</Translate>
        </Heading>
        <ol className={styles.passos}>
          {PASSOS.map((p, i) => (
            <li key={i} className={styles.passo}>
              <span className={styles.numero} aria-hidden="true">{i + 1}</span>
              <Heading as="h3">{p.titulo}</Heading>
              <p>{p.texto}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const RECURSOS = [
  {
    to: '/funcionalidades/extracao-youtube',
    titulo: <Translate id="homepage.features.youtube.title">YouTube com minuto exato</Translate>,
    texto: (
      <Translate id="homepage.features.youtube.text">
        Canais inteiros, playlists ou vídeos avulsos. As legendas são baixadas no seu computador, com fila, pausa e
        atualização automática de canais.
      </Translate>
    ),
  },
  {
    to: '/funcionalidades/repositorio-multi-fonte',
    titulo: <Translate id="homepage.features.docs.title">Documentos e originais</Translate>,
    texto: (
      <Translate id="homepage.features.docs.text">
        PDF, Word, Excel, CSV, Markdown e páginas web. A IA cita a página e pode abrir o original, inclusive
        imagens, sem metadados de localização.
      </Translate>
    ),
  },
  {
    to: '/funcionalidades/fontes-publicas',
    titulo: <Translate id="homepage.features.public.title">Fontes públicas por área</Translate>,
    texto: (
      <Translate id="homepage.features.public.text">
        Artigos, teses, legislação, jurisprudência, dados abertos e acervos, de saúde a direito, buscados direto da
        fonte e guardados na base.
      </Translate>
    ),
  },
  {
    to: '/biblioteca-de-prompts',
    titulo: <Translate id="homepage.features.prompts.title">41 pedidos prontos</Translate>,
    texto: (
      <Translate id="homepage.features.prompts.text">
        Resumos, quizzes, flashcards, prova, plano de aula, comparação de fontes e 20 técnicas de estudo com
        evidência, com a referência de cada uma e o modelo de IA indicado.
      </Translate>
    ),
  },
  {
    to: '/funcionalidades/estudo',
    titulo: <Translate id="homepage.features.materials.title">Materiais e revisão espaçada</Translate>,
    texto: (
      <Translate id="homepage.features.materials.text">
        O que a IA gera fica guardado no Tusab e abre numa janela: flashcards para virar, documentos com tabelas e
        diagramas desenhados. Exporta em PDF.
      </Translate>
    ),
  },
  {
    to: '/tela',
    titulo: <Translate id="homepage.features.screen.title">Uma tela para organizar</Translate>,
    texto: (
      <Translate id="homepage.features.screen.text">
        No navegador, só neste computador: extrair, organizar projetos, ver relatórios e copiar pedidos. Em
        português, inglês e espanhol, com tema claro e escuro.
      </Translate>
    ),
  },
];

function Recursos() {
  return (
    <section className={clsx(styles.secao, styles.secaoAlternada)} aria-labelledby="o-que-faz">
      <div className="container">
        <Heading as="h2" id="o-que-faz">
          <Translate id="homepage.features.heading">O que dá para fazer</Translate>
        </Heading>
        <ul className={styles.grade}>
          {RECURSOS.map((r) => (
            <li key={r.to} className={styles.cartao}>
              <Heading as="h3">
                <Link to={r.to}>{r.titulo}</Link>
              </Heading>
              <p>{r.texto}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

function OndeFunciona() {
  return (
    <section className={styles.secao} aria-labelledby="onde-funciona">
      <div className="container">
        <Heading as="h2" id="onde-funciona">
          <Translate id="homepage.where.heading">Onde funciona</Translate>
        </Heading>
        <ul className={styles.grade}>
          <li className={styles.cartao}>
            <Heading as="h3">
              <Link to="/instalacao">
                <Translate id="homepage.where.desktop.title">Claude Desktop</Translate>
              </Link>
            </Heading>
            <p>
              <Translate id="homepage.where.desktop.text">
                Instalação com um arquivo: abra o pacote .mcpb e escolha a pasta da base. O Node.js já vem com o
                Claude. Os pedidos prontos aparecem no botão +.
              </Translate>
            </p>
          </li>
          <li className={styles.cartao}>
            <Heading as="h3">
              <Link to="/outras-ias">
                <Translate id="homepage.where.others.title">Claude Code, VS Code, Cursor, Gemini CLI, Codex</Translate>
              </Link>
            </Heading>
            <p>
              <Translate id="homepage.where.others.text">
                Qualquer ferramenta que aceite servidores MCP locais. Precisa do Node.js instalado; a configuração
                leva três dados.
              </Translate>
            </p>
          </li>
          <li className={styles.cartao}>
            <Heading as="h3">
              <Link to="/biblioteca-de-prompts#ia-no-navegador">
                <Translate id="homepage.where.web.title">IAs no navegador</Translate>
              </Link>
            </Heading>
            <p>
              <Translate id="homepage.where.web.text">
                Claude.ai, ChatGPT e Gemini na web não alcançam o seu computador. Para elas, o Tusab copia o pedido
                já com os trechos da sua base dentro.
              </Translate>
            </p>
          </li>
        </ul>
      </div>
    </section>
  );
}

function Privacidade() {
  return (
    <section className={clsx(styles.secao, styles.secaoAlternada)} aria-labelledby="privado">
      <div className="container">
        <Heading as="h2" id="privado">
          <Translate id="homepage.privacy.heading">Privado por padrão</Translate>
        </Heading>
        <ul className={styles.lista}>
          <li>
            <Translate id="homepage.privacy.1">
              Arquivos, transcrições e índice ficam numa pasta do seu computador.
            </Translate>
          </li>
          <li>
            <Translate id="homepage.privacy.2">
              A IA recebe só os trechos que consultou, e só a IA que você escolheu.
            </Translate>
          </li>
          <li>
            <Translate id="homepage.privacy.3">
              Nada passa por servidor da CriAugu: não há conta, login, telemetria nem sincronização em nuvem.
            </Translate>
          </li>
          <li>
            <Translate id="homepage.privacy.4">O código é aberto para leitura no GitHub.</Translate>
          </li>
        </ul>
        <p>
          <Link to="/privacidade">
            <Translate id="homepage.privacy.link">O que sai do computador, e para onde</Translate>
          </Link>
        </p>
      </div>
    </section>
  );
}

function Chamada() {
  return (
    <section className={styles.secao} aria-labelledby="comecar">
      <div className={clsx('container', styles.chamada)}>
        <Heading as="h2" id="comecar">
          <Translate id="homepage.cta.heading">Comece pela sua próxima pergunta</Translate>
        </Heading>
        <div className={styles.buttons}>
          <Link className="button button--primary button--lg" to="/instalacao">
            <Translate id="homepage.cta.install">Instalar</Translate>
          </Link>
          <Link className="button button--outline button--primary button--lg" to="/intro">
            <Translate id="homepage.cta.docs">Ler o guia</Translate>
          </Link>
        </div>
      </div>
    </section>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title={translate({id: 'homepage.meta.title', message: 'Caderno de estudo e pesquisa para o Claude e outras IAs'})}
      description={translate({
        id: 'homepage.meta.description',
        message:
          'Tusab, conector local (MCP) para o Claude e outras IAs: as fontes ficam no seu computador, e a IA recebe só os trechos certos, com citação do vídeo e minuto ou da página.',
      })}>
      <Cabecalho />
      <main>
        <ComoFunciona />
        <Recursos />
        <OndeFunciona />
        <Privacidade />
        <Chamada />
      </main>
    </Layout>
  );
}
