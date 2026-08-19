# Plano de Responsividade — Ruby Dojo

## Diagnóstico

A análise revelou que o app usa **Next.js App Router + Tailwind CSS v4 + inline styles**. Os conteúdos das páginas já têm alguma responsividade básica (grids que colapsam), mas há problemas críticos:

| Problema | Severidade |
|---|---|
| **Sidebar fixa em 220px sem nenhum comportamento mobile** — ocupa 59% de uma tela de 375px | Crítico |
| **Editor de código com alturas fixas** (450px/500px) e overflow horizontal no CodeMirror | Alto |
| **`Navbar.tsx` existe mas nunca é usado** — código morto | Médio |
| Coluna `w-48` fixa na página de perfil | Baixo |

---

## Stack

- **Framework**: Next.js 16.3.0 (App Router)
- **Estilização**: Tailwind CSS v4 (CSS-first config) + inline styles + CSS Custom Properties
- **Breakpoints usados**: mobile-first, `sm:` 640px, `md:` 768px, `lg:` 1024px

---

## Fase 1 — Bottom Navigation Bar (mobile)

### Novo arquivo: `components/layout/BottomNav.tsx`
- Barra fixa no `bottom: 0` com os 4 links principais: Learn, Practice, Ranking, Profile
- Visível apenas em `< lg` (abaixo de 1024px) via `lg:hidden`
- Ícones + labels curtos
- Destaca o link ativo com a cor de acento do design system (`--accent-red`)

### `components/layout/Sidebar.tsx`
- Adicionar `hidden lg:flex` para ocultar completamente em mobile
- Remover os estilos de `position: sticky` que causam overflow em mobile

### `app/layout.tsx`
- Adicionar `<BottomNav />` dentro do layout
- Adicionar `pb-16 lg:pb-0` no `<main>` para não sobrepor o conteúdo com a barra

### Remover: `components/layout/Navbar.tsx`
- Código morto — nunca importado ou renderizado em nenhum lugar

---

## Fase 2 — Editor de Código (`/practice/[id]`)

### `components/practice/CodeEditor.tsx`
- Trocar altura fixa `450px` por `h-[45vh] min-h-[300px]`

### `components/practice/ChallengeClient.tsx`
- Painel de output/solutions: trocar `height: "500px"` por `h-[45vh] min-h-[200px]`
- Garantir `overflow-x: auto` no wrapper do CodeMirror
- Layout já usa tabs (Editor / Output / Solutions) — manter comportamento, apenas ajustar alturas

---

## Fase 3 — Ajuste de Perfil

### `app/profile/page.tsx`
- Coluna `w-48 shrink-0` na lista de módulos → `w-32 sm:w-48 shrink-0 truncate`

---

## Resumo de Arquivos

| Arquivo | Mudança |
|---|---|
| `components/layout/BottomNav.tsx` | **Criar** — nova barra de navegação mobile |
| `components/layout/Sidebar.tsx` | `hidden lg:flex` + remoção de sticky em mobile |
| `app/layout.tsx` | Adicionar `<BottomNav />` + `pb-16 lg:pb-0` no main |
| `components/layout/Navbar.tsx` | **Deletar** (código morto) |
| `components/practice/CodeEditor.tsx` | Altura responsiva |
| `components/practice/ChallengeClient.tsx` | Alturas responsivas + overflow |
| `app/profile/page.tsx` | Coluna de módulos ajustada |

---

## Decisões de Design

- **Navegação mobile**: Bottom navigation bar (barra fixa na parte inferior, estilo app mobile)
- **Editor de código no mobile**: Tabs compactas — descrição do desafio em cima, depois tabs para Editor / Output
