---
id: outras-ias
title: Use in other AIs
sidebar_label: Use in other AIs
slug: /outras-ias
description: How to use Tusab in the ChatGPT desktop app, Codex, Gemini CLI, Claude Code, Cursor, VS Code and LM Studio, including how to check for and install Node.js.
---

# Use in other AIs

Tusab works in any AI tool that accepts **local MCP servers**, that is, servers the tool itself starts on your computer: the ChatGPT desktop app, Codex, Gemini CLI, Claude Code, Cursor, VS Code (with GitHub Copilot), LM Studio and others. In them, installation is done by hand, in three steps:

1. have **Node.js** on the computer;
2. put Tusab's files in a folder;
3. tell the tool where they are.

In Claude Desktop it is simpler: see [Install in Claude Desktop](/instalacao).

:::info Where it does not work
AIs in the browser (Claude.ai, ChatGPT, Gemini on the web) and mobile apps only connect to servers on the internet: they cannot reach the Tusab on your computer. The Gemini app, including on the desktop, also accepts only internet connectors; for Gemini, use **Gemini CLI**. To use them with your base, copy the request from the [Prompt Library](/biblioteca-de-prompts#ia-no-navegador) and use **Open in browser**: Tusab copies the request with the excerpts from the base already inside.
:::

## 1. Node.js: check and install

Claude Desktop ships its own Node.js; the other tools use the one installed on the computer. Tusab needs version **18.17 or newer**.

**Check whether it is installed.** Open PowerShell (Windows: Start menu › "PowerShell") or Terminal (macOS: Applications › Utilities › Terminal) and type:

```bash
node --version
```

- A number like `v22.11.0` shows up (18.17 or higher): go to step 2.
- A lower number shows up (for example, `v16.20.0`): update with the installer below.
- "`node` is not recognized as a command" (Windows) or "`command not found`" (macOS) shows up: Node.js is not installed.

**Install.** Download the **LTS** version from [nodejs.org](https://nodejs.org/) (Windows: `.msi` installer; macOS: `.pkg` installer) and follow the installer with the default options. If you prefer the command line, use `winget install OpenJS.NodeJS.LTS` (Windows) or `brew install node` (macOS, with Homebrew). Then **close and reopen** PowerShell or Terminal (and the AI tool) and check with `node --version`.

## 2. Put Tusab in a folder

The simplest way is to open the `.mcpb` package itself (the same one used by Claude Desktop) into a folder: it already has the server, the dependencies and the ready-made screen.

1. Download the package from the [releases page](https://github.com/criaugu/tusab/releases) (`tusab-X.Y.Z.mcpb`) and check the SHA-256 checksum, as in [Install in Claude Desktop](/instalacao#1-baixar).
2. In PowerShell or Terminal, open the package into a folder (replace the file name and folder with yours):

```powershell
# Windows
npx --yes @anthropic-ai/mcpb@2.1.2 unpack "$HOME\Downloads\tusab-2.0.0.mcpb" "$HOME\tusab-servidor"
```

```bash
# macOS
npx --yes @anthropic-ai/mcpb@2.1.2 unpack ~/Downloads/tusab-2.0.0.mcpb ~/tusab-servidor
```

The file the tool will run is `src/index.js`, inside that folder. To **update**, download the new package and open it into the same folder: your base data lives elsewhere and is not touched. If you prefer the source code, use a clone of the repository (see [Development setup](/desenvolvimento/setup)).

## 3. Configure the tool

All of them ask for the same three values:

| Value | What to use |
|---|---|
| Command | `node` |
| Argument | the full path of `src/index.js` in the folder from step 2 |
| `TUSAB_REPOSITORIO` variable | your base folder (the same one chosen in Claude Desktop, to use the same base) |

In the examples below, replace `augusto` with your user and the folders with yours. In JSON files on Windows, the backslash is doubled (`\\`).

**Claude Code** (in the terminal; `-s user` applies to all projects):

```powershell
claude mcp add tusab -s user -e TUSAB_REPOSITORIO="C:\Users\augusto\Tusab" -- node "C:\Users\augusto\tusab-servidor\src\index.js"
```

**Cursor** (`~/.cursor/mcp.json`), **Gemini CLI** (`~/.gemini/settings.json`) and other tools that use the `mcpServers` key:

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

On macOS, the paths look like `/Users/augusto/tusab-servidor/src/index.js` and `/Users/augusto/Tusab`.

**VS Code with GitHub Copilot** (`.vscode/mcp.json` in the project, or the "MCP: Add Server" command): the same block, with the `servers` key instead of `mcpServers` and `"type": "stdio"` inside `tusab`.

**Codex** (`~/.codex/config.toml`):

```toml
[mcp_servers.tusab]
command = "node"
args = ['C:\Users\augusto\tusab-servidor\src\index.js']
env = { TUSAB_REPOSITORIO = 'C:\Users\augusto\Tusab' }
```

**ChatGPT desktop app:** it uses the same configuration as Codex. If Codex already has Tusab (block above), there is nothing else to do. If not, in the app go to **Settings › MCP servers › Add server**, choose **STDIO**, enter the `node` command, the argument with the path to `src/index.js` and the `TUSAB_REPOSITORIO` variable, save and click **Restart**. OpenAI documents this configuration for **Codex** tasks inside the app; in regular ChatGPT conversations, local tools may not show up. In that case, use Codex in the app or copy the request from the Library.

**LM Studio** (AIs that run on the computer itself, offline): the same `mcpServers` block in LM Studio's `mcp.json` file (`~/.lmstudio/mcp.json`; on Windows, `%USERPROFILE%\.lmstudio\mcp.json`), which can also be opened from the app. Choose a model that can use tools ("tool use"); very small models tend to get the calls wrong.

After configuring, restart the tool and ask "open Tusab" or "list my Tusab projects". If the tool says the server did not start, check step 1 (`node --version` in the same terminal) and whether the path to `src/index.js` is right.

## What works in each tool

| Feature | Claude Desktop | Other tools |
|---|---|---|
| Search with citations, YouTube, documents, public sources, materials, spaced repetition, token savings (the 15 tools) | Yes | Yes |
| Tusab screen in the browser (opens by itself the first time; afterwards, ask "open Tusab") | Yes | Yes |
| **Open in Tusab** link after saving a material | Yes | Yes |
| Connection status after copying a request | Yes, as "Claude Desktop" | Yes, with the name the tool reports |
| Ready-made requests in **+** | Yes | Depends on the tool (in Claude Code they become `/` commands). Where they do not show up, copy the request from the Library |
| **Open Claude (app)** button in the "copied" notice | Yes | Not applicable: paste the request in the tool |
| Images from originals | Yes | In most; depends on the tool accepting images from the server |
| Installation | Open the `.mcpb` | Steps 1 to 3 |
| Node.js | Comes with Claude Desktop | Must be installed (18.17 or newer) |

Before using it, read the [precautions](/primeiros-passos#cuidados), above all the first one: **one AI at a time on the same base**.
