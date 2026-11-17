# Audit SEO, performance e accessibilità

Data 17 novembre 2026. Repository pedrozebra/pietrodellanotte.dev.
Dominio esaminato https://www.pietrodellanotte.dev.
Questo lavoro pubblica esclusivamente il report. Le correzioni proposte
richiedono approvazione prima dell'implementazione.

## Executive summary

Il sito restituisce contenuti statici leggibili senza dipendere dal consenso
Analytics. Le nove pagine principali rispondono 200, i due URL inesistenti
provati restituiscono 404, HTTPS e dominio www sono consolidati con redirect
308. I sette articoli hanno canonical coerenti e tutte le pagine hanno titolo,
una sola description e lang it. Non emerge un blocco P0 dell'indicizzabilità.

Le priorità sono completare canonical/description di Home e About, correggere
la sitemap, contrasto e riconoscibilità dei link, semantica degli heading e
geometria delle cover. Le immagini Markdown richiedono dimensioni e caricamento
appropriati. Font e CMP compaiono nella catena render-blocking misurata.

Sono state eseguite 12 misure Lighthouse production con Chrome headless.
La Home mobile ha Performance mediano 90 e LCP mediano 3,338 s. I due articoli
campionati hanno LCP mobile di 3,544 s e 2,925 s. Le misure desktop sono migliori.
Questi dati sono di laboratorio. INP e dati CrUX non sono disponibili.
I punteggi SEO 100 non rilevano diversi difetti confermati dal controllo manuale
del markup e non dimostrano completezza SEO. I punteggi Accessibility non
certificano conformità WCAG o navigazione da tastiera.

La proposta conserva Next.js 16, Pages Router, JavaScript, Markdown e SSG.
Non richiede nuovi servizi o migrazioni di framework.

## Baseline tecnica e perimetro

- Main locale e origin/main allineati dopo git fetch origin al commit
  `a152dd6e5f150876c15706eb90ae6e5b36544c24`.
- Branch `docs/seo-performance-audit` creato da origin/main, working tree
  iniziale pulito. I riferimenti a file e righe sono relativi a quel commit.
- Next 16.4.6, React/React DOM 19.3.1, PostCSS 8.5.33, Tailwind 2.2.19,
  Autoprefixer 10.4.4. Node locale 24.22.3 e npm 11.19.1.
- Hosting dichiarato Vercel/Node 24, risposte HTTP con server Vercel.
  Il commit del deployment non è stato associato tramite il pannello Vercel.
  Il build ID pubblico osservato è `arbI9qxH_7F5Ab1yyMlOH`.
- Esaminati AGENTS.md, roadmap e technical-audit, tutte le pagine e componenti,
  lib/posts e lib/ga, helpers/config, CSS, Tailwind/PostCSS, public e test.
  Nessun next.config applicativo individuato, sono usati i default Next.
- Il technical-audit precedente descriveva Next 12 e l'integrazione consenso
  precedente. Quei rilievi storici non sono considerati automaticamente attuali.
- Localmente npm ci, npm run build e npm test sono riusciti su archivio del
  commit in una directory temporanea senza .env.local. Suite con 29 successi
  e 0 fallimenti. Il repository non ha modifiche applicative o alle dipendenze.
- Durante ci restano 7 segnalazioni High già oggetto dell'eccezione picomatch.
  Questo report non riapre la remediation delle dipendenze né applica upgrade.

## Metodo e limiti

### Controlli HTTP e repository

Un crawler di audit in Node ha richiesto Home, About e tutti i sette articoli,
estratto heading, metadata, immagini e link dall'HTML ricevuto e verificato
30 destinazioni interne distinte, comprese immagini ottimizzate e originali.
Sono controllati anche i frammenti incontrati. Nessun link interno rotto nel
campione. I link esterni non sono stati sottoposti a una verifica sistematica.

Sono stati confrontati robots e sitemap pubblici con i file versionati,
controllati redirect, header di cache e due 404. Le risposte production sono
state acquisite durante questa sessione. Search Console, stato effettivo
dell'indice, log Googlebot e pannelli Vercel/Cookiebot/GA4 non sono accessibili
in questo audit. Idoneità tecnica al crawling e presenza nell'indice restano
verifiche distinte.

### Misure Lighthouse

- Lighthouse CLI **13.6.0**, eseguito come strumento temporaneo tramite npm exec,
  senza aggiungerlo al manifest o al lockfile.
- Chrome **157.0.8103.78** headless su Windows, Node 24.22.3.
- Esecuzioni seriali, profilo Chrome nuovo, reset storage predefinito,
  nessuna interazione con il banner, nessuna autorizzazione Analytics concessa.
- Mobile simulato 412×823, DPR 1,75, RTT 150 ms, throughput 1.638,4 Kbps,
  rallentamento CPU 4×. Desktop preset 1350×940, DPR 1, RTT 40 ms,
  throughput 10.240 Kbps, CPU 1×. Throttling method simulate.
- Tre esecuzioni Home per dispositivo, un'esecuzione per ciascun'altra coppia
  pagina/dispositivo. Intervallo 21:20:16–21:23:44 Europe/Rome,
  equivalente a 20:20:16–20:23:44 UTC del 17 novembre 2026.
- Workstation condivisa, senza isolamento esclusivo di CPU/rete. Cache browser
  ripristinata, cache CDN non svuotata. Risultati sensibili a edge, rete e CMP.
  La prima misura Home si sovrapponeva al crawler HTTP leggero dell'audit.
- JSON grezzi e screenshot conservati nella directory temporanea di sessione
  `pdn-seo-audit-1fdea0f5d495446e8f7bf11367cbd6df`, esclusa dal repository.
  I risultati essenziali sono trascritti qui perché il deliverable è un solo file.

Comando di riferimento mobile, da eseguire fuori dal repository con un percorso
di output temporaneo e CHROME_PATH impostato sul proprio Chrome.

```sh
npm exec --yes --package=lighthouse@13.6.0 -- lighthouse \
  https://www.pietrodellanotte.dev/ \
  --chrome-flags="--headless=new --disable-gpu --no-first-run" \
  --only-categories=performance,accessibility,best-practices,seo \
  --output=json --output-path=home-mobile.json --quiet
```

Per desktop aggiungere `--preset=desktop`. Ripetere tre volte e conservare
configSettings, fetchTime, versione Chrome e risultati per singolo run.
Ripetere la stessa matrice per valutare modifiche future, includendo anche
uno scenario con banner già gestito, da distinguere dalla prima visita.

### Field data e verifiche interattive

L'API PageSpeed Insights senza chiave ha restituito HTTP 429, quota giornaliera
esaurita. Non sono disponibili CrUX o valutazioni CWV sul campo. Non si deduce
da questo errore che il sito abbia traffico insufficiente per CrUX.

INP non è misurato dalle navigazioni Lighthouse prive di interazioni. La tabella
riporta TBT di laboratorio. Per INP servono field data o un percorso interattivo
appropriato. Il browser interattivo connesso restituisce
`The browser access host is unavailable`, mentre Chrome headless Lighthouse
funziona. Tastiera, focus, zoom, dark mode e consenso dopo interazione rimangono
manuali. [Google, metriche sul campo e laboratorio](https://web.dev/articles/vitals).

## Technical SEO

### URL, crawling e sitemap

| Controllo pubblico | Esito osservato |
|---|---|
| HTTP apice | 308 verso HTTPS apice, poi 308 verso HTTPS www, quindi 200 |
| HTTPS apice | 308 verso HTTPS www, quindi 200 |
| HTTP www | 308 verso HTTPS www, quindi 200 |
| HTTPS apice /about | 308 verso HTTPS www /about |
| /about/ | 308 verso /about |
| Home, About e sette articoli | 200 |
| Due URL inesistenti | 404 |
| robots.txt | 200, Allow / e riferimento alla sitemap www |
| sitemap.xml | 200, XML con sette URL articolo sul dominio apice |
| Lang | it nelle nove pagine |
| Meta robots e X-Robots-Tag delle nove pagine | Nessun noindex osservato |

Il dominio preferito osservabile è www. Il redirect apice è già corretto.
La doppia transizione da HTTP apice è un'ottimizzazione P3 eventuale, senza
necessità di cambiare ora le impostazioni hosting.

La sitemap omette Home e About. Tutti i sette articoli sono presenti, ma ogni
URL usa l'apice e richiede un redirect prima di raggiungere il canonical www.
robots e sitemap pubblici coincidono con i file versionati. I canonical dei
sette post corrispondono al filename Markdown, al frontmatter e all'URL pubblico.

È possibile generare staticamente la sitemap durante la build usando lo stesso
inventario validato dei Markdown e le due pagine statiche, senza database o
servizio esterno. Occorrono XML escaping, URL assoluti, deduplicazione e test
di completezza. Preferire un unico dominio condiviso con i metadata.
[Google, canonical coerenti](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls).

Le date lastmod divergono dalla data pubblicata per almeno tre articoli,
inclusi let/var/const, Node Windows e destrutturazione PHP. Una modifica successiva
alla pubblicazione è possibile, quindi la divergenza non prova una data falsa.
Nel repository manca però una fonte editoriale aggiornata che spieghi quei
valori. Omettere lastmod quando non è attendibile. Non usare automaticamente
data del deploy o mtime della copia di build.
[Google, sitemap e lastmod](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap).

### Metadata e structured data

| Elemento | Home/About | Sette articoli |
|---|---|---|
| Title | Presenti e distinti | Presenti e distinti |
| Description | Una per pagina, stesso testo su entrambe | Una per pagina, distinta per articolo |
| Canonical | Assente | Autoreferenziale assoluto www |
| Open Graph | Assente | Presente, type website |
| Twitter Card | Assente | Presente, summary |
| JSON-LD | Assente | Assente |
| Heading principale | Home ha H1, About senza heading | Un H1 per articolo |

Il meta description del Layout è sostituito da next/head nei post. Non sono
state confermate description duplicate nella stessa pagina. Due description
contengono invece l'entità letterale `&#039;`, già codificata nel Markdown e
nuovamente escapata da React. Il problema si estende a OG/Twitter derivati.

Per gli articoli il tipo OG article è semanticamente più appropriato di website.
Una Twitter Card più grande può essere valutata editorialmente; summary è
già un valore valido. Evitare account social non presenti o non confermati.

JSON-LD è un'ottimizzazione P2, senza evidenza che la sua assenza impedisca
l'indicizzazione. Si possono collegare WebSite, Person e BlogPosting con @id
stabili usando soltanto nome, sito, profili pubblici effettivamente verificati,
titolo, immagine e descrizione esistenti. About può ospitare Person ed
eventualmente ProfilePage se aderente al contenuto. Non inventare qualifiche,
organizzazioni, premi, indirizzi, statistiche o logo editoriale.

Per datePublished verificare la data editoriale esistente e l'eventuale ora con
fuso, senza dedurre una data da Git. dateModified resta assente finché non c'è
un campo affidabile. Serializzare JSON-LD in modo sicuro anche rispetto a
`</script>`, senza indebolire la sanitizzazione Markdown.
[Google, Article e BlogPosting](https://developers.google.com/search/docs/appearance/structured-data/article),
[Google, profilo autore](https://developers.google.com/search/docs/appearance/structured-data/profile-page).

## Problemi confermati con riferimenti

P1 indica intervento prioritario, P2 miglioramento pianificabile e P3 rifinitura.
S/M indicano impegno relativo contenuto/medio, senza costituire una stima certa.
L'impatto atteso è qualitativo, nessun incremento di ranking o punteggio è promesso.

| ID | Problema ed evidenza | File e righe | Priorità | Impatto atteso, complessità e rischio |
|---|---|---|---|---|
| SEO-01 | Canonical assenti Home/About e description condivisa, confermati nell'HTML production | pages/index.js:21, pages/about.js:7, components/Layout.js:18, helpers/config.js:1 | P1 | Segnali URL e snippet più coerenti. S. Evitare doppioni e variazioni dei canonical post |
| SEO-02 | Sitemap di sette URL apice, Home/About assenti, lastmod non alimentato da fonte editoriale | public/sitemap.xml:4, public/sitemap.xml:29, public/robots.txt:5 | P1 | Inventario completo di nove URL canonici. S/M. Evitare date inventate e rotture della build |
| A11Y-01 | Link prose con contrasto 3,67:1 su bianco rilevato da axe/Lighthouse; About link senza sottolineatura, contrasto col testo circostante 2,82:1 | tailwind.config.js:14, styles/global.css:18, pages/about.js:12 | P1 | Leggibilità e riconoscibilità. S. Controllare hover, focus e tema scuro |
| A11Y-02 | About senza H1; freccia Home dentro H2 prima del titolo articolo; quattro post iniziano sezioni a H3 dopo H1 | pages/about.js:10, components/Layout.js:57, posts/destrutturazione-di-array-in-php-spiegata-semplice.md:9, posts/differenza-let-var-const-javascript.md:12 | P1 | Struttura più comprensibile. S/M. Conservare gli ID degli anchor pubblici e distinguere modifiche editoriali |
| IMG-01 | Cover naturali 1024×512 mostrate 650×300; Lighthouse conferma rapporto 2,17 rispetto a 2,00 in entrambi i post campione | components/Layout.js:51 | P1 | Eliminare deformazione e dimensionare correttamente. S. Altezza desktop naturale diventerebbe 325 px, quindi verificare composizione |
| IMG-02 | Immagini Markdown senza width/height, lazy loading o srcset; 12 screenshot Salesforce con alt generico ripetuto | lib/posts.js:59, posts/salesforce-commerce-cloud-job-framework.md:30, posts/salesforce-commerce-cloud-job-framework.md:116, posts/il-mio-miglior-snippet-di-codice-in-assoluto.md:21 | P1 | Stabilità del layout, trasferimenti e descrizioni migliori. M. Evitare lazy loading dell'immagine LCP e preservare URL legacy |
| PERF-01 | CMP sincrona render-blocking e LCP Home mobile identificato nel testo banner nel primo run | pages/_document.js:29 | P1 per verifica, eventuale modifica dopo approvazione | Misurare separatamente banner e contenuto. M. Differire CMP potrebbe compromettere Automatic Blocking |
| PERF-02 | Google Fonts via CSS @import e fallback font non esplicito; richiesta presente nella catena critica Lighthouse | styles/global.css:1, tailwind.config.js:69 | P2 | Accorciare dipendenze e stabilizzare font. S/M. Verificare licenza, pesi e resa prima di self-hosting |
| SEO-03 | Entità HTML letterali in due description, propagate ai metadata social | posts/destrutturazione-di-array-in-php-spiegata-semplice.md:4, posts/differenza-let-var-const-javascript.md:4, pages/posts/[id].js:24 | P2 | Testo metadata corretto. S. Aggiornare intenzionalmente solo le fixture interessate |
| SEO-04 | OG/Twitter assenti sulle pagine statiche, OG type website sui post, nessun JSON-LD | pages/posts/[id].js:26, pages/index.js:21, pages/about.js:7 | P2 | Anteprime e descrizione delle entità più complete. M. Nessun dato editoriale o personale inventato |
| PERF-03 | Prefetch Link di pagine e JSON visibili nelle richieste Home; framework e CMP hanno codice inutilizzato nella navigazione misurata | pages/index.js:38, components/Navigation.js:7, pages/_app.js:1 | P2 | Valutare trasferimenti iniziali con trade-off sulla navigazione. M. Non eliminare runtime sulla base della sola coverage |
| A11Y-03 | Alt cover uguale allo slug; testo della freccia poco descrittivo; link About chiamati Questa/Questo | components/Layout.js:54, components/Layout.js:63, pages/about.js:20 | P2 | Nomi e descrizioni contestuali. S. Evitare duplicazioni verbose e alt inventati |
| QA-01 | I test preservano metadata esistenti, ma non controllano completezza sitemap, canonical Home/About o JSON-LD | tests/http.test.cjs:54, tests/http.test.cjs:90, tests/markdown.test.cjs:32 | P2 | Prevenire regressioni mirate. S/M. Non rigenerare fixture per nascondere errori |

I primi dieci ID della tabella costituiscono le dieci criticità/opportunità
prioritarie del report. Nessun P0 confermato. Robots che bloccasse il sito,
noindex accidentale o pagine primarie non raggiungibili richiederebbero un
intervento urgente, ma non sono stati osservati in questa verifica.

## Performance misurata

Home riporta la mediana di tre run per metrica. Le altre righe riportano un
solo run. P/A/B/S indicano Performance, Accessibility, Best Practices e SEO.
FCP/LCP/TTFB sono in secondi, TBT in millisecondi. TTFB è il valore del modello
simulato Lighthouse. Non equivale al tempo di elaborazione del server Vercel.

| Pagina e dispositivo | N | P/A/B/S | FCP | LCP | CLS | TBT | TTFB |
|---|---|---|---|---|---|---|---|
| Home mobile | 3 | 90/100/100/100 | 2,158 | 3,338 | 0 | 47 | 0,617 |
| Home desktop | 3 | 99/100/100/100 | 0,552 | 0,852 | 0 | 0 | 0,176 |
| About mobile | 1 | 98/96/100/100 | 1,785 | 1,785 | 0 | 79 | 0,618 |
| About desktop | 1 | 99/96/100/100 | 0,584 | 0,584 | 0,058 | 0 | 0,181 |
| for/forEach mobile | 1 | 87/97/96/100 | 2,419 | 3,544 | 0 | 38 | 0,621 |
| for/forEach desktop | 1 | 98/97/96/100 | 0,840 | 0,972 | 0,050 | 0 | 0,179 |
| Salesforce mobile | 1 | 92/100/96/100 | 2,334 | 2,925 | 0 | 72 | 0,628 |
| Salesforce desktop | 1 | 99/100/96/100 | 0,720 | 0,833 | 0,048 | 0 | 0,179 |

Gli articoli sono `/posts/differenza-for-loop-vs-foreach-javascript` e
`/posts/salesforce-commerce-cloud-job-framework`, scelti per cover grande e
molti screenshot. Home mobile ha score 89/91/90 e LCP 3,427/3,249/3,338 s.
Home desktop ha score 99/99/99 e LCP 0,845/0,856/0,852 s.

L'elemento LCP nel primo run Home mobile è il testo del banner Cookiebot.
Negli articoli mobile è la cover. In About mobile è un paragrafo del contenuto.
La differenza di elemento impedisce di attribuire tutti i risultati alla stessa
risorsa. Le stime Lighthouse di risparmio render-blocking sono 400 ms sulla
prima Home mobile, 510 ms su for/forEach e 540 ms su Salesforce. Sono stime
del modello, non miglioramenti già ottenuti.

### Trasferimenti, immagini e bundle

| Campione mobile | Richieste | Trasferimento totale | Script | Immagini |
|---|---|---|---|---|
| Prima Home | 40 | 341.304 B | 290.425 B | 3.412 B |
| About | 32 | 324.405 B | 282.041 B | 0 B |
| for/forEach | 35 | 393.198 B | 290.559 B | 64.067 B |
| Salesforce | 47 | 581.449 B | 290.680 B | 251.383 B |

Questi sono aggregati network del run, inclusi prefetch e risorse terze, con
compressione e header. Non corrispondono al peso del solo codice applicativo.
Il primo run Home attribuisce 182.199 B alle risorse terze. Lighthouse stima
circa 52 KiB di JS inutilizzato tra CMP e framework in quel caricamento;
non è una prova che quel codice sia eliminabile senza conseguenze.

Next/Image è già usato e preloaded per profilo/cover. Il profilo selezionato
dal browser mobile usa la variante w=256, circa 3.190 B di corpo immagine.
Il suo originale su disco pesa 786.419 B. Una richiesta di audit al fallback
src w=3840 ha scaricato 200.972 B, ma non è la risorsa scelta dal browser mobile.
Non attribuire quel peso al normale caricamento della Home.

Le sette cover sorgente misurano 1024×512. La cover for/forEach pesa 977.408 B
su disco, ma il run mobile trasferisce circa 64 KiB di immagini ottimizzate.
La cover non specifica sizes. Definire sizes in base alla larghezza reale
del container e correggere il rapporto naturale prima di valutare compressioni.

Le immagini Markdown sono normali img. In Salesforce i 12 asset del corpo
sono richiesti insieme alla cover; Lighthouse segnala immagini senza dimensioni
e opportunità di delivery. CLS mobile 0 nel campione non elimina il rischio
su altre reti, viewport, scorrimento e cache. Pre/code risultano renderizzati,
ma lo scorrimento interno e l'overflow a 320 px richiedono prova manuale.

Il CSS applicativo servito pesa 8.489 B più 604 B prima della compressione.
Nel primo run Home le tre stylesheet, inclusa Google Fonts, trasferiscono
5.027 B. La principale opportunità unused CSS stimata riguarda circa 15 KiB
di stile inline Cookiebot. Non emerge una ragione misurata per migrare Tailwind.

### Font, cache e risorse critiche

La URL Google Fonts richiede pesi 300–700 e include già display=swap. Il run
Home mobile richiede un file font da 21.997 B, quindi cinque pesi dichiarati
non vanno descritti come cinque download osservati. È possibile valutare
font locale o un caricamento meno concatenato e un fallback monospace esplicito.

Cache HTTP osservata su asset `_next/static` con max-age 31536000 e immutable,
compressione br e risposte HIT. HTML con cache-control public/max-age=0/
must-revalidate ma x-vercel-cache HIT e Age presente. max-age=0 al browser non
dimostra assenza di cache CDN. robots e sitemap rispondono correttamente.
Il campione ottimizzato immagine interrogato da Node è HIT e revalidabile.
La cache terza Cookiebot non è una configurazione controllata dal repository.

Cookiebot sincrono, CSS e Google Fonts compaiono nei render-blocking insight.
Non rimuovere o differire la CMP per inseguire un punteggio senza rieseguire
Automatic Blocking e la matrice consenso. Il vecchio finding sul chunk Next
classificato Statistics va verificato nel Manager rispetto agli asset attuali.

## Accessibilità, responsive e rischi ancora da verificare

Lighthouse usa axe-core 4.14.0. Ha rilevato contrasto insufficiente dei link
prose negli articoli e riconoscibilità dei link About. Per testo normale il
riferimento è 4,5:1. Per link senza sottolineatura occorre anche distinguibilità
dal testo circostante e indicatori appropriati di interazione.
[W3C, contrasto minimo](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

| Area | Stato e verifica rimanente |
|---|---|
| Inline code | La palette configurata pink-500 su bianco ha rapporto calcolato 3,53:1; blue-400 su bianco 2,54:1. Verificare i casi realmente renderizzati e lo sfondo, senza attribuire questi valori ai pre che hanno colori diversi |
| Focus e tastiera | Non risulta un reset globale che cancelli esplicitamente tutti gli outline. Visibilità effettiva, ordine Tab, Enter, skip link e focus dopo route/chiusura CMP non provati manualmente |
| Responsive | Misurati viewport Lighthouse 412 e 1350 px. Da verificare 320, 375, 768, 1280 px e zoom 200%, overflow della pagina e scorrimento dei blocchi codice |
| Dark mode | Configurazione class e varianti dark presenti; nessun controllo tema individuato. Body senza sfondo dark e nav/titoli con dark:text-white; .prose non applica dark:prose-dark. Con classe dark attiva esiste un rischio di incoerenza/contrasto da verificare prima di esporre il tema |
| Nomi accessibili | Freccia con testo simbolico e title, alt cover derivato dallo slug e screenshot con alt ripetuti. Valutare contesto, nomi espliciti e alt vuoti per immagini realmente decorative |
| Banner CMP | Screenshot Home mobile con dialogo esteso e Statistics visivamente selezionata prima di interazioni dell'audit. Verificare default di categoria, policy regionale e stato CMP nel Manager, senza dedurre una concessione effettiva da un toggle |
| Consenso dopo interazione | Accettazione, rifiuto, revoca, focus trap, chiusura, riapertura e refresh non eseguiti nel browser interattivo |
| Indicizzazione con CMP | HTML dei contenuti disponibile nelle risposte Node. Resta da verificare la resa di Googlebot con URL Inspection e l'eventuale blocco di script runtime dopo future scansioni CMP |

In tutte le 12 navigazioni Lighthouse non risultano richieste gtag.js o endpoint
Google Analytics, errori runtime Lighthouse o errori console raccolti.
Nei quattro campioni mobile esaminati non risultano risposte network >=400.
È una conferma limitata al caricamento senza scelte. I test applicativi del
consenso non sostituiscono accettazione/revoca reali, né una prova di INP.

## Quick wins proposti

1. Canonical e description specifici per Home e About, lasciando invariati i post.
2. Sitemap con nove URL www e generazione dall'inventario, lastmod solo verificato.
3. Sottolineatura dei link About e palette prose con contrasto adeguato.
4. H1 About e rimozione dell'heading usato soltanto per la freccia di navigazione.
5. Correzione delle due description con entità pre-escapate.
6. Rapporto cover 2:1 e sizes coerente con il layout, verificando la nuova altezza.

Sono modifiche future separate. Restano da approvare testi e cambi di resa.

## Roadmap incrementale e criteri di accettazione

### PR 1 — Metadata e canonical delle pagine

Ambito SEO-01 e SEO-03, completamento OG/Twitter di SEO-04. Centralizzare
l'origine www e comporre metadata per Home/About/post senza cambiare URL.
Correggere le due description in testo Unicode e usare OG article per i post.
Impatto atteso su coerenza e anteprime, complessità S/M.

Accettazione e test proposti per tutte le nove pagine, un solo title,
description e canonical assoluto, testi specifici e URL canonical 200 senza
redirect. OG/Twitter coerenti, nessuna entità letterale indesiderata, lang it
conservato. Verificare 404, body Markdown e pagine con JavaScript disabilitato.
Aggiornare intenzionalmente le sole fixture dei metadata corretti.

### PR 2 — Sitemap statica automatica

Ambito SEO-02. Generatore in JavaScript integrato nella build, basato sullo
stesso inventario dei post e sulle pagine statiche. Nessuna nuova infrastruttura.
Definire un campo modified opzionale soltanto se mantenibile editorialmente;
altrimenti omettere lastmod non verificabile. Complessità S/M.

Accettazione e test proposti, XML valido con nove URL www unici e canonici,
Home/About inclusi, nessun URL di errore o inesistente. Testare XML escaping,
articolo nuovo, filename/slug incoerente, robots con sitemap corretta e build
deterministica. Le fixture temporanee non vanno pubblicate come articoli.

### PR 3 — Link e semantica accessibili

Ambito A11Y-01/A11Y-02/A11Y-03. H1 About, freccia come navigazione con nome
descrittivo, link nel testo riconoscibili e contrasto corretto. Conservare
gli anchor esistenti e proporre separatamente la revisione editoriale H3/H2
dei Markdown. Complessità S/M.

Accettazione e test proposti, axe senza i finding contrast/link-in-text-block
nei campioni, un H1 per pagina di contenuto e nessun heading per la sola freccia.
Test manuale Tab/Shift+Tab/Enter, focus visibile, nomi dei link e pannello CMP.
Controllare hover, tastiera, tema corrente e layout a 320–1350 px/zoom 200%.
Non dichiarare conformità completa sulla sola scansione automatica.

### PR 4 — Geometria e delivery delle immagini

Ambito IMG-01/IMG-02. Dimensioni intrinseche corrette, sizes per le cover,
dimensioni riservate alle immagini Markdown e lazy loading sotto la piega.
Alt contestuali da verificare sul contenuto. Complessità M.

Accettazione, rapporti visualizzati corretti e nessun finding image-aspect-ratio.
Controllare srcset/currentSrc a viewport/DPR rappresentativi, niente lazy LCP,
assenza di immagini rotte e URL storici mantenuti. Ripetere tre run mobile dei
due articoli, controllare CLS, trasferimenti e screenshot con/senza cache.

### PR 5 — Font e trasferimenti iniziali

Ambito PERF-02/PERF-03. Prima intervenire sul caricamento font e fallback,
poi valutare in una PR distinta l'eventuale prefetch selettivo e il costo
client della formattazione date. Conservare stile e lingua. Complessità M.

Accettazione, confronto font/typography, pesi effettivi, richieste e dimensioni
prima/dopo. Rimisurare FCP/LCP con identico setup e verificare navigazione client
e date. Non attribuire risparmi di bundle a una dipendenza senza analisi del build.

### PR 6 — Structured data verificati

Ambito SEO-04. WebSite, Person e BlogPosting con identità e dati esistenti,
date editoriali validate, serializzazione sicura. Complessità M.

Accettazione, JSON valido e coerente con contenuto visibile, canonical e autore;
test escape di </script>, date mancanti, dateModified assente quando ignoto,
asset 200 e nessun doppione. Validare con strumenti gratuiti Google/schema.org,
senza promettere un rich result.

### PR 7 — Verifica CMP e prevenzione delle regressioni

Prima completare la matrice browser del documento analytics-cookie-consent-audit
e confrontare prima visita/banner gestito, runtime consentito e GA4 Basic.
Ogni modifica CMP richiede proposta e approvazione specifiche. Complessità M.

Accettazione, zero Analytics senza statistics, una pageview per route valida,
titolo corretto, revoca immediata con un solo reload, preferenze accessibili,
nessun blocco del runtime. Verificare in Network e Tag Assistant senza affidarsi
al solo punteggio Performance. I controlli Vercel rimangono read-only finché
non è approvata una modifica.

## Copertura futura dei test SEO

| Oggetto | Copertura attuale | Estensione proposta |
|---|---|---|
| Title/description/canonical | Post confrontati alla fixture; title Home/About | Unicità e cardinalità per tutte le pagine, canonical autoreferenziale www |
| Sitemap e robots | Nessun test dedicato | Parsing XML, inventario completo, URL unici/200/canonici, robots e sitemap coerenti |
| Metadata social | Parte degli OG post controllata | OG/Twitter Home/About/post e contenuti Unicode corretti |
| Structured data | Assenti | Schema/tipi e valori coerenti, date affidabili, escaping sicuro |
| Slug e URL storici | Sette ID e route protetti, 404 verificati | Nuovi slug unici, filename/frontmatter coerenti, nessuna deriva di URL |
| Immagini e link | Cover optimizer e immagini del corpo HTTP 200 | Dimensioni/alt/loading, frammenti esistenti, link interni estratti dall'HTML |
| Accessibilità | Nessuna scansione browser nella suite | Axe mirato più checklist manuale, senza sostituire la tastiera |
| Consenso e navigazione | Controller e ordine SSR testati | Prove browser su CMP reale, pageview e titolo dopo route, accettazione/revoca |

La suite non è stata modificata durante questo audit. Anche la validazione
frontmatter futura deve preservare i sette articoli esistenti e dare errori
espliciti per asset o canonical incoerenti, senza introdurre campi obbligatori
alle versioni precedenti senza migrazione approvata.

## Condizioni per la prossima fase

Approvare separatamente le PR implementative, partendo da metadata, sitemap e
accessibilità. Usare questo commit e queste misure come baseline, poi ripetere
i controlli dopo ciascun cambiamento. Tastiera, zoom, viewport aggiuntivi,
dark mode, dati CrUX/INP, Search Console e consenso dopo interazione restano
da verificare. Nessun codice applicativo, dipendenza, URL o impostazione
Vercel/Cookiebot/GA4 è stato modificato. Nessun merge o deploy eseguito.
