# Product Owner · UI Design · Vibe Coding

Eleven front-end concepts by **Ed Scannell**. Each site started as a product brief I wrote, covering the audience, the look and feel, and exactly how things should behave. I then built it with Claude and kept reviewing and redirecting until it met the brief.

**Portfolio page:** https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/

| # | Project | What it is | Live |
|---|---------|-----------|------|
| 01 | [Brass by Bezalel](brass-by-bezalel/) | E-commerce storefront for handmade brass jewelry. 3D tumbling-ring hero, glass-case carousel, 360° piece viewer, appointment booking | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/brass-by-bezalel/) |
| 02 | [Decco Design Co.](decco-design-co/) | Art Deco designer portfolio with faceted search across 12 projects and a lead-capture form modeled on Airtable | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/decco-design-co/) |
| 03 | [Taqueria La Mexicana](taqueria-la-mexicana/) | Restaurant landing page concept with live open/closed status, taco picker, salsa bar, reviews, ordering, and events | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/taqueria-la-mexicana/) |
| 04 | [Frog Pondian Design Co.](frog-pondian-design-co/) | Mobile-first Deco nocturne portfolio with a multi-select "matching desk" and a lead ledger | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/frog-pondian-design-co/) |
| 05 | [Edward's Arcade](edwards-arcade/) | Neon 1984 arcade with three playable canvas games, synthesized sound, and top-10 leaderboards | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/edwards-arcade/) |
| 06 | [Maison Odile](maison-odile/) | French bakery ordering site with scheduled pickup across three shops, menu search and filters, a shopping bag, and a catering planner | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/maison-odile/) |
| 07 | [Hollis Hearth Bread Co.](hollis-hearth-bread/) | Artisan bread bakery with a twelve-month seasonal loaf calendar, photo carousel, and an adaptive Hearth Regulars sign-up | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/hollis-hearth-bread/) |
| 08 | [Lanternfield Books](lanternfield-books/) | Independent bookstore "Shelf Talkers" page: staff and genre filters, book carousel, reserve-for-pickup flow, and designed covers | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/lanternfield-books/) |
| 09 | [Ironwood Beer Hall](ironwood-beer-hall/) | Beer hall and music venue with live open/closed status, a beer-glass busyness meter, an events lineup, and BBQ menus | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/ironwood-beer-hall/) |
| 10 | [Arthur's Carpentry & Painting](arthurs-carpentry/) | Home-improvement product page with size picker, cart, a guided walkthrough of the UI, an Ask Arthur quote form, and labeled demo reviews | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/arthurs-carpentry/) |
| 11 | [Pixel Play Arcade](pixel-play-arcade/) | Pixel-art arcade with three playable games, live demos, difficulty modes, top-10 leaderboards, and on-screen phone controls | [Open](https://edwardscannell.github.io/Product-Owner-UI-Design-Vibe-Coding/pixel-play-arcade/) |

## How they're built

- Every site is plain HTML, CSS, and JavaScript with no framework and no build step. Sites 01 to 05 and 09 are a single `index.html` file; the others split their code into a few files in the same folder.
- To run one locally, download its folder and serve it with any static server (for example `python3 -m http.server`), then open it in a browser. Sites that use JavaScript modules will not run straight from the file system.
- Forms, carts, and leaderboards save to the browser's storage. Nothing is sent anywhere.

Businesses, people, clients, prices, and reviews on these pages are illustrative. Phone numbers use the 555-01xx range, email and web addresses use the reserved `.example` domain, and towns are invented.

## Photo credits

Food, venue, and bookstore photos on sites 06 to 09 are from [Unsplash](https://unsplash.com) and load from Unsplash under the [Unsplash License](https://unsplash.com/license). Each site credits its photographers on the page. The Lanternfield Books covers are original designs made for this site; book titles and authors are real.

© 2026 Ed Scannell. All rights reserved.
