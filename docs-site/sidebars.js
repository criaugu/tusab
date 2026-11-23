// @ts-check

// Dois guias: "Guia" para quem usa o Tusab (estudante, professor, pesquisador, profissional)
// e "Para desenvolvedores" para quem lê, roda ou altera o código. Os endereços das páginas
// não mudaram com a reorganização (23/11/2026): só o lugar delas no menu.

/** @type {import('@docusaurus/plugin-content-docs').SidebarsConfig} */
const sidebars = {
  guia: [
    {
      type: 'category',
      label: 'Começar',
      collapsed: false,
      items: ['intro', 'instalacao', 'outras-ias', 'primeiros-passos'],
    },
    {
      type: 'category',
      label: 'Montar a base',
      collapsed: false,
      items: [
        'funcionalidades/extracao-youtube',
        'funcionalidades/repositorio-multi-fonte',
        'funcionalidades/fontes-publicas',
        'funcionalidades/originais-e-imagens',
      ],
    },
    {
      type: 'category',
      label: 'Estudar e pesquisar',
      collapsed: false,
      items: [
        'biblioteca-de-prompts',
        'funcionalidades/estudo',
        'tela',
        'perfis-e-jornadas',
        'funcionalidades/idiomas',
        'funcionalidades/economia-de-tokens',
      ],
    },
    {
      type: 'category',
      label: 'Privacidade e segurança',
      collapsed: false,
      items: [
        'politica-de-privacidade',
        'termos-e-condicoes',
        'privacidade',
        'seguranca',
        'acessibilidade',
        'licenca',
      ],
    },
    'changelog',
  ],
  tecnico: [
    'ferramentas-mcp',
    {
      type: 'category',
      label: 'Arquitetura',
      collapsed: false,
      items: [
        'arquitetura/visao-geral',
        'arquitetura/dados-e-armazenamento',
        'arquitetura/decisoes-tecnicas',
      ],
    },
    {
      type: 'category',
      label: 'Desenvolvimento',
      collapsed: false,
      items: ['desenvolvimento/setup', 'desenvolvimento/build-e-testes', 'contribuindo'],
    },
    'design-system',
    {
      type: 'category',
      label: 'App desktop (descontinuado)',
      collapsed: true,
      items: [
        'desktop/visao-geral',
        'desktop/instalacao',
        'desktop/assistente-rag',
        'desktop/modo-estudo',
        'desktop/mcp-server',
        'desktop/decisoes-tecnicas',
        'desktop/desenvolvimento',
      ],
    },
  ],
};

export default sidebars;
