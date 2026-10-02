import { icon } from './icons.js';

/** OPTIONAL PROTOTYPE WALKTHROUGH — LIVE, FRONTEND ONLY.
 * The starting screen is ALWAYS the Product Detail page. The path explains
 * actual working UI rather than replacing shopping with screenshots.
 * Completion is reported by app.js only after the corresponding real action.
 * Nothing here adds products, submits forms, charges a payment, or sends email.
 * Only non-personal progress is stored in sessionStorage. Refreshing during
 * checkout returns the visitor to their cart; contact details are not persisted.
 * FUTURE: a production onboarding flow can reuse these presentation helpers;
 * event analytics are intentionally absent from this prototype.
 */
export const journeySteps = [
  {
    label: 'Product detail',
    icon: 'brush',
    description:
      'Start here. Read the details, choose a size and quantity, and add your first item.',
  },
  {
    label: 'Categories',
    icon: 'home',
    description:
      'Follow the breadcrumb to a project category. Filter product types and return to a product.',
  },
  {
    label: 'Related items',
    icon: 'plus',
    description: 'Explore a matching supply, choose its quantity, and add it to the same cart.',
  },
  {
    label: 'Cart',
    icon: 'bag',
    description: 'Review your items and quantities, then begin checkout.',
  },
  {
    label: 'Delivery',
    icon: 'truck',
    description: 'Enter contact details and choose shipping or local pickup.',
  },
  {
    label: 'Payment & review',
    icon: 'card',
    description: 'Select a sample payment method and review the order before confirming.',
  },
  {
    label: 'Confirmation',
    icon: 'check',
    description: 'See the confirmed demo order, total, and delivery selection.',
  },
  {
    label: 'Email receipt',
    icon: 'mail',
    description: 'Open the confirmation email prepared by the server behind the scenes.',
  },
];

export function initialJourney() {
  const empty = { active: false, step: 0, completed: [], productId: 'angled-brush' };
  try {
    const saved = JSON.parse(sessionStorage.getItem('arthurs-journey-v1'));
    if (!saved || saved.active !== true) return empty;
    return {
      active: true,
      step: Number.isInteger(saved.step) ? Math.max(0, Math.min(3, saved.step)) : 0,
      completed: Array.isArray(saved.completed)
        ? saved.completed.filter((step) => Number.isInteger(step) && step >= 0 && step < 3)
        : [],
      productId: typeof saved.productId === 'string' ? saved.productId : 'angled-brush',
    };
  } catch {
    return empty;
  }
}

export function saveJourney(journey) {
  try {
    sessionStorage.setItem('arthurs-journey-v1', JSON.stringify(journey));
  } catch {
    /* The walkthrough still works when browser storage is unavailable. */
  }
}

export function journeyTrail(journey, interactive = false) {
  return `<ol class="journey-trail" aria-label="Shopping navigation path">${journeySteps
    .map((step, index) => {
      const completed = journey.completed.includes(index);
      return `<li class="${index === journey.step ? 'current' : ''} ${completed ? 'completed' : ''}" ${index === journey.step ? 'aria-current="step"' : ''}><${interactive ? 'button' : 'span'} ${interactive ? `data-action="journey-step" data-step="${index}"` : ''}><b>${completed ? icon('check') : index + 1}</b><span>${step.label}</span></${interactive ? 'button' : 'span'}>${index < journeySteps.length - 1 ? icon('right') : ''}</li>`;
    })
    .join('')}</ol>`;
}

export function journeyOverview() {
  return `<span class="eyebrow">THE DIY SHOPPING JOURNEY</span><h2>From this product<br>to your next project.</h2><p>Follow a real shopping path, starting right here on the Product Detail page. You’re in control of each step.</p><ol class="journey-overview-list">${journeySteps.map((step, index) => `<li><span class="journey-overview-icon">${icon(step.icon)}</span><div><h3><span>${index + 1}.</span> ${step.label}</h3><p>${step.description}</p></div></li>`).join('')}</ol><div class="journey-sample"><strong>A simple example</strong><span>2 × 2½″ brushes + 1 × painter’s tape</span><small>Try different quantities and see the totals update.</small></div><button class="button primary full-width" data-action="journey-start">Start on the Product Detail page ${icon('arrow')}</button><p class="journey-disclosure">Demo payments only. The server creates an email preview; actual email delivery requires the configured email service.</p>`;
}
