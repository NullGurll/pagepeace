# PagePeace

**Browse in peace.**

PagePeace is a modified GPLv3 fork of uBlock Origin. The upstream filtering engine, lists, logger, element picker, dynamic filtering, and privacy protections remain intact.

## Added in this fork

- A friendly **Easy Mode** for everyday protection and recovery.
- The complete **Expert Mode** for uBO's firewall, logger, picker, and detailed controls.
- A **Customization Studio** in Dashboard → Settings.
- Coordinated Focus, Midnight, and High Contrast visual presets.
- Minimal, Balanced, and Expert popup layouts.
- Clear fork branding so the build cannot be mistaken for an official uBlock Origin release.

Interface modes and presets do not turn off lists, relax dynamic filtering, or change site permissions unless the user explicitly pauses protection for a site.

## Build

- Chromium MV2: `make chromium`
- Firefox: `make firefox`
- Chromium MV3 / uBO Lite engine: `make mv3-chromium`

The MV3 edition includes PagePeace Easy Mode with Standard, Strong, and Maximum protection choices, plus Expert Mode with the upstream filtering slider, page tools, matched rules, custom filters, and ruleset dashboard.

The classic Chromium build uses Manifest V2. Firefox is the recommended target for the full upstream engine. The MV3 build uses uBlock Origin Lite's browser-native ruleset and does not expose every classic uBO feature.
