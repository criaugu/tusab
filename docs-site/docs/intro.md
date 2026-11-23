---
id: intro
title: O que é o Tusab
sidebar_label: O que é o Tusab
slug: /intro
description: O Tusab é um caderno de estudo e pesquisa dentro da IA, um conector local que guarda as fontes no computador e entrega à IA só os trechos certos, com citação.
---

# O que é o Tusab

O Tusab é o seu **caderno de estudo e pesquisa dentro da sua IA**. É um **conector local**: ele guarda as suas fontes **no seu computador** e entrega à IA só os trechos certos, **com citação**, seja o vídeo e o minuto exato, seja o documento e a página.

Funciona no **Claude Desktop** (instalação com um arquivo), no **app do ChatGPT para computador**, no **Gemini CLI** e em outras ferramentas que aceitam servidores MCP locais, como Codex, Claude Code, Cursor, VS Code e LM Studio. Para qualquer IA no navegador (ChatGPT, Gemini, Claude.ai, Copilot), o Tusab copia o pedido já com os trechos da sua base dentro.

## O que ele faz

- **Monta a sua base** numa pasta do computador, por projeto: transcrições de canais e vídeos do [YouTube](/funcionalidades/extracao-youtube), [documentos](/funcionalidades/repositorio-multi-fonte) (PDF, Word, Excel, CSV, Markdown), páginas web e resultados de [fontes públicas](/funcionalidades/fontes-publicas) (artigos, teses, legislação, dados abertos).
- **Responde à IA com a fonte.** Quando você pergunta, a IA busca na base e cita de onde tirou cada informação. Ela também pode ler uma fonte inteira em ordem e abrir o arquivo original.
- **Traz 41 pedidos prontos** na [Biblioteca de Prompts](/biblioteca-de-prompts), 20 deles baseados em técnicas de estudo com evidência, cada um com a referência e o modelo de IA sugerido. No Claude Desktop, eles aparecem no botão **+**.
- **Guarda o que a IA gera.** Flashcards, resumos, quizzes, mapas mentais e documentos ficam na aba **Materiais**, abrem numa janela (com diagramas desenhados) e os flashcards entram em [revisão espaçada](/funcionalidades/estudo).
- **Tem uma [tela no navegador](/tela)**, só neste computador, para extrair, organizar os projetos, ver relatórios e copiar pedidos.

Quem conversa, resume e cria o material é **a IA que você já usa**. O Tusab cuida da base: extrai, indexa, acha o trecho, cita a fonte e guarda o que precisa ser lembrado entre conversas.

## Os dados ficam no seu computador

- A extração do YouTube roda no seu computador e no seu IP, com o [yt-dlp](https://github.com/yt-dlp/yt-dlp).
- Arquivos, transcrições e índice ficam na pasta que você escolhe na instalação.
- Só os **trechos consultados** vão para a IA que você escolheu.
- **Nada passa por servidor da CriAugu.** Não há conta, login, telemetria nem sincronização em nuvem.

Quais conexões saem do computador, e para onde, está em [Privacidade](/privacidade) e [Segurança](/seguranca).

## Onde funciona

| Onde | Como instalar | Observação |
|---|---|---|
| Claude Desktop (Windows e macOS) | [Abrir o pacote `.mcpb`](/instalacao) | O Node.js vem com o Claude; os pedidos prontos aparecem no **+** |
| App do ChatGPT para computador, Codex, Gemini CLI, Claude Code, Cursor, VS Code, LM Studio | [Configurar como servidor MCP](/outras-ias) | Precisa do Node.js instalado. No app do ChatGPT, vale para as tarefas do Codex |
| ChatGPT, Gemini, Claude.ai e Copilot no navegador; app do Gemini; apps de celular | Não instala | Copie o pedido com os trechos pela [Biblioteca de Prompts](/biblioteca-de-prompts#ia-no-navegador) |

## Nome e formato

"Conector local" é como o Claude chama esse tipo de complemento: ele roda no seu computador, e não num servidor na internet. Por isso não aparece no claude.ai nem no celular. Tecnicamente, o Tusab é um servidor [MCP](https://modelcontextprotocol.io) local em Node.js, distribuído como pacote MCPB (`.mcpb`). Os detalhes estão no guia [Para desenvolvedores](/ferramentas-mcp).

Antes da versão 2.0.0, o Tusab era um app desktop com chat próprio, descontinuado em 19/11/2026. O Tusab atual abre as bases criadas pelo app: veja [App desktop](/desktop/visao-geral).

## Por onde seguir

1. [Instalar no Claude Desktop](/instalacao) ou [em outras IAs](/outras-ias).
2. [Primeiros passos](/primeiros-passos): a primeira base, a primeira pergunta e os cuidados.
3. [Biblioteca de Prompts](/biblioteca-de-prompts): o que pedir à IA.
