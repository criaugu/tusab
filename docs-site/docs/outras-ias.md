---
id: outras-ias
title: Usar em outras IAs
sidebar_label: Usar em outras IAs
slug: /outras-ias
description: Como usar o Tusab no app do ChatGPT para computador, no Codex, no Gemini CLI, no Claude Code, no Cursor, no VS Code e no LM Studio, incluindo como conferir e instalar o Node.js.
---

# Usar em outras IAs

O Tusab funciona em qualquer ferramenta de IA que aceite **servidores MCP locais**, isto é, servidores que a própria ferramenta inicia no seu computador: o app do ChatGPT para computador, Codex, Gemini CLI, Claude Code, Cursor, VS Code (com o GitHub Copilot), LM Studio e outras. Nelas, a instalação é feita à mão, em três passos:

1. ter o **Node.js** no computador;
2. deixar os arquivos do Tusab numa pasta;
3. dizer à ferramenta onde eles estão.

No Claude Desktop é mais simples: veja [Instalar no Claude Desktop](/instalacao).

:::info Onde não funciona
IAs no navegador (Claude.ai, ChatGPT, Gemini na web) e apps de celular só se conectam a servidores na internet: não alcançam o Tusab do seu computador. O app do Gemini, inclusive no computador, também aceita só conectores pela internet; no Gemini, use o **Gemini CLI**. Para usá-las com a sua base, copie o pedido pela [Biblioteca de Prompts](/biblioteca-de-prompts#ia-no-navegador) e use **Abrir no navegador**: o Tusab copia o pedido já com os trechos da base dentro.
:::

## 1. Node.js: conferir e instalar

O Claude Desktop traz o próprio Node.js; as outras ferramentas usam o que está instalado no computador. O Tusab precisa da versão **18.17 ou mais nova**.

**Conferir se já está instalado.** Abra o PowerShell (Windows: menu Iniciar › "PowerShell") ou o Terminal (macOS: Aplicativos › Utilitários › Terminal) e digite:

```bash
node --version
```

- Apareceu um número como `v22.11.0` (18.17 ou maior): pode seguir para o passo 2.
- Apareceu um número menor (por exemplo, `v16.20.0`): atualize pelo instalador abaixo.
- Apareceu "`node` não é reconhecido como um comando" (Windows) ou "`command not found`" (macOS): o Node.js não está instalado.

**Instalar.** Baixe a versão **LTS** em [nodejs.org](https://nodejs.org/) (Windows: instalador `.msi`; macOS: instalador `.pkg`) e siga o instalador com as opções padrão. Quem prefere a linha de comando pode usar `winget install OpenJS.NodeJS.LTS` (Windows) ou `brew install node` (macOS, com Homebrew). Depois, **feche e abra de novo** o PowerShell ou o Terminal (e a ferramenta de IA) e confira com `node --version`.

## 2. Deixar o Tusab numa pasta

O jeito mais simples é abrir o próprio pacote `.mcpb` (o mesmo do Claude Desktop) numa pasta: ele já traz o servidor, as dependências e a tela pronta.

1. Baixe o pacote da [página de releases](https://github.com/criaugu/tusab/releases) (`tusab-X.Y.Z.mcpb`) e confira a soma SHA-256, como em [Instalar no Claude Desktop](/instalacao#1-baixar).
2. No PowerShell ou no Terminal, abra o pacote numa pasta (troque pelo nome do arquivo e pela pasta que quiser):

```powershell
# Windows
npx --yes @anthropic-ai/mcpb@2.1.2 unpack "$HOME\Downloads\tusab-2.0.0.mcpb" "$HOME\tusab-servidor"
```

```bash
# macOS
npx --yes @anthropic-ai/mcpb@2.1.2 unpack ~/Downloads/tusab-2.0.0.mcpb ~/tusab-servidor
```

O arquivo que a ferramenta vai rodar é `src/index.js`, dentro dessa pasta. Para **atualizar**, baixe o pacote novo e abra na mesma pasta: os dados da sua base ficam em outro lugar e não são tocados. Quem prefere o código-fonte pode usar um clone do repositório (veja [Setup de desenvolvimento](/desenvolvimento/setup)).

## 3. Configurar a ferramenta

Todas pedem os mesmos três dados:

| Dado | Valor |
|---|---|
| Comando | `node` |
| Argumento | o caminho completo de `src/index.js` na pasta do passo 2 |
| Variável `TUSAB_REPOSITORIO` | a pasta da sua base (a mesma escolhida no Claude Desktop, para usar a mesma base; pode deixar as duas IAs abertas ao mesmo tempo) |

Nos exemplos abaixo, troque `augusto` pelo seu usuário e as pastas pelas suas. Em arquivos JSON, no Windows, a barra invertida vai dobrada (`\\`).

**Claude Code** (no terminal; `-s user` vale para todos os projetos):

```powershell
claude mcp add tusab -s user -e TUSAB_REPOSITORIO="C:\Users\augusto\Tusab" -- node "C:\Users\augusto\tusab-servidor\src\index.js"
```

**Cursor** (`~/.cursor/mcp.json`), **Gemini CLI** (`~/.gemini/settings.json`) e outras ferramentas que usam a chave `mcpServers`:

```json
{
  "mcpServers": {
    "tusab": {
      "command": "node",
      "args": ["C:\\Users\\augusto\\tusab-servidor\\src\\index.js"],
      "env": { "TUSAB_REPOSITORIO": "C:\\Users\\augusto\\Tusab" }
    }
  }
}
```

No macOS, os caminhos ficam como `/Users/augusto/tusab-servidor/src/index.js` e `/Users/augusto/Tusab`.

**VS Code com o GitHub Copilot** (`.vscode/mcp.json` no projeto, ou o comando "MCP: Add Server"): o mesmo bloco, com a chave `servers` no lugar de `mcpServers` e `"type": "stdio"` dentro de `tusab`.

**Codex** (`~/.codex/config.toml`):

```toml
[mcp_servers.tusab]
command = "node"
args = ['C:\Users\augusto\tusab-servidor\src\index.js']
env = { TUSAB_REPOSITORIO = 'C:\Users\augusto\Tusab' }
```

**App do ChatGPT para computador:** usa a mesma configuração do Codex. Se o Codex já tem o Tusab (bloco acima), não há mais nada a fazer. Se não, no app vá em **Settings › MCP servers › Add server**, escolha **STDIO**, informe o comando `node`, o argumento com o caminho de `src/index.js` e a variável `TUSAB_REPOSITORIO`, salve e clique em **Restart**. A OpenAI documenta essa configuração para as tarefas do **Codex** dentro do app; nas conversas comuns do ChatGPT, as ferramentas locais podem não aparecer. Nesse caso, use o Codex no app ou copie o pedido pela Biblioteca.

**LM Studio** (IAs que rodam no próprio computador, sem internet): o mesmo bloco `mcpServers` no arquivo `mcp.json` do LM Studio (`~/.lmstudio/mcp.json`; no Windows, `%USERPROFILE%\.lmstudio\mcp.json`), que também pode ser aberto pelo próprio app. Escolha um modelo que saiba usar ferramentas ("tool use"); modelos muito pequenos costumam errar as chamadas.

Depois de configurar, reinicie a ferramenta e peça "abra o Tusab" ou "liste os projetos do Tusab". Se a ferramenta disser que o servidor não iniciou, confira o passo 1 (`node --version` no mesmo terminal) e se o caminho de `src/index.js` está certo.

## O que funciona em cada ferramenta

| Recurso | Claude Desktop | Outras ferramentas |
|---|---|---|
| Busca com citação, YouTube, documentos, fontes públicas, materiais, revisão espaçada, economia de tokens (as 15 ferramentas) | Sim | Sim |
| Tela do Tusab no navegador (abre sozinha na primeira vez; depois, peça "abra o Tusab") | Sim | Sim |
| Link **Abrir no Tusab** depois de guardar um material | Sim | Sim |
| Aviso de conexão depois de copiar um pedido | Sim, como "Claude Desktop" | Sim, com o nome que a ferramenta informa |
| Pedidos prontos no **+** | Sim | Depende da ferramenta (no Claude Code, viram comandos `/`). Onde não aparecem, copie o pedido pela Biblioteca |
| Botão **Abrir o Claude (app)** no aviso de "copiado" | Sim | Não se aplica: cole o pedido na ferramenta |
| Imagens dos originais | Sim | Na maioria; depende de a ferramenta aceitar imagem vinda do servidor |
| Instalação | Abrir o `.mcpb` | Passos 1 a 3 |
| Node.js | Vem com o Claude Desktop | Precisa estar instalado (18.17 ou mais novo) |

Antes de usar, leia os [cuidados](/primeiros-passos#cuidados). Várias IAs podem usar a mesma base ao mesmo tempo: a primeira que abrir cuida dela, e as outras repassam os pedidos.
