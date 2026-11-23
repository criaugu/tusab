---
id: primeiros-passos
title: First steps
sidebar_label: First steps
slug: /primeiros-passos
description: The first base, the first question with citations, the first study material and the precautions when using Tusab.
---

# First steps

With Tusab [installed](/instalacao), the path is: build the base, ask, study. In the examples, "Biology" is the project name; use yours.

## 1. Open Tusab

Ask the AI: **"open Tusab"**. In Claude Desktop you can also use **+ › Tusab › Open Tusab**. The [screen](/tela) opens in the browser, at an address that only works on this computer.

## 2. Build the base

On the screen, create a project and add content:

- **YouTube:** paste the address of a channel, playlist or video. Tusab downloads the subtitles (not the videos) and splits them into excerpts with the minute of each one. See [YouTube extraction](/funcionalidades/extracao-youtube).
- **Documents:** upload PDFs, Word or Excel files, CSVs, Markdown texts or the address of a web page. See [Repository and documents](/funcionalidades/repositorio-multi-fonte).
- **Public sources:** search papers, theses, legislation or open data and keep the results that matter. See [Public sources](/funcionalidades/fontes-publicas).

The AI can also add content for you. For example: "add the channel youtube.com/@channel to the Biology project in Tusab".

## 3. Ask

In the conversation, ask about the content of the base:

> What does my Tusab base say about photosynthesis in the Biology project?

The AI searches the base and answers citing the source: the video with the minute (with a link that opens the video at that point) or the document with the page. If it answers that Tusab is not connected, turn the connector on in **+ › Connectors** (Claude Desktop) or check the configuration in the [other tool](/outras-ias).

## 4. Study

Pick a ready-made request:

- in Claude Desktop, in **+ › Tusab** (for example, **Flashcards**, **Quiz** or **Study summary**);
- in any AI, in the screen's **Prompt Library** tab: copy the request and paste it into the conversation.

The AI builds the material from the base, saves it in Tusab and returns the **Open in Tusab** link. The material stays in the **Materials** tab: flashcards to flip, summaries and documents with tables and diagrams, exportable to PDF. To review the flashcards on the right day, use the **Review today** request in a new conversation. See [Materials and spaced repetition](/funcionalidades/estudo).

**Which model to use?** Each request in the Library has a badge with the suggested model: **Fast** (in Claude, Haiku) for simple tasks, **Balanced** (Sonnet) to organize and compare, **Most capable** (Opus) to cross several sources. It is a cost-benefit suggestion; you choose the model, in the AI tool.

## Precautions {#cuidados}

- **Several AIs on the same base, safely.** You can use Tusab in more than one AI tool at the same time (for example, Claude Desktop and Cursor) with the same folder. The first one to open takes care of the base; the others pass their requests to it, so all of them see the same base and nothing gets corrupted. If the first one closes, another takes over by itself in a few seconds.
- **The screen works while any AI with Tusab is open.** Tusab is started by the AI tools and closes with the last of them. If the AI taking care of the base closes, another takes over and the screen address changes: ask "open Tusab" again.
- **The "Open in Tusab" link only works in that session.** The screen's address changes each time the AI starts Tusab, so an old link does not open. To see a material later, ask "open Tusab" and use the Materials tab.
- **Do not share the screen's link.** It carries the session key. It only works on this computer, but treat it as a temporary password.
- **Install only from the official repository.** Tusab runs with your user's permissions (Claude Desktop warns about this during installation). Download the package from the [releases](https://github.com/criaugu/tusab/releases) and check the SHA-256 checksum.
- **Keep Node.js up to date in the other tools.** With a version below 18.17, Tusab does not start.
- **YouTube extraction uses your IP address.** Very large channels take time; Tusab pauses between requests so it does not get blocked. You can pause and resume.

## Common problems

| What happens | What to do |
|---|---|
| The AI says Tusab is not connected | Claude Desktop: turn it on in **+ › Connectors**. Other tools: restart and check the configuration in [Other AIs](/outras-ias) |
| The screen says it lost the connection to Tusab | The AI was closed or restarted. Ask "open Tusab" again |
| The ready-made requests do not show up in **+** | Check that the connector is on. In tools without that menu, copy the request from the Library |
| The answer does not cite the base | Ask explicitly "search in Tusab". The ready-made requests already include this rule |
