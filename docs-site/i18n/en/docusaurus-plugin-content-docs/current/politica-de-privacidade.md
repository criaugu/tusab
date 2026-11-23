---
id: politica-de-privacidade
title: Privacy Policy
sidebar_label: Privacy Policy
slug: /politica-de-privacidade
description: Tusab Privacy Policy (LGPD and GDPR). Data stays on the user's computer; CriAugu receives no content, bases or usage data.
---

# Tusab Privacy Policy

**Version:** 2.0 · **In effect:** from November 2026 (Tusab version 2.0.0)
**Responsible party:** CriAugu, CNPJ 65.131.075/0001-57 · **Contact:** [tusab@tusab.solutions](mailto:tusab@tusab.solutions)

This policy applies to Tusab from version 2.0.0, the local connector for Claude and other AIs. For the discontinued desktop app (versions 1.0.x), see [section 9](#app-desktop). The Portuguese version is the reference text.

## 1. The principle: your data stays on your computer

Tusab runs on your computer. **CriAugu operates no server** that receives the content of your base, your conversations with the AI, your files or data about how you use Tusab. There is no account, login, telemetry, tracking cookies or cloud sync.

This policy follows Brazil's General Data Protection Law (LGPD, Law No. 13,709/2018) and, where applicable, the EU General Data Protection Regulation (GDPR, Regulation (EU) 2016/679).

## 2. What Tusab stores, and where

Everything stays in the folder you choose at installation (the "repository folder"):

| Data | Purpose |
|---|---|
| YouTube transcripts, documents, texts, web pages and public-source results you add | Building your knowledge base |
| Original files (PDF, images, audio etc.) | Letting the AI look at the original |
| Search index | Finding the right excerpts |
| Study materials and spaced-repetition state | Keeping what the AI produces and remembering review dates |
| Your own requests (prompts), language, extraction queue and preferences | Configuring Tusab |
| Token-savings counter (aggregate numbers only) | Showing how much the search saved |

CriAugu has no access to any of this data.

## 3. What leaves your computer

| Where to | What | When |
|---|---|---|
| **The AI tool you use** (Claude Desktop, Claude Code, VS Code, Cursor, Gemini CLI, Codex etc.) and the AI service behind it | The excerpts the AI looked up, document pages and images it asked for (images without location metadata), project and source names | When the AI uses a Tusab tool |
| YouTube | Requests for subtitles and video information, from your IP address | When extracting a channel or video, or checking channels for new videos |
| Public sources (paper databases, legislation, open data) | The term you searched for | When you search |
| Sites of the web pages you add | The page request | When you add a page |
| GitHub | Download of the yt-dlp tool and its checksum | Only if the computer does not have yt-dlp yet |

**What the AI tool does with the excerpts** (storing them, using them to train models, which country the servers are in) follows the terms and privacy policy of that tool and AI service, not Tusab's. You choose the tool; read its policy. These services may be outside Brazil, which is an international data transfer made at your initiative (LGPD, art. 33).

To use an AI in the browser, Tusab copies a request with excerpts from the base to your clipboard. Nothing is sent until you paste it into the AI.

Technical details are in [Privacy (technical details)](/privacidade).

## 4. Legal bases

| Processing | Legal basis |
|---|---|
| Building and querying your base on your computer, for personal use | Processing by a natural person for exclusively private, non-economic purposes, outside the scope of the LGPD (art. 4, I) |
| The same, in professional or institutional use | Whoever uses it (you or your organization) is the controller and chooses the appropriate legal basis (LGPD, arts. 7 and 11; GDPR, art. 6) |
| Sending excerpts to the AI tool you chose | An action you start, under the terms of the chosen tool |
| Third parties' personal data you put in the base (for example, names in documents) | The legal basis is the responsibility of whoever adds the content (see the [Terms and Conditions](/termos-e-condicoes)) |

Since CriAugu receives none of this data, it acts neither as controller nor as processor of your base's content. It is responsible only for the software itself and for this policy.

## 5. Your rights

Your data is on your computer, so you exercise the rights in art. 18 of the LGPD directly:

| Right | How |
|---|---|
| Access and correction | The repository folder can be opened in the operating system; the Tusab screen also lets you view and edit |
| Deletion | On the screen (delete, clear or full reset) or by deleting the files. Deleting a document also deletes the original |
| Portability | Files are in open formats (`.txt`, `.json`, `.csv`), and the base can be exported to a `.tusab` file |
| Stopping the processing | Turn off or remove Tusab from the AI tool. With the tool closed, Tusab does not run |

Privacy questions: [tusab@tusab.solutions](mailto:tusab@tusab.solutions).

## 6. Security

- The Tusab screen only answers on this computer (`127.0.0.1`) and requires a new key each session.
- Files are written so that a power outage does not corrupt the base.
- Images are sent to the AI without location metadata; if removal cannot be guaranteed, they are not sent.
- The installation package comes with a SHA-256 checksum to verify it.

We recommend protecting the computer with a password and disk encryption (BitLocker on Windows, FileVault on macOS). More in [Security](/seguranca).

## 7. Retention

Your base is kept until you delete it. CriAugu retains no data of yours, because it receives none.

## 8. Children and adolescents

Tusab is not intended for people under 16 without the supervision of their guardians. CriAugu collects no data from anyone, minors included.

## 9. Desktop app (discontinued) {#app-desktop}

The desktop app (versions 1.0.x), discontinued on 2026-11-19, had features today's Tusab does not have, involving other data flows: chat with AI providers configured by the user (with API keys stored on the computer), optional anonymous telemetry with consent, and optional backup to Google Drive. Those still using the app remain covered by version 1.1 of this policy, whose rules are summarized in [Privacy (technical details)](/privacidade#app-desktop).

## 10. Changes

This policy may change. The current version is always on this page, with its number and date at the top. Relevant changes are also recorded in the [Changelog](/changelog).

## 11. Contact and data protection officer

**CriAugu**, CNPJ 65.131.075/0001-57
Data protection officer: Augusto Alves Brasil
Email: [tusab@tusab.solutions](mailto:tusab@tusab.solutions)
