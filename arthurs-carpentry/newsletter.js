import { icon } from './icons.js';

/** NEWSLETTER WIDGET
 * LIVE: Shared footer placement, a visible email label, unchecked required
 * consent, native input validation, retryable API errors and a focused success
 * state. app.js posts only after the visitor submits. No popup or auto-enrolment.
 * CONTENT: The newsletter's deals/tips promise is proposed marketing copy.
 * FUTURE: Connect /api/newsletter to the merchant's email platform, double
 * opt-in, consent versioning, unsubscribe/preferences and delivery reporting.
 * The current server only saves a local intent; it never sends newsletter mail.
 */
export function newsletterContent(saved = false) {
  if (saved)
    return `<div class="newsletter-success" id="newsletter-status" role="status" tabindex="-1"><span class="newsletter-check">${icon('check')}</span><div><h3>Your signup is saved.</h3><p>Thanks for stopping by Arthur’s workshop. This demo saved your request locally; no newsletter emails will be sent.</p></div></div>`;
  return `<form id="newsletter-form" aria-labelledby="newsletter-title">
    <label for="newsletter-email">Your email address</label>
    <div class="newsletter-fields"><input id="newsletter-email" name="email" type="email" autocomplete="email" inputmode="email" placeholder="you@example.com" maxlength="254" required aria-describedby="newsletter-note newsletter-error" /><button type="submit" class="button primary">Sign me up ${icon('arrow')}</button></div>
    <label class="checkbox-label newsletter-consent"><input name="consent" type="checkbox" required /><span>I’d like Arthur’s newsletter with deals and DIY tips.</span></label>
    <p id="newsletter-error" class="form-error" role="alert"></p>
    <p id="newsletter-note" class="newsletter-note">Demo signup · Saved locally. No emails are sent. <button type="button" class="newsletter-privacy" data-action="privacy">Privacy & your data</button></p>
  </form>`;
}

export function newsletterWidget(saved = false) {
  return `<section class="newsletter-section" aria-labelledby="newsletter-title"><div class="container newsletter-inner"><div class="newsletter-copy"><span class="eyebrow">A NOTE FROM ARTHUR’S WORKSHOP</span><h2 id="newsletter-title">Good deals.<br>Fresh ideas. <em>In your inbox.</em></h2><p>A little inspiration for your next project. Sign up for weekly finds, practical DIY tips, and deals worth a second look.</p></div><div id="newsletter-content">${newsletterContent(saved)}</div></div></section>`;
}
