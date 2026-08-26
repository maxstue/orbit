# Orbit

Orbit is Max's personal field log: a bilingual web experience that organizes
goals and content as transmissions in an interactive solar system.

The application combines a playful 2D interface with accessible navigation.
Content is available in English and German and can be explored with a mouse,
touch, or keyboard. Its appearance and animations respect the system theme and
reduced-motion preferences.

## Technical overview

Orbit is a server-rendered React application built with TanStack Start and
TypeScript. Tailwind CSS handles styling, while Paraglide JS provides
localization. The production application runs on Cloudflare Workers at
[me.justmax.xyz](https://me.justmax.xyz).

## Local development

```bash
pnpm install
pnpm dev
```

The local application is then available at `http://localhost:5174/en`. The
German version is available under `/de`.

## Quality checks

```bash
pnpm check
pnpm test
pnpm build
```

Translations are maintained in `messages/en.json` and `messages/de.json`.
Generated files under `src/paraglide/` must not be edited manually.

Further architecture, delivery, and operations documentation is maintained in
the [Orbit project in Linear](https://linear.app/justmax/project/orbit-c1cf87c59020).
