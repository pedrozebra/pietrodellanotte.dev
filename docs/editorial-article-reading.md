# Lettura degli articoli — audit e intervento

20 novembre 2026. Base `origin/main` **cc631e0**, merge della #34.
Branch `feat/editorial-article-reading`. Audit eseguito prima delle modifiche
applicative, su build production, dopo `npm ci` riuscito.

## Audit iniziale

Inventario dei sette HTML renderizzati: `let/var/const` ha il maggior numero
di blocchi codice (14); Salesforce contiene 12 immagini tecniche e 9 liste;
`for/forEach` ha 8 blocchi codice, liste annidate, H2/H3 e una citazione.
Questi tre articoli coprono le strutture più rilevanti. Nessuna tabella,
didascalia semantica o inline code nell'inventario attuale; nessun syntax
highlighting attivo, soltanto blocchi monospace con classi di linguaggio.

Misure iniziali in [audit-measurements.json](editorial-article-reading/audit-measurements.json),
Chrome Windows, viewport alta 900 px, font esistenti caricati.

| Area | Riscontro reale | Priorità / proposta |
|---|---|---|
| Header | Cover → freccia isolata → titolo → data → testo. A 1280 titolo y=474,59, corpo y=618,59; cover 650×325. A 375 titolo y=305,09, corpo y=521,09–557,09. | Alta: titolo/data prima della cover, cover compatta, rimuovere il ritorno duplicato in alto. |
| Misura | Corpo 624 px desktop, 311 px a 375. Già limitato, non una riga eccessivamente lunga. | Conservare una misura contenuta, adattarla a 70ch del font proporzionale. |
| Font / colori | Corpo Source Code Pro 16/28, titolo 30/36; palette bianco/grigio/blu diversa da Home/About. | Media: riusare font e token editoriali; corpo 18 px, monospace per codice/data. È una scelta di coerenza, non una correzione di un contrasto già valido. |
| Paragrafi / liste / quote / link | Strutture già rese da typography; link sottolineati. Liste annidate e citazione presenti in for/forEach. | Conservare strutture e sottolineature, uniformare colori e ritmo. |
| Codice | 14/24 px; righe lunghe già scorrono localmente. Primo blocco for/forEach a 375: scrollWidth 517, clientWidth 311. Pre già focalizzabili e nominati. | Non inventare un difetto di overflow: preservare comportamento, portare il testo a 15/24 e mantenere font monospace e focus visibile. |
| H2/H3 | Gerarchia visiva esistente; alcuni post partono da H3 direttamente dopo H1. | Migliorare spaziature e scala visiva. Livelli editoriali storici rinviati, perché richiedono modifica Markdown. |
| Immagini Markdown | Pipeline riserva width/height, loading lazy e decoding async; link alle immagini tecniche presenti. | Conservare attributi, rapporto e accesso all'originale, verificare responsive. |
| Navigazione | Home/About già condivisi e accessibili; due ritorni Home, uno è soltanto una freccia sopra il titolo. | Conservare menu e ritorno testuale in fondo, eliminare duplicato superiore. |
| Dark | Variante già presente, palette precedente rispetto alle altre pagine. | Riutilizzare i token dark editoriali senza selettore o nuova logica. |

## Scelta e compromessi prima dell'implementazione

Intervento limitato a template articolo, ramo articolo del Layout e CSS dedicato.
Nessuna modifica ai contenuti o ai livelli dei titoli Markdown, alle date,
al routing o ai metadata. Riutilizzo di `editorial.module.css` tramite composition.
La cover passerà da 650 a massimo 360 px, sempre intera e in rapporto 2:1,
dopo titolo/data. Compromesso: meno spazio alla fotografia, più priorità al testo.
Width/height intrinseci 1024×512 e preload conservati; `sizes` sarà aggiornato
per evitare richieste sovradimensionate. Il testo proporzionale cambia gli
a capo, mentre il codice conserva spazi e scorrimento locale.

## Implementazione e risultati

Tre file applicativi: `pages/posts/[id].js`, il solo ramo articolo di
`components/Layout.js` e il nuovo `styles/article.module.css`.
Cover trasferita dal Layout all'header dell'articolo, dopo titolo e data.
Conservati source, alt/title, preload e dimensioni intrinseche; rapporto 2:1
senza crop. Ritorno testuale Home in fondo, con etichetta accessibile.
CSS composto dagli stili editoriali esistenti, senza modificarli. Corpo
18/30,6 px; H2 26/33,8, H3 22/29,7; codice 15/24 e data 14/22,4 monospace.
Larghezza massima 70ch (circa 647 px con Corbel su questa macchina).
Token di palette riutilizzati; soltanto il fondo dei pre è specifico del modulo.
Link sottolineati, quote e indicatori delle liste leggibili nei due temi.

| Larghezza | Titolo prima → dopo | Corpo let/var/const prima → dopo | Corpo Salesforce prima → dopo |
|---:|---:|---:|---:|
| 320 | 277,59 → 84 px | 549,59 → 403,17 px | 529,59 → 436,77 px |
| 375 | 305,09 → 84 px | 521,09 → 397,08 px | 557,09 → 430,67 px |
| 768 | 474,59 → 84 px | 618,59 → 416,11 px | 618,59 → 416,11 px |
| 1280 | 474,59 → 84 px | 618,59 → 423,98 px | 618,59 → 423,98 px |

Coordinate dalla cima del documento, font caricati. Dark uguale nelle misure.
Il corpo for/forEach segue let/var/const, salvo a 320 (529,59 → 403,17 px).
Su mobile il padding passa da 32 a 20 px come Home/About: la cover a 375
diventa 335×167,5, leggermente più grande di prima, ma il corpo anticipa comunque
di 124–126 px. Desktop cover 650×325 → 360×180. Nessuna immagine originale modificata.

## Test e regressioni

- `npm ci`: exit 0, 231 pacchetti installati, zero vulnerabilità segnalate.
- Build production prima/dopo: exit 0. `npm test`: **49 pass, 0 fail**.
  Estesi i controlli all'ordine titolo/data/cover, al singolo ritorno Home e al
  contrasto dei token editoriali light/dark effettivamente inclusi nella build.
  Test di contrasto testo ≥4,5:1 e focus sul codice ≥3:1 riusciti.
- Chrome headless Windows; viewport 320/375/768/1280 × 900, DPR 1;
  Puppeteer Core 25.18.1, axe-core 4.14.1 esterni alle dipendenze del sito.
  Font Google esistenti consentiti, attesa `document.fonts.ready`.
  Cookiebot/altri servizi esterni bloccati: non è un test del banner reale.
- **40 combinazioni per fase**: tre articoli e Home/About × quattro larghezze
  × due temi. Nessun overflow del documento o errore JavaScript.
  Zero violazioni axe selezionate (wcag2a/wcag2aa/wcag21aa/wcag22aa), prima/dopo.
  Skip link + Invio focalizza main, Tab/Shift+Tab e focus dei due link nav verificati.
- **16 verifiche aggiuntive** sui pre più lunghi dei due articoli con codice:
  font 15 px, white-space pre, focus visibile 3 px e scorrimento con ArrowRight
  quando necessario; nessun overflow della pagina. Tutte le 12 immagini Salesforce
  caricate scorrendo la pagina, proporzioni preservate. Attributi Markdown invariati.
- HTML interno Markdown dei tre articoli identico nei due temi e a ogni misura;
  metadata invariati nel confronto DOM. Suite HTTP/Markdown sui **sette post**,
  relative immagini, URL/404, SEO/canonical/OG, sitemap/robots e consenso riuscita.
- **16 confronti Home/About**: DOM del main e screenshot della prima viewport
  identici nei byte. Nessuna modifica ai loro sorgenti o CSS, né ai token condivisi.
- Navigazione client Home → let/var/const → About → Home → Salesforce → Home:
  CSS articolo caricato, indicazione pagina corrente coerente, nessun reload
  documento (sentinella su window), nessun errore JavaScript.

Evidenze: [risultati](editorial-article-reading/results.json),
[codice/immagini](editorial-article-reading/technical-checks.json),
[navigazione](editorial-article-reading/client-navigation.json).
Script e snapshot integrali conservati in `%TEMP%/pdn-reading-*`.
Warning noti Tailwind JIT e MODULE_TYPELESS_PACKAGE_JSON invariati.

## Screenshot prima/dopo

Prima viewport, stessa altezza 900 px e DPR 1. Le viste tecniche sono centrate
sul primo pre o sulla prima immagine, quindi non hanno lo stesso scroll numerico.
Revisionati visivamente header desktop/mobile, codice e immagini tecniche mobile,
focus e codice dark. Nessun elemento decorativo o controllo aggiunto.

| Articolo | Prima 375 | Dopo 375 | Prima 1280 | Dopo 1280 |
|---|---|---|---|---|
| let/var/const | [Prima](editorial-article-reading/before-differenza-let-var-const-javascript-375.png) | [Dopo](editorial-article-reading/after-differenza-let-var-const-javascript-375.png) | [Prima](editorial-article-reading/before-differenza-let-var-const-javascript-1280.png) | [Dopo](editorial-article-reading/after-differenza-let-var-const-javascript-1280.png) |
| Salesforce | [Prima](editorial-article-reading/before-salesforce-commerce-cloud-job-framework-375.png) | [Dopo](editorial-article-reading/after-salesforce-commerce-cloud-job-framework-375.png) | [Prima](editorial-article-reading/before-salesforce-commerce-cloud-job-framework-1280.png) | [Dopo](editorial-article-reading/after-salesforce-commerce-cloud-job-framework-1280.png) |
| for/forEach | [Prima](editorial-article-reading/before-differenza-for-loop-vs-foreach-javascript-375.png) | [Dopo](editorial-article-reading/after-differenza-for-loop-vs-foreach-javascript-375.png) | [Prima](editorial-article-reading/before-differenza-for-loop-vs-foreach-javascript-1280.png) | [Dopo](editorial-article-reading/after-differenza-for-loop-vs-foreach-javascript-1280.png) |

Ulteriori screenshot `*-technical-*.png` nella stessa cartella;
[codice lungo/focus light](editorial-article-reading/after-long-code-light-375.png) e
[dark](editorial-article-reading/after-long-code-dark-375.png).

## LCP / CLS locali

Tre navigazioni seriali per articolo/fase su production `127.0.0.1:3223`.
Chrome headless, 375×900 DPR 1, contesto browser nuovo per run, nessun throttling
rete/CPU. Optimizer server già riscaldato dalla stessa matrice prima di ogni
serie; nessun altro controllo browser della sessione durante la serie finale.
HTTPS esterni bloccati, compresi Google Fonts/CMP: il vecchio testo usa il
fallback, quello nuovo il font locale. Scenario diverso dalle verifiche visuali.
PerformanceObserver LCP/CLS, attesa networkidle più 500 ms, senza scroll/input.

| Articolo | LCP prima, ms (run 1/2/3) | LCP dopo, ms (run 1/2/3) | Mediana | CLS prima/dopo |
|---|---|---|---|---|
| let/var/const | 168 / 140 / 140 | 172 / 140 / 156 | 140 → 156 ms | 0 / 0 |
| Salesforce | 120 / 100 / 104 | 100 / 116 / 116 | 104 → 116 ms | 0 / 0 |

Non emerge un miglioramento LCP: differenze di 12–16 ms in un campione piccolo
non throttled su workstation condivisa. Il candidato di let/var/const passa
dalla cover al primo paragrafo. Conteggio resource entries invariato: 22 e 25;
transferSize delle risorse (escluso documento, inclusi headers e entries bloccate
a zero byte) 153449 → 152590 e 197923 → 197064 byte. Non si attribuisce il
risultato soltanto alla cover. CLS zero in questi run non garantisce zero in
produzione. Nessun Lighthouse, CrUX, RUM o INP raccolto; non sono metriche reali
degli utenti. Dati per run: [prima](editorial-article-reading/before-performance.json),
[dopo](editorial-article-reading/after-performance.json).

## Rinviati e limiti

- Correggere i livelli H3 iniziali richiede revisione Markdown: fuori scope.
- Tabelle, inline code e didascalie non presenti: nessuna funzionalità dedicata
  o fixture editoriale artificiale introdotta. Nessun nuovo syntax highlighting.
- Non verificati Safari/Firefox, dispositivi fisici, screen reader, zoom nativo,
  font su altri sistemi e CMP sul dominio autorizzato. I controlli automatici
  non certificano conformità WCAG o maggiore velocità di lettura.

Markdown, date, routing, SEO, sitemap/robots, Cookiebot/GA4, asset originali,
manifest e lockfile invariati. Nessun ampliamento architetturale, merge o deploy.
