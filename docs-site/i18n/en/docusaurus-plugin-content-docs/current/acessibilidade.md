---
id: acessibilidade
title: Accessibility
sidebar_label: Accessibility
slug: /acessibilidade
---

# Accessibility

The Tusab screen (the React interface in `web_interface/`, the same one the discontinued desktop app used) is audited against **WCAG 2.1 level AA**.

## Compliance by area

| Area | Status |
|------|--------|
| Semantic HTML structure | ✅ Compliant |
| Visible focus and keyboard navigation | ✅ Compliant (global via `index.css`) |
| `prefers-reduced-motion` | ✅ Compliant (respected globally) |
| Modals with focus trap, `aria-modal`, background isolation | ✅ Compliant (`ModalWrapper.jsx`) |
| Skip-nav link | ✅ Compliant |
| `lang` on the HTML element | ✅ Compliant |
| Text contrast (AA) | ✅ Compliant (audited via pa11y-ci on every PR) |
| `aria-live` for dynamic content | ⚠️ Partial — still evolving |

## Implementation decisions

**Global visible focus** — `:focus-visible` with a 2px ring in the primary color, applied via the `BTN_FOCUS` constant on every interactive button.

**`prefers-reduced-motion`** — every animation (Framer Motion) is reduced to 0.01ms durations when the operating system signals the preference.

**Modals** — `ModalWrapper.jsx` implements `role="dialog"`, `aria-modal="true"`, mandatory `aria-label`, automatic focus trap, rendering via `ReactDOM.createPortal` (outside `#root`), `aria-hidden="true"` on `#root` while the modal is open, and focus restoration to the previous element on close.

## Keyboard shortcuts

Shortcuts use **only letters and symbols, with no Ctrl, Alt, ⌘ or Option**. Every Windows, macOS and browser shortcut uses one of those modifiers (or F1 to F12), so Tusab's never clash with them. They work outside text fields and when no window is open. To navigate, use the **numbers 0 to 7**, in the order of the sidebar (the numeric keypad works too): one key, the same in any language.

| Shortcut | Action |
|---|---|
| `0` | Home screen |
| `1` | Extraction |
| `2` | Repository |
| `3` | Prompt Library |
| `4` | Materials |
| `5` | Overview |
| `6` | Monitor |
| `7` | Admin |
| `N` | Create on the open screen: new extraction (Extraction), new project (Repository) or new prompt (Library) |
| `/` | Search the Prompt Library |
| `F` | Full screen (enter and exit) |
| `T` | Light or dark theme |
| `?` | Show the shortcuts |
| `Esc` | Close the open window or notice |

**They can be turned off** in Help › Keyboard shortcuts (WCAG success criterion 2.1.4, for people who use voice control or type by accident). The choice is saved in the browser.

The list lives in `web_interface/src/constants/atalhos.js`, the same one the keyboard and Help use.

## WCAG 2.1 AA checklist — summary by principle

**Perceivable** — non-text content mostly has `aria-label`; minimum 4.5:1 contrast verified on the main components (with a few exceptions under fixing); text resizable via relative units; no text-as-images.

**Operable** — 100% keyboard-navigable, no focus trap outside modals, skip-nav present, focus order = DOM order, focus always visible (`BTN_FOCUS` + global CSS).

**Understandable** — page language declared (`lang`), i18n via `react-i18next`, context changes always triggered by an explicit user action, errors identified with a text message.

**Robust** — JSX compiled into valid HTML; most interactive components use the correct `role` (`switch`, `dialog`, `alert`, `status`).

## Tools used in audits

- **axe DevTools** — automated scanning (Chrome/Firefox)
- **NVDA** (Windows) — testing with the free screen reader
- **Colour Contrast Analyser** — contrast measurement
- **pa11y-ci** (axe-core + HTML_CodeSniffer via Puppeteer) — runs automatically on every push/PR (`web_interface/.pa11yci`, `.github/workflows/ci.yml`)

### pa11y-ci scope

Today the automated audit covers only the **Landing screen** (light and dark themes), the first screen and the only one reachable without prior state, which makes it deterministically testable in CI. In CI it is served by Tusab itself, as in a real installation (`node tusab-mcp/src/cli.js painel --sem-navegador`, with an empty repository). The rest (internal screens, modals, data-driven flows) is covered by manual review and screen-reader testing, not by that automated gate.

The contrast rule (`color-contrast`) is validated via **HTML_CodeSniffer**, not axe-core, in this specific configuration — the Landing's animated background (`<canvas>` from `CircuitBackground`) makes axe flag most text as "needs manual review" (it can't sample a background that keeps changing), which would reduce the gate to noise without this choice.
