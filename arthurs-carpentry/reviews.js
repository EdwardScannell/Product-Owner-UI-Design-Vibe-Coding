import { icon } from './icons.js';

/** CATEGORY-LEVEL BUSINESS REVIEWS — USER-REQUESTED MOCK DATA.
 * LIVE: provider filtering, average/count calculation, pagination, expansion
 * and keyboard-accessible tabs. All reviews below are invented design fixtures.
 * They were NOT retrieved from Trustpilot, Google, Angi or Thumbtack. Never label
 * these records as verified, use them in rating structured data, or publish them
 * as genuine endorsements. A persistent on-screen demo label is intentional.
 *
 * FUTURE INTEGRATION: configure verified business IDs/profile URLs, then use
 * each provider's approved widget/API. Trustpilot: official TrustBox. Google:
 * preserve Google Maps and author attribution and source links under Places
 * policies. Angi/Thumbtack: approved profile/widget integration from the merchant
 * account. Never scrape providers or silently blend live reviews with fixtures.
 * These are BUSINESS/SERVICE reviews, separate from each product's review data.
 */
export const reviewProviders = [
  { id: 'all', name: 'All reviews', mark: '' },
  { id: 'google', name: 'Google', mark: 'G' },
  { id: 'trustpilot', name: 'Trustpilot', mark: '★' },
  { id: 'angi', name: 'Angi', mark: 'a' },
  { id: 'thumbtack', name: 'Thumbtack', mark: 't' },
];

export const businessReviews = [
  {
    id: 'demo-g1',
    provider: 'google',
    name: 'Jamie R.',
    initials: 'JR',
    rating: 5,
    project: 'Interior painting',
    age: '2 weeks ago',
    title: 'Our hallway feels like home again.',
    text: 'Arthur helped us choose a finish, explained the preparation, and left everything tidy. The trim looks lovely, and we knew what to expect at every step.',
    extra:
      ' The estimate was easy to understand and the work was completed in the time we had discussed. We would be happy to ask for help on our next project.',
  },
  {
    id: 'demo-t1',
    provider: 'trustpilot',
    name: 'Morgan T.',
    initials: 'MT',
    rating: 5,
    project: 'DIY supplies',
    age: '3 weeks ago',
    title: 'The right tools, without the guesswork.',
    text: 'I came for a brush and found the tape and drop cloth I needed too. The care notes gave me the confidence to tackle my first furniture refresh.',
    extra:
      ' Being able to compare the sizes and add the little extras to one cart made planning the weekend much easier.',
  },
  {
    id: 'demo-a1',
    provider: 'angi',
    name: 'Taylor W.',
    initials: 'TW',
    rating: 5,
    project: 'Decorative trim',
    age: '1 month ago',
    title: 'Thoughtful work. A beautiful finish.',
    text: 'The new trim makes such a difference. Arthur talked through the options, listened to the details that mattered to us, and did a careful job.',
    extra:
      ' We appreciated the clear communication and the attention given to protecting the surrounding room during the work.',
  },
  {
    id: 'demo-th1',
    provider: 'thumbtack',
    name: 'Casey L.',
    initials: 'CL',
    rating: 4,
    project: 'Shelving & storage',
    age: '1 month ago',
    title: 'A useful little upgrade to our home.',
    text: 'Our new storage looks great and makes the room easier to use. Scheduling took a little longer than expected, but Arthur kept us updated.',
    extra:
      ' Once the date was set, everything went smoothly. We especially liked being able to discuss the finish before the work began.',
  },
  {
    id: 'demo-g2',
    provider: 'google',
    name: 'Leslie P.',
    initials: 'LP',
    rating: 5,
    project: 'Home repairs',
    age: '5 weeks ago',
    title: 'The small fixes were worth doing.',
    text: 'We had a list of small cosmetic repairs and weren’t sure where to begin. Arthur helped us prioritize and explained which parts we could do ourselves.',
    extra:
      ' It was helpful to have a practical plan and a clear list of supplies. The house feels much more looked after.',
  },
  {
    id: 'demo-t2',
    provider: 'trustpilot',
    name: 'Alex D.',
    initials: 'AD',
    rating: 4,
    project: 'Painting supplies',
    age: '6 weeks ago',
    title: 'Good supplies for a weekend project.',
    text: 'The brush was comfortable and the ordering process was straightforward. I would have liked a few more paint colors, but the essentials did the job.',
    extra:
      ' The instructions helped me get a cleaner edge around the door frame. I am keeping the brush for the next room.',
  },
  {
    id: 'demo-a2',
    provider: 'angi',
    name: 'Jordan S.',
    initials: 'JS',
    rating: 5,
    project: 'Outdoor touch-ups',
    age: '2 months ago',
    title: 'Our outdoor space has a fresh start.',
    text: 'Arthur was thoughtful about the weather and the finish for our outdoor furniture. The work was neat, and the pieces look ready for another season.',
    extra:
      ' We also received clear advice about caring for the finish and when it would be ready to use.',
  },
  {
    id: 'demo-th2',
    provider: 'thumbtack',
    name: 'Sam K.',
    initials: 'SK',
    rating: 5,
    project: 'Room refresh',
    age: '2 months ago',
    title: 'Clear advice from start to finish.',
    text: 'The quote explained the work clearly. Arthur answered our questions, protected the floors, and gave the room the fresh feeling we had hoped for.',
    extra:
      ' We appreciated the final walk-through and the practical touch-up advice. A positive experience all around.',
  },
];

export function reviewStars(rating) {
  const stars = Array.from({ length: 5 }, () => icon('star')).join('');
  return `<span class="business-stars" role="img" aria-label="${rating.toFixed(1)} out of 5 stars"><span>${stars}</span><span class="business-stars-fill" style="width:${(rating / 5) * 100}%">${stars}</span></span>`;
}

export function businessReviewsWidget(providerId = 'all', page = 0, expanded = []) {
  const provider = reviewProviders.find((source) => source.id === providerId) || reviewProviders[0];
  const reviews = businessReviews.filter(
    (review) => provider.id === 'all' || review.provider === provider.id,
  );
  const perPage = 3;
  const pageCount = Math.ceil(reviews.length / perPage);
  const currentPage = Math.max(0, Math.min(page, pageCount - 1));
  const visible = reviews.slice(currentPage * perPage, (currentPage + 1) * perPage);
  const average = reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length;
  return `<section class="business-reviews" aria-labelledby="business-reviews-title"><div class="business-reviews-heading"><div><span class="eyebrow">A LITTLE CONFIDENCE FOR YOUR NEXT PROJECT</span><h2 id="business-reviews-title">Good work. Good words.</h2><p>From choosing the right supplies to getting a helping hand.</p></div><span class="demo-review-label">${icon('info')} Demo reviews</span></div><div class="business-review-controls"><div class="business-review-score"><strong>${average.toFixed(1)}<small>/ 5</small></strong><div>${reviewStars(average)}<span>From ${reviews.length} mock ${provider.id === 'all' ? 'business' : provider.name} reviews</span></div></div><div class="review-source-tabs" role="tablist" aria-label="Business review source">${reviewProviders.map((source) => `<button id="review-source-${source.id}" role="tab" aria-selected="${provider.id === source.id}" aria-controls="business-reviews-panel" tabindex="${provider.id === source.id ? 0 : -1}" class="review-source ${provider.id === source.id ? 'selected' : ''}" data-action="review-provider" data-id="${source.id}">${source.mark ? `<span class="source-mark source-${source.id}" aria-hidden="true">${source.mark}</span>` : ''}${source.name}${source.id === 'angi' ? '<span class="sr-only"> (formerly Angie’s List)</span>' : ''}</button>`).join('')}</div></div><div id="business-reviews-panel" role="tabpanel" aria-labelledby="review-source-${provider.id}"><div class="business-review-grid">${visible
    .map((review) => {
      const source = reviewProviders.find((source) => source.id === review.provider);
      const isExpanded = expanded.includes(review.id);
      return `<article class="business-review-card"><div class="review-card-top">${reviewStars(review.rating)}<span>${review.age}<span class="sr-only"> (sample date)</span></span></div><span class="review-project-type">${review.project}</span><h3>${review.title}</h3><p>${review.text}${isExpanded ? review.extra : ''}</p><button class="review-expand" data-action="review-expand" data-id="${review.id}" aria-expanded="${isExpanded}">${isExpanded ? 'Show less' : 'Read full review'} ${icon(isExpanded ? 'minus' : 'plus')}</button><div class="business-review-author"><span class="review-avatar">${review.initials}</span><div><strong>${review.name}</strong><span>Mock reviewer</span></div><span class="review-source-caption">${source.name} sample</span></div></article>`;
    })
    .join(
      '',
    )}</div><div class="business-review-bottom"><p role="status" aria-live="polite">Showing ${currentPage * perPage + 1}–${Math.min((currentPage + 1) * perPage, reviews.length)} of ${reviews.length} demo reviews</p><div class="review-pagination"><button class="icon-button" data-action="review-page" data-change="-1" aria-label="Previous reviews" ${currentPage === 0 ? 'disabled' : ''}>${icon('back')}</button><button class="icon-button" data-action="review-page" data-change="1" aria-label="Next reviews" ${currentPage >= pageCount - 1 ? 'disabled' : ''}>${icon('arrow')}</button></div></div></div><div class="business-review-disclosure"><p>Illustrative business and service reviews, separate from product ratings. No reviews have been fetched from external platforms.</p><button class="text-link" data-action="review-about">About these reviews ${icon('info')}</button></div></section>`;
}
