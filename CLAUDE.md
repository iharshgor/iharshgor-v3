# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Overview

This is the personal portfolio site for Harsh Gor (https://iharshgor.com) — a **vanilla static site** with no build step, no framework, and no package manager. It is three hand-written files served directly: `index.html`, `style.css`, `app.js`. Deployment is via Netlify (the repo root is the publish directory).

There is no `npm`, no bundler, no transpiler, and no test suite. Edits to the source files are the final shipped artifacts.

## Development

- **Preview locally**: open `index.html` directly in a browser, or run any static server from the repo root (e.g. `python3 -m http.server 8000`). Note that the contact form's POST to `/` only works on Netlify, not via a plain local server.
- **Deploy**: push to `main`; Netlify publishes the repo root (`publish = "."` in `netlify.toml`). No build command runs.
- **Lint/tests**: none exist. Validate changes by eye in the browser.

## Architecture

### `app.js` — initializer pattern
A single `DOMContentLoaded` handler calls a series of independent, self-guarding `init*()` functions in order: `initTheme`, `initCanvasBackground`, `initTerminal`, `initTabs`, `initProjectsFilter`, `initContactForm`, `initMobileMenu`, `initScrollAnimationsFallback`. Each function queries its own DOM nodes and early-returns if they are absent, so features are decoupled. To add a feature, write a new `initX()` and register it in the `DOMContentLoaded` list.

Notable subsystems:
- **Interactive terminal** (`initTerminal`): the hero section's centerpiece. Commands live in the `commands` object keyed by name (`help`, `neofetch`, `about`, `skills`, `projects`, `hired`, `clear`). Each value is a function returning an HTML string (or performing a side effect). Add a command by adding a key — and update the `help` text. The `hired` command auto-fills and scrolls to the contact form.
- **Canvas particle background** (`initCanvasBackground`): full-screen `#bg-canvas` with mouse-reactive particles.
- **Theme**: the site is **dark-only**. `<html data-theme="dark">` is hardcoded and `:root` in `style.css` holds the dark token values directly (no light fallback, no `prefers-color-scheme`, no `light-dark()`). There is no theme toggle. If reintroducing a light theme, restore the `[data-theme="light"]` variable set, the toggle UI, and `color-scheme: light dark`.
- **Tabs / project filters**: `initTabs` (skills section, ARIA-driven with arrow-key nav) and `initProjectsFilter` (data-`data-category` matching against `data-filter` buttons).

### Contact form — Netlify Forms
The form (`#contact-form`) uses `data-netlify="true"`. Submission is intercepted in `initContactForm`: client-side validation runs first (custom validity messages via `setCustomValidity`), then it POSTs URL-encoded form data to `/` via `fetch`, shows a spinner, and opens the `<dialog id="success-dialog">` on success. The `name="contact"` attribute is what Netlify keys the form on — do not rename it.

### Scroll animations
Reveal-on-scroll is driven by `initScrollReveal` (an `IntersectionObserver`), not CSS scroll-driven timelines — the latter stuttered against the always-running canvas rAF loop and only settled when scrolling stopped. Elements opt in with `.scroll-reveal`; the observer adds `.is-visible`, and CSS transitions opacity/transform (GPU-composited, so smooth regardless of main-thread work). JS adds `.reveal-ready` to `<html>` so the hidden initial state only applies when JS is active (no-JS degrades to fully visible); the whole system is gated behind `prefers-reduced-motion: no-preference`. Items entering the viewport together (grid cards) are staggered by ~90ms each; items entering one-by-one (timeline) reveal immediately. Apply `.scroll-reveal` to individual repeating items (timeline items, project cards) rather than the wrapping section so they cascade in as you scroll.

### `style.css`
Single large stylesheet using CSS custom properties for theming (driven by `[data-theme]`). Glassmorphism (`.glass-card`, `.glass-dialog`) is a recurring visual motif. Mobile layout and the hamburger drawer (`#mobile-nav`, toggled by `initMobileMenu` which also locks body scroll via the `no-scroll` class) are handled here.

## Conventions & gotchas

- **SEO/meta is load-bearing.** `index.html`'s head contains canonical URL, Open Graph + Twitter cards (pointing at `og-preview.png`, 1200×630), and a JSON-LD `application/ld+json` block. `sitemap.xml` and `robots.txt` are also shipped. The head preloads the Outfit-800 latin woff2 (the hero `<h1>`/LCP font) — if the Google Fonts version bumps (currently `v15`), update that preload URL too. Keep these consistent when content (title, description, sections) changes.
- **Analytics**: Google Analytics (GA4, `G-4J0Y87FEVF`) is loaded in the head. (AdSense was removed for mobile performance — it accounted for ~220 KiB of the unused JS dragging mobile LCP.)
- **Caching**: `netlify.toml` sets `*.css` and `*.js` to `immutable` 1-year cache. Because filenames are not hashed, a hard refresh may be needed to see local changes reflected against a deployed version, but this does not affect deploys (Netlify invalidates on change).
- Section `id`s in `index.html` (`#hero`, `#about`, `#experience`, `#skills`, `#projects`, `#contact`) are the nav anchor targets — renaming one means updating both nav menus (desktop `.main-nav` and mobile drawer).
