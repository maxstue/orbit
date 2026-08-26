# Orbit

Max' persönliches Field Log: eine zweisprachige, serverseitig gerenderte
Web-Erfahrung, die Inhalte als Ziele in einem interaktiven Sonnensystem
organisiert.

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Die Vorschau läuft anschließend unter `http://localhost:5174/en`. `/` leitet
dauerhaft auf die englische Standardroute `/en` weiter.

## Aktueller Funktionsumfang

- statisches, responsives Sonnensystem im Stil von **Max — Field Log**
- fünf per Maus, Touch und Tastatur erreichbare Transmissionen
- URL-basierter Dialogzustand unter `/:locale/:signal`
- vollständige deutsche und englische Inhalte über Paraglide JS
- Englisch als Standardsprache; Deutsch unter `/de`
- `LINGUA RELAY` als Alien-Raumschiff mit zugänglicher Sprachauswahl
- dekorative Decoder- und Wechselanimation mit Reduced-Motion-Fallback
- Tailwind CSS v4 für Layout und Typografie sowie shadcn/Base UI für Controls
- lokalisierte Metadaten, Sitemap, `robots.txt` und Fehlerzustände
- persistierte Nacht-, Tag- und Systemdarstellung ohne Theme-Flackern beim Start

Die Planeten bewegen sich in dieser Ausbaustufe bewusst noch nicht. Orbit bleibt
eine HTML-/CSS-basierte 2D-Anwendung; Three.js, React Three Fiber, Canvas und
WebGL sind nicht mehr Teil der Planung. Später folgen gezielte 2D-Animationen,
Sentry, Browser-/E2E-Tests und produktives Hosting.

## Geplante 2D-Ausbaustufe

- dezente Transmission- und Signal-Lock-Animationen
- klarer ausgewählter Zustand an den Planeten
- leichte Monde und Satelliten
- optionale langsame Orbitbewegung nach Accessibility- und Performance-Abnahme
- seltene Asteroiden oder Meteore innerhalb des Motion-Budgets
- vollständiger funktionaler Gleichstand bei Reduced Motion

## Qualitätsprüfung

```bash
pnpm check
pnpm test
pnpm build
```

Vite+ bündelt Vite, Oxlint, Oxfmt, TypeScript-Prüfung und Vitest. Biome und
React Testing Library werden nicht verwendet. Die Oberfläche basiert auf
TanStack Start, Tailwind CSS v4 und shadcn-Komponenten mit Base UI.

## Übersetzungen

Die Kataloge liegen in `messages/en.json` und `messages/de.json`. Englisch ist
in `project.inlang/settings.json` als `baseLocale` definiert. Generierte
Paraglide-Dateien unter `src/paraglide/` werden nicht manuell bearbeitet.

## Hosting

Orbit läuft als serverseitig gerenderte Anwendung auf Cloudflare Workers. Das
Cloudflare-Vite-Plugin verwendet lokal, für die Vorschau und beim Build dieselbe
Workers-Runtime wie in Produktion.

```bash
pnpm cf:typegen # nach Änderungen an wrangler.jsonc oder neuen Bindings
pnpm deploy
```

`pnpm deploy` baut die Anwendung und veröffentlicht den Worker
`orbit-field-log`. Die Produktionsanwendung ist unter
[me.justmax.xyz](https://me.justmax.xyz) erreichbar; die `workers.dev`-Route ist
deaktiviert.

Der reale CI/CD-, Rollback- und Observability-Ablauf ist im
[Operations-Runbook](docs/operations.md) beschrieben.
