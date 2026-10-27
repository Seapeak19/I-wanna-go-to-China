# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

Public Chinese and international travelers discovering destinations across China, including counties and lesser-known places. Support individuals, couples, friends, families and older travelers; do not assume one party size or budget. Desktop and mobile web are equally important.

## Product Purpose

I wanna go to China helps people discover destinations, inspect source-backed attraction and restaurant information, and assemble an editable trip budget. The user confirmed on 2026-10-25 that discovery and planning should have equal importance.

## Operating Context

Visitors browse province → city/prefecture → attractions, or filter and search the catalog. Districts and counties are shown as labels on attraction photographs, using explicit records or addresses; uncertain labels remain unconfirmed. Municipalities open directly to attractions. Regional groups such as 华南 and 华东 remain available. Guides and food references connect to a locally saved itinerary. Full planning, comparison and source detail are useful after initial discovery.

## Capabilities and Constraints

- Preserve all 34 province-level regions, including Hong Kong, Macao and Taiwan. Administrative directory coverage and guide coverage are different; show content gaps honestly.
- Preserve all existing guides, original images, source links, ticket verification states, language/currency controls and budget arithmetic.
- Support 12 languages and 13 currencies independently. Translation quality and reference exchange-rate limitations remain visible.
- Verified single ticket prices prefill; unknown prices stay unknown; manually edited values persist. Shared lodging/transport costs are counted once. Dining combines manually entered costs with enabled restaurant entries; routes import alternatives unchecked.
- Preferences, comparisons and plans stay in browser storage. No account, cloud sync, payment or real-time booking service.
- Existing static HTML/CSS/JavaScript site, Node build, GitHub Pages deployment. Initial home directory and province/language data load on demand. Avoid large new dependencies and additional large image downloads.
- This design scope is home and destination exploration, with consistent detail refinements elsewhere. Budget tools must remain usable and familiar. Preview before publishing this design; the last published release is separate from current local work.

## Brand Commitments

- Name: I wanna go to China.
- The user explicitly selected dark technology aesthetics combined with translucent glass, three-dimensional depth, and pronounced motion. Preserve these commitments while developing a more distinctive composition.
- Actual destination imagery, truthful content and clearly attributed sources outrank decorative invention.

## Evidence on Hand

- `data.json`: existing destination, restaurant, price, provenance and editorial records.
- `assets/` and `assets/thumbs/`: source-backed destination images and derived thumbnails. Copyright metadata remains in the catalog. Do not substitute generated imagery for real places or imply that every image is openly licensed.
- `map-data/manifest.json`: administrative directory snapshot and lightweight destination covers.
- `i18n/`, `locale-data.js`, `locale-core.js`: existing translations and language handling.
- Existing verified budget behavior in `budget-core.js`, `ticket-core.js`, `currency-core.js` and tests.
- No invented popularity rankings, ratings, endorsements, customer counts, live availability or proof of personal visits.

## Product Principles

1. Let evocative real places lead into useful planning actions.
2. Make provenance and uncertainty understandable at the point of use.
3. Preserve geographic completeness while being honest about content gaps.
4. Keep calculations transparent and user-adjustable.
5. Keep discovery fast on mobile and desktop.

## Accessibility & Inclusion

Keep keyboard access, visible focus, readable text, touch navigation and reduced-motion support. Motion can be disabled and must not prevent discovery or planning. Multiple scripts and long translations must fit without clipping.
