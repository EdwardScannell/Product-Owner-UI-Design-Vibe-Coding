# Product Owner · UI Design · Vibe Coding

Twelve front-end concepts and two slide decks by **Ed Scannell**. Each site started as a product brief I wrote, covering the audience, the look and feel, and exactly how things should behave. I then built it with Claude and kept reviewing and redirecting until it met the brief.

**Portfolio page:** https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/

| # | Project | What it is | Model | Live |
|---|---------|-----------|-------|------|
| 01 | [Brass by Bezalel](brass-by-bezalel/) | E-commerce storefront for handmade brass jewelry. 3D tumbling-ring hero, glass-case carousel, 360° piece viewer, appointment booking | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/brass-by-bezalel/)  |
| 02 | [Edward's Arcade](edwards-arcade/) | Neon 1984 arcade with three playable canvas games, synthesized sound, and top-10 leaderboards | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/edwards-arcade/)  |
| 03 | [Pixel Play Arcade](pixel-play-arcade/) | Pixel-art arcade with three playable games, live demos, difficulty modes, top-10 leaderboards, and on-screen phone controls | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/pixel-play-arcade/)  |
| 04 | [Maison Odile](maison-odile/) | French bakery ordering site with scheduled pickup across three shops, menu search and filters, a shopping bag, and a catering planner | Astra | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/maison-odile/)  |
| 05 | [Ironwood Beer Hall](ironwood-beer-hall/) | Beer hall and music venue with live open/closed status, a beer-glass busyness meter, an events lineup, and BBQ menus | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/ironwood-beer-hall/)  |
| 06 | [Arthur's Carpentry & Painting](arthurs-carpentry/) | Home-improvement product page with size picker, cart, a guided walkthrough of the UI, an Ask Arthur quote form, and labeled demo reviews | Astra | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/arthurs-carpentry/)  |
| 07 | [Arthur's, take two](arthurs-carpentry-take-two/) | The same product-page brief run through Fable: an annotated prototype of the whole shopping path, with a URL map and [CONTENT] / [TODO-DEV] notes | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/arthurs-carpentry-take-two/)  |
| 08 | [Lanternfield Books](lanternfield-books/) | Independent bookstore "Shelf Talkers" page: staff and genre filters, book carousel, reserve-for-pickup flow, and designed covers | Astra | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/lanternfield-books/)  |
| 09 | [Taqueria La Mexicana](taqueria-la-mexicana/) | Restaurant landing page concept with live open/closed status, taco picker, salsa bar, reviews, ordering, and events | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/taqueria-la-mexicana/)  |
| 10 | [Decco Design Co.](decco-design-co/) | Art Deco designer portfolio with faceted search across 12 projects and a lead-capture form modeled on Airtable | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/decco-design-co/)  |
| 11 | [Frog Pondian Design Co.](frog-pondian-design-co/) | Mobile-first Deco nocturne portfolio with a multi-select "matching desk" and a lead ledger | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/frog-pondian-design-co/)  |
| 12 | [Hollis Hearth Bread Co.](hollis-hearth-bread/) | Artisan bread bakery with a twelve-month seasonal loaf calendar, photo carousel, and an adaptive Hearth Regulars sign-up | Fable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/hollis-hearth-bread/)  |
| 13 | [Kamp Kumquat, Astra's deck](kamp-kumquat-slides/) | Seven-slide illustrated safety orientation for a fictional summer camp: painted storybook scenes with comic bubbles; slide viewer and PDF | Astra | [View](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/kamp-kumquat-slides/) |
| 14 | [Kamp Kumquat, Fable's deck](kamp-kumquat-slides-fable/) | The same brief as a find-the-mistakes game: numbered klutzes per scene, a klutz counter, and Ned's one-page cue card | Fable | [View](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/kamp-kumquat-slides-fable/) |

## Same brief, Fable vs. Astra

Most of these briefs went to two models, Fable and Astra, so I could see where they diverge. Left undirected, Astra leans toward the real thing: a site that looks and behaves like the business's actual website, and twice a full app with sign-in and a database. Fable leans toward the design: polished comps, canvases, and annotated prototypes. The portfolio page shows every run side by side, brief by brief: [Fable vs. Astra](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/#fable-vs-astra). Runs that were not picked appear there as screenshots only, fictionalized the same way as the live sites.

## How they're built

- Every site is plain HTML, CSS, and JavaScript with no framework and no build step. Brass, Edward's Arcade, Ironwood, Taqueria, Decco, Frog Pondian, and Arthur's take two are each a single `index.html` file; the others split their code into a few files in the same folder.
- To run one locally, download its folder and serve it with any static server (for example `python3 -m http.server`), then open it in a browser. Sites that use JavaScript modules will not run straight from the file system.
- Forms, carts, and leaderboards save to the browser's storage. Nothing is sent anywhere.

Businesses, people, clients, prices, and reviews on these pages are illustrative. Phone numbers use the 555-01xx range, email and web addresses use the reserved `.example` domain, and towns are invented.

## Photo credits

Food, venue, and bookstore photos on Maison Odile, Ironwood, Lanternfield, and Hollis Hearth are from [Unsplash](https://unsplash.com) and load from Unsplash under the [Unsplash License](https://unsplash.com/license). Each site credits its photographers on the page. The Lanternfield Books covers are original designs made for this site; book titles and authors are real.

© 2026 Ed Scannell. All rights reserved.
