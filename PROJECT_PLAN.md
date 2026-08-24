# orbit — Gesamtprojektplan

Stand: 24. August 2026

## 1. Zielbild

`orbit` ist die persönliche Website von Max. Sie wird nicht als klassisches
Portfolio mit dekorativem Weltraum-Hintergrund umgesetzt, sondern als ruhige,
zugängliche 3D-Systemoberfläche. Die Besucher navigieren durch ein stilisiertes
Sonnensystem und öffnen Inhalte als „Transmissionen“.

Der veröffentlichte Prototyp **Max — Field Log** ist die visuelle und inhaltliche
Referenz. Er liefert Typografie, Farbwelt, Tonalität, Planetenidentitäten und die
ersten Texte. Die neue Anwendung übernimmt diese Identität, ersetzt aber die
flache Darstellung durch eine belastbare Webarchitektur mit echter 3D-Szene,
URL-basiertem Zustand, Deutsch/Englisch, Themes und barrierefreier HTML-Ebene.

## 2. Leitprinzipien

1. **Inhalt bleibt wichtiger als Inszenierung.** Jeder Inhalt ist ohne WebGL
   erreichbar und lesbar.
2. **Die Metapher ist funktional.** Planeten, Theme und Sprache sind Teil des
   Systems und keine bloße Dekoration.
3. **Die URL ist die Wahrheit.** Sprache und geöffnete Transmission sind
   teilbar, bookmarkfähig und mit Vor/Zurück navigierbar.
4. **Bewegung ist optional.** Reduced Motion bietet die vollständige Erfahrung
   ohne Orbits, Kameraflüge oder Scan-Sequenzen.
5. **Mobile ist kein verkleinerter Desktop.** Komposition und Bedienung werden
   für kleine Bildschirme bewusst angepasst.
6. **Progressive Enhancement.** SSR-HTML zuerst, 3D als clientseitige
   Erweiterung.
7. **Wenig Magie.** Keine globale State-Library, keine unnötige Datenbank und
   keine schweren Modelle oder Texturen im MVP.

## 3. Zielgruppen und Kernaufgaben

### Primäre Zielgruppen

- Menschen aus Softwareentwicklung und Produktentwicklung
- potenzielle Kolleginnen, Kollegen und Auftraggeber
- persönliche Kontakte mit Interesse an Max' Arbeit und Hobbys

### Was Besucher innerhalb kurzer Zeit verstehen sollen

- Wer Max ist
- woran er arbeitet und wie er über Software denkt
- welche Interessen ihn außerhalb der Arbeit beschäftigen
- wie man Kontakt aufnehmen kann

### Primäre Nutzerabläufe

1. Seite öffnen und System sofort verstehen.
2. Planeten per Maus, Touch oder Tastatur auswählen.
3. Transmission öffnen, lesen und schließen.
4. Zwischen Transmissionen wechseln.
5. Sprache wechseln, ohne den aktuellen Inhalt zu verlieren.
6. Theme wechseln, ohne sichtbares Flackern.
7. Einen direkten Link zu einer Transmission teilen.

## 4. Inhalt und Informationsarchitektur

| ID            | Systemname    | Zweck                              | Farbe/Charakter              |
| ------------- | ------------- | ---------------------------------- | ---------------------------- |
| `home`        | HOME SIGNAL   | Vorstellung und Kurzprofil         | Koralle, zentral und warm    |
| `current`     | CURRENT ORBIT | aktueller Fokus und Momentaufnahme | Lime, kleiner Mond           |
| `workbench`   | WORKBENCH     | Arbeitsweise, Technik und Projekte | Cyan, technischer Ringplanet |
| `side-quests` | SIDE QUESTS   | Gaming, Wandern, LEGO, Training    | Violett, mehrere Monde       |
| `comms`       | COMMS RELAY   | Kontakt                            | helles Satellitensignal      |
| `language`    | LINGUA RELAY  | Sprachwechsel                      | separates Relay-Objekt       |

### Inhaltsquelle

Die Inhalte liegen im MVP lokal und typisiert im Repository. Eine Datenbank oder
ein CMS ist nicht vorgesehen. Übersetzbare Texte werden in den Paraglide-
Nachrichtenkatalogen gepflegt. Strukturelle Planetendaten liegen zentral in
`worlds.ts`.

### Vorhandene deutsche Ausgangstexte

Die Inhalte aus **Max — Field Log** bilden Version 0 der deutschen Texte. Vor
dem Produktionsstart müssen insbesondere diese Angaben bestätigt werden:

- endgültiger Standorttext
- aktuelle Arbeitsmittel und Schwerpunkte
- konkrete Projektbeispiele im WORKBENCH
- aktueller Inhalt von CURRENT ORBIT
- echte Kontaktadresse statt `max@example.com`
- gewünschte externe Profile, falls vorhanden

## 5. Verbindliche URL- und Zustandsarchitektur

```text
/                         -> permanente Weiterleitung nach /en
/en                       -> englisches System, keine Transmission
/de                       -> deutsches System, keine Transmission
/en/workbench             -> englischer Workbench-Inhalt
/de/side-quests           -> deutscher Side-Quests-Inhalt
```

Unterstützte `signal`-Werte:

```text
home | current | workbench | side-quests | comms
```

| Zustand        | Quelle                                               |
| -------------- | ---------------------------------------------------- |
| Sprache        | verpflichtender Pfadparameter `/en` oder `/de`       |
| Transmission   | verschachtelte Pfadroute unter der aktiven Locale    |
| Theme          | Cookie; auf `<html data-theme>` serverseitig gesetzt |
| System-Theme   | `prefers-color-scheme`                               |
| Reduced Motion | `prefers-reduced-motion`                             |
| Orbitposition  | ausschließlich 3D-Render-Loop                        |

Regeln:

- `/` leitet immer nach `/en`; keine automatische Sprachumleitung.
- Unbekannte Sprachen zeigen eine gestaltete Übersetzungsfehlerseite.
- Unbekannte Transmission-Pfade liefern einen definierten Fehlerzustand.
- Der Sprachwechsel behält das aktuelle `signal`.
- Das Öffnen und Schließen einer Transmission erzeugt sinnvolle History-
  Einträge.
- Canonical, `hreflang`, `<html lang>`, Titel und Beschreibung entsprechen der
  aktiven Locale.

## 6. Technische Architektur

### Kernstack

- TypeScript mit strikten Compiler-Einstellungen
- React
- TanStack Start und TanStack Router
- Vite+ als einheitliche Toolchain mit Vite, Oxlint, Oxfmt und Vitest
- Tailwind CSS v4
- shadcn mit Base UI als Primitive-Layer
- Three.js
- `@react-three/fiber`
- `@react-three/drei`
- Motion
- Paraglide JS
- Zod
- Sentry für Browser- und Server-Observability
- Vitest über Vite+
- `@vitest/browser-playwright`
- Playwright

React Testing Library wird nicht installiert.

### Rendering-Modell

```text
TanStack-Start-Route (SSR)
├── semantische HTML-Systemoberfläche
│   ├── Einführung und HUD
│   ├── zugängliche Planetennavigation
│   ├── TransmissionDialog
│   └── Theme- und Sprachsteuerung
└── clientseitiger R3F-Canvas
    ├── Sternenhimmel
    ├── Zentralstern
    ├── Orbits
    ├── Planeten und Relays
    └── CameraRig
```

Die Route und die inhaltliche HTML-Ebene werden serverseitig gerendert. Der
Canvas wird nur im Browser gestartet. Ein statischer, gestalterisch passender
Fallback ist schon vor dem Laden der 3D-Szene sichtbar.

### Kein globaler Anwendungsstore

Die Route liefert `locale` und `selectedSignal`. Theme wird über einen kleinen
Provider und Cookie verwaltet. Laufende 3D-Werte bleiben in Refs und im
Render-Loop. Redux, Zustand oder vergleichbare Stores sind für den MVP nicht
vorgesehen.

## 7. Vorgesehene Projektstruktur

```text
src/
├── routes/
│   ├── __root.tsx
│   ├── index.tsx
│   └── $locale/
│       └── index.tsx
├── features/
│   └── star-system/
│       ├── data/
│       │   └── worlds.ts
│       ├── scene/
│       │   ├── StarSystemScene.tsx
│       │   ├── Starfield.tsx
│       │   ├── CentralStar.tsx
│       │   ├── Orbit.tsx
│       │   ├── Planet.tsx
│       │   ├── LinguaSatellite.tsx
│       │   ├── SceneLighting.tsx
│       │   └── CameraRig.tsx
│       ├── transmissions/
│       │   ├── TransmissionDialog.tsx
│       │   └── TransmissionContent.tsx
│       ├── controls/
│       │   ├── SystemHud.tsx
│       │   ├── StellarConditions.tsx
│       │   └── LinguaRelay.tsx
│       ├── navigation/
│       │   ├── AccessibleNavigation.tsx
│       │   └── PlanetLabel.tsx
│       ├── theme/
│       │   ├── theme.config.ts
│       │   ├── ThemeProvider.tsx
│       │   └── theme.server.ts
│       ├── i18n/
│       │   ├── locale-routing.ts
│       │   └── LocalizedLink.tsx
│       ├── model/
│       │   ├── schemas.ts
│       │   ├── orbit.ts
│       │   └── navigation.ts
│       └── types.ts
├── components/
│   ├── ClientOnlyScene.tsx
│   └── ErrorBoundary.tsx
├── styles/
│   ├── tokens.css
│   ├── themes.css
│   └── app.css
└── router.tsx

messages/
├── en.json
└── de.json

tests/
├── unit/
├── browser/
└── e2e/
```

## 8. Visuelles System

### Referenz

Vom Sites-Prototyp werden übernommen:

- große redaktionelle Typografie
- dunkle, nahezu schwarze Grundfläche
- gebrochenes Weiß statt hartem Reinweiß
- Koralle, Lime, Cyan und Violett als Signalidentitäten
- kleine technische Mono-Texte
- Field-Log-/Transmission-Tonalität
- klar abgegrenztes Kommunikationsfenster

### Themes

**DEEP SPACE**

- dunkler Weltraum
- helle Sterne und atmosphärische Planeten
- dezentes Bloom
- dunkle Kommunikationsfenster

**STAR CHART**

- warmer, papierähnlicher Hintergrund
- dunkle Sternpunkte und Orbitlinien
- Schatten und technische Linien statt Bloom
- farbige Planeten bleiben räumlich

**AUTO NAV**

- folgt dem Betriebssystem
- reagiert auch auf Änderungen während der Sitzung

Das Theme verändert sowohl CSS-Tokens als auch Szenenparameter wie Fog,
Beleuchtung, Sternfarben, Materialien und Postprocessing.

## 9. 3D- und Interaktionskonzept

### Szene

- feste, kuratierte Kamera; keine freie Orbit-Steuerung
- prozedurale Planeten ohne externe Modelle oder große Texturen
- 32 bis 48 Segmente pro Kugel
- langsame, voneinander unterscheidbare Orbitgeschwindigkeiten
- maximal dezentes Bloom
- DPR-Obergrenze von etwa 1,5
- pausierter Render-Loop in inaktiven Tabs

### Auswahlablauf

1. Planet wird per Maus, Touch oder Tastatur ausgewählt.
2. Die Anwendung navigiert auf `/:locale/<signal>`.
3. Ausgewählter Planet stoppt; andere Orbits verlangsamen sich.
4. Kamera richtet sich dezent aus.
5. `SIGNAL LOCKED` erscheint.
6. HTML-Transmission fährt ein.

Die vollständige Sequenz bleibt kurz und darf den Inhalt nicht künstlich
verzögern. Bei Reduced Motion entfallen Orbit- und Kamerabewegung; das Fenster
blendet direkt ein.

### Eingaben

- Klick oder Tap auf Planeten
- sichtbare HTML-Navigation
- Ziffern `1` bis `5` für die Hauptsignale
- Pfeiltasten für vorheriges/nächstes Signal
- `Escape` zum Schließen
- vollständige Bedienbarkeit ohne Hover

## 10. Internationalisierung

- Englisch ist Standardsprache, aber immer unter `/en` sichtbar.
- Deutsch liegt unter `/de`.
- Paraglide erhält die Locale ausschließlich aus der Route.
- Komponenten lesen weder Browsersprache noch Local Storage als konkurrierende
  Sprachquelle.
- Alle nutzerrelevanten Texte, Labels, Fehler und Metadaten werden übersetzt.
- Systemnamen wie `WORKBENCH` dürfen identisch bleiben; die Erklärung wird
  lokalisiert.
- Beide Kataloge müssen dieselben Schlüssel besitzen.

`LINGUA RELAY` zeigt die echten Sprachbezeichnungen sofort. Die optionale
Handshake-Animation dauert höchstens etwa 300 bis 500 Millisekunden und wird
bei Reduced Motion übersprungen.

## 11. Barrierefreiheit

Ziel: WCAG 2.2 AA für die bedienbaren und inhaltlichen Oberflächen.

- Canvas ist nicht die einzige Navigation.
- Jeder Planet besitzt eine äquivalente HTML-Schaltfläche.
- Transmissionen haben Dialogsemantik, zugänglichen Namen und Fokusfalle.
- Der Fokus kehrt nach dem Schließen zum auslösenden Element zurück.
- Sichtbare Fokuszustände in beiden Themes.
- Sinnvolle Überschriftenhierarchie und Landmarken.
- Statusmeldungen werden bei Bedarf über eine Live-Region vermittelt, ohne
  Screenreader mit Animationsmeldungen zu überladen.
- Keine Information wird ausschließlich über Farbe vermittelt.
- Touch-Ziele sind ausreichend groß.
- Zoom und große Schrift bleiben verwendbar.
- WebGL-Ausfall zeigt eine vollständige, gestaltete HTML-Version.

## 12. Responsive Strategie

### Desktop

- Sonnensystem als dominante Fläche
- Transmission seitlich oder als großes Panel
- Labels können nahe an den Planeten erscheinen

### Tablet

- verkürzte Kamerabewegung
- kompakteres HUD
- Transmission nimmt mehr Breite ein

### Mobile

- kuratierte, weniger überlappende Planetenkonstellation
- Transmission als nahezu vollflächiges Sheet
- permanente kompakte HTML-Signalleiste
- keine hoverabhängigen Informationen
- niedrigere DPR- und Effektgrenzen

## 13. Fehler- und Fallbackzustände

- `/fr`: gestaltete Seite `TRANSLATION PROTOCOL UNAVAILABLE`
- ungültiges `signal`: System bleibt offen; optional unaufdringliche Meldung
- WebGL nicht verfügbar: zugängliche HTML-Planetennavigation
- 3D-Chunk lädt nicht: statischer Field-Log-Hintergrund und Inhalte bleiben
  verwendbar
- JavaScript deaktiviert: SSR-Inhalte und normale Links bleiben lesbar
- unbekannter Anwendungsfehler: lokalisierte Systemfehlerseite mit Rückkehrlink

## 14. Teststrategie

### Vitest — Unit und Integration

- Locale-Schema akzeptiert nur `en` und `de`
- Signal-Schema akzeptiert nur bekannte IDs
- `/`-Weiterleitung führt nach `/en`
- vorheriges und nächstes Signal
- der Transmission-Pfad bleibt beim Sprachwechsel erhalten
- Orbitpositionen aus Zeit, Radius und Geschwindigkeit
- Theme-Auflösung aus Cookie und Systemeinstellung
- Reduced-Motion-Auflösung
- identische Übersetzungsschlüssel in beiden Katalogen
- zentrale Planetenkonfiguration ist vollständig und eindeutig

### Vitest Browser Mode — Komponenten im echten Browser

- Transmission öffnet und zeigt den richtigen Inhalt
- `Escape` schließt
- Fokus bleibt im Dialog und kehrt korrekt zurück
- Ziffern- und Pfeiltastennavigation
- Theme-Steuerung und `data-theme`
- Lingua Relay zeigt Deutsch und Englisch verständlich
- Sprachwechsel behält die Transmission
- Dialogrollen, Namen und Labels
- Reduced Motion verkürzt beziehungsweise entfernt Animationen

Browser-Komponententests verwenden Browser-Locators und `userEvent` aus
`vitest/browser`, nicht React Testing Library.

### Playwright — Ende-zu-Ende und visuell

Kritischer Ablauf:

```text
/en öffnen
-> Workbench auswählen
-> URL ist /en/workbench
-> nach Deutsch wechseln
-> URL ist /de/workbench
-> deutscher Inhalt sichtbar
-> Browser-Zurück
-> vorheriger Zustand erscheint
```

Weitere Abdeckung:

- direkter Einstieg in jede Locale mit Signal
- `/`-Weiterleitung
- ungültige Locale
- Theme bleibt beim Sprachwechsel erhalten
- Light/Dark auf Desktop und Mobile
- Reduced Motion
- WebGL-Fallback
- Tastatur-only-Ablauf
- Metadaten, Canonical und `hreflang`
- kleine visuelle Screenshot-Suite für stabile Kernansichten

## 15. Performance-Budget

Ziele für eine typische moderne Mobilverbindung:

- SSR-Inhalt erscheint ohne Warten auf Three.js.
- 3D-Code wird als eigener Client-Chunk geladen.
- keine großen Bild- oder Modellassets im MVP.
- keine React-State-Updates pro Frame.
- Geometrien und Materialien werden wiederverwendet.
- Szene pausiert bei unsichtbarem Tab.
- Effekte passen sich an kleinere Geräte an.
- nach Implementierung werden Core Web Vitals, Bundle-Aufteilung und reale
  Mobilgeräte geprüft.

Konkrete Kilobyte- und Timing-Grenzen werden nach dem ersten vertikalen Schnitt
festgelegt, weil Three.js-Größe und Hosting-Kompression dann messbar sind.

## 16. Sicherheit und Datenschutz

- keine Tracking-Skripte im MVP
- keine Newsletter- oder Marketingformulare
- Kontakt bevorzugt über normalen `mailto:`-Link
- keine Zugangsdaten oder privaten Informationen im Client-Bundle
- externe Links erhalten sichere Attribute, wo erforderlich
- Content Security Policy wird mit den Anforderungen von WebGL und Hosting
  abgestimmt
- keine unnötigen Cookies; nur Theme-Präferenz

## 17. Observability mit Sentry

Sentry wird für Browser- und TanStack-Start-Serverfehler, gesampelte Traces,
Web Vitals, Releases und Source Maps integriert. Ohne konfigurierten DSN bleibt
die Integration deaktiviert.

Datenschutzbaseline:

- `sendDefaultPii=false`
- keine Nutzer-, Session- oder Geräteidentifikation
- keine Cookies, Request Bodies, Kontakt- oder Freitextinhalte
- Query-Strings und URL-Fragmente vor dem Versand entfernen
- Session Replay bleibt deaktiviert
- nur niedrig-kardinale Tags für Locale, Theme, Route, WebGL und Reduced Motion

Delivery und Betrieb:

- Clientinitialisierung vor der Hydration
- Serverinitialisierung vor dem Request-Handler
- TanStack-Router- und Error-Boundary-Erfassung
- commitbasierte Releases
- Source-Map-Upload nur in CI über `SENTRY_AUTH_TOKEN`
- getrennte Environments für Development, Preview und Production
- Alerts für neue Fehler, Regressionen und Fehlerspitzen
- vierteljährliche Prüfung von Quota, Sampling und Retention

Nach jedem relevanten Produktionssetup werden kontrollierte Client-, Server-
und WebGL-Fallback-Fehler geprüft. Events dürfen keine personenbezogenen Daten
oder URL-Parameter enthalten und müssen dem richtigen Release zugeordnet sein.

## 18. SEO und Social Preview

- lokalisierter Seitentitel und Beschreibung
- `<html lang>` pro Route
- Canonical pro Locale
- `hreflang="en"`, `hreflang="de"` und `x-default`
- strukturierte Person-/Website-Daten nur mit bestätigten Angaben
- eigene Social-Preview-Grafik im Field-Log-Stil
- keine indexierbaren falschen Sprachvarianten
- Sitemap mit `/en` und `/de`
- `robots.txt`

## 19. Umsetzung in Meilensteinen

### M0 — Projektfundament

Ergebnis:

- Projekt initialisiert
- Formatierung, TypeScript und Qualitätschecks eingerichtet
- TanStack Start startet lokal
- `/` leitet nach `/en`
- `/en` und `/de` rendern eine minimale SSR-Hülle

Abnahme:

- Produktionsbuild erfolgreich
- keine Starter-Platzhalter mehr sichtbar

### M1 — Erster vertikaler Schnitt

Ergebnis:

- erkennbare Field-Log-Startansicht
- zentrale Planetendaten
- ein repräsentativer Planet
- HOME-Transmission als HTML-Dialog
- Pfadroute `/en/home`
- zugängliche HTML-Navigation

Abnahme:

- Besucher erkennen Produkt und visuelle Richtung
- Öffnen, Schließen, Reload und Browser-Zurück funktionieren
- erste lokale Vorschau wird gezeigt

### M2 — Vollständiges Inhaltssystem

Ergebnis:

- alle fünf Hauptsignale
- Vor/Zurück- und Ziffernnavigation
- deutsche Ausgangsinhalte überarbeitet
- englische Inhalte ergänzt
- Paraglide und Localized Links
- Fehlerseite für unbekannte Locale

Abnahme:

- jede Transmission ist in beiden Sprachen erreichbar
- Sprachwechsel erhält das Signal
- keine fehlenden Übersetzungsschlüssel

### M3 — Vollständige 3D-Szene

Ergebnis:

- Sternenhimmel, Zentralstern, Orbits und alle Planeten
- individuelle Planetenformen und Farben
- Camera Rig und Signal-Lock-Sequenz
- Relay-Satelliten
- adaptive Qualitätsstufen

Abnahme:

- flüssige, kontrollierbare Szene auf Zielgeräten
- HTML-Navigation bleibt jederzeit gleichwertig
- WebGL-Ausfall ist unkritisch

### M4 — Themes, Sprache als Systemfunktion und Bewegung

Ergebnis:

- DEEP SPACE, STAR CHART und AUTO NAV
- serverseitiges Theme-Cookie ohne Flackern
- LINGUA RELAY mit kurzer Handshake-Sequenz
- vollständiges Reduced-Motion-Verhalten

Abnahme:

- jede Sprache funktioniert in jedem Theme
- Theme bleibt über Navigation und Reload erhalten
- Reduced Motion stoppt alle nicht notwendigen Bewegungen

### M5 — Responsive, Accessibility und Feinschliff

Ergebnis:

- kuratierte Mobile-Komposition
- vollständige Tastatur- und Fokusführung
- Screenreader-taugliche Navigation
- robuste Textgrößen und Touch-Ziele
- finale Texte, Kontaktangaben und Metadaten

Abnahme:

- Desktop, Tablet und Mobile getestet
- zentraler Ablauf vollständig ohne Maus möglich
- keine kritischen Accessibility-Probleme

### M6 — Qualität, Performance und Veröffentlichung

Ergebnis:

- vollständige Unit-, Browser- und E2E-Suite
- visuelle Regressionen für Kernansichten
- Bundle- und Web-Vitals-Prüfung
- Sentry für Browser und Server mit Datenschutzfiltern
- Releases, Source Maps, Sampling und Alerts
- Social Preview, Sitemap und Robots
- produktive Veröffentlichung

Abnahme:

- Build und alle Pflichtprüfungen erfolgreich
- kontrollierte Sentry-Fehler zeigen bereinigte Events und lesbare Stacktraces
- direkte Links, Reloads und Fehlerzustände funktionieren produktiv
- veröffentlichte Site ist in beiden Sprachen nutzbar

## 20. MVP-Grenze

Zum MVP gehören:

- fünf Hauptsignale
- Deutsch und Englisch
- Deep Space und Star Chart einschließlich Systemmodus
- URL-basierte Navigation
- zugängliche HTML-Transmissionen
- vollständige 3D-Szene aus prozeduralen Formen
- Reduced Motion und WebGL-Fallback
- responsive Kernansichten
- Kontaktlink, Metadaten und Social Preview

Nicht Teil des MVP:

- CMS oder Datenbank
- Blogsystem
- frei drehbare Kamera
- Benutzerkonten
- Kontaktformular
- Analytics
- große Texturen, GLB-Modelle oder Physik
- dynamische Projekt-Detailseiten
- komplexe Shader oder Audio

## 21. Entscheidungen für spätere Versionen

Erst nach dem MVP bewerten:

- echte Projekt-Detailseiten unter lokalisierten URLs
- Blog oder fortlaufendes Field Log
- sehr dezente Maus-Parallaxe
- optionale Audioebene mit expliziter Zustimmung
- zusätzliche Signale oder versteckte Easter Eggs
- anonymes, datenschutzfreundliches Nutzungsfeedback

## 22. Offene Produktentscheidungen vor M2

Diese Fragen blockieren das Fundament nicht, müssen aber vor der finalen
Inhaltsphase beantwortet sein:

1. Welche echte E-Mail-Adresse soll veröffentlicht werden?
2. Welche konkreten Projekte oder Arbeitsergebnisse dürfen im WORKBENCH genannt
   werden?
3. Welche externen Profile sollen verlinkt werden?
4. Soll „Nähe Karlsruhe“ so öffentlich bleiben?
5. Welche englische Tonalität soll die deutsche Persönlichkeit am besten
   übertragen: eher direkt oder etwas stärker in der Sci-Fi-Rolle?
6. Soll die neue Site die bisherige Field-Log-URL später ersetzen oder unter
   einer eigenen Domain erscheinen?

## 23. Definition of Done

Das Projekt gilt als fertig, wenn:

- alle MVP-Funktionen implementiert sind,
- sämtliche Inhalte in Deutsch und Englisch vollständig sind,
- Sprache, Signal und Theme reproduzierbar navigieren,
- die Seite ohne WebGL und mit Reduced Motion vollständig nutzbar bleibt,
- Tastatur, Touch und Maus unterstützt werden,
- Build, Unit-, Browser- und E2E-Pflichtprüfungen erfolgreich sind,
- Metadaten und Social Preview korrekt sind,
- keine Platzhalterdaten mehr enthalten sind,
- die produktive Veröffentlichung geprüft und direkt erreichbar ist.
