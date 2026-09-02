import { defineConfig, passthroughImageService } from "astro/config";

// No integrations on purpose. No framework, no client JS, no font loader.
// The site is dumb too — see BRAND.md. Adding an integration here needs a reason
// that survives the page-weight budget in scripts/pageweight.mjs.
export default defineConfig({
  site: "https://dumbindex.com",
  trailingSlash: "always",
  build: { inlineStylesheets: "always" },
  // We ship no processed images, so skip sharp entirely. This keeps installs small and
  // removes a native-binary dependency that is a common source of CI fragility.
  image: { service: passthroughImageService() },
  devToolbar: { enabled: false },
  // /changed was split into /updates (everything) and /downgrades (devices that got worse).
  redirects: { "/changed": "/updates/" },
});
