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

Os atalhos usam **só letras e sinais, sem Ctrl, Alt, ⌘ ou Option**. Todo atalho do Windows, do macOS e dos navegadores usa um desses modificadores (ou F1 a F12), então os do Tusab nunca brigam com eles. Funcionam fora das caixas de texto e quando nenhuma janela está aberta. Para navegar, use os **números de 0 a 7**, na ordem da barra lateral (o teclado numérico também vale): uma tecla só, igual em qualquer idioma.

| Atalho | Ação |
|---|---|
| `0` | Tela inicial |
| `1` | Extração |
| `2` | Repositório |
| `3` | Biblioteca de Prompts |
| `4` | Materiais |
| `5` | Visão Geral |
| `6` | Monitor |
| `7` | Admin |
| `N` | Criar na tela aberta: nova extração (Extração), novo projeto (Repositório) ou novo prompt (Biblioteca) |
| `/` | Buscar na Biblioteca de Prompts |
| `F` | Tela cheia (entrar e sair) |
| `T` | Tema claro ou escuro |
| `?` | Mostrar os atalhos |
| `Esc` | Fechar a janela ou o aviso aberto |

**Podem ser desligados** em Ajuda › Atalhos de teclado (critério 2.1.4 da WCAG, para quem usa comando de voz ou digita sem querer). A escolha fica guardada no navegador.

A lista mora em `web_interface/src/constants/atalhos.js`, a mesma que o teclado e a Ajuda usam.

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
