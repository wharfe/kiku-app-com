// Play Store links for the two KIKU apps.
//
// Every link carries an install referrer so Play Console can separate installs
// that came from this site from organic store traffic. Play expects the whole
// UTM string as a single, URL-encoded value of the `referrer` parameter, so the
// `&` and `=` inside it have to be escaped a second time — building the URLs
// here keeps that escaping out of the templates.

const PACKAGE_NAMES = {
  player: 'io.github.wharfe.kiku',
  studio: 'com.wharfe.kikustudio',
} as const;

export type AppKey = keyof typeof PACKAGE_NAMES;

export function playStoreUrl(app: AppKey, campaign: string): string {
  const referrer = new URLSearchParams({
    utm_source: 'kiku-app.com',
    utm_medium: 'website',
    utm_campaign: campaign,
  }).toString();

  const params = new URLSearchParams({
    id: PACKAGE_NAMES[app],
    referrer,
  });

  return `https://play.google.com/store/apps/details?${params.toString()}`;
}
