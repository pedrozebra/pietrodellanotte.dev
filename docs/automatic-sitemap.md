# Sitemap statica automatica

## Strategia

Implementazione della PR 2 dell'audit SEO, a partire da origin/main
`7fc28f54b78bfd82b6e0b68c46267c925aaa69f8`, dopo il merge della PR #28.

`npm run build` esegue `scripts/generate-sitemap.mjs` prima di Next. Il file
`public/sitemap.xml` viene sovrascritto deterministicamente e servito come asset
statico su `/sitemap.xml`. Non introduce route dinamiche, servizi o dipendenze.
Il file generato resta versionato per essere disponibile anche in sviluppo.
Per rigenerarlo senza build: `node scripts/generate-sitemap.mjs`.

`lib/post-inventory.js` è condiviso da Home, getStaticPaths e generatore. Legge
soltanto file regolari `.md` direttamente in `posts/`, in ordine stabile.
Verifica slug minuscoli alfanumerici separati da trattini, canonical uguale al
filename senza estensione e assenza del campo riservato `id`. Un'incoerenza
interrompe la build con il nome del file, evitando di pubblicare una sitemap
che diverge dalle route. La validazione completa dei campi editoriali rimane
fuori da questa PR.

Home e About sono aggiunte esplicitamente. I post derivano dall'inventario,
senza mantenere una seconda lista di slug nel generatore. Tutti gli URL usano
`siteUrl` da `helpers/config.js`, con origine https://www.pietrodellanotte.dev.
Il generatore verifica l'unicità e serializza testo con escaping XML.
`lastmod`, `changefreq` e `priority` sono omessi. Non vengono usati timestamp
di deploy, filesystem, Git o date di pubblicazione come date di modifica.

`public/robots.txt` è già coerente e resta invariato. Il test HTTP controlla il
riferimento unico alla sitemap www e la disponibilità di entrambi i file.
Non sono modificati URL storici, metadata, rendering Markdown, CSS, immagini,
Cookiebot, Analytics o configurazioni di hosting.

## Verifiche automatiche

- Validazione dell'intero XML contro la grammatica limitata emessa dal generatore,
  con namespace sitemap e struttura urlset/url/loc, oltre a casi malformati.
- Escaping di tutti i caratteri XML riservati, ordine e output deterministici.
- Nove URL unici sul dominio canonico, Home/About e sette slug storici.
- Generatore reale eseguito in directory temporanea con un nuovo Markdown:
  dieci URL e inventario delle route coerente; nessuna fixture pubblicata.
- File estranei e directory `.md` esclusi; slug invalidi, canonical diverso o
  duplicato e campo `id` rifiutati.
- HTTP 200 della sitemap e delle nove pagine, canonical corrispondenti,
  inventario uguale ai manifest delle pagine statiche/SSG e robots coerente.
- Suite esistente per metadata, body Markdown, immagini, 404 e consenso.

## Limiti e manutenzione

`npm run build` è il comando ufficiale per produrre l'artefatto di rilascio:
un comando diretto `next build` non rigenera `public/sitemap.xml`.
Un nuovo articolo richiede filename e canonical coerenti, oltre ai campi e
asset necessari alle pagine esistenti. Dopo aggiunte editoriali rigenerare e
versionare anche la sitemap. Le nuove pagine statiche diverse da Home/About
andranno aggiunte esplicitamente al generatore e ai test.

`npm test` confronta il file presente su disco con l'output del generatore in
memoria, senza riscriverlo e senza richiedere una build per questo controllo.
La suite HTTP completa richiede comunque una build production disponibile.
La regressione usa un inventario temporaneo con un nuovo articolo e la sitemap
versionata non rigenerata: esegue il vero test di coerenza in un sottoprocesso,
verifica exit 1 per assertion e controlla che il file sia rimasto identico.
Solo dopo esegue il generatore e verifica l'inclusione del nuovo articolo.
Una build precedente aggiorna il file su disco: per controllare lo stato
versionato prima della rigenerazione eseguire il test prima della build.

La sitemap facilita il crawling ma non garantisce indicizzazione. Eventuali
verifiche Search Console e del deployment futuro richiedono un rilascio
separatamente autorizzato. Questa PR non esegue merge o deploy.

## Validazione eseguita il 17 novembre 2026

Node 24.22.3, npm 11.19.1: `npm ci` e `npm run build` conclusi con exit 0;
`npm test`: 43 test superati, nessun fallimento. Verificate via server production
locale le nove pagine, sitemap, robots, metadata, Markdown, immagini e 404.
La suite consenso resta superata e i sorgenti Analytics/Cookiebot sono invariati.
Nessuna modifica visiva o interattiva; nessuna nuova verifica manuale di
accessibilità o dei pannelli esterni CMP/Analytics.

Il primo run dei test ha evidenziato un controllo incompleto del manifest:
About, ottimizzata staticamente, compare nel pages-manifest ma non nel
prerender-manifest SSG. Il test ora verifica entrambi e passa.

Restano le sette segnalazioni High già documentate nell'eccezione dipendenze,
l'avviso Tailwind JIT e l'avviso Node MODULE_TYPELESS_PACKAGE_JSON (anche per
i moduli ESM condivisi col generatore). Non sono stati aggiornati dipendenze,
lockfile o tipo del package.

Rifinitura PR #29: ripetuti `npm ci`, `npm run build` e `npm test` con esito
positivo (43/43). La suite sitemap isolata passa anche prima della nuova build.
Prova negativa con un commento XML aggiunto temporaneamente al file reale:
`npm test` restituisce exit 1 e l'hash del file resta invariato. Ripristinati
i byte originali, la suite completa torna a 43/43. Il nuovo caso automatico
copre l'articolo aggiunto senza rigenerazione; nessuna modifica applicativa.

Rifinitura portabilità PR #29: eliminata la junction di `node_modules` e le
copie di `lib`/`helpers`. Il test risolve il generatore rispetto a `__dirname`
tramite `pathToFileURL`, mantenendo il cwd temporaneo per inventario e sitemap.
Le dipendenze si risolvono dal checkout: non servono link, privilegi per crearli
o distinzioni fra junction Windows e symlink POSIX. Il controllo negativo e
il confronto dei byte del file restano invariati.

Verifica eseguita su Windows con Node 24.22.3: `npm test` 43/43 e
`npm run build` exit 0. Compatibilità Linux/macOS valutata dal codice usando
API Node multipiattaforma, non verificata con esecuzioni su quei sistemi.
Tentativo Linux via WSL su Ubuntu e Ubuntu-22.04: kernel Linux disponibile,
ma `node` non installato/disponibile nel PATH; Docker Engine non attivo.
Nessun ambiente macOS disponibile. Nessuna modifica al comportamento applicativo.
