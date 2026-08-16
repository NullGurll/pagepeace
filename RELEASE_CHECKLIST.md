# PagePeace Release Checklist

## Engineering

- [ ] Run syntax, lint, and unit checks.
- [ ] Build Firefox MV2, Chromium MV2, and Chromium MV3 packages from a clean checkout.
- [ ] Test default blocking, per-site pause, timed restoration, repair steps, filter updates, custom filters, import/export, and settings persistence.
- [ ] Test light, dark, high-contrast, keyboard-only, zoom, and reduced-motion experiences.
- [ ] Test fresh installation and upgrade from the previous PagePeace build.
- [ ] Review generated permissions and content-security policy.

## Compatibility

- [ ] Test representative news, video, shopping, banking, login, documentation, and web-app sites.
- [ ] Confirm site repair relaxes only the minimum necessary protection.
- [ ] Confirm Firefox private-window and Chromium incognito behavior.

## Distribution

- [ ] Add public support email, website, source URL, and privacy-policy URL.
- [ ] Perform formal trademark clearance for PagePeace and the shield-plus mark.
- [ ] Sign the Firefox package through Mozilla Add-ons.
- [ ] Submit the MV3 package to the Chrome Web Store and other desired stores.
- [ ] Publish corresponding GPLv3 source for every distributed binary.
- [ ] Record store review results and version numbers.
