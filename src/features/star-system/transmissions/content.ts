import type { Locale, WorldId } from '../data/worlds'

export type Transmission = {
  channel: string
  title: string
  kicker: string
  lead: string
  details: { label: string; value: string; href?: string }[]
  quote: string
}

const germanTransmissions: Record<WorldId, Transmission> = {
  home: {
    channel: 'CH_01 / ORIGIN / MAX',
    kicker: 'HOME SIGNAL / DECRYPTED',
    title: 'Hey, ich bin Max.',
    lead: 'Ich entwickle Webanwendungen und denke gerne darüber nach, wie komplexe Dinge ein bisschen verständlicher werden. Das hier ist mein kleiner Ort im Internet – irgendwo zwischen Arbeit, Hobbys und einer ziemlich großen Begeisterung für Science-Fiction.',
    details: [
      { label: 'Basis', value: 'Nähe Karlsruhe · Planet Erde' },
      { label: 'Arbeitsmittel', value: '.NET · React · TypeScript' },
      { label: 'Status', value: 'Neugierig & betriebsbereit' },
    ],
    quote:
      '„Meistens irgendwo zwischen Code, Architekturfragen und: Können wir das nicht einfacher machen?“',
  },
  current: {
    channel: 'CH_02 / LIVE / LOW LATENCY',
    kicker: 'CURRENT ORBIT / DECRYPTED',
    title: 'Was mich gerade beschäftigt.',
    lead: 'Keine Roadmap und kein künstlich gefüllter Feed. Nur ein kleiner Schnappschuss von Dingen, die aktuell auf meinem Schreibtisch oder in meinem Kopf liegen.',
    details: [
      { label: 'Bei der Arbeit', value: 'Technische Entscheidungen gemeinsam verständlich halten' },
      { label: 'Nach Feierabend', value: 'Ein Sci‑Fi-Spiel ohne 80 Stunden Backlog finden' },
      { label: 'Kleines Ziel', value: 'Öfter raus. Weniger Tabs.' },
    ],
    quote: '„Vielleicht wird hier irgendwann ein Blog draus. Heute ist es einfach meine Homepage.“',
  },
  workbench: {
    channel: 'CH_03 / BUILD / ITERATE',
    kicker: 'WORKBENCH / DECRYPTED',
    title: 'Software, die auch morgen noch jemand versteht.',
    lead: 'Mich interessiert nicht nur, ob etwas funktioniert. Ebenso wichtig ist, ob andere Menschen es nachvollziehen, verändern und weiterentwickeln können.',
    details: [
      { label: 'Code', value: 'Wartbare Webanwendungen und verständliche APIs' },
      { label: 'Zusammenarbeit', value: 'Kontext teilen statt Entscheidungen verstecken' },
      { label: 'Werkzeuge', value: 'Nur so viel Magie wie wirklich hilfreich ist' },
    ],
    quote:
      '„Pragmatismus ist nicht Gleichgültigkeit. Und gute Tickets gehören auch zur Developer Experience.“',
  },
  'side-quests': {
    channel: 'CH_04 / OFF DUTY / ONLINE',
    kicker: 'SIDE QUESTS / DECRYPTED',
    title: 'Bildschirm aus. Side Quest an.',
    lead: 'Ich mag Dinge, bei denen man Fortschritt sieht: einen Weg finden, etwas aufbauen und dabei immer ein bisschen besser verstehen, wie alles zusammenspielt.',
    details: [
      { label: 'Gaming', value: 'Sci‑Fi, Fantasy und fremde Welten' },
      { label: 'Draußen', value: 'Wandern und Bildschirm gegen Weitblick tauschen' },
      { label: 'Bauen', value: 'LEGO, kleine Teile und große Systeme' },
      { label: 'Training', value: 'Konstanz schlägt die perfekte Session' },
    ],
    quote: '„Mein bevorzugtes Fast Travel funktioniert leider meistens nur im Spiel.“',
  },
  comms: {
    channel: 'CH_05 / CHANNEL / OPEN',
    kicker: 'COMMS RELAY / DECRYPTED',
    title: 'Ein Signal senden.',
    lead: 'Wenn du über Software, LEGO, Science-Fiction oder einen guten Wanderweg sprechen möchtest, ist der Kommunikationskanal geöffnet.',
    details: [
      { label: 'E-Mail', value: 'max@example.com ↗', href: 'mailto:max@example.com' },
      { label: 'Antwortzeit', value: 'Üblicherweise innerhalb einer Erdrotation' },
      { label: 'Protokoll', value: 'Freundlich, direkt und ohne Verkaufssequenz' },
    ],
    quote: '„No tracking beacons. No newsletter popup. Nur eine ganz normale E-Mail.“',
  },
}

const englishTransmissions: Record<WorldId, Transmission> = {
  home: {
    channel: 'CH_01 / ORIGIN / MAX',
    kicker: 'HOME SIGNAL / DECRYPTED',
    title: "Hey, I'm Max.",
    lead: 'I build web applications and enjoy making complex things a little easier to understand. This is my small place on the internet — somewhere between work, hobbies, and a fairly large enthusiasm for science fiction.',
    details: [
      { label: 'Base', value: 'Near Karlsruhe · Planet Earth' },
      { label: 'Tools', value: '.NET · React · TypeScript' },
      { label: 'Status', value: 'Curious & operational' },
    ],
    quote:
      '“Usually somewhere between code, architecture questions, and: could we make this simpler?”',
  },
  current: {
    channel: 'CH_02 / LIVE / LOW LATENCY',
    kicker: 'CURRENT ORBIT / DECRYPTED',
    title: 'What has my attention right now.',
    lead: 'No roadmap and no artificially filled feed. Just a small snapshot of the things currently on my desk or in my head.',
    details: [
      { label: 'At work', value: 'Keeping technical decisions understandable together' },
      { label: 'After hours', value: 'Finding a sci-fi game without an 80-hour backlog' },
      { label: 'Small goal', value: 'Go outside more. Keep fewer tabs.' },
    ],
    quote: '“Maybe this will become a blog one day. Today it is simply my homepage.”',
  },
  workbench: {
    channel: 'CH_03 / BUILD / ITERATE',
    kicker: 'WORKBENCH / DECRYPTED',
    title: 'Software someone can still understand tomorrow.',
    lead: 'I care not only whether something works, but whether other people can understand, change, and continue developing it.',
    details: [
      { label: 'Code', value: 'Maintainable web applications and understandable APIs' },
      { label: 'Collaboration', value: 'Share context instead of hiding decisions' },
      { label: 'Tools', value: 'Only as much magic as is genuinely helpful' },
    ],
    quote:
      '“Pragmatism is not indifference. And good tickets are part of developer experience too.”',
  },
  'side-quests': {
    channel: 'CH_04 / OFF DUTY / ONLINE',
    kicker: 'SIDE QUESTS / DECRYPTED',
    title: 'Screen off. Side quest on.',
    lead: 'I like things where progress is visible: finding a path, building something, and understanding a little better how everything fits together.',
    details: [
      { label: 'Gaming', value: 'Sci-fi, fantasy, and unfamiliar worlds' },
      { label: 'Outside', value: 'Hiking and trading the screen for a wider view' },
      { label: 'Building', value: 'LEGO, small pieces, and big systems' },
      { label: 'Training', value: 'Consistency beats the perfect session' },
    ],
    quote: '“Unfortunately, my preferred fast travel usually only works in games.”',
  },
  comms: {
    channel: 'CH_05 / CHANNEL / OPEN',
    kicker: 'COMMS RELAY / DECRYPTED',
    title: 'Send a signal.',
    lead: 'If you want to talk about software, LEGO, science fiction, or a good hiking trail, the communications channel is open.',
    details: [
      { label: 'Email', value: 'max@example.com ↗', href: 'mailto:max@example.com' },
      { label: 'Response time', value: 'Usually within one Earth rotation' },
      { label: 'Protocol', value: 'Friendly, direct, and without a sales sequence' },
    ],
    quote: '“No tracking beacons. No newsletter popup. Just a regular email.”',
  },
}

export function getTransmission(id: WorldId, locale: Locale): Transmission {
  return locale === 'de' ? germanTransmissions[id] : englishTransmissions[id]
}
