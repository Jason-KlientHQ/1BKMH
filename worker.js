/**
 * Entry Worker for the static-assets deployment.
 *
 * Its only job is a host canonicalisation: 301 www.1bkmh.com → 1bkmh.com
 * (preserving path + query) so the site has one canonical origin. Every other
 * request is handed straight to the static-assets binding, which honours the
 * SPA `not_found_handling` from wrangler.jsonc.
 *
 * `run_worker_first: true` in wrangler.jsonc is required so this runs even for
 * requests that match a real asset (e.g. www.1bkmh.com/ → index.html), which
 * would otherwise be served directly and skip the redirect.
 */
export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.hostname === "www.1bkmh.com") {
      url.hostname = "1bkmh.com";
      return Response.redirect(url.toString(), 301);
    }
    return env.ASSETS.fetch(request);
  },
};
