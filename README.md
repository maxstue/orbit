# Orbit

Max' persönliches Field Log: eine zweisprachige, serverseitig gerenderte
Web-Erfahrung, die Inhalte als Ziele in einem interaktiven Sonnensystem
organisiert.

## Lokale Entwicklung

```bash
pnpm install
pnpm dev
```

Die Vorschau läuft anschließend unter `http://127.0.0.1:3000/en`.

## Qualitätsprüfung

```bash
pnpm check
pnpm test
pnpm build
```

Vite+ bündelt Vite, Oxlint, Oxfmt, TypeScript-Prüfung und Vitest. Biome und
React Testing Library werden nicht verwendet. Die Oberfläche basiert auf
TanStack Start, Tailwind CSS v4 und shadcn-Komponenten mit Base UI.
