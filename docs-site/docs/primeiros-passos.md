---
id: primeiros-passos
title: Primeiros passos
sidebar_label: Primeiros passos
slug: /primeiros-passos
description: A primeira base, a primeira pergunta com citação, o primeiro material de estudo e os cuidados ao usar o Tusab.
---

# Primeiros passos

Com o Tusab [instalado](/instalacao), o caminho é: montar a base, perguntar, estudar. Nos exemplos, "Biologia" é o nome do projeto; use o seu.

## 1. Abrir o Tusab

Peça à IA: **"abra o Tusab"**. No Claude Desktop, também dá para usar **+ › Tusab › Abrir o Tusab**. A [tela](/tela) abre no navegador, num endereço que só funciona neste computador.

## 2. Montar a base

Na tela, crie um projeto e adicione conteúdo:

- **YouTube:** cole o endereço de um canal, playlist ou vídeo. O Tusab baixa as legendas (não os vídeos) e divide em trechos com o minuto de cada um. Veja [Extração do YouTube](/funcionalidades/extracao-youtube).
- **Documentos:** envie PDFs, arquivos do Word ou do Excel, CSVs, textos em Markdown ou o endereço de uma página web. Veja [Repositório e documentos](/funcionalidades/repositorio-multi-fonte).
- **Fontes públicas:** busque artigos, teses, legislação ou dados abertos e guarde os resultados que interessam. Veja [Fontes públicas](/funcionalidades/fontes-publicas).

A IA também pode adicionar por você. Por exemplo: "adicione o canal youtube.com/@canal ao projeto Biologia no Tusab".

## 3. Perguntar

Na conversa, pergunte sobre o conteúdo da base:

> O que a minha base do Tusab diz sobre fotossíntese no projeto Biologia?

A IA busca na base e responde citando a fonte: o vídeo com o minuto (com link que abre o vídeo naquele ponto) ou o documento com a página. Se ela responder que o Tusab não está conectado, ative o conector em **+ › Conectores** (Claude Desktop) ou confira a configuração na [outra ferramenta](/outras-ias).

## 4. Estudar

Escolha um pedido pronto:

- no Claude Desktop, em **+ › Tusab** (por exemplo, **Flashcards**, **Quiz** ou **Resumo de estudo**);
- em qualquer IA, na aba **Biblioteca de Prompts** da tela: copie o pedido e cole na conversa.

A IA gera o material a partir da base, guarda no Tusab e devolve o link **Abrir no Tusab**. O material fica na aba **Materiais**: flashcards para virar, resumos e documentos com tabelas e diagramas, exportáveis em PDF. Para revisar os flashcards no dia certo, use o pedido **Revisar hoje** numa conversa nova. Veja [Materiais e revisão espaçada](/funcionalidades/estudo).

**Qual modelo usar?** Cada pedido da Biblioteca tem um selo com o modelo sugerido: **Rápido** (no Claude, Haiku) para tarefas simples, **Intermediário** (Sonnet) para organizar e comparar, **Mais capaz** (Opus) para cruzar várias fontes. É uma sugestão de custo-benefício; quem escolhe o modelo é você, na ferramenta de IA.

## Cuidados {#cuidados}

- **Uma IA por vez na mesma base.** Cada ferramenta de IA liga o seu próprio Tusab. Se duas estiverem abertas ao mesmo tempo usando a mesma pasta (por exemplo, Claude Desktop e Claude Code), as duas gravam o mesmo índice e os mesmos arquivos, e a base pode se corromper. Feche uma antes de abrir a outra, ou use uma pasta de base diferente para cada uma.
- **A tela funciona enquanto a IA estiver aberta.** O Tusab é iniciado pela ferramenta de IA e fecha junto com ela. Quando a IA fecha, a tela no navegador para de responder.
- **O link "Abrir no Tusab" vale só naquela sessão.** O endereço da tela muda cada vez que a IA inicia o Tusab, então um link antigo não abre. Para ver um material depois, peça "abra o Tusab" e use a aba Materiais.
- **O link da tela não deve ser compartilhado.** Ele leva a chave da sessão. Só funciona neste computador, mas trate-o como uma senha temporária.
- **Instale só do repositório oficial.** O Tusab roda com as permissões do seu usuário (o Claude Desktop avisa isso na instalação). Baixe o pacote das [releases](https://github.com/criaugu/tusab/releases) e confira a soma SHA-256.
- **Mantenha o Node.js atualizado nas outras ferramentas.** Com uma versão abaixo da 18.17, o Tusab não inicia.
- **A extração do YouTube usa o seu IP.** Canais muito grandes levam tempo; o Tusab faz uma pausa entre os pedidos para não ser bloqueado. Dá para pausar e retomar.

## Problemas comuns

| O que acontece | O que fazer |
|---|---|
| A IA diz que o Tusab não está conectado | Claude Desktop: ative em **+ › Conectores**. Outras ferramentas: reinicie e confira a configuração em [Outras IAs](/outras-ias) |
| A tela avisa que perdeu a conexão com o Tusab | A IA foi fechada ou reiniciada. Peça "abra o Tusab" de novo |
| Os pedidos prontos não aparecem no **+** | Confira se o conector está ativado. Em ferramentas sem esse menu, copie o pedido pela Biblioteca |
| A resposta não cita a base | Peça explicitamente "busque no Tusab". Os pedidos prontos já incluem essa regra |
