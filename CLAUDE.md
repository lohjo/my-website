# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repo layout

Project root holds the Next.js app inside `sylph-main/`. A `venv/` (Python) sits beside it but is unrelated to the site build. Run all `pnpm`/`npm` commands from `sylph-main/`.

## Commands

Package manager: pnpm (see `pnpm-lock.yaml`, `.npmrc`). `npm` also works because scripts shell out via `npm run`.

- `pnpm dev` — start Next dev server.
- `pnpm build` — runs `lint` → `mdx:timestamps` → `next build`. Lint failures block builds.
- `pnpm start` — serve production build. `postbuild` invokes `next-sitemap` (uses `NEXT_PUBLIC_SITE_URL`).
- `pnpm lint` — runs in order: `lint:style` (stylelint --fix on CSS), `lint:prettier` (prettier --write), `lint:biome` (`biome check --fix --unsafe`). Order matters: prettier formats first, biome organizes imports + applies safe/unsafe fixes after.
- `pnpm lint:biome` / `pnpm lint:prettier` / `pnpm lint:style` — run individual linters.
- `pnpm mdx:timestamps` — rewrites frontmatter `time.created` / `time.updated` from FS `birthtime`/`mtime` for every `.mdx` in `app/`. Pass `--override-created` to force-overwrite created times. Auto-runs in `build`.

No test runner configured.

## Environment

`NEXT_PUBLIC_SITE_URL` — used by `app/(posts)/*/[slug]/page.tsx` to build OG image URLs and by `next-sitemap.config.js` for `siteUrl` (defaults to `https://localhost:3000` if unset).

## Architecture

Next.js 16 App Router + MDX-first content site (Sylph portfolio template).

**Path alias:** `@/*` → repo root of `sylph-main/`. Imports use `@/components/...`, `@/lib/...`, `@/types`, `@/mdx-components`, `@/styles/...`.

**Routing — `app/`:**
- Root group renders at `app/page.tsx` (home). Global `app/layout.tsx` wraps everything in `<Providers>` (theme) + Inter font + a centered article container; loads `@/styles/main.css` and applies `OpenGraph` metadata from `lib/og`.
- `app/(posts)/` route group adds a `Breadcrumb` layout. Two content sections: `guides` and `examples`. Each section follows a fixed pattern:
  - `app/(posts)/<section>/page.tsx` — index listing.
  - `app/(posts)/<section>/[slug]/page.tsx` — post page; calls `getPosts("<section>")`, generates static params + per-post OG metadata, renders `<Layout post route>`.
  - `app/(posts)/<section>/posts/*.mdx` — content files. **The folder name `posts/` is hardcoded in `lib/mdx/index.ts`** — to add a new section, mirror this triplet exactly.
- `app/api/og/route.tsx` — dynamic OG image endpoint consumed by `generateMetadata`.

**Content pipeline — `lib/mdx/index.ts`:** `getPosts(directory)` reads `app/(posts)/<directory>/posts/*.mdx`, parses frontmatter with `gray-matter`, and returns typed `Post` objects (slug derived from filename). Failures log + skip rather than throw. The `Post` type lives in `types/post/index.tsx` and supports rich frontmatter (author, time, media, seo, audience, related, social).

**MDX rendering — `mdx-components.tsx`:** Exports both a `useMDXComponents` hook (for compile-time MDX) and an `MDX` component that wraps `next-mdx-remote/rsc` for runtime rendering of frontmatter-extracted post bodies. The `MDX` wrapper hard-codes the remark/rehype plugin chain: `remarkGfm`, `rehypeSlug`, `rehypePrettyCode` (Shiki, github-dark/light, `keepBackground: false`, default `tsx`). Custom element overrides handle: GFM footnotes (rewrites `<a href="#user-content-fn-...">` into `FootnoteForwardReference` and the matching `<li>` into `FootnoteBackReference`, plus suppresses the auto-generated "Footnotes" `<h2>` and replaces with a styled label), internal/external links via `@/components/link`, `<Preview>` and `<Image>` MDX shortcodes, and Tailwind-styled `blockquote`/`table`/lists. **When changing footnote behavior, edit both the `a` and `li`/`ol` overrides together** — they cooperate.

**Styling:** Tailwind v4 (`tailwind.config.ts`, single `styles/main.css` entry). Radix Colors palette via `@radix-ui/colors`. `lib/cn` exposes a `tailwind-merge` + `clsx` helper. `next-themes` provides light/dark via `components/providers`.

**Build-time dating:** `scripts/update-mdx-timestamps.js` is invoked by `build` *before* `next build`. It mutates MDX frontmatter on disk using FS timestamps — be aware that running `build` will modify tracked `.mdx` files if their times have shifted.

## Tooling config

- **Biome** (`biome.json`) is the primary linter/formatter for JS/TS/CSS: 2-space indent, 160-char width, double quotes, organize imports on. Errors: `noUnusedImports`. Off: `a11y/noSvgWithoutTitle`. Info: `nursery/useSortedClasses` (Tailwind class sorting).
- **Prettier** runs first in the lint chain (compatible config, formats files Biome may then re-format).
- **Stylelint** with `stylelint-config-standard` + `stylelint-config-recess-order` for `*.css`.
- **TypeScript** strict mode, `moduleResolution: bundler`, `jsx: preserve`, `allowJs: true` (so `scripts/*.js` typechecks).
