---
id: politica-de-privacidade
title: Privacy Policy
sidebar_label: Privacy Policy
slug: /politica-de-privacidade
description: Tusab Privacy Policy (LGPD and GDPR). Data stays on the user's computer; CriAugu only receives the feedback the user decides to send.
---

# Tusab Privacy Policy

**Version:** 2.1 · **In effect:** from November 25, 2026 (Tusab version 2.0.0 onward)
**Responsible party:** CriAugu, CNPJ 65.131.075/0001-57 · **Contact:** [tusab@tusab.solutions](mailto:tusab@tusab.solutions)

This policy applies to Tusab from version 2.0.0, the local connector for Claude and other AIs. For the discontinued desktop app (versions 1.0.x), see [section 9](#app-desktop). The Portuguese version is the reference text.

## 1. The principle: your data stays on your computer

Tusab runs on your computer. **CriAugu operates no server** that receives the content of your base, your conversations with the AI or your files. There is no account, login, telemetry, tracking cookies or cloud sync. The only thing CriAugu receives is [voluntary feedback](#feedback-voluntario): it leaves only if you decide to send it, and you can see exactly what will go beforehand.

This policy follows Brazil's General Data Protection Law (LGPD, Law No. 13,709/2018) and, where applicable, the EU General Data Protection Regulation (GDPR, Regulation (EU) 2016/679).

## 2. What Tusab stores, and where

Everything stays in the folder you choose at installation (the "repository folder"):

| Data | Purpose |
|---|---|
| YouTube transcripts, documents, texts, web pages and public-source results you add | Building your knowledge base |
| Original files (PDF, images, audio etc.) | Letting the AI look at the original |
| Search index | Finding the right excerpts |
| Excerpt vectors (only if you turn on search by meaning with Ollama, advanced option) | Finding excerpts with similar meaning. They live in `data/vetores/` and are removed when the source is deleted, on full reset and when the option is turned off |
| Study materials and spaced-repetition state | Keeping what the AI produces and remembering review dates |
| Your own requests (prompts), language, extraction queue and preferences | Configuring Tusab |
| Token-savings counter (aggregate numbers only) | Showing how much the search saved |
| Usage counters (numbers only: tools used, prompts, trails, days of use) and the state of the feedback invitation | Inviting you to give feedback at the right time and, if you want, sending them with it |

CriAugu has no access to any of this data. The only exception is the usage numbers you decide to send with the feedback.

## 3. What leaves your computer

| Where to | What | When |
|---|---|---|
| **The AI tool you use** (Claude Desktop, Claude Code, VS Code, Cursor, Gemini CLI, Codex etc.) and the AI service behind it | The excerpts the AI looked up, document pages and images it asked for (images without location metadata), project and source names | When the AI uses a Tusab tool |
| YouTube | Requests for subtitles and video information, from your IP address | When extracting a channel or video, or checking channels for new videos |
| Public sources (paper databases, legislation, open data) | The term you searched for | When you search |
| Sites of the web pages you add | The page request | When you add a page |
| GitHub | Download of the yt-dlp tool and its checksum | Only if the computer does not have yt-dlp yet |
| Ollama **on your own computer** (advanced option) | The text of the excerpts and questions, to compute the vectors. It does not leave the computer | Only if you turn on search by meaning (`TUSAB_EMBEDDINGS=1`) |
| **CriAugu**, in the CriAugu feedback collector ([voluntary feedback](#feedback-voluntario)) | The score, the comment, the email (if you give it), the installation code and, if you check the box, the usage numbers | Only when you click Send in the feedback form |

**What the AI tool does with the excerpts** (storing them, using them to train models, which country the servers are in) follows the terms and privacy policy of that tool and AI service, not Tusab's. You choose the tool; read its policy. These services may be outside Brazil, which is an international data transfer made at your initiative (LGPD, art. 33).

To use an AI in the browser, Tusab copies a request with excerpts from the base to your clipboard. Nothing is sent until you paste it into the AI.

### Voluntary feedback {#feedback-voluntario}

From time to time (after you complete a trail, save 5 materials, after a week of use or on a new version; at most once every 30 days), the Tusab screen invites you to give a score and a comment. You can also open the form from Help. Before sending, you can see exactly what will go (under "See exactly what will be sent"):

- the score from 0 to 10 and the comment, if you write one (please do not write personal data or excerpts from your documents);
- the email, only if you want a reply;
- only if you check the box (it starts unchecked), the **usage numbers**: how many times each tool was used, which AI tools connected to Tusab, which prompts and trails, how many projects, sources, videos and excerpts, token savings, the date of first use and the days of use, the Tusab and Node versions, the system and the language. The content of the base, the queries, project names, titles or folders **never** go;
- a random installation code, which groups submissions from the same computer. It does not carry your name, but if you give your email, CriAugu can link that code to you.

The submission goes to the CriAugu collector (`coletor.criaugu.com`, on the hosting CriAugu contracts from Hostinger, which acts as a processor), is stored there and reaches the tusab@tusab.solutions mailbox by email. Hostinger is a company headquartered outside Brazil, and the servers may be in another country; in that case there is an international data transfer (LGPD, art. 33). As with any internet access, the hosting records the IP address and time of the request in the server logs; the collector itself keeps the IP only as a code derived from it (a salted digest), for up to 3 days, to limit abuse. If direct sending fails, Tusab prepares the same email, which you send if you want. "Not now" postpones it for 14 days; "Don't ask again" turns the invitation off for good. This data is used only to improve Tusab and reply to you, is kept for up to 24 months (see [section 7](#7-retention)) and can be deleted earlier, on request, through the contact email.

Technical details are in [Privacy (technical details)](/privacidade).

## 4. Legal bases

| Processing | Legal basis |
|---|---|
| Building and querying your base on your computer, for personal use | Processing by a natural person for exclusively private, non-economic purposes, outside the scope of the LGPD (art. 4, I) |
| The same, in professional or institutional use | Whoever uses it (you or your organization) is the controller and chooses the appropriate legal basis (LGPD, arts. 7 and 11; GDPR, art. 6) |
| Voluntary feedback (score, comment, optional email and usage numbers) | Consent (LGPD, art. 7, I; GDPR, art. 6(1)(a)), given at each submission; you can ask for deletion at any time |
| Sending excerpts to the AI tool you chose | An action you start, under the terms of the chosen tool |
| Third parties' personal data you put in the base (for example, names in documents) | The legal basis is the responsibility of whoever adds the content (see the [Terms and Conditions](/termos-e-condicoes)) |

**CriAugu does not receive the content of your base**, so it acts neither as controller nor as processor of that content. **It is the controller of the voluntary feedback data** (score, comment, optional email, installation code and usage numbers), and Hostinger acts as processor.

## 5. Your rights

Your base's data is on your computer, so you exercise the rights in art. 18 of the LGPD directly. For feedback, which CriAugu receives, use the contact email:

| Right | How |
|---|---|
| Access and correction | The repository folder can be opened in the operating system; the Tusab screen also lets you view and edit |
| Deletion | On the screen (delete, clear or full reset) or by deleting the files. Deleting a document also deletes the original, and the search-by-meaning vectors go with it. The usage counters and the installation code live in `data/config/uso.json` and `data/config/feedback.json`: delete these files to reset them |
| Portability | Files are in open formats (`.txt`, `.json`, `.csv`), and the base can be exported to a `.tusab` file |
| Stopping the processing | Turn off or remove Tusab from the AI tool. With the tool closed, Tusab does not run |
| Feedback already sent | Ask for access, correction or deletion through the contact email, giving the installation code (it appears in the submission preview). You can also withdraw consent at any time: just stop sending and ask for deletion of what was sent |

Privacy questions: [tusab@tusab.solutions](mailto:tusab@tusab.solutions).

## 6. Security

- The Tusab screen only answers on this computer (`127.0.0.1`) and requires a new key each session.
- Files are written so that a power outage does not corrupt the base.
- Images are sent to the AI without location metadata; if removal cannot be guaranteed, they are not sent.
- The installation package comes with a SHA-256 checksum to verify it.

We recommend protecting the computer with a password and disk encryption (BitLocker on Windows, FileVault on macOS). More in [Security](/seguranca).

## 7. Retention

Your base stays on your computer until you delete it.

**Feedback:** kept by CriAugu for up to 24 months from submission and then deleted, both the records in the collector (deleted automatically) and the emails in the tusab@tusab.solutions mailbox. The code derived from the IP, used to limit abuse, is deleted within 3 days. You can ask for earlier deletion through the contact email.

## 8. Children and adolescents

Tusab is not intended for people under 16 without the supervision of their guardians. Feedback does not ask for age: if you are under 18, do not give an email or personal data in the comment.

## 9. Desktop app (discontinued) {#app-desktop}

The desktop app (versions 1.0.x), discontinued on 2026-11-19, had features today's Tusab does not have, involving other data flows: chat with AI providers configured by the user (with API keys stored on the computer), optional anonymous telemetry with consent, and optional backup to Google Drive. Those still using the app remain covered by version 1.1 of this policy, whose rules are summarized in [Privacy (technical details)](/privacidade#app-desktop).

## 10. Changes

This policy may change. The current version is always on this page, with its number and date at the top. Relevant changes are also recorded in the [Changelog](/changelog).

## 11. Contact and data protection officer

**CriAugu**, CNPJ 65.131.075/0001-57
Data protection officer: Augusto Alves Brasil
Email: [tusab@tusab.solutions](mailto:tusab@tusab.solutions)
