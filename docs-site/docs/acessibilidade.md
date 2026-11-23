---
id: acessibilidade
title: Acessibilidade
sidebar_label: Acessibilidade
slug: /acessibilidade
---

# Acessibilidade

A tela do Tusab (a interface React de `web_interface/`, a mesma que o app desktop descontinuado usava) é auditada contra **WCAG 2.1 nível AA**.

## Conformidade por área

| Área | Status |
|------|--------|
| Estrutura HTML semântica | ✅ Conforme |
| Foco visível e navegação por teclado | ✅ Conforme (global via `index.css`) |
| `prefers-reduced-motion` | ✅ Conforme (respeitado globalmente) |
| Modais com trap de foco, `aria-modal`, isolamento do fundo | ✅ Conforme (`ModalWrapper.jsx`) |
| Skip-nav link | ✅ Conforme |
| `lang` no HTML | ✅ Conforme |
| Contraste de texto (AA) | ✅ Conforme (auditado via pa11y-ci a cada PR) |
| `aria-live` para conteúdo dinâmico | ⚠️ Parcial — segue em evolução |

## Decisões de implementação

**Foco visível global** — `:focus-visible` com anel de 2px na cor primária, aplicado via constante `BTN_FOCUS` em todo botão interativo.

**`prefers-reduced-motion`** — todas as animações (Framer Motion) são reduzidas para durações de 0.01ms quando o sistema operacional sinaliza a preferência.

**Modais** — `ModalWrapper.jsx` implementa `role="dialog"`, `aria-modal="true"`, `aria-label` obrigatório, trap de foco automático, renderização via `ReactDOM.createPortal` (fora do `#root`), `aria-hidden="true"` no `#root` enquanto a modal está aberta, e restauração de foco ao elemento anterior ao fechar.

## Atalhos de teclado

| Tecla | Alternativa no macOS | Ação |
|-------|----------------------|------|
| `Shift + B` | `⌘ + B` | Aba Repositório |
| `Shift + E` | `⌘ + E` | Aba Extração |
| `Shift + R` | — | Relatório (dentro de Extração) |
| `Shift + U` | `⌘ + U` | Biblioteca de Prompts |
| `Shift + V` | `⌘ + V` | Visão Geral |
| `Shift + M` | — | Monitor |
| `Shift + A` | `⌘ + A` | Admin |

Todos os atalhos com `Shift` são desativados automaticamente enquanto o foco está num campo de texto, para não interferir com a digitação, em qualquer sistema.

No macOS, a maioria dos atalhos também aceita `⌘` (Cmd), além do `Shift`. **Monitor e Relatório ficam só com `Shift`**, mesmo no Mac: as letras `M` e `R` colidem com atalhos do sistema e do navegador (Minimizar, Recarregar), que pegam a tecla antes da tela.

O app desktop, descontinuado, tinha atalhos a mais para o chat, o Assistente e o Histórico, que não existem na tela atual.

## Checklist WCAG 2.1 AA — resumo por princípio

**Perceptível** — conteúdo não-textual majoritariamente com `aria-label`; contraste mínimo 4.5:1 verificado nos componentes principais (com exceções pontuais em correção); texto redimensionável via unidades relativas; sem imagens de texto.

**Operável** — 100% navegável por teclado, sem armadilha de foco fora de modais, skip-nav presente, ordem de foco = ordem do DOM, foco sempre visível (`BTN_FOCUS` + CSS global).

**Compreensível** — idioma da página declarado (`lang`), i18n via `react-i18next`, mudanças de contexto sempre disparadas por ação explícita do usuário, erros identificados com mensagem textual.

**Robusto** — JSX compilado para HTML válido; a maioria dos componentes interativos usa `role` correto (`switch`, `dialog`, `alert`, `status`).

## Ferramentas usadas em auditorias

- **axe DevTools** — varredura automatizada (Chrome/Firefox)
- **NVDA** (Windows) — testes com leitor de tela gratuito
- **Colour Contrast Analyser** — medição de contraste
- **pa11y-ci** (axe-core + HTML_CodeSniffer via Puppeteer) — roda automaticamente a cada push/PR (`web_interface/.pa11yci`, `.github/workflows/ci.yml`)

### Escopo do pa11y-ci

Hoje a auditoria automatizada cobre só a **tela de Landing** (temas claro e escuro), a primeira tela e a única alcançável sem estado prévio, o que a torna testável de forma determinística em CI. No CI, ela é servida pelo próprio Tusab, como numa instalação de verdade (`node tusab-mcp/src/cli.js painel --sem-navegador`, com um repositório vazio). O restante (telas internas, modais, fluxos com dados) é coberto por revisão manual e por testes com leitor de tela, não por esse gate automatizado.

A regra de contraste (`color-contrast`) é validada via **HTML_CodeSniffer**, não via axe-core, nesta configuração específica — o fundo animado da Landing (`<canvas>` do `CircuitBackground`) faz o axe sinalizar a maioria dos textos como "precisa de revisão manual" (não consegue amostrar um fundo que muda), o que reduziria o gate a ruído sem essa escolha.
