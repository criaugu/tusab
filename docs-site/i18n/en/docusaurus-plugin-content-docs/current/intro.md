---
id: intro
title: What Tusab is
sidebar_label: What Tusab is
slug: /intro
description: Tusab is a study and research notebook inside your AI, a local connector that keeps your sources on your computer and gives the AI only the right excerpts, with citations.
---

# What Tusab is

Tusab is your **study and research notebook inside your AI**. It is a **local connector**: it keeps your sources **on your computer** and gives the AI only the right excerpts, **with citations**: the video and the exact minute, or the document and the page.

It works in **Claude Desktop** (one-file installation), in the **ChatGPT desktop app**, in **Gemini CLI** and in other tools that accept local MCP servers, such as Codex, Claude Code, Cursor, VS Code and LM Studio. For any AI in the browser (ChatGPT, Gemini, Claude.ai, Copilot), Tusab copies the request with the excerpts from your base already inside.

## What it does

- **Builds your base** in a folder on your computer, by project: transcripts of [YouTube](/funcionalidades/extracao-youtube) channels and videos, [documents](/funcionalidades/repositorio-multi-fonte) (PDF, Word, Excel, CSV, Markdown), web pages and results from [public sources](/funcionalidades/fontes-publicas) (papers, theses, legislation, open data).
- **Answers the AI with the source.** When you ask, the AI searches the base and cites where each piece of information came from. It can also read a whole source in order and open the original file.
- **Brings 41 ready-made requests** in the [Prompt Library](/biblioteca-de-prompts), 20 of them based on evidence-based study techniques, each with its reference and the suggested AI model. In Claude Desktop, they show up in the **+** button.
- **Keeps what the AI produces.** Flashcards, summaries, quizzes, mind maps and documents stay in the **Materials** tab, open in a window (with diagrams drawn), and flashcards go into [spaced repetition](/funcionalidades/estudo).
- **Has a [screen in the browser](/tela)**, on this computer only, to extract, organize projects, see reports and copy requests.

The one that talks, summarizes and creates the material is **the AI you already use**. Tusab takes care of the base: it extracts, indexes, finds the excerpt, cites the source and keeps what has to be remembered across conversations.

## The data stays on your computer

- YouTube extraction runs on your computer and your IP address, with [yt-dlp](https://github.com/yt-dlp/yt-dlp).
- Files, transcripts and the index stay in the folder you choose at installation.
- Only the **queried excerpts** go to the AI you chose.
- **Nothing goes through a CriAugu server.** There is no account, login, telemetry or cloud sync.

Which connections leave the computer, and where they go, is in [Privacy](/privacidade) and [Security](/seguranca).

## Where it works

| Where | How to install | Note |
|---|---|---|
| Claude Desktop (Windows and macOS) | [Open the `.mcpb` package](/instalacao) | Node.js comes with Claude; the ready-made requests show up in **+** |
| ChatGPT desktop app, Codex, Gemini CLI, Claude Code, Cursor, VS Code, LM Studio | [Configure it as an MCP server](/outras-ias) | Needs Node.js installed. In the ChatGPT app, it applies to Codex tasks |
| ChatGPT, Gemini, Claude.ai and Copilot in the browser; the Gemini app; mobile apps | Does not install | Copy the request with the excerpts from the [Prompt Library](/biblioteca-de-prompts#ia-no-navegador) |

## Name and format

"Local connector" is what Claude calls this kind of add-on: it runs on your computer, not on a server on the internet. That is why it does not show up on claude.ai or on mobile. Technically, Tusab is a local [MCP](https://modelcontextprotocol.io) server in Node.js, distributed as an MCP Bundle (`.mcpb`). The details are in the [For developers](/ferramentas-mcp) guide.

Before version 2.0.0, Tusab was a desktop app with its own chat, discontinued on 2026-11-19. Today's Tusab opens the bases created by the app: see [Desktop app](/desktop/visao-geral).

## Where to go next

1. [Install in Claude Desktop](/instalacao) or [in other AIs](/outras-ias).
2. [First steps](/primeiros-passos): the first base, the first question and the precautions.
3. [Prompt Library](/biblioteca-de-prompts): what to ask the AI.
