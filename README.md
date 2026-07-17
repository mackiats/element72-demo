# Element 72 — Chat Prototype (Phases 1 & 2)

A working, self-contained front-end prototype of **Phases 1 & 2** of the
Element 72 conversational commerce project: the *structured-query chat layer*
plus *comparison and recommendation/outfit flows*.

> **What this is:** the chat-first storefront built to validate **H1 (intent)**,
> **H3 (entry point)**, **H4 (comparison)** and **H2 (exploratory via cards)**
> with users *before* funding the full build. No LLM/inference dependency:
> intent is parsed with rules. Phase 2's recommendation pairings are
> hand-curated (so a recommendation is never a tasteless combination — the
> brand-risk concern); in real Phase 2 this layer is LLM-assembled.

## Run it

Open `index.html` in any modern browser. No build step, no server, no install.

```
open prototype/index.html        # macOS
```

Fully offline — the brand typeface **PSL-Kittithada** (Thai + Latin) is
self-hosted from `fonts/` via `@font-face`. Using one Thai-native family across
both languages fixes the earlier gap where the Latin UI font carried no Thai
glyphs (Thai fell back to a random system font). Two glyphs absent from the
font's character set (`·`, `×`) were swapped for supported ones (`•`, `✕`).

## What's built (and what's deliberately deferred)

| Phase 1 — structured-query chat | Phase 2 — compare + recommend |
|---|---|
| Natural-language → **structured intent** (brand / category / size / price / colour / attribute) | **Side-by-side comparison** — pin products from the storefront and compare on the page (chat collapsed), or type "compare A and B" |
| **Streaming** product cards (image, price, variants, **honest stock**, quick-add) | **Outfit / kit completion** — "complete the look" around any seed product |
| **Bilingual** Thai + English, incl. brand transliteration (คีน → KEEN) | **Occasion "style me"** flows (city / camping / travel / rain / hike) |
| **Mobile-keyboard-aware** layout (`visualViewport`) | **"Add all to bag"** — the AOV / kit-completion lever (G5) |
| **Entry-point prompt menu** + escape hatches (H3) | Curated, taste-safe pairings (cross-brand) |
| **Honest no-match** (declines brands we don't carry; never fakes stock) | |

| Still deferred to Phase 3+ |
|---|
| LLM-assembled (vs. rule-based) recommendation + true semantic "vibe" queries · session memory / personalization · first-party-data pipeline & PDPA consent · real catalog + commerce-backend integration |

## How it maps to the scope decisions

- **≤2 interactions to add-to-cart** — tap a prompt or type a query → card → pick a size → add. The high-intent path (Korn, P1) closes in two taps.
- **Productive zero-intent first response** — the opening message offers a prompt menu and a "Browse everything" grid, so a user with no formed intent still lands somewhere (H3).
- **Never trap the passive browser** — persistent "Browse everything" escape hatch opens the full catalog as a grid.
- **Honest stock / no confident-wrong answers** — the skeptic (Tee, P2) requirement. Each size shows real stock; sold-out sizes are disabled; unknown brands are declined with a redirect, never faked. The `GRAYL GeoPress` Tee referenced is in the catalog.
- **Rule-based, no inference** — the parser is deterministic and instant, so first content renders well under the 3–4s bounce threshold and the channel has **zero per-query AI cost** in Phase 1.
- **Search by tags, descriptions & categories** — beyond the structured brand/size/price parse, a free-text layer matches any residual query word against each product's **tags, description copy, and category**. So `washable`, `MagSlider`, `office commute` or `solar lantern` find the right card; gibberish still returns an honest no-match. Owned by the **@seo-optimizer** agent (`.claude/agents/seo-optimizer.md`); descriptions are authored by the **@copywriter** agent.

## Try these (EN)

**Phase 1 — high-intent search**
- `KEEN sandals in size 42` — exact match, size preselected, stock confirmed
- `YETI tumblers under ฿1,500`
- `lightweight rain shell`
- `Salomon trail shoes` — honest decline + redirect (we don't carry Salomon)
- `KEEN size 50` — honest "size not available", shows the real range

**Phase 1 — free-text search (by tags / descriptions / categories)**
- `washable` — finds the Newport H2 by its description copy
- `office commute` — finds the Chrome messenger by tag + description
- `solar lantern` — finds the Goal Zero by category + description

**Phase 2 — compare & recommend**
- `style me for the city` — occasion kit + "Add all to bag"
- `what goes with the G-Pant` — outfit completion around a seed product
- `compare KEEN Newport and Targhee III` — side-by-side, streamed in chat
- tap the **compare pin** on any two storefront cards (or the item view) → the
  page-level **tray bar** → **Compare (2)** opens the comparison on the webpage,
  no chat required — the whole flow works with the guide collapsed
- tap **✦ Complete the look** on any apparel/footwear card

## Try these (ไทย)

- `รองเท้าแตะ KEEN ไซส์ 42`
- `กระบอกน้ำ YETI ไม่เกิน 1500`
- `จัดลุคสำหรับไปแคมป์` — Thai occasion kit

## Files

| File | Role |
|---|---|
| `index.html` | App shell + DOM |
| `styles.css` | Color system (per Color Book), keyboard-aware layout |
| `catalog.js` | Mock catalog (real E72 brand mix; uneven stock by design) |
| `app.js` | Rule-based intent parser, structured + free-text search (tags/descriptions/categories), streaming render, cart |
| `fonts/` | Self-hosted PSL-Kittithada web fonts (woff2/woff/ttf) |

## Colour system

Implements the **Element72 Color Book** directive: Ink (`#141210`) + Signal Red
(`#C41E22`) + a warm-mineral neutral scale, flat and high-contrast, **no
gradients** (the old gradient product tiles are now flat Neutral-100
placeholders). Tokens live as CSS variables in `styles.css`.

**Red is deployed with restraint** (the directive's core rule — max ~2 per
viewport, reserved for the single most important action). So:

- **Primary CTAs are Ink Black** (`Add to bag`, `Add all`, send) — `btn-primary`.
- **Signal Red is reserved for** the logo underline (brand mark), the **Checkout**
  CTA (the one conversion action), the cart-count badge, and error / out-of-stock
  states. Functional states use Forest Deep (in-stock) and Earth Ochre (low-stock).

A side effect: this also clears the UX audit's **P0-2 contrast failures** — muted
text now 5.1:1, sold-out 4.8:1, CTAs ≥ 5.2:1.

## Credits

Typeface **PSL-Kittithada** via [Web Font Free](https://www.webfontfree.com) — licensed CC BY 4.0.

## Honest limitations (what a stakeholder should know)

- The catalog is **mock data**. Real Phase 1 quality is floored by actual catalog
  metadata — run validation **V5** (catalog audit) before trusting recommendations.
- Stock is static. Real Phase 1 needs an **authoritative stock source** (risk R1);
  the "AI displaces LINE OA stock checks" claim depends on it.
- Quick-add is a stub. Real checkout integrates with the existing commerce backend (R4).
