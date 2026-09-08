// Verify the built HTML: Play links carry the right install referrer, and the
// GA4 click event reports the same app/campaign the link does.
//
// Run with: npm run verify  (after npm run build)
import fs from 'fs';

let fail = 0;
const say = (ok, msg) => { console.log((ok ? 'PASS ' : 'FAIL ') + msg); if (!ok) fail = 1; };

for (const [page, pkg] of [['player', 'io.github.wharfe.kiku'], ['studio', 'com.wharfe.kikustudio']]) {
  const html = fs.readFileSync(`dist/${page}/index.html`, 'utf8');
  const m = html.match(/<a class="play-badge"([^>]*)>/);
  if (!m) { say(false, `${page}: play-badge anchor not found`); continue; }
  const attrs = m[1];

  const href = attrs.match(/href="([^"]+)"/)?.[1]?.replace(/&#38;|&amp;/g, '&');
  const dataApp = attrs.match(/data-app="([^"]+)"/)?.[1];
  const dataCampaign = attrs.match(/data-campaign="([^"]+)"/)?.[1];

  const q = new URL(href).searchParams;
  const r = new URLSearchParams(q.get('referrer') || '');

  say(q.get('id') === pkg, `${page}: package id`);
  say(r.get('utm_source') === 'kiku-app.com', `${page}: utm_source`);
  say(r.get('utm_medium') === 'website', `${page}: utm_medium`);
  say(!!r.get('utm_campaign'), `${page}: utm_campaign present (${r.get('utm_campaign')})`);
  say(dataApp === page, `${page}: data-app matches page`);
  // the drift guard: the GA4 event and the Play referrer must name one campaign
  say(dataCampaign === r.get('utm_campaign'),
      `${page}: data-campaign === referrer utm_campaign (${dataCampaign} vs ${r.get('utm_campaign')})`);
}

// GA4: the snippet must be present exactly when a measurement ID is configured.
// Read the source rather than importing it — this file is plain Node, and a
// failed import would silently turn into a skipped check.
const src = fs.readFileSync('src/lib/analytics.ts', 'utf8');
const idMatch = src.match(/export const GA_MEASUREMENT_ID = '([^']*)'/);
if (!idMatch) {
  say(false, 'GA4: could not read GA_MEASUREMENT_ID from src/lib/analytics.ts');
} else {
  const id = idMatch[1];
  const home = fs.readFileSync('dist/index.html', 'utf8');
  const hasGtag = home.includes('googletagmanager.com/gtag/js');
  if (id === '') {
    say(!hasGtag, 'GA4: no measurement ID set, so no gtag snippet is emitted');
  } else {
    say(hasGtag && home.includes(id), `GA4: gtag snippet present with ${id}`);
    say(home.includes('click_play_badge'), 'GA4: click_play_badge listener present');
  }
}

process.exit(fail);
