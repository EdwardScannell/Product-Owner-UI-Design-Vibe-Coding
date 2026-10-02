/**
 * CONTENT / FUTURE CMS: This is a deliberately small, fictional sample catalog.
 * Product names, inventory, prices, reviews, shipping promises, and specifications
 * are demonstration content, not verified commercial offers. Replace this module
 * with a commerce/CMS adapter before launch and obtain supplier-approved specs.
 * The server imports the SAME catalog and computes totals itself; client-supplied
 * prices are never accepted. Money is always represented as integer USD cents.
 */
export const products = [
  {
    id: 'angled-brush',
    name: 'Pro Angled Paint Brush',
    shortName: 'Pro Angled Paint Brush',
    brand: 'ARTHUR’S ESSENTIALS',
    price: 1400,
    originalPrice: 1800,
    image: 'brush',
    category: 'painting',
    categories: ['painting', 'carpentry', 'outdoor', 'repairs'],
    stock: 24,
    rating: '4.9',
    reviews: 38,
    description:
      'Clean lines. Smooth coverage. A finish you’ll be proud of. Our go-to brush for the little details that make a big difference.',
    detail:
      'A dependable angled brush for cutting in around trim, tackling corners, and giving your next project a beautifully even finish. The comfortable wood handle feels right from the first stroke to the last.',
    sizes: [
      { label: '1½″', value: '1.5', price: 1000 },
      { label: '2″', value: '2', price: 1200 },
      { label: '2½″', value: '2.5', price: 1400 },
      { label: '3″', value: '3', price: 1700 },
    ],
    defaultSize: '2.5',
    specs: [
      ['Bristles', 'Nylon / polyester blend'],
      ['Brush shape', 'Angled sash'],
      ['Handle', 'Natural beechwood'],
      ['Ferrule', 'Stainless steel'],
      ['Works with', 'Water-based paints & primers'],
      ['Best for', 'Trim, doors, edges & furniture'],
      ['Use', 'Interior & exterior'],
      ['Care', 'Clean after use; reshape and hang dry'],
    ],
  },
  {
    id: 'painters-tape',
    name: 'Clean Edge Painter’s Tape',
    shortName: 'Clean Edge Painter’s Tape',
    brand: 'THE PREP ESSENTIALS',
    price: 650,
    originalPrice: 850,
    image: 'tape',
    category: 'painting',
    categories: ['painting', 'repairs'],
    stock: 45,
    rating: '4.8',
    reviews: 24,
    description:
      'A little prep. A much cleaner line. Protect edges and make your next paint project feel effortless.',
    detail:
      'Mask clean, dry surfaces before painting. Test on a hidden area first, and follow the coating and tape removal instructions for your surface.',
    specs: [
      ['Width', '1.41 in.'],
      ['Length', '60 yd.'],
      ['Material', 'Crepe paper'],
      ['Adhesive', 'Low tack'],
      ['Best for', 'Masking trim & painted walls'],
      ['Use', 'Test on an inconspicuous area first'],
    ],
  },
  {
    id: 'roller-kit',
    name: 'Smooth Finish Roller Kit',
    shortName: 'Smooth Finish Roller Kit',
    brand: 'ARTHUR’S ESSENTIALS',
    price: 1850,
    image: 'roller',
    category: 'painting',
    categories: ['painting', 'outdoor'],
    stock: 18,
    rating: '4.9',
    reviews: 19,
    description:
      'Cover more ground with a smooth, even finish. A comfortable roller for walls and your weekend to-do list.',
    detail:
      'A reusable roller frame with a soft sleeve for smooth to lightly textured surfaces. Pair with a tray and the right coating for your project.',
    specs: [
      ['Roller width', '9 in.'],
      ['Nap', '⅜ in.'],
      ['Handle', 'Natural wood'],
      ['Frame', 'Chrome-plated steel'],
      ['Works with', 'Water-based paints'],
      ['Care', 'Clean sleeve and frame after use'],
    ],
  },
  {
    id: 'canvas-cloth',
    name: 'Heavyweight Canvas Drop Cloth',
    shortName: 'Canvas Drop Cloth',
    brand: 'THE PREP ESSENTIALS',
    price: 2200,
    image: 'cloth',
    category: 'painting',
    categories: ['painting', 'carpentry', 'repairs'],
    stock: 31,
    rating: '4.8',
    reviews: 16,
    description:
      'Good work starts with good prep. A reusable canvas layer for catching everyday paint drips and dust.',
    detail:
      'Drape over floors or furniture before work. Canvas is absorbent but not waterproof; wipe up spills promptly and use a leakproof layer where needed.',
    specs: [
      ['Dimensions', '6 × 9 ft.'],
      ['Material', 'Cotton canvas'],
      ['Weight', '8 oz. fabric'],
      ['Reusable', 'Yes'],
      ['Waterproof', 'No'],
      ['Care', 'Shake outdoors; follow care label'],
    ],
  },
  {
    id: 'interior-paint',
    name: 'Everyday Interior Paint',
    shortName: 'Everyday Interior Paint',
    brand: 'ARTHUR’S COLOUR COLLECTION',
    price: 3200,
    image: 'paint',
    category: 'painting',
    categories: ['painting', 'carpentry', 'repairs'],
    stock: 14,
    rating: '4.9',
    reviews: 27,
    description:
      'Meet your next fresh start. A soft sage finish that makes a well-loved room feel like home all over again.',
    detail:
      'Sample water-based interior paint in Workshop Sage. Prepare your surface and use a compatible primer where needed. Confirm technical data with the supplier before a real project.',
    specs: [
      ['Colour', 'Workshop Sage'],
      ['Finish', 'Eggshell'],
      ['Volume', '1 quart'],
      ['Base', 'Water-based'],
      ['Use', 'Interior walls'],
      ['Recoat time', 'Follow the final manufacturer label'],
    ],
  },
];

/** IA: Task-based navigation keeps tools, supplies, learning, and professional
 * help together. These are common DIY scopes, NOT a legal no-license guarantee.
 * Structural, electrical, gas, plumbing, roof, and hazardous-material work are
 * deliberately outside this sample catalog; requirements vary by location. */
export const categories = [
  {
    id: 'painting',
    name: 'Painting & Decorating',
    icon: 'brush',
    subtitle: 'A fresh coat. A fresh perspective.',
    items: [
      'Interior walls & ceilings',
      'Doors, trim & cabinets',
      'Wallpaper & decorative finishes',
      'Surface prep & patching',
    ],
  },
  {
    id: 'carpentry',
    name: 'Carpentry & Woodwork',
    icon: 'hammer',
    subtitle: 'Make something worth keeping.',
    items: [
      'Furniture refinishing',
      'Shelves & simple storage',
      'Decorative trim & moulding',
      'Small wood repairs',
    ],
  },
  {
    id: 'outdoor',
    name: 'Outdoor & Garden',
    icon: 'leaf',
    subtitle: 'A little care, beyond the front door.',
    items: [
      'Fence & deck maintenance',
      'Outdoor furniture',
      'Planters & garden projects',
      'Exterior cleaning & touch-ups',
    ],
  },
  {
    id: 'repairs',
    name: 'Home Repairs',
    icon: 'home',
    subtitle: 'Little fixes. A happier home.',
    items: [
      'Drywall patches & caulking',
      'Door & cabinet hardware',
      'Weatherstripping',
      'Grout care & cosmetic repairs',
    ],
  },
];
/** LIVE IA: These sample product types back real filtered catalog routes.
 * Breadcrumbs use this mapping so “Brushes & rollers” never opens an unrelated
 * all-products page. FUTURE CMS: replace IDs with the merchant's taxonomy. */
export const productGroups = [
  { id: 'brushes-rollers', name: 'Brushes & rollers', productIds: ['angled-brush', 'roller-kit'] },
  {
    id: 'prep-protection',
    name: 'Prep & protection',
    productIds: ['painters-tape', 'canvas-cloth'],
  },
  { id: 'paint-finishes', name: 'Paint & finishes', productIds: ['interior-paint'] },
];
export const getProductGroup = (id) => productGroups.find((group) => group.productIds.includes(id));
export const getProduct = (id) => products.find((product) => product.id === id);
export const getPrice = (product, size) =>
  product.sizes ? product.sizes.find((option) => option.value === size)?.price : product.price;
export const money = (cents) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(cents / 100);
