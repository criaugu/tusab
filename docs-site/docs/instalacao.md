---
id: instalacao
title: Instalar no Claude Desktop
sidebar_label: Instalar no Claude Desktop
slug: /instalacao
description: Como instalar o Tusab, conector local, no Claude Desktop para Windows e macOS com o pacote .mcpb.
---

# Instalar no Claude Desktop

No Claude Desktop, o Tusab é instalado com um arquivo só, o pacote `.mcpb`. Funciona no **Windows** e no **macOS**. Não é preciso instalar mais nada: o Node.js, que o Tusab usa para rodar, já vem com o Claude Desktop.

Vai usar outra ferramenta (Claude Code, VS Code, Cursor, Gemini CLI, Codex)? Veja [Outras IAs](/outras-ias).

:::info Onde o Tusab aparece
O Tusab é um **conector local**: roda no **app desktop** do Claude, no seu computador. Ele não aparece no claude.ai nem no app de celular.
:::

## 1. Baixar {#1-baixar}

<a className="button button--primary button--lg" href="https://github.com/criaugu/tusab/releases/download/v2.0.0/tusab-2.0.0.mcpb">Baixar o Tusab 2.0.0 (.mcpb)</a>

Baixe sempre da [página de releases do repositório oficial](https://github.com/criaugu/tusab/releases).

**Conferir o arquivo (opcional, recomendado).** Na mesma release há o arquivo `tusab-2.0.0.mcpb.sha256`, com a soma do pacote. Compare-a com a que o seu computador calcula:

- Windows (PowerShell): `Get-FileHash .\tusab-2.0.0.mcpb -Algorithm SHA256`
- macOS (Terminal): `shasum -a 256 tusab-2.0.0.mcpb`

Se as somas forem diferentes, não instale e baixe de novo.

## 2. Instalar

1. Com o Claude Desktop instalado, **abra o arquivo `tusab-2.0.0.mcpb`** (duplo clique). Outra forma: no Claude Desktop, vá em **Configurações › Extensões** e instale o arquivo por lá. "Extensões" é o nome da tela do Claude para conectores locais.
2. O Claude Desktop mostra o que o Tusab é e avisa que ele roda com as permissões do seu usuário. Confirme a instalação.
3. Quando ele pedir a **Pasta do repositório**, escolha onde a sua base vai ficar (por exemplo, `Documentos\Tusab`). O Tusab cria a pasta `data/` dentro dela. Quem usava o app desktop pode escolher a pasta de dados dele para abrir a base antiga (veja [Dados e armazenamento](/arquitetura/dados-e-armazenamento#onde-os-dados-ficam)).
4. Na primeira vez, o Tusab abre a [tela](/tela) no navegador com uma apresentação curta.

## 3. Ativar na conversa

Numa conversa do Claude Desktop, clique em **+ › Conectores** e confira se o conector **Tusab** está ativado. Com ele ativado:

- os pedidos prontos aparecem em **+ › Tusab** (41 pedidos e o atalho **Abrir o Tusab**);
- a IA consegue buscar na sua base e citar as fontes.

Se a IA responder que o Tusab não está conectado, é este passo que falta.

## Atualizar

Baixe o pacote da versão nova e abra como na instalação. A base fica na pasta que você escolheu e não é apagada.

## Próximo passo

[Primeiros passos](/primeiros-passos): montar a primeira base, fazer a primeira pergunta e conhecer os cuidados (por exemplo, usar uma IA por vez na mesma base).

Quem quer gerar o pacote a partir do código encontra o passo a passo em [Build e testes](/desenvolvimento/build-e-testes). As variáveis de ambiente estão em [Setup de desenvolvimento](/desenvolvimento/setup).
