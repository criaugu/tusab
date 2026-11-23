---
id: instalacao
title: Install in Claude Desktop
sidebar_label: Install in Claude Desktop
slug: /instalacao
description: How to install Tusab, a local connector, in Claude Desktop for Windows and macOS with the .mcpb package.
---

# Install in Claude Desktop

In Claude Desktop, Tusab installs from a single file, the `.mcpb` package. It works on **Windows** and **macOS**. There is nothing else to install: Node.js, which Tusab runs on, already comes with Claude Desktop.

Using another tool (Claude Code, VS Code, Cursor, Gemini CLI, Codex)? See [Other AIs](/outras-ias).

:::info Where Tusab shows up
Tusab is a **local connector**: it runs in Claude's **desktop app**, on your computer. It does not show up on claude.ai or in the mobile app.
:::

## 1. Download {#1-baixar}

<a className="button button--primary button--lg" href="https://github.com/criaugu/tusab/releases/download/v2.0.0/tusab-2.0.0.mcpb">Download Tusab 2.0.0 (.mcpb)</a>

Always download from the [releases page of the official repository](https://github.com/criaugu/tusab/releases).

**Check the file (optional, recommended).** The same release has a `tusab-2.0.0.mcpb.sha256` file with the package checksum. Compare it with the one your computer calculates:

- Windows (PowerShell): `Get-FileHash .\tusab-2.0.0.mcpb -Algorithm SHA256`
- macOS (Terminal): `shasum -a 256 tusab-2.0.0.mcpb`

If the checksums differ, do not install it; download it again.

## 2. Install

1. With Claude Desktop installed, **open the `tusab-2.0.0.mcpb` file** (double-click). Alternatively, in Claude Desktop go to **Settings › Extensions** and install the file from there. "Extensions" is the name of Claude's screen for local connectors.
2. Claude Desktop shows what Tusab is and warns that it runs with your user's permissions. Confirm the installation.
3. When it asks for the **Repository folder**, choose where your base will live (for example, `Documents\Tusab`). Tusab creates a `data/` folder inside it. Former desktop app users can choose the app's data folder to open the old base (see [Data and storage](/arquitetura/dados-e-armazenamento#onde-os-dados-ficam)).
4. The first time, Tusab opens the [screen](/tela) in the browser with a short introduction.

## 3. Turn it on in the conversation

In a Claude Desktop conversation, click **+ › Connectors** and check that the **Tusab** connector is on. With it on:

- the ready-made requests show up in **+ › Tusab** (41 requests and the **Open Tusab** shortcut);
- the AI can search your base and cite the sources.

If the AI answers that Tusab is not connected, this is the missing step.

## Update

Download the new version's package and open it as in the installation. Your base stays in the folder you chose and is not deleted.

## Next step

[First steps](/primeiros-passos): build the first base, ask the first question and learn the precautions (for example, one AI at a time on the same base).

Those who want to build the package from source will find the steps in [Build and tests](/desenvolvimento/build-e-testes). The environment variables are in [Development setup](/desenvolvimento/setup).
