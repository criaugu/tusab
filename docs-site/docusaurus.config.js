// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import {themes as prismThemes} from 'prism-react-renderer';

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: 'Tusab',
  tagline:
    'Caderno de estudo e pesquisa para o Claude, o ChatGPT, o Gemini e outras IAs. Conector local (MCP): as fontes ficam no seu computador, e a IA recebe só os trechos certos, com citação.',
  favicon: 'img/favicon.ico',

  // Set the production url of your site here
  url: 'https://tusab.solutions',
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: '/',

  // GitHub pages deployment config.
  organizationName: 'criaugu', // GitHub org/user name.
  projectName: 'tusab', // Repo name.
  deploymentBranch: 'gh-pages',
  trailingSlash: false,

  onBrokenLinks: 'throw',
  markdown: {
    hooks: {
      onBrokenMarkdownLinks: 'warn',
    },
  },

  i18n: {
    defaultLocale: 'pt-BR',
    locales: ['pt-BR', 'en'],
    localeConfigs: {
      'pt-BR': {label: 'Português', htmlLang: 'pt-BR'},
      en: {label: 'English', htmlLang: 'en'},
    },
  },

  presets: [
    [
      'classic',
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          routeBasePath: '/', // documentação é a home do site
          sidebarPath: './sidebars.js',
          editUrl: 'https://github.com/criaugu/tusab/tree/main/docs-site/',
        },
        blog: false, // Tusab usa CHANGELOG.md no repositório principal, não blog
        theme: {
          customCss: './src/css/custom.css',
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      image: 'img/tusab-logo.png',
      colorMode: {
        defaultMode: 'dark',
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: 'Tusab',
        logo: {
          alt: 'Logo Tusab',
          src: 'img/tusab-logo-navbar.png',
        },
        items: [
          {
            type: 'docSidebar',
            sidebarId: 'guia',
            position: 'left',
            label: 'Guia',
          },
          {
            type: 'docSidebar',
            sidebarId: 'tecnico',
            position: 'left',
            label: 'Para desenvolvedores',
          },
          {
            type: 'localeDropdown',
            position: 'right',
          },
          {
            href: 'https://github.com/criaugu/tusab',
            label: 'GitHub',
            position: 'right',
          },
          {
            to: '/instalacao',
            label: 'Instalar',
            position: 'right',
          },
        ],
      },
      footer: {
        style: 'dark',
        links: [
          {
            title: 'Guia',
            items: [
              {label: 'O que é o Tusab', to: '/intro'},
              {label: 'Instalação', to: '/instalacao'},
              {label: 'Outras IAs', to: '/outras-ias'},
              {label: 'Primeiros passos', to: '/primeiros-passos'},
              {label: 'Biblioteca de Prompts', to: '/biblioteca-de-prompts'},
            ],
          },
          {
            title: 'Confiança',
            items: [
              {label: 'Política de Privacidade', to: '/politica-de-privacidade'},
              {label: 'Termos e Condições', to: '/termos-e-condicoes'},
              {label: 'Segurança', to: '/seguranca'},
              {label: 'Acessibilidade', to: '/acessibilidade'},
              {label: 'Ferramentas MCP', to: '/ferramentas-mcp'},
            ],
          },
          {
            title: 'Contato',
            items: [
              {label: 'tusab@tusab.solutions', href: 'mailto:tusab@tusab.solutions'},
              {label: 'WhatsApp', href: 'https://wa.me/5561992684947?text=Ol%C3%A1!%20Quero%20saber%20mais%20sobre%20o%20Tusab.'},
              {label: 'LinkedIn', href: 'https://www.linkedin.com/in/augustoalvesbrasil/'},
            ],
          },
          {
            title: 'Projeto',
            items: [
              {label: 'Repositório no GitHub', href: 'https://github.com/criaugu/tusab'},
              {label: 'Changelog completo', href: 'https://github.com/criaugu/tusab/blob/main/CHANGELOG.md'},
              {label: 'Issues', href: 'https://github.com/criaugu/tusab/issues'},
              {label: 'Licença (Elastic License 2.0)', href: 'https://github.com/criaugu/tusab/blob/main/LICENSE'},
              {label: 'Releases', href: 'https://github.com/criaugu/tusab/releases'},
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} CriAugu — CNPJ 65.131.075/0001-57. Documentação construída com Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
        additionalLanguages: ['powershell', 'python', 'bash', 'json'],
      },
    }),
};

export default config;
