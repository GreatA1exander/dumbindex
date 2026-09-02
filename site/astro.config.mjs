import { defineConfig } from "astro/config";

// No integrations on purpose. No framework, no client JS, no font loader.
// The site is dumb too — see BRAND.md. Adding an integration here needs a reason
// that survives the page-weight budget in scripts/pageweight.mjs.
export default defineConfig({
  site: "https://dumbindex.com",
  trailingSlash: "always",
  build: { inlineStylesheets: "always" },
  devToolbar: { enabled: false },
  // /changed was split into /updates (everything) and /downgrades (devices that got worse).
  redirects: { "/changed": "/updates/" },
});
