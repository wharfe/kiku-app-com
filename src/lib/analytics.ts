// GA4 configuration.
//
// The measurement ID is a public identifier — it ships in the page source of
// every site that uses GA4 — so it lives here rather than in a build secret.
// Keeping it out of the CI environment means the deploy workflow does not have
// to know about analytics at all.
//
// Property: "kiku-app" (web only). The app-side property named "kiku-studio"
// carries the Android streams for BOTH apps and deliberately stays separate,
// so that neither report needs a platform filter to be readable.
export const GA_MEASUREMENT_ID = 'G-6D56YXW8F4';

export const analyticsEnabled = GA_MEASUREMENT_ID !== '';
