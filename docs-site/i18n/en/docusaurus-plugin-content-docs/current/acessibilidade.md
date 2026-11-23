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

| Key | macOS alternative | Action |
|-----|-------------------|--------|
| `Shift + B` | `⌘ + B` | Repository tab |
| `Shift + E` | `⌘ + E` | Extraction tab |
| `Shift + R` | — | Report (inside Extraction) |
| `Shift + U` | `⌘ + U` | Prompt Library |
| `Shift + V` | `⌘ + V` | Overview |
| `Shift + M` | — | Monitor |
| `Shift + A` | `⌘ + A` | Admin |

All `Shift` shortcuts are turned off automatically while the focus is in a text field, so they do not interfere with typing, on any system.

On macOS, most shortcuts also accept `⌘` (Cmd), besides `Shift`. **Monitor and Report stay `Shift`-only**, even on a Mac: the letters `M` and `R` collide with system and browser shortcuts (Minimize, Reload), which grab the key before the screen does.

The discontinued desktop app had extra shortcuts for the chat, the Assistant and the History, which do not exist on today's screen.

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
