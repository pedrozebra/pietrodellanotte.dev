# Audit immagini e performance

19 novembre 2026. Base `origin/main` `9882957`, dopo merge PR #30.
Branch `perf/image-optimization`. Pages Router, Next 16.4.6, React 19.3.1.

## Audit prima delle modifiche

Letti AGENTS.md, audit SEO/performance, accessibilità, audit tecnico,
migrazione Next/React, sitemap e consenso. Consultata la documentazione
installata Next per Image, inclusi sizes, preload e dimensioni intrinseche.
Inventario ottenuto con sharp già transitivo di Next; peso in byte originali.
Home mostra solo profile.jpg a 144 px; About non mostra immagini (il profilo
è usato nei metadata social). Ogni articolo mostra la propria cover.

| File sotto public/images | Dimensioni | Formato | Byte |
|---|---:|---|---:|
| profile.jpg | 1658×2211 | JPEG | 786419 |
| posts/destrutturazione-di-array-in-php-spiegata-semplice/cover.png | 1024×512 | PNG | 649739 |
| posts/differenza-for-loop-vs-foreach-javascript/cover.png | 1024×512 | PNG | 977408 |
| posts/differenza-let-var-const-javascript/cover.png | 1024×512 | PNG | 317826 |
| posts/il-mio-miglior-snippet-di-codice-in-assoluto/cover.png | 1024×512 | PNG | 816821 |
| posts/lavoro-da-remoto-pro-e-contro/cover.png | 1024×512 | PNG | 656421 |
| posts/salesforce-commerce-cloud-job-framework/cover.png | 1024×512 | PNG | 701563 |
| posts/versioni-differenti-nodejs-su-windows/cover.png | 1024×512 | PNG | 53883 |
| posts/il-mio-miglior-snippet-di-codice-in-assoluto/diegoluna.png | 300×468 | PNG | 67895 |
| posts/salesforce-commerce-cloud-job-framework/exitstatusrule.png | 481×182 | PNG | 14483 |
| posts/salesforce-commerce-cloud-job-framework/failurehandling.png | 758×225 | PNG | 14801 |
| posts/salesforce-commerce-cloud-job-framework/icon1.png | 58×34 | PNG | 525 |
| posts/salesforce-commerce-cloud-job-framework/icon2.png | 52×33 | PNG | 677 |
| posts/salesforce-commerce-cloud-job-framework/icon3.png | 38×22 | PNG | 498 |
| posts/salesforce-commerce-cloud-job-framework/newjob.png | 428×451 | PNG | 11981 |
| posts/salesforce-commerce-cloud-job-framework/notification.png | 1207×397 | PNG | 17178 |
| posts/salesforce-commerce-cloud-job-framework/operations-job.png | 155×74 | PNG | 1436 |
| posts/salesforce-commerce-cloud-job-framework/schedulehistory.png | 951×519 | PNG | 23577 |
| posts/salesforce-commerce-cloud-job-framework/sfcc-job-framework.png | 898×429 | PNG | 21745 |
| posts/salesforce-commerce-cloud-job-framework/step-job.png | 489×787 | PNG | 35185 |
| posts/salesforce-commerce-cloud-job-framework/steptypes.png | 620×910 | PNG | 65167 |

Asset accessori in public: android-chrome-192x192.png (192², 6102 byte),
android-chrome-512x512.png (512², 23628), apple-touch-icon.png (180², 7212),
favicon-16x16.png (16², 422), favicon-32x32.png (32², 889), favicon.ico
(34494 byte, ICO con frame 16²/24²/32²/48²/64², invariato).
Non sono immagini editoriali né candidati LCP. Nessun asset editoriale remoto.

### Problemi e priorità

- P1: tutte le cover hanno rapporto reale 2:1 ma attributi 650×300 e aspect-ratio
  CSS 650/300. La deformazione e la riserva di spazio sono incoerenti.
- P1: tredici immagini Markdown senza width/height: lo spazio dipende dal download,
  con rischio CLS. Nessun loading lazy: tutti gli originali sono richiesti anche
  molto sotto la piega. Sono 12 PNG Salesforce (207253 byte) e un PNG Snippet.
- P2: cover next/image senza sizes: srcset a densità fissa poco adatto al mobile.
  Il profilo ha già sizes 144px e proporzioni corrette. Le sorgenti pesanti sono
  già servite dall'optimizer Next, non necessariamente trasferite integralmente.
- Tutte le cover e il profilo hanno preload, una sola immagine per pagina.
  Non ci sono preload delle immagini Markdown né duplicati espliciti nel codice.
- I PNG Markdown sono screenshot di interfacce/testo e icone, 498–67895 byte.
  Alcuni superano il contenitore prose (65ch), ma max-width:100% di Tailwind
  limita il rendering. Non è dimostrata la necessità di ricompressione lossy.

Il loader converte Markdown con remark-html (sanitizzazione predefinita),
remark-images e heading-id, poi aggiunge attributi costanti ai pre per la tastiera.
Le immagini sono link agli originali con URL relativi storici ../images/posts/….
Preservare link, alt, testo, anchor e sanitizzazione è requisito dell'intervento.

### Ipotesi LCP e piano circoscritto

Prima delle misure di questa PR: le cover sopra la piega sono probabili LCP
negli articoli; Home può avere testo o profilo; About testo. Il banner CMP può
diventare LCP in produzione, come nell'audit precedente. Non sono misure attuali.

Correggere il rapporto cover, mantenere larghezza massima 650 px e fornire sizes
coerente con padding laterale 32 px. Conservare preload della singola hero.
Aggiungere dimensioni PNG locali e loading lazy/decoding async ai soli img
Markdown riconosciuti dopo sanitizzazione, senza JavaScript client o dipendenze.
Mantenere PNG originali per screenshot e icone: la compressione lossy potrebbe
ridurre la leggibilità; il trasferimento totale è già contenuto. Nessuna nuova
conversione automatica, nessuna sostituzione degli originali. Verificare la
maggiore altezza cover desktop (325 invece di 300 px) e la stabilità del layout.

## Modifiche applicate

- `components/Layout.js`: cover next/image 1024×512, width CSS 650 px,
  max-width 100%, height auto. Sizes `(max-width: 713px) calc(100vw - 64px),
  650px` corrisponde al contenitore con 32 px di padding per lato. Eliminato
  l'aspect-ratio deformante. A 714 px lo spazio utile raggiunge 650 px.
- `lib/markdown-images.js` e `lib/posts.js`: dopo sanitizzazione, arricchimento
  dei soli img con percorso locale PNG editoriale riconosciuto. Dimensioni lette
  da firma PNG/IHDR durante SSG, loading lazy e decoding async. Nessun accesso
  a URL remoti, percorso arbitrario o filesystem dal client. PNG locale mancante
  o intestazione invalida interrompono esplicitamente la build; formati e percorsi
  non riconosciuti rimangono invariati. Nessuna nuova dipendenza.
- Le 13 immagini del corpo sono sotto la prima viewport nei campioni a 900 px
  di altezza. Il lazy loading nativo può comunque caricare quelle vicine alla
  viewport: non si promette che tutte attendano uno scroll effettivo.
- Nessun srcset aggiunto ai PNG del corpo: i quattro screenshot più larghi di
  650 px pesano ciascuno 14–24 kB e l'intero gruppo Salesforce pesa circa
  207 kB; servire gli originali
  preserva testo e icone senza varianti lossy o una pipeline di asset aggiuntiva.
  Le immagini rimangono responsive tramite max-width:100%/height:auto esistenti.
- Preload mantenuto esclusivamente per profilo Home e cover articolo, una sola
  immagine per pagina. Nessun priority deprecato, nessun lazy sulla hero.
  Quality 75 e negoziazione del formato dell'optimizer Next restano quelli
  preesistenti. Gli originali non sono modificati né eliminati e restano linkabili.
- Test Markdown e HTTP confrontano ancora le fixture editoriali originali,
  ignorando soltanto i nuovi attributi previsti. Controllano le dimensioni lette,
  la geometria cover, l'assenza di lazy sulla hero, sicurezza e sorgenti escluse.

## Metodo prima/dopo

Windows, Node 24.22.3, npm 11.19.1, Chrome headless 157.0.8103.78,
Lighthouse CLI 13.6.0 e Puppeteer Core 25.18.1. Strumenti browser presenti
in directory temporanee, nessuna modifica a manifest o lockfile.
Build production Webpack servite su `http://127.0.0.1:3218`, sulla stessa
macchina. Esecuzioni seriali, profilo Chrome nuovo per ciascun run Lighthouse,
storage reset attivo, cache optimizer riscaldata prima di entrambe le serie
tramite la stessa matrice viewport. CPU/rete della workstation non isolate.

Entrambe le serie bloccano `https://*`: font esterni, Cookiebot e Analytics
esclusi. Quindi font di fallback e nessun banner CMP, nessuna interazione
consenso. Questa scelta isola il delivery locale delle immagini; i numeri non
sono confrontabili con l'audit precedente su Vercel e non rappresentano
direttamente l'esperienza production. La build legge `.env.local` già esistente,
senza copiarlo né modificarlo o riportarne valori.

Mobile Lighthouse: 412×823, DPR 1,75, RTT 150 ms, throughput 1638,4 Kbps,
CPU 4×. Desktop: 1350×940, DPR 1, RTT 40 ms, throughput 10240 Kbps, CPU 1×.
Throttling simulate. Tre run per ciascun articolo campione su mobile, uno per
le altre coppie pagina/dispositivo: 12 prima e 12 dopo. I trasferimenti sono
byte di rete misurati nelle navigazioni, LCP è il risultato simulato Lighthouse.
Le richieste totali includono anche quelle esterne tentate e bloccate.

Comando di riferimento (strumento temporaneo, CHROME_PATH impostato):

```sh
lighthouse http://127.0.0.1:3218/posts/salesforce-commerce-cloud-job-framework \
  --chrome-flags="--headless=new --disable-gpu --no-first-run" \
  --only-categories=performance --blocked-url-patterns="https://*" \
  --output=json --output-path=salesforce-mobile.json --quiet
```

Desktop aggiunge `--preset=desktop`. I JSON Lighthouse integrali, screenshot,
script e risultati viewport sono nella directory temporanea locale
`C:/Users/pdell/AppData/Local/Temp/pdn-image-perf/{before,after}`.
Le tabelle seguenti conservano i risultati essenziali nel repository.

## Confronto prima/dopo

Misure del 19 novembre, prima 11:41:14–11:43:23 e dopo 11:45:08–11:47:16
Europe/Rome (timestamp di avvio run). Dati per singola esecuzione e richieste
immagine in [image-performance-results.json](image-performance-results.json).
I valori con N=3 sono mediane indipendenti per metrica; gli altri sono singoli
campioni. Byte in base 10; LCP in secondi. Tutti i 24 run senza runWarnings.

| Pagina / dispositivo | N per fase | Performance prima→dopo | LCP prima→dopo | CLS prima→dopo | Byte immagini prima→dopo | Richieste immagini prima→dopo | Richieste totali prima→dopo |
|---|---:|---|---|---|---:|---|---|
| Home mobile | 1 | 98→99 | 2,155→2,113 | 0→0 | 3612→3612 | 1→1 | 28→28 |
| Home desktop | 1 | 100→100 | 0,490→0,492 | 0→0 | 3612→3612 | 1→1 | 29→29 |
| About mobile | 1 | 100→100 | 1,537→1,536 | 0→0 | 0→0 | 0→0 | 20→20 |
| About desktop | 1 | 100→100 | 0,439→0,437 | 0→0 | 0→0 | 0→0 | 20→20 |
| for/forEach mobile | 3 | 97→98 | 2,411→2,183 | 0→0 | 64207→31925 | 1→1 | 22→22 |
| for/forEach desktop | 1 | 100→100 | 0,510→0,507 | 0→0 | 40935→40935 | 1→1 | 22→22 |
| Salesforce mobile | 3 | 94→97 | 3,014→2,483 | 0→0 | 252417→110796 | 13→6 | 34→27 |
| Salesforce desktop | 1 | 100→100 | 0,613→0,528 | 0→0 | 240707→116326 | 13→6 | 34→27 |

LCP mobile for/forEach per run: prima 2,564 / 2,411 / 2,257 s;
dopo 2,258 / 2,183 / 2,181 s. Salesforce: prima 3,086 / 3,014 / 3,012 s;
dopo 2,559 / 2,482 / 2,483 s. Riduzione mediana osservata circa 228 ms e
530 ms, rispettivamente. Non è una garanzia sull'esperienza degli utenti:
il campione è piccolo e la workstation condivisa. Le piccole oscillazioni
Home/About, senza variazioni nei byte immagine, sono compatibili con rumore.

Le immagini iniziali Salesforce mobile scendono di circa **56,1%** in byte e
sette richieste; for/forEach mobile di **50,3%**. La cover mobile Lighthouse ora
seleziona w=640 invece di w=1920 (la sorgente resta 1024 px, senza upscaling).
Desktop seleziona ancora w=750. Il numero di richieste cover rimane uno,
senza download duplicato fra preload e img. Il lazy loading differisce sette
PNG Salesforce; cinque PNG vicini vengono comunque richiesti, oltre alla cover.
Scorrendo l'articolo si scaricano anche le immagini differite: il risparmio
misurato riguarda la navigazione iniziale, non una lettura completa.

LCP **effettivamente identificato nei trace**, prima e dopo e in entrambi i
dispositivi: profilo su Home, primo paragrafo su About, cover nei due articoli.
Questo supporta il mantenimento del preload selettivo. Le altre cinque pagine
articolo non hanno una misura Lighthouse: cover come LCP rimane un'ipotesi,
supportata dalla struttura comune, non un risultato esteso automaticamente.

### Viewport e revisione visuale

Puppeteer, DPR 1, altezza 900 px, tutte le nove pagine alle larghezze richieste:
36 combinazioni prima e 36 dopo. Cache browser nuova per pagina. Nessun overflow
orizzontale di documento, immagine rotta o CLS osservato in entrambe le serie,
anche dopo scroll e decodifica di tutte le immagini. Dopo, tutte le proporzioni
rispettano l'originale entro 1 px di arrotondamento; prima le sette cover erano
deformate in tutte le quattro larghezze (28 casi).

| Viewport | Cover renderizzata prima→dopo | currentSrc w prima→dopo (DPR 1) |
|---:|---|---|
| 320 px | 256×118→256×128 | 750→256 |
| 375 px | 311×144→311×156 | 750→384 |
| 768 px | 650×300→650×325 | 750→750 |
| 1280 px | 650×300→650×325 | 750→750 |

Controllati visivamente i comparativi Salesforce, prima a sinistra e dopo a
destra: [cover 375 px](image-performance-screenshots/covers-375.png),
[cover 1280 px](image-performance-screenshots/covers-1280.png),
[screenshot Markdown 1280 px](image-performance-screenshots/markdown-1280.png).
Cover più alte secondo il rapporto reale, nessun ritaglio nuovo o degrado
visivo evidente nel campione; screenshot con la stessa resa. Gli spostamenti
verticali statici di 12 px a 375 e 25 px desktop sono intenzionali, non CLS.
Nessuna valutazione percettiva esaustiva su display ad alta densità.

Con download immagini bloccati a 375 px, tutte le 13 immagini Markdown hanno
naturalWidth=0 ma un box già riservato positivo: ad esempio sfcc-job-framework
148,56 px di altezza e diegoluna 468 px. Questo verifica la riserva indipendente
dalla velocità di arrivo dei file, senza inventare un guadagno CLS misurato.

## Verifiche di regressione

- `npm ci`: exit 0, 231 pacchetti installati; npm riporta zero vulnerabilità
  in questa esecuzione, senza cambiare il lockfile. I finding storici nei report
  precedenti non sono una misura dell'attuale risposta del registry.
- `npm run build`: exit 0 prima e dopo, Home/About e sette articoli statici/SSG.
- `npm test`: **46 pass, 0 fail**, incluso nuovo caso su immagini escluse/PNG
  invalido, metadata/canonical di tutte le nove pagine, sitemap/robots, route
  storiche/404, rendering editoriale, sanitizzazione, contrasto/focus/skip link,
  blocchi codice e suite di consenso Analytics.
- Diff nullo per Markdown e fixture editoriali, public (incluse immagini,
  sitemap e robots), metadata SEO, pagine, CSS, Cookiebot/Analytics, configurazioni
  e dipendenze. Nessun nuovo campo frontmatter, URL o contenuto modificato.
- Warning preesistenti MODULE_TYPELESS_PACKAGE_JSON e Tailwind JIT invariati.
- Chrome/axe-core 4.14.1: 18 scansioni, nove pagine nei due temi, zero violazioni
  rilevate sui tag wcag2a/wcag2aa/wcag21aa/wcag22aa. Tab e Invio sullo skip link
  verificati nelle nove pagine, outline 3 px e focus su main preservati.
  È una regressione automatizzata circoscritta, non una certificazione WCAG.

## Rischi residui e interventi futuri

Queste sono misure di laboratorio, **non Core Web Vitals reali**. Nessun dato
CrUX/RUM o INP raccolto. CLS zero nella baseline locale non dimostra che gli img
senza dimensioni siano stabili con rete lenta: la modifica elimina la mancanza
di spazio riservato, senza attribuirle un miglioramento numerico non osservato.

Restano da verificare hosting/CDN Vercel, prima richiesta optimizer a cache
fredda, CMP reale e font remoto, dispositivi fisici, Safari/Firefox e screen
reader. Nessuna certificazione di accessibilità né verifica completa del
pannello consenso. Il comportamento CMP/GA4 è protetto dalla suite applicativa
e dai sorgenti invariati, ma richiede una prova production separata.

Il piccolo helper copre i PNG locali presenti, non è un parser generale HTML
o un decoder completo di immagini. Per futuri JPEG/WebP/asset remoti estendere
la lettura dimensioni con test dedicati; non introdurre lazy su una futura
immagine Markdown spostata sopra la piega senza rivalutare LCP. Tutte le cover
attuali condividono 1024×512: i test segnalano asset futuri con geometria diversa.
Gli alt generici esistenti richiedono revisione editoriale separata.
Eventuali conversioni lossy o nuovi formati vanno campionati visivamente prima
di sostituire sorgenti; font/prefetch e CMP rimangono interventi distinti.
Nessun merge o deploy eseguito.

## Rifinitura dopo code review della PR #31

Il riconoscimento di `src` ora consuma gli attributi completi, inclusi i valori
tra virgolette, e seleziona il solo nome esatto `src`. Non interpreta `data-src`
né una sequenza `src=…` nel testo di `alt` come sorgente. La selezione del percorso
PNG locale rimane ancorata all'intero valore; percorsi remoti, traversal o formati
non supportati restano invariati. Sanitizzazione e attributi editoriali intatti.
I nuovi casi coprono src assente/autentico, data-src da solo e insieme a src,
ordine degli attributi, spazi/newline e valori contenenti una falsa sorgente.

La lettura è limitata ai primi 24 byte (firma PNG, tipo IHDR, width e height),
anziché allocare l'intero file. Le API fs native richiedono soltanto apertura,
lettura e chiusura in finally, anche in caso di errore: un costo circoscritto
di codice per rendere I/O e buffer indipendenti dal peso dell'immagine. Nessun
benchmark o guadagno LCP attribuito a questo cambiamento durante SSG.
Restano gli errori espliciti per PNG locali con intestazione invalida o dimensioni
nulle; aggiunti casi di intestazione troncata e larghezza zero.

Lighthouse non ripetuto: questa rifinitura non cambia gli asset serviti,
le dimensioni, i sizes, il preload, il lazy loading o la decodifica delle immagini
esistenti. Il confronto prestazionale precedente resta riferito alla prima
implementazione; la preservazione dell'output viene verificata separatamente.

Verifiche della rifinitura: `npm ci` exit 0 (231 pacchetti, zero vulnerabilità
segnalate), `npm run build` exit 0, `npm test` **48 pass, 0 fail**. Un confronto
integrale dei sette oggetti restituiti da getPostData prima/dopo la review
conferma output HTML Markdown e metadata esattamente identici, senza rimuovere
attributi dal confronto. La suite HTTP verifica nuovamente immagini originali
e ottimizzate, metadata, canonical e route. Diff nullo per asset, contenuti,
fixture, componenti, CSS, dipendenze, sitemap/robots e consenso; modificati
soltanto helper, test Markdown e questa nota. Nessun merge o deploy.
