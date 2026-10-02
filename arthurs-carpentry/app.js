import {
  products,
  categories,
  productGroups,
  getProductGroup,
  getProduct,
  getPrice,
  money,
} from './catalog.js';
import { icon } from './icons.js';
import { businessReviewsWidget, reviewProviders } from './reviews.js';
import { newsletterWidget, newsletterContent } from './newsletter.js';
import {
  journeySteps,
  initialJourney,
  saveJourney,
  journeyTrail,
  journeyOverview,
} from './journey.js';

/** ARTHUR'S STOREFRONT — FRONTEND INTEGRATION MAP
 *
 * LIVE IN THIS BUILD: product/category routing; product search and sorting;
 * size selection; gallery zoom; accessible tabs; localStorage cart; quantity and
 * stock checks; delivery/payment selection; server-priced checkout; local order
 * confirmation and email preview; local deal watches, newsletter signups and quote requests;
 * clipboard, mailto, Facebook and Pinterest share intents; receipt download.
 *
 * CONTENT FIXTURES: every product, review, deal, stock count, return promise,
 * recommendation and project time is sample editorial content. catalog.js is
 * the intended CMS/commerce boundary. Generated images are concept photography.
 *
 * FUTURE SERVICES: authenticated accounts, real inventory/tax/shipping, hosted
 * payments, transactional email delivery, scheduled deal monitoring, quote CRM,
 * real reviews, analytics/consent and a production canonical URL for sharing.
 * Server endpoint boundaries are annotated at each form. No card data or API
 * credentials belong here. This build never implies that a demo payment ran.
 */
const $ = (selector, parent = document) => parent.querySelector(selector);
const escape = (value) =>
  String(value ?? '').replace(
    /[&<>"']/g,
    (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[char],
  );
const readLocal = (key, fallback) => {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
};
const writeLocal = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Private browsing/storage limits must not break shopping. */
  }
};
const rawCart = readLocal('arthurs-cart-v1', []);
const cart = Array.isArray(rawCart)
  ? rawCart.filter(
      (item) =>
        item &&
        getProduct(item.id) &&
        Number.isInteger(item.qty) &&
        item.qty > 0 &&
        item.qty <= getProduct(item.id).stock &&
        Number.isInteger(getPrice(getProduct(item.id), item.size)),
    )
  : [];
const state = {
  productId: 'angled-brush',
  size: '2.5',
  qty: 1,
  gallery: 0,
  tab: 'overview',
  cart,
  watched: readLocal('arthurs-watches-v1', []),
  orders: readLocal('arthurs-orders-v1', []),
  route: 'product',
  category: 'all',
  group: '',
  catalogContext: 'painting',
  search: '',
  sort: 'recommended',
  menu: null,
  checkout: { step: 1, delivery: 'shipping', payment: 'card', customer: {}, key: null },
  order: null,
  activeWatchId: null,
  journey: initialJourney(),
  reviewProvider: 'all',
  reviewPage: 0,
  expandedReviews: [],
  newsletterSaved: false,
};
if (!getProduct(state.journey.productId)) state.journey.productId = 'angled-brush';
if (state.journey.step === 3 && !state.cart.length) state.journey.step = 0;
if (!Array.isArray(state.watched)) state.watched = [];
if (!Array.isArray(state.orders)) state.orders = [];
const current = () => getProduct(state.productId) || products[0];
const cartCount = () => state.cart.reduce((count, item) => count + item.qty, 0);
const subtotal = () =>
  state.cart.reduce((sum, item) => sum + getPrice(getProduct(item.id), item.size) * item.qty, 0);
const productArt = (product, cls = '') =>
  product.image === 'brush'
    ? `<img class="product-art brush-art ${cls}" src="./assets/arthurs-brush.png" alt="Arthur’s angled paint brush with natural wood handle and dark bristles" loading="lazy" />`
    : `<div class="product-art sprite sprite-${product.image} ${cls}" role="img" aria-label="${escape(product.name)}"></div>`;
const stars = () =>
  `<span class="stars" aria-label="5 out of 5 stars">${Array(5).fill(icon('star')).join('')}</span>`;

function logo() {
  return `<a class="brand" href="./" data-action="home" aria-label="Arthur’s home"><span class="brand-mark"><svg viewBox="0 0 48 48" aria-hidden="true"><path d="M4 39 21 7h5l18 32H33L23.5 19 14 39Z" fill="currentColor"/><path d="M13 31h23" stroke="var(--paper)" stroke-width="3"/><path d="m31 6 10 10M33 4l10 10" stroke="currentColor" stroke-width="2.8"/></svg></span><span><span class="brand-name">arthur’s<span class="brand-period">.</span></span><span class="brand-subtitle">CARPENTRY & PAINTING</span></span></a>`;
}

function header() {
  return `<div class="announcement"><div class="container announcement-inner"><span>A little know-how. A lot of possibility.</span><a href="./?category=deals" data-action="category" data-id="deals">Good deals for your next great project ${icon('arrow')}</a><span>Free shipping on orders $75+</span></div></div>
  <header class="site-header">
    <div class="container header-main">${logo()}
      <form class="search-form" role="search" id="search-form"><label class="sr-only" for="site-search">Search tools, supplies, and projects</label>${icon('search')}<input id="site-search" name="search" autocomplete="off" placeholder="What are you working on?" value="${escape(state.search)}" /><kbd>⌘ K</kbd><div id="search-results" class="search-results" hidden></div></form>
      <div class="header-actions"><button class="help-button" data-action="quote">A little help?<strong>Ask Arthur ${icon('arrow')}</strong></button><span class="header-divider"></span><button class="icon-button account-button" data-action="account" aria-label="Your workshop and saved items">${icon('user')}</button><button class="cart-button" data-action="cart" aria-label="Open cart, ${cartCount()} items">${icon('bag')}<span>Cart</span><span class="cart-count">${cartCount()}</span></button><button class="icon-button mobile-menu" data-action="mobile-menu" aria-label="Open navigation">${icon('menu')}</button></div>
    </div>
    <nav class="nav-shell" aria-label="Main navigation"><div class="container nav-inner"><div class="nav-links">
      <button class="nav-link" data-action="menu" data-id="shop" aria-expanded="false">Shop by project ${icon('chevron')}</button>
      <button class="nav-link" data-action="category" data-id="all">Tools & supplies ${icon('chevron')}</button>
      <button class="nav-link" data-action="guides">DIY guides & advice</button>
      <button class="nav-link deal-nav" data-action="category" data-id="deals">${icon('tag')} Arthur’s deals</button>
    </div><button class="journey-launch" data-action="journey-overview">${icon('arrow')} Try the shopping journey</button></div><div id="mega-menu" class="mega-menu" hidden>${megaMenu()}</div></nav>
  </header>`;
}

function megaMenu() {
  return `<div class="container mega-grid">${categories.map((category) => `<section><button class="mega-title" data-action="category" data-id="${category.id}">${icon(category.icon)} ${category.name} ${icon('arrow')}</button>${category.items.map((item) => `<button data-action="category" data-id="${category.id}">${item}</button>`).join('')}</section>`).join('')}<p class="scope-note">Everyday projects, thoughtfully planned. Check local permit and licensing requirements before starting; structural and regulated trades need qualified help.</p></div>`;
}

function footer() {
  return `${newsletterWidget(state.newsletterSaved)}<section class="confidence-strip"><div class="container confidence-inner"><span>${icon('shield')} Tools Arthur would use himself</span><span>${icon('book')} Know-how with every project</span><span>${icon('return')} 30-day easy returns</span><span>${icon('home')} A real person in your corner</span></div></section>
  <footer><div class="container footer-main">${logo()}<p>Good tools. A little know-how.<br>A home you love.</p><div class="footer-links"><button data-action="guides">Find your next project</button><button data-action="quote">Get a free quote</button><button data-action="shipping">Shipping & returns</button></div><button class="footer-cta" data-action="category" data-id="deals">A good deal is a good beginning. ${icon('arrow')}</button></div><div class="container footer-bottom"><span>© ${new Date().getFullYear()} Arthur’s Carpentry & Painting</span><span>Storefront concept · Sample catalog · Demo checkout</span><button data-action="privacy">Privacy & your data</button></div></footer>`;
}

function breadcrumbs(product) {
  const category =
    categories.find((category) => category.id === state.catalogContext) || categories[0];
  const group = getProductGroup(product.id);
  // LIVE: `from` in the product URL preserves category context through refresh,
  // related-item navigation, copyable links and browser Back/Forward. A related
  // item outside that category uses its own valid category instead.
  return `<nav class="breadcrumbs" aria-label="Breadcrumb"><a href="./" data-action="home">Home</a>${icon('right')}<a href="./?category=${category.id}" data-action="category" data-id="${category.id}">${category.name}</a>${icon('right')}<a href="./?category=${category.id}&group=${group.id}" data-action="group" data-id="${group.id}" data-category="${category.id}">${group.name}</a>${icon('right')}<span aria-current="page">${escape(product.shortName)}</span></nav>`;
}

function productUrl(product) {
  const preferred = state.route === 'category' ? state.category : state.catalogContext;
  const from = product.categories.includes(preferred) ? preferred : product.category;
  return `/?product=${product.id}&from=${from}${state.journey.active ? '&journey=1' : ''}`;
}

function renderBusinessReviews() {
  const mount = $('#business-reviews-mount');
  if (mount)
    mount.innerHTML = businessReviewsWidget(
      state.reviewProvider,
      state.reviewPage,
      state.expandedReviews,
    );
}

function selectReviewProvider(id) {
  state.reviewProvider = reviewProviders.some((provider) => provider.id === id) ? id : 'all';
  state.reviewPage = 0;
  renderBusinessReviews();
  $(`#review-source-${state.reviewProvider}`)?.focus({ preventScroll: true });
}

function productPage() {
  const product = current();
  const price = getPrice(product, state.size);
  const hasDeal = !!product.originalPrice;
  const oldPrice = hasDeal ? price + product.originalPrice - product.price : null;
  const watched = state.watched.includes(product.id);
  return `<main id="main" class="container main-content">${breadcrumbs(product)}
    <div class="product-layout">
      <section class="gallery" aria-label="Product images"><div class="hero-image gallery-${state.gallery} ${product.image !== 'brush' ? 'accessory-hero' : ''}"><span class="pick-badge">${icon('check')} ARTHUR’S PICK</span><button class="gallery-zoom icon-button" data-action="zoom" aria-label="Enlarge product image">${icon('zoom')}</button>${product.image === 'brush' && state.gallery === 3 ? '<img class="product-art brush-art hero-art" src="./assets/painting-essentials.png" alt="Arthur’s painting toolkit: tape, roller, canvas and paint" />' : productArt(product, 'hero-art')}<span class="gallery-caption">GOOD TOOLS. GREAT POSSIBILITIES.</span></div>
        <div class="gallery-bottom">${product.image === 'brush' ? `<div class="gallery-thumbs" aria-label="Choose product view">${['The whole brush', 'A closer look at the bristles', 'Natural wood handle', 'Complete your toolkit'].map((label, index) => `<button class="thumbnail thumb-${index} ${state.gallery === index ? 'selected' : ''}" data-action="gallery" data-index="${index}" aria-label="${label}" aria-pressed="${state.gallery === index}">${index === 3 ? `<img src="./assets/painting-essentials.png" alt="Painting tools and supplies" />` : `<img src="./assets/arthurs-brush.png" alt="" />`}</button>`).join('')}</div>` : '<span class="small muted">Thoughtfully chosen. Ready for your next project.</span>'}<span class="image-note">The details make<br>the difference.</span></div>
        <div class="arthur-note"><span class="note-icon">${icon('brush')}</span><div><span class="eyebrow">FROM ARTHUR’S TOOLBOX</span><p>“${product.image === 'brush' ? 'A good brush does half the work. This is the one I reach for, job after job.' : 'The right supplies make all the difference. Start with good prep, and the rest follows.'}”</p></div><span class="signature">Arthur</span></div>
      </section>
      <section class="product-info" aria-labelledby="product-title"><div class="product-eyebrow"><span class="eyebrow">${product.brand}</span>${hasDeal ? '<span class="weekly-deal">THIS WEEK’S GOOD DEAL</span>' : ''}</div><h1 id="product-title">${product.id === 'angled-brush' ? 'Pro Angled<br>Paint Brush' : escape(product.name)}</h1><button class="review-link" data-action="tab" data-tab="reviews">${stars()}<strong>${product.rating}</strong><span>(${product.reviews} reviews)</span></button><p class="product-description">${product.description}</p>
        <div class="price-line"><span class="price">${money(price)}</span>${hasDeal ? `<s>${money(oldPrice)}</s><span class="save-badge">Save ${money(oldPrice - price)}</span>` : ''}<span class="price-unit">/ ${product.image === 'paint' ? 'quart' : 'each'}</span></div>
        ${product.sizes ? `<fieldset class="size-field"><legend>Brush width <span>${state.size} inch${state.size === '2.5' ? ' · Arthur’s all-rounder' : ''}</span></legend><div class="size-options">${product.sizes.map((option) => `<button class="size-option ${option.value === state.size ? 'selected' : ''}" data-action="size" data-size="${option.value}" aria-pressed="${option.value === state.size}">${option.label}${option.value === '2.5' ? '<span>POPULAR</span>' : ''}</button>`).join('')}</div></fieldset>` : `<div class="product-variant"><span>${product.specs[0][0]}</span><strong>${product.specs[0][1]}</strong></div>`}
        <div class="availability"><span class="stock-dot"></span><strong>In stock & ready for your project</strong><span>Ships in 1–2 business days</span></div>
        <div class="purchase-row"><div class="quantity-control"><button data-action="quantity" data-change="-1" aria-label="Decrease quantity" ${state.qty <= 1 ? 'disabled' : ''}>${icon('minus')}</button><label class="sr-only" for="product-quantity">Quantity</label><input id="product-quantity" type="number" min="1" max="${product.stock}" value="${state.qty}" inputmode="numeric" /><button data-action="quantity" data-change="1" aria-label="Increase quantity" ${state.qty >= product.stock ? 'disabled' : ''}>${icon('plus')}</button></div><button class="button primary add-cart" data-action="add-current">${icon('bag')} Add to cart <span>— ${money(price * state.qty)}</span></button></div>
        <!-- LIVE: Direct checkout uses the existing cart, including accessories.
             It never adds this product again. Empty carts prompt an explicit add.
             FUTURE: Reuse the production checkout/payment integration here. -->
        <button class="button checkout-button full-width product-checkout" data-action="product-checkout">Checkout ${icon('arrow')}</button>
        <button class="watch-button ${watched ? 'watching' : ''}" data-action="watch" data-id="${product.id}">${icon(watched ? 'check' : 'bell')} ${watched ? 'You’re watching this item' : 'Watch this item for a deal from Arthur'} ${!watched ? icon('plus') : ''}</button>
        <div class="shipping-perks"><button data-action="shipping">${icon('truck')} Free shipping $75+</button><span>·</span><button data-action="shipping">${icon('return')} 30-day easy returns</button></div>
        <div class="quote-card"><span class="quote-icon">${icon('home')}</span><div><strong>Love the result. Skip the work.</strong><p>Let Arthur take care of your next project.</p><button data-action="quote">Ask Arthur for a free quote ${icon('arrow')}</button></div></div>
        <div class="share-row"><span>A good find? Pass it on.</span><button data-action="share" data-platform="facebook" aria-label="Share product on Facebook" class="social-button social-f">f</button><button data-action="share" data-platform="pinterest" aria-label="Share product on Pinterest" class="social-button social-p">p</button><button data-action="share" data-platform="email" aria-label="Share product by email" class="social-button">${icon('mail')}</button><button data-action="share" data-platform="copy" aria-label="Copy product link" class="social-button">${icon('link')}</button></div>
      </section>
    </div>
    <section class="product-details" id="product-details" aria-label="Product details"><div class="tabs" role="tablist" aria-label="Learn about this item">${[
      ['overview', 'The details'],
      ['specifications', 'Specifications'],
      ['instructions', 'How to use'],
      ['safety', 'Safety & care'],
      ['reviews', `Reviews (${product.reviews})`],
    ]
      .map(
        ([id, label]) =>
          `<button id="tab-${id}" role="tab" aria-selected="${state.tab === id}" aria-controls="detail-panel" tabindex="${state.tab === id ? 0 : -1}" data-action="tab" data-tab="${id}" class="tab ${state.tab === id ? 'active' : ''}">${label}</button>`,
      )
      .join(
        '',
      )}</div><div id="detail-panel" role="tabpanel" aria-labelledby="tab-${state.tab}" tabindex="0">${detailContent(product)}</div></section>
    <section class="related-section"><div class="section-heading"><div><span class="eyebrow">BETTER TOGETHER</span><h2>A few things for a great finish.</h2></div><button class="text-link" data-action="category" data-id="painting">Shop painting essentials ${icon('arrow')}</button></div><div class="product-grid">${products
      .filter((item) => item.id !== product.id)
      .slice(0, 4)
      .map(productCard)
      .join('')}</div></section>
    ${projectsSection()}
    <section class="ask-banner"><div class="banner-illustration">${icon('brush')}${icon('hammer')}</div><div><span class="eyebrow">A LITTLE HELP GOES A LONG WAY</span><h2>You bring the vision.<br>Arthur brings the know-how.</h2><p>From a fresh coat to a fresh start, let’s make your home feel more like you.</p></div><button class="button light" data-action="quote">Tell Arthur about your project ${icon('arrow')}</button></section>
  </main>`;
}

function detailContent(product) {
  if (state.tab === 'specifications')
    return `<div class="details-grid"><div><span class="eyebrow">KNOW YOUR TOOL</span><h2>Every little detail.</h2><dl class="spec-table">${product.sizes ? `<div><dt>Selected width</dt><dd>${state.size} in.</dd></div>` : ''}${product.specs.map(([label, value]) => `<div><dt>${label}</dt><dd>${value}</dd></div>`).join('')}</dl><p class="small muted">SKU: ART-${product.id.toUpperCase()}${product.sizes ? `-${state.size.replace('.', '')}` : ''} · Sample product specifications.</p></div>${tipCard('Right tool. Better result.', 'Match your brush to the coating and surface. Synthetic bristles are a good starting point for water-based paint.', 'See how to use it', 'instructions')}</div>`;
  if (state.tab === 'instructions')
    return `<div class="details-grid"><div><span class="eyebrow">YOU’VE GOT THIS</span><h2>${product.image === 'brush' ? 'A great finish, step by step.' : 'Make the most of your supplies.'}</h2><ol class="instruction-list">${(product.image ===
    'brush'
      ? [
          [
            'Start with a sound surface',
            'Clean and dry the surface. Protect your floor and mask edges. Check older coatings for lead before any sanding or scraping.',
          ],
          [
            'Load a little, paint a little',
            'For water-based paint, lightly dampen the bristles and remove excess water. Dip about one-third of the bristle length, then tap gently against the can.',
          ],
          [
            'Let the angle do the work',
            'Hold the brush like a pencil. Use light pressure and controlled strokes to cut in at edges, working from a wet edge. Avoid overworking drying paint.',
          ],
          [
            'Finish well. Clean well.',
            'Follow your paint label for drying and recoat times. Clean the brush promptly, reshape the bristles, and hang it to dry before storing.',
          ],
        ]
      : product.image === 'tape'
        ? [
            [
              'Prepare your surface',
              'Start with a clean, dry surface. Test adhesion and removal in a hidden spot.',
            ],
            [
              'Apply with care',
              'Lay tape without stretching and press the edge firmly to create an even boundary.',
            ],
            [
              'Paint and remove',
              'Follow the tape and paint labels for removal timing. Pull tape back slowly at an angle; score a bridged paint edge carefully if needed.',
            ],
          ]
        : product.image === 'cloth'
          ? [
              [
                'Protect the work area',
                'Cover furniture and walking surfaces while keeping paths and ladder feet secure.',
              ],
              [
                'Catch drips safely',
                'Flatten folds that could trip you. Canvas is not waterproof; add a suitable protective layer for spills.',
              ],
              [
                'Clean and store',
                'Let water-based drips dry, then shake out debris safely and fold for next time. Follow the fabric care label.',
              ],
            ]
          : [
              [
                'Read the coating label',
                'Check the surface compatibility, ventilation requirements, and recommended applicator.',
              ],
              [
                'Prepare and test',
                'Protect surrounding surfaces, prepare a small test area, and use a compatible primer where required.',
              ],
              [
                'Apply evenly',
                'Maintain an even wet edge and follow the coating’s drying and recoat instructions.',
              ],
              [
                'Clean promptly',
                'Follow the product label for cleanup and disposal. Store tools dry and paint securely.',
              ],
            ]
    )
      .map(([title, body]) => `<li><div><h3>${title}</h3><p>${body}</p></div></li>`)
      .join(
        '',
      )}</ol><div class="inline-actions"><button class="text-link" data-action="share" data-platform="copy" data-content="instructions">${icon('share')} Share this guide</button><a class="text-link" href="#painting">More brush guidance ${icon('arrow')}</a></div></div>${tipCard('Slow is smooth. Smooth is fast.', 'A little time spent on preparation saves a lot of time fixing things later. Put the kettle on, lay out your tools, and start small.', 'Check the safety notes', 'safety')}</div>`;
  if (state.tab === 'safety')
    return `<div class="details-grid"><div><span class="eyebrow">LOOK AFTER YOURSELF, TOO</span><h2>A good job is a safe job.</h2><div class="safety-notice">${icon('shield')}<div><strong>Painting a home built before 1978?</strong><p>Old painted surfaces may contain lead. Avoid disturbing suspect paint. EPA recommends a lead-safe certified contractor for renovation work involving lead paint.</p><a href="https://www.epa.gov/lead/lead-safe-renovations-diyers" target="_blank" rel="noopener noreferrer">Read EPA’s lead-safe guidance ${icon('arrow')}</a></div></div><ul class="care-list"><li><strong>Read the label first.</strong> Follow the paint or coating label and safety data sheet, including ventilation and protective equipment requirements.</li><li><strong>Protect your space.</strong> Keep children and pets away from wet paint and tools. Secure drop cloths and keep walkways clear.</li><li><strong>Reach safely.</strong> Use a stable, suitable ladder according to its instructions. Do not overreach or stand on furniture.</li><li><strong>Clean up thoughtfully.</strong> For this water-based brush, follow the paint label’s washing instructions. Do not pour paint or wash water into storm drains; follow local disposal requirements.</li><li><strong>Store for next time.</strong> Reshape clean bristles, hang to dry, and use a brush keeper. Store paint securely in its original labeled container.</li></ul><p class="small muted">Licensing and permits depend on your location and scope. Ask a qualified professional about structural work, regulated trades, or hazardous materials.</p></div>${tipCard('When in doubt, ask.', 'Your home and your safety are worth getting right. If a project feels outside your comfort zone, we’ll help you find the next step.', 'Tell Arthur about your project', 'quote')}</div>`;
  if (state.tab === 'reviews')
    return `<div class="details-grid"><div><span class="eyebrow">FROM THE WORKBENCH</span><h2>Good words. Great projects.</h2><div class="review-summary"><span>${product.rating}</span><div>${stars()}<p>${product.reviews} sample customer reviews</p></div></div>${[
      {
        name: 'Jamie R.',
        project: 'A hallway refresh',
        text: 'Made the edges around our door frames feel so much easier. Comfortable to hold, even when the afternoon got a little longer than planned.',
      },
      {
        name: 'Morgan T.',
        project: 'A second life for an old dresser',
        text: 'Exactly the kind of practical tool I wanted. The care notes were a nice touch, and everything cleaned up well.',
      },
    ]
      .map(
        (review) =>
          `<article class="review-card"><div>${stars()}<span>${review.project}</span></div><p>${review.text}</p><strong>${review.name}</strong><span class="small muted"> · Illustrative review</span></article>`,
      )
      .join(
        '',
      )}</div>${tipCard('Made for real life.', 'A wall refreshed. A dresser rescued. A Saturday well spent. The best projects are the ones that make your home feel like yours.', 'Explore more projects', 'guides')}</div>`;
  return `<div class="details-grid"><div><span class="eyebrow">SMALL TOOL. BIG DIFFERENCE.</span><h2>${product.image === 'brush' ? 'Meet your new right-hand brush.' : 'Good things start with the right tools.'}</h2><p class="detail-intro">${product.detail}</p><div class="feature-grid">${(product.image ===
  'brush'
    ? [
        ['brush', 'A cleaner edge', 'Angled bristles get into the details.'],
        ['leaf', 'Comfort in your hand', 'A natural wood handle, made for control.'],
        ['sparkle', 'A smoother finish', 'Fine synthetic bristles lay paint evenly.'],
        ['return', 'Ready for the next job', 'Clean, care for, and use again.'],
      ]
    : [
        ['check', 'Thoughtfully chosen', 'The essentials your project needs.'],
        ['home', 'At home in your toolkit', 'Practical supplies for everyday projects.'],
        ['book', 'Know-how included', 'Simple guidance to help you get started.'],
        ['heart', 'Arthur’s kind of quality', 'Dependable tools, no unnecessary extras.'],
      ]
  )
    .map(
      ([name, title, text]) =>
        `<div>${icon(name)}<span><strong>${title}</strong><p>${text}</p></span></div>`,
    )
    .join(
      '',
    )}</div></div>${tipCard('A little advice from Arthur', product.image === 'brush' ? '“Don’t overload your brush. Dip just the bottom third of the bristles, tap off the extra, and let the brush do what it does best.”' : '“Good prep is the bit nobody sees, but everybody notices. Give yourself a little time to get it right.”', 'Get the step-by-step', 'instructions')}</div>`;
}

function tipCard(title, text, link, action) {
  return `<aside class="tip-card"><span class="tip-doodle">${icon('sun')}</span><h3>${title}</h3><p>${text}</p><span class="signature">Arthur</span><button class="text-link" data-action="${['quote', 'guides'].includes(action) ? action : 'tab'}" data-tab="${action}">${link} ${icon('arrow')}</button></aside>`;
}

function productCard(product) {
  return `<article class="product-card"><a class="card-image" href="${productUrl(product)}" data-action="product" data-id="${product.id}">${productArt(product)}${product.originalPrice ? '<span class="card-deal">A GOOD DEAL</span>' : ''}</a><div class="card-meta"><span>${product.brand === 'THE PREP ESSENTIALS' ? 'PREP LIKE A PRO' : 'ARTHUR’S ESSENTIALS'}</span><span>${icon('star')} ${product.rating}</span></div><a class="card-title" href="${productUrl(product)}" data-action="product" data-id="${product.id}">${product.shortName}</a><div class="card-price"><span>${money(product.price)} ${product.originalPrice ? `<s>${money(product.originalPrice)}</s>` : ''}</span><button class="quick-add" data-action="quick-add" data-id="${product.id}" aria-label="Add ${escape(product.name)} to cart">${icon('plus')}</button></div></article>`;
}

const projects = [
  {
    title: 'Give your trim a fresh start',
    type: 'INTERIOR PAINTING',
    icon: 'home',
    time: 'An afternoon',
    level: 'Beginner friendly',
    category: 'painting',
    description:
      'Clean and prepare sound trim, protect the surrounding area, and apply a compatible water-based finish in light coats. Check older paint for lead before disturbing it.',
    items: ['angled-brush', 'painters-tape', 'canvas-cloth'],
  },
  {
    title: 'Make old furniture feel new',
    type: 'FURNITURE & WOODWORK',
    icon: 'hammer',
    time: 'A weekend',
    level: 'A little experience',
    category: 'carpentry',
    description:
      'Give a small wooden piece a cosmetic refresh. Identify the old finish, follow lead-safe guidance where relevant, clean carefully, and use furniture-compatible primer and paint.',
    items: ['angled-brush', 'canvas-cloth', 'painters-tape'],
  },
  {
    title: 'Add a little front-door charm',
    type: 'OUTDOOR PROJECTS',
    icon: 'leaf',
    time: 'A weekend',
    level: 'Beginner friendly',
    category: 'outdoor',
    description:
      'Refresh an existing, sound door or decorative planter with a coating specifically rated for the surface and outdoor exposure. Check weather and drying instructions before you begin.',
    items: ['angled-brush', 'roller-kit', 'canvas-cloth'],
  },
];

function projectsSection() {
  return `<section class="projects-section"><div class="section-heading"><div><span class="eyebrow">ONE BRUSH. SO MANY POSSIBILITIES.</span><h2>What will you make of your weekend?</h2></div><button class="text-link" data-action="guides">More DIY inspiration ${icon('arrow')}</button></div><div class="project-grid">${projects.map((project, index) => `<button class="project-card project-${index}" data-action="project-guide" data-index="${index}"><div class="project-visual">${icon(project.icon)}<span>0${index + 1}</span></div><div class="project-copy"><span class="eyebrow">${project.type}</span><h3>${project.title}</h3><p>${icon('clock')} ${project.time}<span>·</span>${project.level}</p><span class="project-arrow">${icon('arrow')}</span></div></button>`).join('')}</div></section>`;
}

function categoryPage() {
  const category = categories.find((item) => item.id === state.category);
  const group = productGroups.find((item) => item.id === state.group);
  let filtered = products.filter(
    (product) =>
      (state.category === 'all' ||
        (state.category === 'deals' && product.originalPrice) ||
        product.categories.includes(state.category)) &&
      (!group || group.productIds.includes(product.id)) &&
      (!state.search ||
        `${product.name} ${product.description} ${product.categories.join(' ')}`
          .toLowerCase()
          .includes(state.search.toLowerCase())),
  );
  if (state.sort === 'price-low') filtered.sort((a, b) => a.price - b.price);
  if (state.sort === 'price-high') filtered.sort((a, b) => b.price - a.price);
  const title = state.search
    ? `Good finds for “${escape(state.search)}”`
    : state.category === 'deals'
      ? 'Good tools. Even better deals.'
      : group?.name || category?.name || 'Good things for the job ahead.';
  return `<main id="main" class="container category-page"><nav class="breadcrumbs" aria-label="Breadcrumb"><a href="./" data-action="home">Home</a>${icon('right')}${group ? `<a href="./?category=${state.category}" data-action="category" data-id="${state.category}">${category?.name || 'Tools & supplies'}</a>${icon('right')}<span aria-current="page">${group.name}</span>` : `<span aria-current="page">${category?.name || 'Tools & supplies'}</span>`}</nav><div class="category-hero"><span class="eyebrow">${state.category === 'deals' ? 'A FEW GOOD DEALS, EVERY WEEK' : 'FROM ARTHUR’S TOOLBOX TO YOURS'}</span><h1>${title}</h1><p>${category?.subtitle || 'The tools we reach for. The supplies we trust. Everything you need to make a little progress.'}</p></div><div class="category-chips"><button class="chip ${state.category === 'all' ? 'selected' : ''}" data-action="category" data-id="all">All essentials</button>${categories.map((item) => `<button class="chip ${state.category === item.id ? 'selected' : ''}" data-action="category" data-id="${item.id}">${icon(item.icon)} ${item.name}</button>`).join('')}<button class="chip ${state.category === 'deals' ? 'selected' : ''}" data-action="category" data-id="deals">${icon('tag')} Good deals</button></div>${category ? `<div class="project-scope">${category.items.map((item) => `<span>${icon('check')} ${item}</span>`).join('')}</div>` : ''}<div class="product-type-links" aria-label="Filter by product type"><span>Find your supplies</span>${productGroups.map((item) => `<button class="${state.group === item.id ? 'selected' : ''}" data-action="group" data-id="${item.id}" data-category="${state.category}" aria-pressed="${state.group === item.id}">${item.name}</button>`).join('')}${state.group ? `<button data-action="category" data-id="${state.category}">All product types ${icon('close')}</button>` : ''}</div><div class="results-bar"><span>${filtered.length} thoughtfully chosen essentials</span><label>Sort by <select id="catalog-sort"><option value="recommended" ${state.sort === 'recommended' ? 'selected' : ''}>Arthur’s picks</option><option value="price-low" ${state.sort === 'price-low' ? 'selected' : ''}>Price: low to high</option><option value="price-high" ${state.sort === 'price-high' ? 'selected' : ''}>Price: high to low</option></select></label></div>${filtered.length ? `<div class="product-grid catalog-grid">${filtered.map(productCard).join('')}</div>` : `<div class="empty-state">${icon('search')}<h2>No tools found this time.</h2><p>Try “brush”, “paint”, or “canvas”, or browse all our essentials.</p><button class="button primary" data-action="category" data-id="all">Browse all essentials</button></div>`}<p class="scope-note category-scope">These are common cosmetic and maintenance projects. Local permit, licensing, and hazardous-material rules vary; confirm the requirements for your home and scope.</p><div id="business-reviews-mount">${businessReviewsWidget(state.reviewProvider, state.reviewPage, state.expandedReviews)}</div>${projectsSection()}</main>`;
}

function guidesPage() {
  return `<main id="main" class="container guides-page"><nav class="breadcrumbs"><a href="./" data-action="home">Home</a>${icon('right')}<span>DIY guides & advice</span></nav><div class="category-hero"><span class="eyebrow">A LITTLE KNOW-HOW GOES A LONG WAY</span><h1>Made for your<br>“I can do this” moment.</h1><p>Simple, thoughtful guides for making home a little more yours.</p></div>${projectsSection()}<div class="guide-help"><h2>Start with the basics.</h2><button class="button outline" data-action="guide-tab" data-tab="instructions">How to use an angled brush ${icon('arrow')}</button><button class="button outline" data-action="guide-tab" data-tab="safety">Read the safety & care guide ${icon('shield')}</button></div></main>`;
}

function render() {
  $('#app').innerHTML =
    header() +
    '<div id="journey-mount"></div>' +
    (state.route === 'category'
      ? categoryPage()
      : state.route === 'guides'
        ? guidesPage()
        : productPage()) +
    footer();
  document.title = `${state.route === 'product' ? current().name : state.route === 'guides' ? 'DIY Guides & Advice' : 'Tools for Your Next Project'} | Arthur’s`;
  renderJourney();
}
function routeFromUrl() {
  const params = new URLSearchParams(location.search);
  state.route =
    params.has('category') || params.has('q')
      ? 'category'
      : params.has('guides')
        ? 'guides'
        : 'product';
  state.productId = getProduct(params.get('product'))?.id || 'angled-brush';
  state.catalogContext = current().categories.includes(params.get('from'))
    ? params.get('from')
    : current().category;
  state.group = productGroups.some((group) => group.id === params.get('group'))
    ? params.get('group')
    : '';
  state.category = ['all', 'deals', ...categories.map((category) => category.id)].includes(
    params.get('category'),
  )
    ? params.get('category')
    : 'all';
  state.search = params.get('q') || '';
  if (params.get('journey') === '1' && !state.journey.active) {
    state.journey = { active: true, step: 0, completed: [], productId: state.productId };
    saveJourney(state.journey);
  }
  state.size = current().defaultSize || '';
  state.tab = ['overview', 'specifications', 'instructions', 'safety', 'reviews'].includes(
    params.get('tab'),
  )
    ? params.get('tab')
    : 'overview';
}
function navigate(query) {
  closeModal();
  const next = new URL(query || '/', location.origin);
  if (state.journey.active) next.searchParams.set('journey', '1');
  history.pushState({}, '', next.pathname + next.search);
  routeFromUrl();
  state.qty = 1;
  state.gallery = 0;
  render();
  window.scrollTo({ top: 0, behavior: 'instant' });
}
window.addEventListener('popstate', () => {
  closeModal();
  routeFromUrl();
  render();
});

/** LIVE, OPTIONAL WALKTHROUGH: All shopping continues to use the ordinary
 * controls and server validation. This layer makes the path visible and offers
 * directions. It must never auto-place an order or imply an email was sent.
 * The initial page remains the PDP, including the shareable /?journey=1 entry.
 */
function journeyCopy() {
  const step = state.journey.step;
  if (step === 0)
    return {
      title: 'Start here, on the Product Detail page.',
      text: 'Read the details, choose a width, set QTY to 2, and add your first item.',
      button: 'Choose quantity',
    };
  if (step === 1)
    return state.route === 'category'
      ? {
          title: 'Explore a sample category.',
          text: 'Try a project category or product type, then open a product card. Your cart stays with you.',
          button: 'Return to your first product',
        }
      : {
          title: 'See where this product belongs.',
          text: 'Follow the category breadcrumb to explore the sample catalog, then return to a product.',
          button: 'Explore categories',
        };
  if (step === 2)
    return state.route === 'product' && current().id !== state.journey.productId
      ? {
          title: 'Add a matching supply.',
          text: 'You’re on a related item’s detail page. Choose its quantity and add it to the same cart.',
          button: 'Choose quantity',
        }
      : {
          title: 'A few supplies make the project complete.',
          text: 'Open a related item below, like painter’s tape, choose its quantity, and add it to your cart.',
          button: 'View related items',
        };
  if (step === 3)
    return {
      title: 'Review your toolbox.',
      text: 'Check quantities and prices, remove anything you don’t need, then begin checkout.',
      button: 'Open cart',
    };
  if (step === 4)
    return {
      title: 'Choose how your order gets to you.',
      text: 'Enter contact details and select shipping or local pickup. Sample details are available for this walkthrough.',
      button: 'Continue checkout',
    };
  if (step === 5)
    return {
      title: 'Select payment, then review.',
      text: 'Choose a sample payment method, check your totals, and place the demo order when you’re ready.',
      button: 'Continue checkout',
    };
  if (step === 6)
    return {
      title: 'Your demo order is confirmed.',
      text: 'See the order number and totals, then open the confirmation email prepared behind the scenes.',
      button: 'View confirmation',
    };
  return {
    title: 'You’ve followed the shopping path.',
    text: 'The email preview shows the order details created by the server. No payment was charged.',
    button: 'Finish walkthrough',
  };
}

function updateJourney(step, completed = []) {
  if (!state.journey.active) return;
  state.journey.step = step;
  state.journey.completed = [...new Set([...state.journey.completed, ...completed])];
  saveJourney(state.journey);
  renderJourney();
}

function renderJourney() {
  const mount = $('#journey-mount');
  document.documentElement.classList.toggle('journey-active', state.journey.active);
  if (mount)
    mount.innerHTML = state.journey.active
      ? `<section class="journey-bar" aria-label="Guided shopping journey"><div class="container"><div class="journey-bar-top"><span class="eyebrow">YOUR SHOPPING PATH · ${state.journey.step + 1} OF 8</span><button class="journey-exit" data-action="journey-exit">Exit walkthrough ${icon('close')}</button></div>${journeyTrail(state.journey)}<div class="journey-next"><div role="status" aria-live="polite"><strong>${journeyCopy().title}</strong><p>${journeyCopy().text}</p></div><button class="button outline" data-action="journey-next">${journeyCopy().button} ${icon('arrow')}</button></div></div></section>`
      : '';
  // In native dialogs, the guide belongs inside the top layer so it remains
  // visible and keyboard reachable without covering or replacing form controls.
  const modal = $('#modal');
  $('.journey-modal-guide', modal)?.remove();
  if (
    state.journey.active &&
    modal.open &&
    ['cart-drawer', 'checkout-modal', 'confirmation-modal', 'email-modal'].some((cls) =>
      modal.classList.contains(cls),
    )
  ) {
    modal.insertAdjacentHTML(
      'afterbegin',
      `<div class="journey-modal-guide"><span>${icon(journeySteps[state.journey.step].icon)}</span><div><strong>STEP ${state.journey.step + 1} OF 8 · ${journeySteps[state.journey.step].label}</strong><p>${journeyCopy().text}</p></div></div>`,
    );
  }
}

function endJourney() {
  state.journey.active = false;
  saveJourney(state.journey);
  const url = new URL(location.href);
  url.searchParams.delete('journey');
  history.replaceState({}, '', url);
  renderJourney();
  toast('Walkthrough closed. Your cart is right where you left it.');
}

function focusJourneyTarget(selector) {
  closeModal();
  requestAnimationFrame(() => {
    const target = $(selector);
    if (!target) return;
    target.scrollIntoView({ behavior: 'smooth', block: 'center' });
    target.classList.add('journey-highlight');
    const control = target.matches('input, button, a') ? target : $('input, button, a', target);
    control?.focus({ preventScroll: true });
    setTimeout(() => target.classList.remove('journey-highlight'), 2400);
  });
}

function nextJourneyAction() {
  const step = state.journey.step;
  if (step === 0) {
    if (state.route !== 'product') navigate(productUrl(getProduct(state.journey.productId)));
    focusJourneyTarget('.purchase-row');
  } else if (step === 1) {
    if (state.route === 'category') {
      updateJourney(2, [1]);
      navigate(productUrl(getProduct(state.journey.productId)));
    } else navigate(`/?category=${state.catalogContext}`);
  } else if (step === 2) {
    if (state.route === 'product' && current().id !== state.journey.productId)
      focusJourneyTarget('.purchase-row');
    else {
      if (state.route !== 'product') navigate(productUrl(getProduct(state.journey.productId)));
      focusJourneyTarget('.related-section');
    }
  } else if (step === 3) cartDialog();
  else if (step === 4 || step === 5) {
    if (!state.checkout.key) state.checkout.key = crypto.randomUUID();
    checkoutDialog();
  } else if (step === 6 && state.order) confirmationDialog();
  else if (step === 7) endJourney();
}

function toast(message) {
  const node = $('#toast');
  node.innerHTML = `${icon('check')}<span>${escape(message)}</span>`;
  node.classList.add('visible');
  clearTimeout(toast.timer);
  toast.timer = setTimeout(() => node.classList.remove('visible'), 3600);
}
function saveCart() {
  writeLocal('arthurs-cart-v1', state.cart);
  $$('.cart-count').forEach((node) => (node.textContent = cartCount()));
  $('.cart-button')?.setAttribute('aria-label', `Open cart, ${cartCount()} items`);
}
function $$(selector, parent = document) {
  return [...parent.querySelectorAll(selector)];
}
function addToCart(id, qty = 1, size) {
  const product = getProduct(id);
  size = product.sizes ? size || product.defaultSize : '';
  const totalOfProduct = state.cart
    .filter((item) => item.id === id)
    .reduce((sum, item) => sum + item.qty, 0);
  if (totalOfProduct + qty > product.stock) {
    toast(`Only ${product.stock} of this item are available in the sample catalog.`);
    return;
  }
  const existing = state.cart.find((item) => item.id === id && item.size === size);
  if (existing) existing.qty += qty;
  else state.cart.push({ id, size, qty });
  saveCart();
  toast(`${qty > 1 ? qty + ' × ' : ''}${product.shortName} added to your cart`);
  // Track actual successful adds only. Opening the guide never changes a cart.
  if (state.journey.active) {
    if (id === state.journey.productId)
      updateJourney(state.journey.completed.includes(1) ? 2 : 1, [0]);
    else updateJourney(3, [2]);
  }
  return true;
}

// LIVE ACCESSIBILITY: native <dialog> gives modal semantics, inert background,
// Escape handling and focus containment. Restore the invoking element on close.
let priorFocus;
function openModal(content, cls = '', label = 'Arthur’s workshop') {
  const modal = $('#modal');
  if (!modal.open) priorFocus = document.activeElement;
  modal.className = cls;
  modal.setAttribute('aria-label', label);
  modal.innerHTML = `<button class="modal-close icon-button" data-action="close-modal" aria-label="Close dialog">${icon('close')}</button>${content}`;
  if (!modal.open) modal.showModal();
  document.body.classList.add('modal-open');
  modal.scrollTop = 0;
  if (cls === 'cart-drawer') updateJourney(3);
  else if (cls === 'checkout-modal') updateJourney(state.checkout.step === 1 ? 4 : 5);
  else if (cls === 'confirmation-modal') updateJourney(6, [5, 6]);
  else if (cls === 'email-modal') updateJourney(7, [7]);
  else renderJourney();
}
function closeModal() {
  const modal = $('#modal');
  if (modal.open) modal.close();
}
$('#modal').addEventListener('close', () => {
  document.body.classList.remove('modal-open');
  if (priorFocus?.isConnected) priorFocus.focus({ preventScroll: true });
});
$('#modal').addEventListener('click', (event) => {
  if (event.target === $('#modal')) {
    const rect = $('#modal').getBoundingClientRect();
    if (
      event.clientX < rect.left ||
      event.clientX > rect.right ||
      event.clientY < rect.top ||
      event.clientY > rect.bottom
    )
      closeModal();
  }
});

function cartDialog() {
  const remaining = Math.max(0, 7500 - subtotal());
  openModal(
    `<div class="drawer-heading"><span class="eyebrow">GOOD THINGS IN THE MAKING</span><h2>Your toolbox <span>(${cartCount()})</span></h2></div>${
      state.cart.length
        ? `<div class="shipping-progress"><p>${remaining ? `You’re ${money(remaining)} away from free shipping.` : `${icon('check')} You’ve unlocked free shipping.`}</p><div><span style="width:${Math.min(100, (subtotal() / 7500) * 100)}%"></span></div></div><div class="cart-items">${state.cart
            .map((item, index) => {
              const product = getProduct(item.id);
              return `<article class="cart-item"><div class="cart-item-image">${productArt(product)}</div><div class="cart-item-info"><h3>${product.name}</h3><p>${item.size ? item.size + ' inch · ' : ''}${money(getPrice(product, item.size))} each</p><div class="cart-item-actions"><div class="quantity-control small-quantity"><button data-action="cart-quantity" data-index="${index}" data-change="-1" aria-label="Decrease ${escape(product.name)} quantity" ${item.qty === 1 ? 'disabled' : ''}>${icon('minus')}</button><span>${item.qty}</span><button data-action="cart-quantity" data-index="${index}" data-change="1" aria-label="Increase ${escape(product.name)} quantity">${icon('plus')}</button></div><button class="icon-button" data-action="remove-item" data-index="${index}" aria-label="Remove ${escape(product.name)}">${icon('trash')}</button></div></div><strong>${money(getPrice(product, item.size) * item.qty)}</strong></article>`;
            })
            .join(
              '',
            )}</div><div class="cart-summary"><div><span>Subtotal</span><strong>${money(subtotal())}</strong></div><p>Shipping and illustrative tax calculated at checkout.</p><button class="button checkout-button full-width" data-action="checkout">Let’s make it happen ${icon('arrow')}</button><button class="text-link continue-shopping" data-action="close-modal">Continue exploring</button><p class="checkout-note">${icon('lock')} Demo checkout · no payment will be taken</p></div>`
        : `<div class="empty-state">${icon('bag')}<h3>A project starts with one good tool.</h3><p>Your cart is empty. Let’s find something for your next project.</p><button class="button primary" data-action="category" data-id="all">Explore Arthur’s essentials ${icon('arrow')}</button></div>`
    }`,
    'cart-drawer',
    'Shopping cart',
  );
}

function watchDialog(id) {
  const product = getProduct(id);
  state.activeWatchId = id;
  if (state.watched.includes(id)) {
    openModal(
      `<div class="modal-emblem">${icon('bell')}</div><span class="eyebrow">ON YOUR RADAR</span><h2>You’re watching a good thing.</h2><p>${product.name} is in your saved deal list.</p><div class="form-note">This preview saves your interest locally. Automatic price monitoring and deal emails will become available when the shop’s notification service is connected.</div><button class="button primary full-width" data-action="close-modal">Keep exploring ${icon('arrow')}</button>`,
      'small-modal',
      'Saved deal watch',
    );
    return;
  }
  openModal(
    `<div class="modal-emblem">${icon('bell')}</div><span class="eyebrow">GOOD THINGS ARE WORTH WATCHING</span><h2>A little heads-up.<br>A better deal.</h2><p>Keep an eye on the <strong>${product.name}</strong>. Arthur’s good deals come around a few times a week.</p><form id="watch-form"><label>Email address<input type="email" name="email" autocomplete="email" placeholder="you@example.com" required maxlength="254" /></label><label class="checkbox-label"><input type="checkbox" name="consent" required /><span>I’d like deal alerts for this item. I can unsubscribe at any time.</span></label><p class="form-error" role="alert"></p><button class="button primary full-width" type="submit">${icon('bell')} Watch this item</button><p class="form-note">Preview: your watch is saved locally. No deal emails are sent.</p></form>`,
    'small-modal',
    'Watch this item for a deal',
  );
}

function quoteDialog() {
  openModal(
    `<div class="quote-modal-intro"><span class="eyebrow">YOUR PROJECT. OUR HELPING HANDS.</span><h2>Let’s make something<br>good happen.</h2><p>Tell Arthur a little about your project. We’ll take it from there.</p></div><form id="quote-form"><div class="form-row"><label>Your name<input name="name" autocomplete="name" required maxlength="100" placeholder="First and last name" /></label><label>Email address<input name="email" type="email" autocomplete="email" required maxlength="254" placeholder="you@example.com" /></label></div><div class="form-row"><label>What are you working on?<select name="project">${categories.map((category) => `<option>${category.name}</option>`).join('')}<option>Something else</option></select></label><label>Project ZIP code<input name="zip" inputmode="numeric" pattern="[0-9]{5}" maxlength="5" placeholder="5-digit ZIP" required /></label></div><label>A few project details<textarea name="description" rows="4" minlength="10" maxlength="2000" placeholder="A room that needs a refresh? Trim that’s seen better days? Tell us what you have in mind." required></textarea></label><p class="form-error" role="alert"></p><button class="button primary full-width" type="submit">Ask Arthur for a free quote ${icon('arrow')}</button><p class="form-note">No obligation. In this preview, requests are saved locally and are not sent to Arthur.</p></form>`,
    'quote-modal',
    'Ask Arthur for a free quote',
  );
}

function accountDialog() {
  openModal(
    `<span class="eyebrow">A PLACE FOR YOUR NEXT PROJECT</span><h2>Your workshop.</h2><p class="muted">Your saved items and demo orders, on this browser.</p><h3 class="workshop-heading">Watching for a deal <span>${state.watched.length}</span></h3>${
      state.watched.length
        ? state.watched
            .filter((id) => getProduct(id))
            .map(
              (id) =>
                `<button class="saved-item" data-action="product" data-id="${id}"><span>${getProduct(id).name}</span>${icon('arrow')}</button>`,
            )
            .join('')
        : '<p class="empty-line">Tap the bell on a product to save it here.</p>'
    }<h3 class="workshop-heading">Recent demo orders</h3>${
      state.orders.length
        ? state.orders
            .slice(-5)
            .reverse()
            .map(
              (order) =>
                `<div class="saved-item"><span>${escape(order.id)}<small>${new Date(order.createdAt).toLocaleDateString()}</small></span><strong>${money(order.total)}</strong></div>`,
            )
            .join('')
        : '<p class="empty-line">Your completed demo orders will appear here.</p>'
    }<div class="form-note">This is a local workshop preview. A secure customer account service is needed to sync across devices.</div>`,
    'small-modal',
    'Your workshop',
  );
}

function localTotals() {
  const sub = subtotal();
  const shipping = state.checkout.delivery === 'pickup' || sub >= 7500 ? 0 : 695;
  const tax = Math.round(sub * 0.06);
  return { subtotal: sub, shipping, tax, total: sub + shipping + tax };
}
function orderSummary() {
  const totals = localTotals();
  return `<aside class="order-summary"><span class="eyebrow">YOUR NEXT PROJECT STARTS HERE</span><h3>In your toolbox</h3>${state.cart
    .map((item) => {
      const product = getProduct(item.id);
      return `<div class="order-line"><div class="order-image">${productArt(product)}<span>${item.qty}</span></div><div><strong>${product.shortName}</strong><small>${item.size ? item.size + ' inch' : 'Arthur’s essentials'}</small></div><span>${money(getPrice(product, item.size) * item.qty)}</span></div>`;
    })
    .join(
      '',
    )}<div class="totals"><div><span>Subtotal</span><strong>${money(totals.subtotal)}</strong></div><div><span>${state.checkout.delivery === 'pickup' ? 'Local pickup' : 'Standard shipping'}</span><strong>${totals.shipping ? money(totals.shipping) : 'Free'}</strong></div><div><span>Illustrative tax (6%)</span><strong>${money(totals.tax)}</strong></div><div class="total-final"><span>Demo total <small>USD</small></span><strong>${money(totals.total)}</strong></div></div><p class="checkout-note">${icon('lock')} Preview order. No charge. No shipment.</p></aside>`;
}
function field(label, name, value, attributes = '') {
  return `<label>${label}<input name="${name}" value="${escape(value || '')}" ${attributes} /></label>`;
}
function checkoutDialog() {
  if (!state.cart.length) return cartDialog();
  const { step, customer, delivery, payment } = state.checkout;
  let content;
  if (step === 1)
    content = `<h3>Where’s your next project?</h3>${state.journey.active ? '<button class="sample-details-button" data-action="sample-details">Use fictional sample details</button>' : ''}<form id="checkout-details"><div class="form-row">${field('Full name', 'name', customer.name, 'autocomplete="name" required maxlength="100"')}${field('Email for your confirmation', 'email', customer.email, 'type="email" autocomplete="email" required maxlength="254"')}</div><fieldset class="delivery-options"><legend>How would you like your order?</legend><label class="selection-card ${delivery === 'shipping' ? 'selected' : ''}"><input type="radio" name="delivery" value="shipping" ${delivery === 'shipping' ? 'checked' : ''} />${icon('truck')}<span><strong>Ship to my door</strong><small>Standard · 3–5 business days</small></span></label><label class="selection-card ${delivery === 'pickup' ? 'selected' : ''}"><input type="radio" name="delivery" value="pickup" ${delivery === 'pickup' ? 'checked' : ''} />${icon('home')}<span><strong>Local pickup</strong><small>Free · demo pickup option</small></span></label></fieldset>${delivery === 'shipping' ? `<div class="shipping-fields">${field('Street address', 'street', customer.street, 'autocomplete="street-address" required maxlength="200"')}<div class="form-row">${field('City', 'city', customer.city, 'autocomplete="address-level2" required maxlength="100"')}${field('State', 'state', customer.state, 'autocomplete="address-level1" placeholder="NY" pattern="[A-Za-z]{2}" maxlength="2" required')}</div>${field('ZIP code', 'zip', customer.zip, 'autocomplete="postal-code" inputmode="numeric" pattern="[0-9]{5}(-[0-9]{4})?" maxlength="10" required')}<p class="small muted">United States · Sample domestic delivery service</p></div>` : '<div class="form-note">Pickup is a sample option. Store location and collection instructions will be supplied by the merchant before launch.</div>'}<button class="button primary full-width" type="submit">Continue to payment ${icon('arrow')}</button></form>`;
  else if (step === 2)
    content = `<h3>Choose how you’d like to pay.</h3><p class="muted">Try the checkout with a sample payment method.</p><form id="checkout-payment"><fieldset class="payment-options"><legend class="sr-only">Payment method</legend>${[['card', 'card', 'Credit or debit card', 'Demo Visa ending in 4242'], ['paypal', 'lock', 'PayPal', 'Simulated wallet selection'], ...(delivery === 'pickup' ? [['pickup', 'home', 'Pay at pickup', 'Settle up when you collect']] : [])].map(([id, name, title, text]) => `<label class="selection-card ${payment === id ? 'selected' : ''}"><input type="radio" name="payment" value="${id}" ${payment === id ? 'checked' : ''} required />${icon(name)}<span><strong>${title}</strong><small>${text}</small></span>${id === 'card' ? '<span class="visa-mark">VISA</span>' : ''}</label>`).join('')}</fieldset><div class="form-note">${icon('shield')} This is a demo. No real card details are needed, no wallet is connected, and no payment will be taken.</div><div class="checkout-buttons"><button type="button" class="text-link" data-action="checkout-back">${icon('back')} Delivery</button><button class="button primary" type="submit">Review your order ${icon('arrow')}</button></div></form>`;
  else
    content = `<h3>One last look. Then you’re all set.</h3><div class="review-block"><div><h4>Contact & ${delivery === 'shipping' ? 'delivery' : 'pickup'}</h4><button class="text-link" data-action="checkout-edit" data-step="1">Edit</button></div><p>${escape(customer.name)}<br>${escape(customer.email)}${delivery === 'shipping' ? `<br>${escape(customer.street)}<br>${escape(customer.city)}, ${escape(customer.state.toUpperCase())} ${escape(customer.zip)}` : '<br>Free local pickup (demo)'}</p></div><div class="review-block"><div><h4>Payment selection</h4><button class="text-link" data-action="checkout-edit" data-step="2">Edit</button></div><p>${payment === 'card' ? 'Demo Visa ···· 4242' : payment === 'paypal' ? 'PayPal (demo)' : 'Pay at pickup (demo)'}</p></div><form id="place-order"><label class="checkbox-label"><input name="acknowledge" type="checkbox" required /><span>I understand this is a demonstration order. No payment will be taken and no goods will ship.</span></label><p class="form-error" role="alert"></p><button class="button primary full-width" type="submit">Place demo order · ${money(localTotals().total)} ${icon('arrow')}</button><p class="checkout-note">Your order confirmation email will be prepared behind the scenes.</p></form>`;
  openModal(
    `<div class="checkout-header">${logo()}<span>${icon('lock')} A little closer to a job well done.</span></div><div class="checkout-steps">${['Contact & delivery', 'Payment', 'Review'].map((label, index) => `<span class="${step === index + 1 ? 'active' : step > index + 1 ? 'complete' : ''}"><b>${step > index + 1 ? icon('check') : index + 1}</b>${label}</span>`).join('')}</div><div class="checkout-layout"><div class="checkout-form-area">${content}</div>${orderSummary()}</div>`,
    'checkout-modal',
    `Checkout: ${['Contact and delivery', 'Payment', 'Review order'][step - 1]}`,
  );
}

function confirmationDialog() {
  const order = state.order;
  openModal(
    `<div class="success-icon">${icon('check')}</div><span class="eyebrow">HERE’S TO YOUR NEXT GOOD PROJECT</span><h2>Good things are<br>on the horizon.</h2><p>Your demo order <strong>${escape(order.id)}</strong> is confirmed.</p><div class="confirmation-summary"><div><span>Demo total</span><strong>${money(order.total)}</strong></div><div><span>Payment taken</span><strong>$0.00</strong></div><div><span>Delivery selection</span><strong>${order.delivery === 'pickup' ? 'Local pickup' : 'Standard shipping'}</strong></div></div><div class="email-status">${icon('mail')}<div><strong>${order.emailStatus === 'sent' ? 'Confirmation email sent' : order.emailStatus === 'failed' ? 'Order saved. Email delivery needs attention.' : 'Your confirmation email is ready'}</strong><p>${order.emailStatus === 'sent' ? `Sent to ${escape(order.customer.email)}.` : order.emailStatus === 'failed' ? 'The email service did not complete delivery. Your order is saved and you can view its email below.' : 'Prepared in the local demo outbox. No email was sent.'}</p></div></div><div class="confirmation-actions"><button class="button primary full-width" data-action="preview-email">${icon('mail')} View confirmation email</button><button class="button outline full-width" data-action="download-receipt">${icon('download')} Download receipt</button><button class="text-link" data-action="close-modal">Back to your next project ${icon('arrow')}</button></div>`,
    'confirmation-modal',
    'Order confirmed',
  );
}

async function api(path, body, headers = {}) {
  const response = await fetch(path, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', ...headers },
    body: JSON.stringify(body),
  });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Something went wrong. Please try again.');
  return data;
}

// LIVE SHARE INTENTS: opening a share composer never posts automatically.
// FUTURE: provide the public canonical product URL and social metadata when
// deploying; localhost links cannot be viewed by another visitor’s device.
async function share(platform, content) {
  const url = new URL(location.href);
  if (content) url.searchParams.set('tab', content);
  const title = `${current().name} — a good find from Arthur’s`;
  if (platform === 'copy') {
    try {
      await navigator.clipboard.writeText(url.href);
      toast(
        content
          ? 'Guide link copied. Pass the know-how on.'
          : 'Product link copied. Good finds are better shared.',
      );
    } catch {
      openModal(
        `<h2>Pass a good thing on.</h2><p>Copy this link to share it.</p><input class="copy-fallback" readonly value="${escape(url.href)}" aria-label="Share link" />`,
        'small-modal',
        'Copy share link',
      );
      $('.copy-fallback').select();
    }
  } else if (platform === 'email')
    location.href = `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(`Thought you might like this:\n${url.href}`)}`;
  else if (platform === 'facebook')
    window.open(
      `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url.href)}`,
      '_blank',
      'noopener,noreferrer',
    );
  else if (platform === 'pinterest')
    window.open(
      `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url.href)}&media=${encodeURIComponent(new URL('./assets/arthurs-brush.png', location.origin).href)}&description=${encodeURIComponent(title)}`,
      '_blank',
      'noopener,noreferrer',
    );
}

function selectTab(tab, scroll = true) {
  state.tab = tab;
  const url = new URL(location.href);
  url.searchParams.set('tab', tab);
  history.replaceState({}, '', url);
  const panel = $('#detail-panel');
  if (panel) {
    panel.innerHTML = detailContent(current());
    panel.setAttribute('aria-labelledby', `tab-${tab}`);
    $$('.tab').forEach((node) => {
      const selected = node.dataset.tab === tab;
      node.classList.toggle('active', selected);
      node.setAttribute('aria-selected', selected);
      node.tabIndex = selected ? 0 : -1;
    });
    if (scroll) $('#product-details').scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
}

document.addEventListener('click', async (event) => {
  const button = event.target.closest('[data-action]');
  if (!event.target.closest('.search-form')) $('#search-results')?.setAttribute('hidden', '');
  if (!event.target.closest('.nav-shell') && state.menu) {
    $('#mega-menu').hidden = true;
    state.menu = null;
    $('[data-action="menu"]')?.setAttribute('aria-expanded', 'false');
  }
  if (!button) return;
  event.preventDefault();
  const { action, id, index, change, tab, platform, content, step } = button.dataset;
  if (action === 'review-provider') selectReviewProvider(id);
  else if (action === 'review-page') {
    state.reviewPage = Math.max(0, state.reviewPage + Number(change));
    renderBusinessReviews();
    $(`[data-action="review-page"][data-change="${change}"]:not(:disabled)`)?.focus({
      preventScroll: true,
    });
  } else if (action === 'review-expand') {
    state.expandedReviews = state.expandedReviews.includes(id)
      ? state.expandedReviews.filter((item) => item !== id)
      : [...state.expandedReviews, id];
    renderBusinessReviews();
    $(`[data-action="review-expand"][data-id="${id}"]`)?.focus({ preventScroll: true });
  } else if (action === 'review-about')
    openModal(
      '<span class="eyebrow">A CLEAR PICTURE</span><h2>About these reviews.</h2><p>These are mock reviews created to demonstrate this widget. The names, quotes, ratings, dates and source assignments are fictional. They have not been fetched from Google, Trustpilot, Angi or Thumbtack.</p><p>The panel shows business and service feedback. Each product’s reviews are separate. Real review integrations will keep the platform and reviewer attribution visible.</p><button class="button primary full-width" data-action="close-modal">Back to the reviews</button>',
      'small-modal',
      'About the demo business reviews',
    );
  else if (action === 'journey-overview')
    openModal(journeyOverview(), 'journey-overview-modal', 'The DIY shopping journey');
  else if (action === 'journey-start') {
    const product = state.route === 'product' ? current() : products[0];
    state.journey = { active: true, step: 0, completed: [], productId: product.id };
    saveJourney(state.journey);
    navigate(productUrl(product));
  } else if (action === 'journey-exit') endJourney();
  else if (action === 'journey-next') nextJourneyAction();
  else if (action === 'sample-details') {
    // Explicit opt-in convenience for the walkthrough; never overwrite typed
    // shopper data, and never submit the form or send anything automatically.
    const sample = {
      name: 'Alex DIY',
      email: 'alex@example.test',
      street: '123 Sample Street',
      city: 'New York',
      state: 'NY',
      zip: '10001',
    };
    Object.entries(sample).forEach(([name, value]) => {
      const field = $(`#checkout-details [name="${name}"]`);
      if (field && !field.value) field.value = value;
    });
    toast('Empty fields filled with fictional sample details.');
  } else if (action === 'home') navigate('/');
  else if (action === 'category') {
    updateJourney(1);
    navigate(`/?category=${id}`);
  } else if (action === 'group') {
    updateJourney(1);
    navigate(`/?category=${button.dataset.category || state.category}&group=${id}`);
  } else if (action === 'product') {
    if (state.route === 'category') updateJourney(2, [1]);
    else if (state.journey.active && id !== state.journey.productId) updateJourney(2);
    navigate(productUrl(getProduct(id)));
  } else if (action === 'guides') navigate('/?guides=1');
  else if (action === 'guide-tab') {
    navigate(`/?product=angled-brush&tab=${tab}`);
    requestAnimationFrame(() => $('#product-details').scrollIntoView({ behavior: 'smooth' }));
  } else if (action === 'menu' || action === 'mobile-menu') {
    state.menu = state.menu ? null : 'shop';
    $('#mega-menu').hidden = !state.menu;
    $('[data-action="menu"]').setAttribute('aria-expanded', !!state.menu);
  } else if (action === 'size') {
    state.size = button.dataset.size;
    const y = window.scrollY;
    render();
    window.scrollTo(0, y);
    $(`[data-action="size"][data-size="${state.size}"]`)?.focus({ preventScroll: true });
  } else if (action === 'gallery') {
    state.gallery = Number(index);
    const image = $('.hero-image');
    image.className = `hero-image gallery-${state.gallery}`;
    const img = $('.hero-art');
    img.src = state.gallery === 3 ? './assets/painting-essentials.png' : './assets/arthurs-brush.png';
    img.alt =
      state.gallery === 3
        ? 'Arthur’s painting toolkit: tape, roller, canvas and paint'
        : 'Arthur’s Pro Angled Paint Brush';
    $$('.thumbnail').forEach((node) => {
      const active = Number(node.dataset.index) === state.gallery;
      node.classList.toggle('selected', active);
      node.setAttribute('aria-pressed', active);
    });
  } else if (action === 'zoom')
    openModal(
      `<div class="zoom-image ${current().image !== 'brush' ? 'zoom-accessory' : ''}">${current().image === 'brush' && state.gallery === 3 ? '<img src="./assets/painting-essentials.png" alt="Complete painting toolkit" />' : productArt(current())}</div><p>${escape(current().name)} · Take a closer look</p>`,
      'zoom-modal',
      'Enlarged product photo',
    );
  else if (action === 'quantity') {
    state.qty = Math.max(1, Math.min(current().stock, state.qty + Number(change)));
    updateQuantity();
  } else if (action === 'add-current') {
    if (!addToCart(current().id, state.qty, state.size)) return;
    button.classList.add('added');
    const original = button.innerHTML;
    button.innerHTML = `${icon('check')} Added to your toolbox`;
    setTimeout(() => {
      if (button.isConnected) {
        button.innerHTML = original;
        button.classList.remove('added');
      }
    }, 1600);
  } else if (action === 'quick-add') addToCart(id);
  else if (action === 'cart') cartDialog();
  else if (action === 'remove-item') {
    state.cart.splice(Number(index), 1);
    saveCart();
    cartDialog();
  } else if (action === 'cart-quantity') {
    const item = state.cart[Number(index)];
    if (Number(change) > 0) {
      const totalQty = state.cart
        .filter((line) => line.id === item.id)
        .reduce((sum, line) => sum + line.qty, 0);
      if (totalQty >= getProduct(item.id).stock)
        return toast('You’ve reached the available quantity.');
    }
    item.qty = Math.max(1, item.qty + Number(change));
    saveCart();
    cartDialog();
  } else if (action === 'watch') watchDialog(id);
  else if (action === 'quote') quoteDialog();
  else if (action === 'account') accountDialog();
  else if (action === 'close-modal') closeModal();
  else if (action === 'tab') selectTab(tab);
  else if (action === 'share') await share(platform, content);
  else if (action === 'checkout' || action === 'product-checkout') {
    if (!state.cart.length) {
      toast('Add an item to your cart before checkout.');
      $('[data-action="add-current"]')?.focus();
      return;
    }
    // The PDP shortcut starts the same checkout without adding another item.
    // Only mark the cart-review step complete when continuing from that dialog.
    updateJourney(4, action === 'checkout' ? [3] : []);
    state.checkout.step = 1;
    state.checkout.key = crypto.randomUUID();
    checkoutDialog();
  } else if (action === 'checkout-back' || action === 'checkout-edit') {
    state.checkout.step = step ? Number(step) : Math.max(1, state.checkout.step - 1);
    checkoutDialog();
  } else if (action === 'preview-email')
    openModal(
      `<span class="eyebrow">THE CONFIRMATION, BEHIND THE SCENES</span><h2>A note from Arthur’s.</h2><p class="small muted">To: ${escape(state.order.customer.email)} · ${state.order.emailStatus === 'sent' ? 'Sent' : 'Local preview'}</p><pre class="email-preview">${escape(state.order.receipt)}</pre><button class="button primary full-width" data-action="back-confirmation">Back to confirmation ${icon('arrow')}</button>`,
      'email-modal',
      'Order confirmation email preview',
    );
  else if (action === 'back-confirmation') confirmationDialog();
  else if (action === 'download-receipt') {
    const blob = new Blob([state.order.receipt], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${state.order.id}-receipt.txt`;
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    toast('Your receipt is ready.');
  } else if (action === 'project-guide') {
    const project = projects[Number(index)];
    openModal(
      `<span class="eyebrow">${project.type}</span><h2>${project.title}</h2><div class="guide-meta">${icon('clock')} ${project.time} <span>·</span> ${project.level}</div><p>${project.description}</p><h3 class="workshop-heading">A few things you’ll need</h3>${project.items.map((itemId) => `<div class="saved-item"><button class="text-link" data-action="product" data-id="${itemId}">${getProduct(itemId).name}</button><button class="quick-add" data-action="quick-add" data-id="${itemId}" aria-label="Add ${escape(getProduct(itemId).name)} to cart">${icon('plus')}</button></div>`).join('')}<p class="form-note">An angled brush also works for edges, small details, and touch-ups on these projects. Match your paint to the surface and check local requirements before starting.</p><button class="button primary full-width" data-action="guide-tab" data-tab="instructions">Read the painting steps ${icon('arrow')}</button><button class="text-link modal-bottom-link" data-action="quote">Rather leave it to Arthur? Get a quote.</button><button class="text-link modal-bottom-link" data-action="share" data-platform="copy" data-content="instructions">${icon('share')} Share the supporting guide</button>`,
      'small-modal',
      project.title,
    );
  } else if (action === 'shipping')
    openModal(
      `<div class="modal-emblem">${icon('truck')}</div><span class="eyebrow">THE PRACTICAL DETAILS</span><h2>From our toolbox<br>to your doorstep.</h2><dl class="spec-table"><div><dt>Standard shipping</dt><dd>$6.95 · US delivery</dd></div><div><dt>Orders $75+</dt><dd>Free standard shipping</dd></div><div><dt>Dispatch</dt><dd>1–2 business days</dd></div><div><dt>Delivery estimate</dt><dd>3–5 business days</dd></div><div><dt>Local pickup</dt><dd>Free</dd></div><div><dt>Returns</dt><dd>Within 30 days, unused</dd></div></dl><p class="form-note">These are sample store policies. This prototype does not fulfill orders. The merchant must confirm shipping coverage, pickup location, and complete return terms before launch.</p><button class="button primary full-width" data-action="close-modal">Back to the good stuff ${icon('arrow')}</button>`,
      'small-modal',
      'Shipping and returns',
    );
  else if (action === 'privacy')
    openModal(
      `<span class="eyebrow">YOUR DATA, EXPLAINED</span><h2>A little clarity.</h2><p>This local preview keeps your cart, watched product IDs, and demo order references in this browser. Quote requests, watch and newsletter emails, demo order contact details, and confirmation email files are stored on the local development server.</p><p>No analytics, real payment processing, or advertising trackers are included. Email delivery is off unless the developer configures a server-side email service.</p><p class="form-note">Before a public launch, the merchant must add a complete privacy policy, account security, consent management, data retention rules, and deletion tools.</p><button class="button primary full-width" data-action="close-modal">Got it ${icon('check')}</button>`,
      'small-modal',
      'Privacy and local data',
    );
});

function updateQuantity() {
  $('#product-quantity').value = state.qty;
  $('[data-action="quantity"][data-change="-1"]').disabled = state.qty <= 1;
  $('[data-action="quantity"][data-change="1"]').disabled = state.qty >= current().stock;
  $('.add-cart').innerHTML =
    `${icon('bag')} Add to cart <span>— ${money(getPrice(current(), state.size) * state.qty)}</span>`;
}
document.addEventListener('change', (event) => {
  if (event.target.id === 'product-quantity') {
    state.qty = Math.max(1, Math.min(current().stock, Math.floor(Number(event.target.value)) || 1));
    updateQuantity();
  }
  if (event.target.id === 'catalog-sort') {
    state.sort = event.target.value;
    render();
  }
  if (event.target.name === 'delivery') {
    const data = new FormData($('#checkout-details'));
    state.checkout.customer = { ...state.checkout.customer, ...Object.fromEntries(data) };
    state.checkout.delivery = data.get('delivery');
    if (state.checkout.delivery === 'shipping' && state.checkout.payment === 'pickup')
      state.checkout.payment = 'card';
    checkoutDialog();
  }
  if (event.target.name === 'payment') {
    state.checkout.payment = event.target.value;
    $$('.payment-options .selection-card').forEach((node) =>
      node.classList.toggle('selected', $('input', node).checked),
    );
  }
});

document.addEventListener('input', (event) => {
  if (event.target.id !== 'site-search') return;
  const query = event.target.value.trim().toLowerCase();
  const results = $('#search-results');
  if (!query) {
    results.hidden = true;
    return;
  }
  const found = products.filter((product) =>
    `${product.name} ${product.description}`.toLowerCase().includes(query),
  );
  results.innerHTML = `<div class="search-label">A FEW GOOD FINDS</div>${found.length ? found.map((product) => `<a href="./?product=${product.id}" data-action="product" data-id="${product.id}"><span>${icon(product.image === 'brush' ? 'brush' : 'bag')}${product.name}</span><strong>${money(product.price)}</strong></a>`).join('') : '<p>No exact match. Try “paint”, “brush”, or “canvas”.</p>'}`;
  results.hidden = false;
});
document.addEventListener('keydown', (event) => {
  if (
    event.target.matches('.review-source-tabs [role="tab"]') &&
    ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
  ) {
    event.preventDefault();
    const tabs = $$('.review-source-tabs [role="tab"]');
    const index = tabs.indexOf(event.target);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectReviewProvider(tabs[next].dataset.id);
    return;
  }
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
    event.preventDefault();
    $('#site-search').focus();
  }
  if (event.key === 'Escape') {
    $('#search-results')?.setAttribute('hidden', '');
    if (state.menu) {
      state.menu = null;
      $('#mega-menu').hidden = true;
      $('[data-action="menu"]').setAttribute('aria-expanded', 'false');
    }
  }
  if (
    event.target.matches('.tabs [role="tab"]') &&
    ['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)
  ) {
    event.preventDefault();
    const tabs = $$('.tabs [role="tab"]');
    const index = tabs.indexOf(event.target);
    const next =
      event.key === 'Home'
        ? 0
        : event.key === 'End'
          ? tabs.length - 1
          : (index + (event.key === 'ArrowRight' ? 1 : -1) + tabs.length) % tabs.length;
    selectTab(tabs[next].dataset.tab, false);
    tabs[next].focus();
  }
});

document.addEventListener('submit', async (event) => {
  const form = event.target;
  event.preventDefault();
  const data = Object.fromEntries(new FormData(form));
  if (form.id === 'search-form') {
    navigate(`/?category=all&q=${encodeURIComponent(data.search.trim())}`);
    return;
  }
  if (form.id === 'checkout-details') {
    state.checkout.customer = data;
    state.checkout.delivery = data.delivery;
    state.checkout.step = 2;
    updateJourney(5, [4]);
    checkoutDialog();
    return;
  }
  if (form.id === 'checkout-payment') {
    state.checkout.payment = data.payment;
    state.checkout.step = 3;
    checkoutDialog();
    return;
  }
  const submit = $('[type="submit"]', form);
  if (!submit || submit.disabled) return;
  const original = submit.innerHTML;
  submit.disabled = true;
  submit.textContent = 'One moment…';
  const error = $('.form-error', form);
  if (error) error.textContent = '';
  try {
    // LIVE LOCAL NEWSLETTER: save only this explicit, consented request. Success
    // stays visible across client-side navigation; no email is stored in browser
    // storage. FUTURE: the server owns email-platform enrolment and double opt-in.
    if (form.id === 'newsletter-form') {
      await api('/api/newsletter', { email: data.email, consent: data.consent === 'on' });
      state.newsletterSaved = true;
      $('#newsletter-content').innerHTML = newsletterContent(true);
      $('#newsletter-status').focus({ preventScroll: true });
    }
    // LIVE LOCAL API: writes a subscription intent. FUTURE: a subscription DB,
    // double opt-in, signed unsubscribe links and a scheduled price-change worker.
    else if (form.id === 'watch-form') {
      await api('/api/watches', {
        productId: state.activeWatchId,
        email: data.email,
        consent: data.consent === 'on',
      });
      state.watched.push(state.activeWatchId);
      writeLocal('arthurs-watches-v1', state.watched);
      const y = window.scrollY;
      render();
      window.scrollTo(0, y);
      openModal(
        `<div class="success-icon">${icon('check')}</div><span class="eyebrow">SAVED TO YOUR WORKSHOP</span><h2>A good deal is<br>on your radar.</h2><p>You’re watching ${getProduct(state.activeWatchId).name}.</p><p class="form-note">Your watch was saved locally. Automatic deal emails aren’t connected in this preview.</p><button class="button primary full-width" data-action="close-modal">Keep exploring ${icon('arrow')}</button>`,
        'small-modal',
        'Item watch saved',
      );
    }
    // LIVE LOCAL API: saves quote details. FUTURE: CRM routing, service-area
    // eligibility, appointment availability and a transactional acknowledgement.
    else if (form.id === 'quote-form') {
      await api('/api/quotes', data);
      openModal(
        `<div class="success-icon">${icon('check')}</div><span class="eyebrow">A GOOD START</span><h2>Your project is<br>taking shape.</h2><p>Thanks, ${escape(data.name.split(' ')[0])}. Your ${escape(data.project.toLowerCase())} request is saved.</p><p class="form-note">This preview stored the request locally. Arthur has not been contacted and no appointment has been booked.</p><button class="button primary full-width" data-action="close-modal">Back to exploring ${icon('arrow')}</button>`,
        'small-modal',
        'Quote request saved',
      );
    }
    // LIVE LOCAL CHECKOUT: server validates items, quantities, prices and
    // delivery. Idempotency key survives retry after an ambiguous response.
    // FUTURE PAYMENT: replace payment selection with hosted fields/redirect;
    // confirm orders ONLY after server-verified payment webhooks, never a client
    // success flag. The server presently records paymentStatus: demo-no-charge.
    else if (form.id === 'place-order') {
      const order = await api(
        '/api/orders',
        {
          items: state.cart,
          customer: state.checkout.customer,
          delivery: state.checkout.delivery,
          payment: state.checkout.payment,
        },
        { 'Idempotency-Key': state.checkout.key },
      );
      state.order = order;
      state.orders.push({ id: order.id, total: order.total, createdAt: order.createdAt });
      writeLocal('arthurs-orders-v1', state.orders);
      state.cart = [];
      saveCart();
      confirmationDialog();
    }
  } catch (err) {
    if (error) error.textContent = err.message || 'Couldn’t save that just yet. Please try again.';
    submit.disabled = false;
    submit.innerHTML = original;
  }
});

routeFromUrl();
render();
