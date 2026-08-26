# Orbit

Orbit ist Max' persönliches Field Log: eine zweisprachige Web-Erfahrung, die
Ziele und Inhalte als Transmissionen in einem interaktiven Sonnensystem
organisiert.

Die Anwendung verbindet eine spielerische 2D-Oberfläche mit zugänglicher
Navigation. Inhalte sind auf Deutsch und Englisch verfügbar und lassen sich per
Maus, Touch oder Tastatur erkunden. Darstellung und Animationen berücksichtigen
System-Theme und Reduced Motion.

## Technischer Überblick

Orbit ist eine serverseitig gerenderte React-Anwendung auf Basis von TanStack
Start und TypeScript. Tailwind CSS übernimmt das Styling, Paraglide JS die
Lokalisierung. Produktion läuft auf Cloudflare Workers unter
[me.justmax.xyz](https://me.justmax.xyz).

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Die lokale Anwendung ist anschließend unter `http://localhost:5174/en`
erreichbar. Deutsch steht unter `/de` zur Verfügung.

## Qualitätsprüfung

```bash
pnpm check
pnpm test
pnpm build
```

Übersetzungen werden in `messages/en.json` und `messages/de.json` gepflegt.
Generierte Dateien unter `src/paraglide/` werden nicht manuell bearbeitet.

Weiterführende Architektur-, Delivery- und Betriebsdokumentation liegt im
[Orbit-Projekt in Linear](https://linear.app/justmax/project/orbit-c1cf87c59020).
