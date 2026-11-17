# Migrazione Next.js / React — prima fase

Data: 15 novembre 2026. Strategia A approvata del [piano dipendenze](dependency-upgrade-plan.md).
Base: `docs/dependency-upgrade-plan` al commit `179e0e2`; branch di lavoro:
`chore/upgrade-nextjs-react`. Il branch base contiene AGENTS.md, audit, roadmap
e piano dipendenze; working tree iniziale pulito. Nessun merge o deploy.

## Modifiche

- Next.js **16.4.6**, React e React DOM **19.3.1**, versioni esatte ricontrollate
  con il registry prima dell'installazione. Next 16 è Active LTS secondo la
  [support policy](https://nextjs.org/support-policy). Le versioni target non
  compaiono fra i pacchetti segnalati nell'audit del lockfile risultante.
- Node.js **24.22.3**, npm **11.19.1**: non erano disponibili tramite nvm locale.
  Per le verifiche è stata scaricata la distribuzione Windows x64 portabile dal
  sito ufficiale, senza cambiare la versione globale. SHA-256 dello ZIP
  confrontato con SHASUMS256 ufficiale:
  `e612af99f626ab415ea225af6bce5c971feb448cb5cae250bb1c3fa50c5f7d9f`.
  Binari usati: `%TEMP%/pdn-node24/node-v24.22.3-win-x64/`.
  `.nvmrc`, engines e packageManager documentano l'ambiente richiesto;
  disponibilità e compatibilità sul provider restano da verificare.
- `dev` e `build` usano `--webpack`. `start` resta il server production Next.
- Aggiornati i Link nelle quattro sorgenti che usavano anchor figli/passHref:
  props trasferite al Link e URL invariati. Rimossi soltanto gli attributi alt
  non validi degli anchor interessati; nessuna revisione SEO/accessibilità estesa.
- Image resta `next/image`; `preload` sostituisce priority deprecato. La cover
  conserva dimensioni nominali 650×300 con larghezza massima controllata dal CSS
  esistente, height auto e aspect ratio esplicito; il profilo conserva la
  larghezza visualizzata di 144 px e l'altezza automatica del CSS esistente.
  Verifica visuale comunicata dal proprietario il 17 novembre 2026: sito
  navigabile e visivamente coerente con la versione precedente.
  Il file del profilo misura 1658×2211: `Layout.js` ora dichiara queste dimensioni
  intrinseche al posto di 144×144, con stile width 144 px e height auto.
  `sizes="144px"` indica all'optimizer la larghezza visualizzata; il limite
  responsive di Tailwind e il bordo circolare restano applicati.
- `AGENTS.md`: `next dev` ha aggiunto automaticamente il blocco
  `nextjs-agent-rules` con il riferimento alla documentazione della versione
  installata. Conservate integralmente le istruzioni del progetto; nessuna
  disabilitazione della funzione e nessuna nuova configurazione Next.
- Aggiunti test Node senza nuove devDependency, fixture acquisite dal loader
  originale, istruzioni operative README e questo resoconto.

Nessun App Router o TypeScript, nessun cambio a SSG, slug, articoli, metadata,
sitemap, robots, configurazione del dominio o Cookiebot/Analytics. La build
stampa una fase chiamata “Running TypeScript”, ma non è stata introdotta una
migrazione del linguaggio né un tsconfig.

## Lockfile e dipendenze conservate

Due tentativi di risoluzione sul vecchio lockfile v1/installazione esistente
sono falliti con ERESOLVE fra Next 12/React 17 presenti e i nuovi target.
Non sono stati usati force, legacy-peer-deps o audit fix. È stato risolto un
lockfile pulito in directory temporanea con Node/npm target, congelando alle
versioni precedenti tutte le dipendenze dirette diverse da Next/React/React DOM.
I range root sono stati riallineati al manifest del repository e il risultato
validato da `npm ci`. Il lockfile è ora v3 e non contiene i residui
react-cookie-consent/js-cookie/prop-types/react-is della vecchia installazione.

| Dipendenza diretta conservata | Versione effettiva |
|---|---|
| Tailwind CSS / typography | 2.2.19 / 0.4.1 |
| PostCSS / Autoprefixer | 8.4.12 / 10.4.4 |
| gray-matter / date-fns | 4.0.3 / 2.28.0 |
| remark / remark-html | 13.0.0 / 13.0.2 |
| remark-images / remark-heading-id | 3.1.0 / 1.0.0 |

Le transitive sono state risolte nuovamente entro i range dei parent, quindi
il diff non riguarda soltanto tre numeri versione. Fra i cambi di sicurezza:
js-yaml 3.15.2, lodash 4.18.1, minimatch 3.1.5, brace-expansion 1.1.22,
micromatch 4.0.8, picomatch 2.3.2, source-map-js 1.2.2 e tmp 0.2.7.
Next usa PostCSS annidato 8.5.23 e sharp 0.35.5. I test confrontano il rendering
dei sette articoli alla baseline, senza rigenerarla dopo l'upgrade.

## Verifiche e risultati

| Controllo | Esito effettivo |
|---|---|
| Test prima dell'aggiornamento | 10 HTTP e 3 Markdown passati con Next 12/React 17 su Node 20.20.2, contro build originale già presente |
| Installazione pulita target | `npm ci --no-fund --audit=false`, exit 0, 231 pacchetti; audit svolto separatamente |
| Build target | `npm run build`, exit 0, Next 16.4.6 Webpack; home/About/404 statiche e sette post SSG generati |
| Suite target | `npm test`, **13 passati, 0 falliti** su Node 24.22.3 |
| Integrità installazione | `npm ls --depth=0`, exit 0, nessun missing/invalid/extraneous |
| HTTP production | Home, About e 7 post: 200; articolo e pagina inesistenti: 404; titoli, lang it, canonical/description/OG dei post e body Markdown invariati |
| Immagini | Le 7 cover rispondono dall'optimizer e le immagini nel corpo dei post rispondono 200 |
| Markdown reale | ID, metadata, asset e HTML dei 7 post identici alla fixture precedente; payload script/onerror/javascript rimossi; heading ID e blocchi codice conservati |
| Dev Webpack | Server avviato su 127.0.0.1 con porta libera; home e post for/forEach HTTP 200; processo arrestato |
| Audit completo | `npm audit --json`, exit **1**: **1 High**, 0 Critical, 0 Moderate/Low |
| Audit production | `npm audit --omit=dev --json`, exit **1**: stesso finding High su PostCSS |
| Browser (prima verifica automatizzata) | Accesso tramite computer/browser tool fallito con “browser access host is unavailable” |
| Verifica locale comunicata dal proprietario il 17 novembre 2026 | `npm ci`, build e test superati; sito navigabile e visivamente coerente con la versione precedente. Rilevato warning Next.js su width/height di `/images/profile.jpg` |

Il primo test di sanitizzazione assumeva una classe language-php e l'encoding
`&lt;`; il sanitizer originale invece rimuove quella classe ed emette `&#x3C;`.
L'asserzione è stata corretta sulla baseline osservata, senza cambiare il loader.
La prima suite target ha poi fallito nove test per un'asserzione che cercava
`<title>` senza attributi; Next 16 aggiunge `data-next-head`. È stata modificata
solo l'estrazione del titolo, mantenendo il confronto esatto del testo.
Nessun errore di applicazione è stato occultato e nessuna fixture di contenuto
è stata aggiornata per accomodare una regressione.

### Warning e compatibilità Tailwind 2

Tailwind 2 compila correttamente sia in produzione sia in sviluppo con questo
target. Restano i suoi warning JIT preview e, durante dev, un warning di timer
duplicato “Reading changed files”. Npm segnala deprecazioni per glob 7 e
inflight. Il test del loader emette MODULE_TYPELESS_PACKAGE_JSON perché il
modulo storico mescola ES import e require: il test fornisce createRequire
senza modificare la pipeline applicativa. Non è stato aggiunto type=module,
che avrebbe effetti sulle configurazioni CommonJS.

Le verifiche automatiche coprono installazione, compilazione e output HTTP.
La verifica browser comunicata dal proprietario conferma navigabilità e coerenza
visiva con la versione precedente; la futura compatibilità di Tailwind 2 resta
da valutare.
Non è stata introdotta ESLint: non è dichiarato passato alcun lint.

### Verifiche manuali e consenso comunicate dal proprietario

Il 17 novembre 2026 il proprietario ha comunicato i risultati della verifica
locale della migrazione Next.js 16 / React 19 riportati nella tabella precedente.
Il warning dell'immagine del profilo ha motivato la correzione di dimensionamento
in `Layout.js`. L'assenza del warning e il confronto desktop/mobile dopo questa
correzione richiedono ancora una conferma in browser.

Verifica automatica della correzione eseguita il 17 novembre 2026 con Node
24.22.3 e npm 11.19.1 su copia temporanea delle sorgenti modificate e dello
stesso lockfile: `npm ci`, `npm run build` e `npm test` terminati con exit 0,
13 test passati e 0 falliti. L'installazione nella directory del repository
ha incontrato EPERM sul file SWC bloccato da Windows. La copia temporanea
non contiene `.env.local`. Restano i warning già documentati di Tailwind JIT
e MODULE_TYPELESS_PACKAGE_JSON e il finding npm High preesistente.

Cookiebot non mostra il banner su localhost perché il dominio non è autorizzato
nel Cookiebot Manager. Il proprietario conferma che il banner è visibile sul
sito pubblico. Il corretto comportamento degli script Analytics rispetto al
consenso non è ancora stato verificato. Queste osservazioni non costituiscono
una verifica del blocco o dell'attivazione degli script prima e dopo il consenso.

## Audit residuo e rischi aperti

L'unico pacchetto segnalato è **PostCSS 8.4.12**, mantenuto per limitare questa
fase al framework. La copia annidata di Next 8.5.23 non è segnalata. Il pacchetto
root è usato da strumenti CSS/Tailwind e risulta anche nel tree production per
la catena typography/Tailwind: non si può liquidare il finding con omit=dev.

I cinque advisory riportati sono:

- [GHSA-7fh5-64p2-3v2j](https://github.com/advisories/GHSA-7fh5-64p2-3v2j): parsing delle line return.
- [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93): escaping dello stringify CSS.
- [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q): lettura di file tramite sourceMappingURL.
- [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp): correzione incompleta del precedente advisory.
- [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849): path traversal nel caricamento delle sourcemap.

Input CSS/sourcemap controllato da attaccante non osservato nel progetto;
sfruttabilità sul deployment non dimostrata. Il finding resta aperto e audit
termina correttamente con exit 1. Prossimo intervento: aggiornare PostCSS con
verifica della catena CSS, senza assumere che sia indispensabile aggiornare
Tailwind nella stessa modifica. Nessuna promessa di audit zero in questa fase.

Altri limiti: hydration e console non verificati sistematicamente; verifica
browser successiva alla correzione del profilo ancora da confermare;
Node 24/OS/librerie native del provider non verificati; nessun deploy. I problemi
preesistenti di canonical/sitemap, frontmatter e consenso indicati nell'audit
rimangono fuori scope. La build usa `.env.local` senza stamparne i valori;
nessun valore di credenziali è stato aggiunto ai test, alla documentazione o al diff.

## Revisione e rollback

Presentare la PR verso **docs/dependency-upgrade-plan**, senza merge e deploy.
Il diff completo comprende anche lockfile, fixture e test, non soltanto i file
applicativi. Si raccomanda una PR draft finché non sono completate le verifiche
browser e la decisione sul rischio PostCSS, prima di un eventuale rilascio.

Rollback di questo gruppo: ripristinare manifest, lockfile e sorgenti dal branch
base con un revert se condiviso, installare da lockfile con il runtime baseline
e ricostruire. Non riutilizzare node_modules o .next di versioni diverse e non
usare reset distruttivi/force push. Next 12 resta obsoleto: rollback soltanto
temporaneo, non soluzione di sicurezza. Nessuna modifica a contenuti o dati da
migrare e nessun rollback di produzione effettuato.
