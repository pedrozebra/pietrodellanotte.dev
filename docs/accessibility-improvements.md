# Accessibilità: link, focus e semantica

Verifica del 17 novembre 2026. Base `origin/main`
`05181e7f5bdd693f5dde0cc5b557871fdaab84a7`, dopo il merge #29.
Branch `feat/accessibility-improvements`. Ambito: interventi prioritari
dell'audit SEO, senza redesign, upgrade, merge o deploy.

## Correzioni

- Link nel contenuto sempre sottolineati, compresi About e lista articoli.
  Palette prose blu 700/900 in chiaro e blu 300/200 in scuro; inline code
  rosa 700/300. Il codice dentro un link ne eredita il colore.
- About ha un H1 visibile. La freccia di ritorno conserva posizione e stile,
  ma il contenitore è un div, non un H2; nome accessibile «Torna alla Home».
- Skip link «Salta al contenuto», visibile al focus, con destinazione main
  programmaticamente focalizzabile. Nessun tabindex positivo.
- Outline al focus da tastiera di 3 px, offset 3 px, indaco 700 in chiaro e
  indaco 300 in scuro, limitato al contenuto applicativo `#__next`.
- Tema scuro coerente quando è presente la classe `dark`: sfondo gray-900,
  testo chiaro, variante prose attiva, date Home gray-400. Nessun nuovo toggle
  o cambiamento alla selezione del tema.
- URL lunghi possono andare a capo; i pre mantengono righe e scorrimento
  orizzontale locale. Ogni pre riceve tabindex 0, role group e nome accessibile
  costante, dopo la sanitizzazione Markdown. Non viene interpolato input.
  Corpo del codice, font monospace e dimensione 14 px restano invariati.

Le fixture cambiano solo per gli attributi pre. Un confronto con origin/main
ha verificato che, rimossi quegli attributi, tutte le fixture siano identiche.
I file Markdown e i relativi ID/anchor non sono modificati.

## Contrasti

Rapporto di luminanza relativa sRGB, soglia 4,5:1 per testo normale e 3:1 per
l'indicatore di focus. Confronti sulle coppie di colori effettivamente emesse
nel CSS; valori arrotondati solo per la tabella, non per i test.

| Elemento / stato | Prima | Dopo |
|---|---|---|
| Link prose su bianco | #3b82f6, 3,68:1 | #1d4ed8, 6,70:1 |
| Link prose hover su bianco | #1d4ed8, 6,70:1 | #1e3a8a, 10,36:1 |
| Inline code su bianco | #ec4899, 3,53:1 | #be185d, 6,04:1 |
| Link About su bianco | #4f46e5, 6,29:1, senza sottolineatura | 6,29:1, sottolineato |
| Link prose con classe dark | 3,68:1, prose chiara ancora attiva | #93c5fd su #111827, 9,84:1 |
| Link prose hover in scuro | 6,70:1 sul vecchio bianco | #bfdbfe su #111827, 12,48:1 |
| Inline code in scuro | Nessuna variante prose attiva | #f9a8d4 su #111827, 9,78:1 |
| Codice nei pre, entrambi i temi | #e5e7eb su #1f2937, 11,86:1 | 11,86:1, invariato |
| Outline focus chiaro / scuro | Stile nativo, non quantificato | 7,90:1 / 8,90:1 sullo sfondo pagina |

Il tema precedente aveva nav e titoli bianchi senza sfondo scuro; non era un
tema coerente. Durante la verifica della prima correzione è emerso anche
#666 su #111827 per le date Home (3,08:1): la regola finale usa #9ca3af,
6,99:1. I selettori dark espliciti restano fuori dal layer base eliminabile
da Tailwind JIT.

Riferimenti: [WCAG 1.4.3](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
[1.4.1](https://www.w3.org/WAI/WCAG22/Understanding/use-of-color.html),
[2.4.7](https://www.w3.org/WAI/WCAG22/Understanding/focus-visible.html).

## Gerarchia verificata

Un H1 per ciascuna delle nove pagine, nessun heading per la freccia.

| Pagina | Livelli dopo la correzione |
|---|---|
| Home | H1 → H2 Blog |
| About | H1 About |
| PHP destrutturazione | H1 → H3 (6 sezioni) |
| for/forEach | H1 → H2, con sottosezioni H3 |
| let/var/const | H1 → H3 (3 sezioni) |
| Snippet | Solo H1 |
| Lavoro remoto | H1 → H3 (4 sezioni) |
| Salesforce Job Framework | H1 → H2 |
| Node Windows | H1 → H3 (1 sezione) |

I quattro salti H1/H3 editoriali rimangono esplicitamente segnalati:
l'audit, sezione PR 3, chiede una revisione separata dei Markdown. Non vengono
rinumerati silenziosamente né alterati contenuti, gerarchia interna o anchor.

## Verifiche automatiche eseguite

Windows, Node 24.22.3, npm 11.19.1:

- `npm ci`: exit 0, lockfile invariato; restano le sette segnalazioni High note.
- `npm run build`: exit 0; nove pagine statiche/SSG generate.
- `npm test`: **45 pass, 0 fail**. Comprende nove pagine HTTP 200, 404,
  metadata/canonical, sitemap/robots, immagini, Markdown e suite consenso.
- Nuovi test HTTP: un H1 e skip target per pagina; freccia fuori dagli heading;
  variante scura prose. Lettura del CSS compilato con PostCSS già presente:
  contrasto di link/hover/inline code/pre/focus, sottolineatura e overflow pre.
- Diff nullo per metadata SEO, configurazione dominio, sitemap, robots,
  dipendenze, Analytics, `_app` e `_document`/Cookiebot.

Chrome headless **157.0.8103.78**, Puppeteer **25.18.1**, axe-core **4.14.1**
installati soltanto in una directory temporanea, senza dipendenze nel progetto:

- Tutte le nove pagine nei due temi: 18 scansioni axe sui tag wcag2a, wcag2aa,
  wcag21aa e wcag22aa, **zero violazioni rilevate**. Non include tutti i
  controlli best-practice (in particolare heading-order) né certifica WCAG AA.
- Colori e sottolineature dei link verificati anche con computed styles;
  hover campionato. Sono state escluse le richieste a servizi esterni.
- Larghezze 320/375/768/1280 px, entrambi i temi, tutte le pagine: nessun
  overflow di pagina. Prima, About arrivava a 335 px con viewport 320 px.
- Tab/Shift+Tab automatizzati: tutti i link applicativi e pre raggiunti,
  outline solid 3 px e focus-visible. Invio sullo skip link focalizza main;
  Invio su About naviga correttamente. Freccia destra su pre a 375 px modifica
  scrollLeft da 0 a 267 px in entrambi i temi, senza trap di tastiera.
- Home/About/PHP a viewport 1280 px con CSS zoom 200%: nessun overflow;
  simulazione CSS, non una prova dello zoom nativo del browser.

## Screenshot e verifiche visuali

Revisione visuale delle immagini: layout, sottolineature, H1 About e focus dei
pre/skip link. Comparativi con lo stesso ambiente e font di fallback, perché
le richieste esterne (Google Fonts e CMP inclusi) erano bloccate nel test.
Non rappresentano la resa del font remoto o del banner production.

| Campione | Prima | Dopo |
|---|---|---|
| About desktop, 1280 px | [Prima](accessibility-screenshots/before-about-light-1280.png) | [Dopo](accessibility-screenshots/after-about-light-1280.png) |
| Home dark, 375 px | [Prima](accessibility-screenshots/before-home-dark-375.png) | [Dopo](accessibility-screenshots/after-home-dark-375.png) |
| Articolo PHP, 375 px | [Prima](accessibility-screenshots/before-destrutturazione-di-array-in-php-spiegata-semplice-light-375.png) | [Dopo](accessibility-screenshots/after-destrutturazione-di-array-in-php-spiegata-semplice-light-375.png) |

[Focus sul codice in scuro](accessibility-screenshots/code-focus-dark-375.png),
[skip link al focus](accessibility-screenshots/skip-focus-light-375.png).

## Limiti e rischi residui

Nessun test manuale con tastiera fisica o screen reader; la tastiera descritta
è automatizzata. Firefox, Safari, dispositivi reali, forced-colors, zoom nativo
e pannello CMP reale restano da verificare. Cookiebot, il suo focus trap e il
ripristino del focus dopo chiusura non sono stati modificati né validati da
questi test isolati. Gli script CMP/Analytics restano identici e i relativi
test applicativi passano.

I pre aggiungono una tappa Tab anche se non traboccano alla larghezza corrente:
scelta statica semplice e prevedibile, senza JavaScript client aggiuntivo.
I nomi generici dei contatti About («Questa/Questo») e gli alt cover derivati
dagli slug restano rilievi P2 da trattare con revisione dei testi. Nessuna
conformità completa WCAG viene dichiarata. Warning noti Node sui moduli ESM
e Tailwind JIT invariati. Nessun merge o deploy.
