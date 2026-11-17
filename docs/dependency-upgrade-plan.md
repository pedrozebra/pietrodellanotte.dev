# Piano di aggiornamento delle dipendenze

Data: 15 novembre 2026. Attività S1 e S2 della [roadmap](roadmap.md), dopo lettura di `AGENTS.md` e del [technical audit](technical-audit.md). Branch: `docs/dependency-upgrade-plan`.

## Decisione proposta

Raggiungere **Next.js 16.4.6, Node.js 24.22.3 LTS e React/React DOM 19.3.1**, mantenendo Pages Router, JavaScript, SSG e gli URL attuali. Procedere per gruppi separati: baseline e test, framework/componenti, CSS, dipendenze transitive. Per la prima validazione usare Webpack esplicitamente, rinviando il cambio di bundler. Le versioni sono quelle rilevate oggi: prima dell'implementazione ricontrollare patch e advisory.

Il piano non certifica ancora la compatibilità eseguibile dei target: **sono stati installati e compilati soltanto i pacchetti originali**. Non sono stati aggiornati codice, manifest o lockfile del checkout. Nessun commit, push, merge, codemod, `npm audit fix --force` o deploy eseguito. L'implementazione richiede l'approvazione del proprietario.

## Situazione attuale e baseline S2

Architettura semplice: Next.js 12.1.1, React/React DOM 17.0.1, Tailwind 2.2.19, typography 0.4.1, PostCSS 8.4.12, Autoprefixer 10.4.4; Markdown locale convertito durante SSG. `getStaticPaths` ha `fallback: false`. Nessuna directory App Router, API applicativa, middleware o configurazione di rewrites individuata. Il codice usa `Link` con figli anchor e la vecchia implementazione `next/image`; la pipeline Markdown combina import ES e require. Esistono sette articoli e due pagine pubbliche principali. Non c'è suite test né configurazione ESLint.

### Metodo riproducibile e risultati osservati

- Copia isolata: `C:\Users\pdell\AppData\Local\Temp\pdn-dependency-audit-5W26Og`. Copiati i file esistenti elencati da `git ls-files`, dal checkout corrente; non copiati `.git`, `.next`, `node_modules` o `.env.local`. Il contenuto del checkout di lavoro non è stato modificato dai controlli.
- HEAD sorgente: `3437aecbb38d94c9cdb7243818d6e65ba08b6266`. Working tree iniziale pulito. Ambiente Windows, Node 20.20.2, npm 10.8.2: baseline storica, non runtime raccomandato.
- Eseguito **`npm ci --no-fund --audit=false`**, exit 0, 231 pacchetti aggiunti. Disabilitato soltanto l'audit automatico durante installazione, svolto poi separatamente. Gli script d'installazione standard non sono stati disabilitati.
- Lockfile v1 invariato, SHA-256 prima e dopo: `99b96e82a3afdc06b96c3898feee00b374523acd9099f5b03268f4ce3aa13d7c`. Nessuna rigenerazione del lockfile.
- `npm ls --depth=0`: tutte le dipendenze dichiarate presenti, **nessun extraneous** nella copia pulita. Le quattro installazioni extraneous osservate nel checkout durante il precedente audit non sono necessarie per compilare.
- **`npm run build`**, exit 0: sette route articolo generate, oltre a home, About e 404. Warning su vecchio lockfile, pacchetti deprecati, caniuse-lite e Tailwind JIT preview. Compare anche `ESLint must be installed in order to run during builds`: il processo prosegue e termina con successo, quindi **non è un lint passato**.
- Avviato `next start -H 127.0.0.1 -p 3187` nella copia; richieste HTTP tramite fetch, poi processo arrestato. Home, About e sette post: HTTP 200; `/posts/inesistente-audit`: HTTP 404. Titoli presenti, lingua HTML it, canonical dei post corrispondenti agli attuali URL www. `/_next/image?url=%2Fimages%2Fprofile.jpg&w=256&q=75`: HTTP 200, image/jpeg. Questo conferma l'optimizer locale funzionante, non una sua sfruttabilità.
- I file temporanei `audit-lock.json`, `audit-clean.json` e `smoke-results.json` conservano le risposte locali; non sono nuovi file del repository né artefatti di produzione.

Non copiando le variabili locali, la build prova che il rendering statico riesce senza tali valori; **non prova che Analytics funzioni**. Non è stato aperto un browser: hydration, navigazione client, cookie, consenso e rendering visivo restano da verificare. Nessun test sul vero hosting, Linux, runtime Node 24 o dipendenze target. Nessun benchmark. S2 ha quindi una baseline install/build/HTTP riproducibile, con limiti espliciti su browser e produzione.

## Vulnerabilità e applicabilità — S1

`npm audit --json --package-lock-only` sul progetto e `npm audit --json` nella copia dopo ci restituiscono entrambi exit 1: **17 pacchetti segnalati, 1 critical, 13 high e 3 moderate**. Il secondo comando continua a riportare voci residue del lockfile: è stato verificato anche il filesystem, senza assumere che audit descriva soltanto i moduli installati. Gli advisory diretti estratti dal JSON sono inventariati individualmente nell'appendice.

Le categorie runtime/build sono basate sull'uso del codice, non soltanto su dependencies/devDependencies: i plugin Markdown sono dichiarati dependencies ma lavorano durante SSG. Una libreria transitiva può essere usata sia dal server Next sia dalla build. Stato **pertinente** significa superficie o elaborazione effettivamente presente; **condizionale** indica prerequisiti non dimostrati; **assente** indica funzionalità non trovata nel repository, non garanzia sulle impostazioni esterne.

| Pacchetto e versione rilevata | Origine e fase | Applicabilità e azione |
|---|---|---|
| next 12.1.1 | Diretto; server runtime, browser e build | Pertinente: usa SSG e next/image. Priorità alta alla rimozione della linea non supportata. Nessun exploit eseguito. Vedere distinzione per advisory nell'appendice. |
| postcss 8.4.12 e copia Next 8.4.5 | Diretto dev più transitivo di Next; build CSS, parte della distribuzione server | Parsing CSS/sourcemap realmente presente, input ostile non dimostrato. Aggiornare sia dipendenza diretta sia framework; aggiornare soltanto quella diretta lascia la copia annidata. |
| js-yaml 3.14.1 | gray-matter → js-yaml; build contenuti | Pertinente al parsing del frontmatter: chi altera Markdown può fornire YAML ostile. Nessun form pubblico né upload trovato; rischio soprattutto per contenuti non fidati in CI. Risolvere a 3.15.2 o patch successiva verificata, compatibile con il range di gray-matter. |
| lodash 4.17.21 | Tailwind e node-emoji → lodash | Build e plugin; nessun uso applicativo di template/imports, unset/omit/pullAt con input non fidati dimostrato. Aggiornare tutte le risoluzioni vulnerabili, senza cambiare API inutilmente. |
| brace-expansion 1.1.11 / minimatch 3.1.2 | glob → minimatch → brace-expansion | Build/glob, pattern del progetto statici. ReDoS/espansioni ostili condizionali; non un endpoint pubblico. Aggiornare i parent e patch compatibili. |
| braces 3.0.2 | chokidar e micromatch | Build/watch, espansioni glob; nessun pattern controllato da visitatore. Aggiornare a risoluzione corretta. |
| micromatch 4.0.5 / picomatch 2.3.1 | fast-glob; micromatch, anymatch, readdirp | Build/watch; condizioni di pattern ostile non dimostrate. Preferire risoluzioni corrette nei range dei parent. |
| browserslist 4.20.2 | Autoprefixer → browserslist | Build; query/stats del progetto, nessun browserslist-stats.json ostile trovato. OOM/prototype write condizionali. Aggiornare Autoprefixer e risoluzioni transitive. |
| nanoid 3.3.1 | PostCSS → nanoid | Identificatori interni; nessun token di autenticazione né chiamata applicativa con size ostile. Advisory sui parametri condizionali; aggiornare risoluzioni. |
| postcss-selector-parser 6.0.9 | Tailwind, postcss-nested, purgecss | Build CSS; selector ostile non dimostrato. Risoluzione almeno 6.1.5 nella linea 6, con nuovo audit. |
| source-map-js 1.0.2, due copie | PostCSS diretto e annidato Next | Build/sourcemap; indice ostile non dimostrato. Verificare entrambe le risoluzioni, almeno 1.2.2 se compatibile. |
| tmp 0.2.1 | Tailwind → tmp | Tooling/build, filesystem locale. Symlink o prefissi/suffissi ostili non dimostrati. Rimuovere la vecchia catena o risolvere a patch corretta (range audit <0.2.6). |
| yaml 1.10.2 | cosmiconfig/postcss-load-config | Build/configurazione; YAML annidato non fidato non trovato. Non confondere con js-yaml dei post. Aggiornare parent o patch compatibile ≥1.10.3. |
| js-cookie 2.2.1 / react-cookie-consent 6.4.1 | Voci residue del lockfile, extraneous nel precedente checkout | Non installati dopo ci e nessun import applicativo individuato. js-cookie ha un advisory; react-cookie-consent eredita la segnalazione, non ha un advisory diretto in questa risposta. Eliminare residui rigenerando il lockfile durante l'aggiornamento approvato, senza aggiungerli al manifest. |

Nota di precisione: la catena certa di lodash rilevata nel vecchio lockfile include `node-emoji → lodash` e `tailwindcss → lodash`; il tree installato va usato per risolvere tutti i parent. Non si deduce la raggiungibilità di una funzione vulnerabile dalla sola presenza del pacchetto.

### Advisory Next: decisioni pratiche

1. **Image optimizer:** le categorie DoS, cache confusion/content injection, cache disco illimitata e RCE AVIF/SVG sono prioritarie perché l'app usa next/image e il server locale espone l'endpoint. L'effettiva possibilità di sfruttarle richiede controlli su hosting, cache, formati accessibili e librerie native. Non basta che nel repository ci siano PNG/JPEG per escludere ogni input all'endpoint.
2. **RCE AVIF e SVG:** gli advisory ufficiali collegano il problema a sharp/libheif o librerie upstream; quello SVG specifica Linux glibc e sharp ≥0.35.5 come workaround. Il vecchio lockfile non contiene sharp e la baseline gira su Windows: non è dimostrata questa RCE nella baseline né in produzione. Controllare il deployment reale e la versione nativa risolta, senza aggiungere sharp al vecchio progetto come presunta soluzione universale. Le patch Next dichiarate per SVG sono 15.5.28 e 16.4.1, per AVIF 15.5.24 e 16.3.3. Fonti: [SVG](https://github.com/advisories/GHSA-2464-fhr4-w9xw), [AVIF](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4).
3. **Bypass autorizzazione/middleware e SSRF redirect middleware:** nessun middleware o controllo di autorizzazione applicativo trovato; il prerequisito non risulta presente. Non classificare il blog come autenticazione bypassabile sulla sola gravità critical del pacchetto.
4. **Request smuggling/SSRF rewrites:** nessuna rewrite applicativa individuata; applicabilità condizionale a configurazioni hosting/proxy non ispezionate.
5. **Cache poisoning/cache-control:** SSG presente, SSR/ISR non configurati nelle pagine esaminate; CDN e trattamento delle risposte non verificati. Leggere i prerequisiti di ciascun advisory prima di attribuirgli esposizione concreta.

Le vulnerabilità React Server Components non vanno attribuite automaticamente a questo progetto Pages Router senza RSC; non compaiono come finding React nella risposta audit esaminata. Le correzioni del consenso e la validazione del frontmatter restano S3/S4: la migrazione non le risolve automaticamente.

## Versioni target e matrice di compatibilità

Le versioni sono state interrogate con `npm view` e registry npm ufficiale, senza installarle. [Support policy Next](https://nextjs.org/support-policy): 16.x Active LTS, 15.x Maintenance LTS con estensione di sicurezza al 31 gennaio 2027, 12/13/14 non supportate. La linea 15 è quindi un ponte breve, non il target consigliato.

| Area | Attuale | Target proposto | Vincoli e verifica ancora necessaria |
|---|---|---|---|
| Node.js | 20.20.2 locale | **24.22.3 LTS**, npm **11.19.1** distribuito con quella release | Node 20 è EOL alla data dell'analisi. Next 16 richiede ≥20.9 ma il minimo tecnico non implica supporto Node. Node 24 è un compromesso LTS più maturo di 26; verificare disponibilità sul provider. Node 22 LTS alternativa se richiesta dall'hosting. |
| Next.js | 12.1.1 | **16.4.6**, versione esatta in migrazione | Pages Router supportato. Nessuna necessità di App Router/TypeScript. Peer ammettono React ^18.2 oppure ^19.0. |
| React / React DOM | 17.0.1 entrambi | **19.3.1 entrambi** | react-dom 19.3.1 richiede react ^19.3.1. Bridge locale possibile su 18.3.1, non passaggio pubblico obbligatorio. Verificare hydration, effetti, script terzi; nessun bisogno di React Compiler. |
| Tailwind CSS | 2.2.19 | **3.4.19**, in gruppo separato | Non è imposto da Next; scelto per ridurre il salto rispetto a v4 e rinnovare la catena. Node ≥14 soddisfatto. Non viene dichiarata una garanzia LTS di Tailwind 3. Rivedere rischio residuo dopo audit. |
| typography | 0.4.1 | **0.5.20** con Tailwind 3 | Peer >=3 o >=4; non aggiornabile isolatamente mantenendo Tailwind 2. Rivedere personalizzazioni prose/dark. |
| PostCSS | 8.4.12, annidato 8.4.5 | **8.5.33** diretto; copia Next gestita dal framework | Verificare tutte le copie risolte e l'audit finale; il pin diretto non forza quelle annidate. |
| Autoprefixer | 10.4.4 | **10.6.2** | Peer postcss ^8.1.0, compatibile con 8.5.33. |
| gray-matter | 4.0.3 | **4.0.3** conservato | È ancora latest alla verifica; range js-yaml ^3.13.1 accetta **3.15.2**, da risolvere nel lockfile. Nessuna necessità di riscrivere il parser. |
| remark / remark-html | 13.0.0 / 13.0.2 | Conservare inizialmente **13.0.0 / 13.0.2** | Nessun advisory diretto nella risposta esaminata. Non equivale a certificazione di assenza di vulnerabilità. Sanitizzazione e plugin da testare sul framework target. |
| remark-images / remark-heading-id | 3.1.0 / 1.0.0 | Conservare inizialmente **3.1.0 / 1.0.0** | Risolvere le transitive vulnerabili; heading-id latest 1.0.1 non elimina automaticamente lodash. Nessun upgrade necessario per rispettare peer React/Next. |
| Modernizzazione remark opzionale | — | remark **15.0.1**, html **16.0.1**, images **4.1.0** | ESM: import API e require del plugin attuale da rivedere, verificando tree unist/unified e heading ID. Fuori dal primo gruppo di migrazione; non mescolare al salto framework senza necessità. |
| date-fns | 2.28.0 | **2.28.0** conservato | Nessun finding diretto in audit; nessun requisito di Next impone una major nuova. 2.30.0 disponibile nella stessa major, aggiornamento eventuale separato. |

Fonti per Node: [stato delle release](https://nodejs.org/en/about/previous-releases), [indice ufficiale con patch e npm](https://nodejs.org/dist/index.json). Per versioni e peer: registry ufficiale, per esempio [next 16.4.6](https://registry.npmjs.org/next/16.4.6), [react-dom 19.3.1](https://registry.npmjs.org/react-dom/19.3.1), [typography 0.5.20](https://registry.npmjs.org/@tailwindcss/typography/0.5.20), [Tailwind 3.4.19](https://registry.npmjs.org/tailwindcss/3.4.19). Il verdetto finale richiede installazione e build della combinazione, oggi non eseguite per vincolo esplicito.

## Confronto delle strategie

| Strategia | Vantaggi | Rischi / complessità | Valutazione |
|---|---|---|---|
| **A — Target 16 diretto, gruppi di modifiche separati** | Arriva su Active LTS, evita una seconda migrazione ravvicinata, nessun cambio router/linguaggio | Salto di quattro major, React, Link/Image e CSS da verificare. 5–8 giornate indicative più verifica hosting | **Consigliata**: checkpoint locali, niente rilascio intermedio su versioni obsolete. |
| **B — Ponte 15.5.29 + React 18.3.1, poi 16** | Webpack e React 18 facilitano isolamento delle regressioni; utile se un'integrazione impedisce React 19 | Due cicli di test e scadenza Maintenance ravvicinata; 6–10 giornate complessive indicative. Entrambe le versioni vanno comunque auditate | Solo se A incontra un blocker concreto; completare 16 prima della scadenza. |
| **C — Patch 12 e aggiornamento sole transitive** | Diff iniziale piccolo | Linea fuori supporto, non risolve in modo sostenibile gli advisory moderni. Non soddisfa il target supportato | Eventuale mitigazione transitoria motivata, non piano finale. |

Le stime includono test minimi e adattamenti, non nuovi contenuti, redesign, multilingua o deployment. Non sono risultati di una prova di migrazione. Non è necessario installare/rilasciare Next 13 e 14: leggerne le guide per i cambi cumulativi e creare checkpoint senza renderle destinazioni di produzione.

## Strategia di migrazione e breaking changes

1. **Preparare regressioni e ambiente.** Conservare baseline e hash, fissare Node/npm per sviluppo e CI, confermare runtime hosting e modalità di deploy. Creare branch di implementazione soltanto dopo approvazione; non riutilizzare il branch dei documenti per modifiche indiscriminate.
2. **Framework e React.** Pin Next/React/React DOM target, rigenerare il lockfile con npm concordato e mantenere Pages Router. Adattare `Link` rimuovendo anchor annidati/passHref non necessari in `components/Navigation.js`, `components/Layout.js`, `pages/index.js`, `pages/posts/[id].js`. Non affidarsi a legacyBehavior come soluzione finale. Aggiornare solo ciò che è necessario a conservare comportamento e URL.
3. **Image e bundler.** Adattare `components/Layout.js` al nuovo next/image e verificare dimensioni, aspect ratio, classi e cover dinamiche. Usare inizialmente `next dev --webpack` e `next build --webpack` in Next 16 per isolare il cambio bundler; Turbopack sarà una valutazione successiva. Non aggiungere configurazioni remote o SVG permissive per aggirare problemi.
4. **CSS separato.** Migrare Tailwind 2 → 3 con `purge` → `content`, rimuovere mode jit obsoleto, mantenere plugin typography e verificare default CSS/Preflight, colori, code block e varianti dark/prose. Il solo upgrade Next non richiede Tailwind 4. La [guida Tailwind 3](https://v3.tailwindcss.com/docs/upgrade-guide) descrive questi adattamenti; sono comunque necessari confronti visuali.
5. **Transitive e lockfile.** Aggiornare risoluzioni ammesse dai range, in particolare js-yaml, lodash e strumenti CSS/glob; rimuovere i residui senza reintrodurre librerie cookie inutilizzate. Se una patch richiede override, motivare path/versione e prova di compatibilità; evitare override major globali. Nuovo audit anche della copia PostCSS Next e dell'eventuale sharp risolto (per advisory SVG ≥0.35.5). Un lockfile rigenerato può avere formato nuovo e un diff grande: distinguere cambi di formato da cambi di versione.
6. **Verificare e revisionare.** Ripetere installazione pulita, build, HTTP, browser e audit. Nessun deploy/merge automatico. I difetti SEO/privacy già presenti si registrano separatamente; non considerarli introdotti dal framework e non cambiarli implicitamente.

I cambi Link e Image sono documentati nella [guida ufficiale 12→13](https://nextjs.org/docs/pages/guides/upgrading/version-13). La [guida Pages Router a Next 16](https://nextjs.org/docs/pages/guides/upgrading/version-16) indica Node ≥20.9, Turbopack predefinito con opt-out Webpack, rimozione di next lint e modifiche dell'optimizer. Serve lint separato, se introdotto. Quality accettate, cache e risposte di `/_next/image` vanno verificate. `getStaticProps`, `getStaticPaths`, `next/head`, `_app` e `_document` restano il modello; le async Request API dell'App Router non richiedono una conversione indiscriminata di queste pagine.

React 19 può evidenziare differenze di hydration, effetti e integrazione script: controllare `_app.js` e `lib/ga/index.js` senza alterare la politica consenso come effetto collaterale. I plugin remark moderni sono ESM: un aggiornamento totale simultaneo complicherebbe inutilmente la diagnosi. Il nuovo target deve funzionare anche sul sistema operativo reale del provider, incluse dipendenze native, e non soltanto su Windows.

## Test minimi di regressione

Tutti i controlli indicati qui sono **da implementare/ripetere sui target**, salvo la baseline S2 esplicitamente descritta sopra. Non c'è oggi una suite automatica eseguita sul target.

| Route protetta | Aspetti specifici |
|---|---|
| `/` | Titolo, lang it, sette link con slug identici, ordinamento e date italiane, profilo |
| `/about` | Titolo e testo, contatti/link esistenti, navigazione; l'h1 mancante è un difetto preesistente |
| `/posts/destrutturazione-di-array-in-php-spiegata-semplice` | Snippet PHP e nested array, date, cover, description/canonical |
| `/posts/differenza-for-loop-vs-foreach-javascript` | Code block, liste e heading `{#bonus}`/anchor generato |
| `/posts/differenza-let-var-const-javascript` | Snippet JS/error e metadata, preservando contenuti |
| `/posts/il-mio-miglior-snippet-di-codice-in-assoluto` | Immagine nel corpo e collegamento al file |
| `/posts/lavoro-da-remoto-pro-e-contro` | Paragrafi, heading e link |
| `/posts/salesforce-commerce-cloud-job-framework` | Tutti gli screenshot, liste, heading e link relativi |
| `/posts/versioni-differenti-nodejs-su-windows` | Snippet, heading, cover e link |

- **HTTP/SSG:** ciascuna delle nove pagine HTTP 200 su server production; slug sconosciuto 404; inventario post esattamente sette. Richieste dirette e refresh senza redirect nuovi; risorse immagini/CSS/JS locali disponibili. Controllare profilo e sette cover tramite optimizer e img Markdown, senza payload exploit.
- **HTML/metadata:** titolo, lingua, data, una description e canonical dei sette post confrontati alla baseline; nessun cambio di slug, canonical o asset URL non approvato. Non fissare snapshot dell'intero HTML Next, che varia tra versioni. Sitemap/robots invariati salvo intervento separato.
- **Markdown/sicurezza:** fixture script, img onerror e link javascript rimosse; code fence, heading ID, link e immagini conservati; frontmatter non deve poter sostituire HTML/id derivati (correzione S4 da coordinare). Confrontare output semantico, non soltanto successo della build.
- **Browser:** navigazione home→ciascun articolo→home, About e history; zero nuovi errori hydration/console, cover non deformate, screenshot a 375 e 1280 px e tastiera/focus. Cookiebot/Analytics con tag disponibili e bloccati; controllare duplicazione listener/pageview e non cambiare il consenso senza verifica S3.
- **Dipendenze/CI:** npm ci con lockfile già generato senza modificarlo, build exit 0, npm ls senza missing/invalid/extraneous, audit completo e audit production annotati. `--omit=dev` non rappresenta da solo la superficie runtime perché vari plugin build sono dependencies.

Per un sito di queste dimensioni bastano inizialmente uno script HTTP/HTML con assert, test parser/sanitizzazione e un controllo browser mirato. L'introduzione di Playwright può essere proposta come devDependency per automatizzare la navigazione, non è obbligatoria per completare la baseline e non è stata effettuata oggi.

## Checklist operativa

- [x] Leggere istruzioni, audit, roadmap e codice rilevante.
- [x] Ripetere audit e distinguere 17 pacchetti dalle singole segnalazioni.
- [x] Verificare policy di supporto e metadata delle versioni target senza installarle.
- [x] Copiare sorgenti in directory temporanea senza node_modules o env locali.
- [x] Eseguire npm ci e build originali, verificando hash del lockfile.
- [x] Eseguire smoke HTTP di nove pagine, 404 e optimizer locale; arrestare server.
- [ ] Approvare strategia A e perimetro di modifiche applicative necessarie.
- [ ] Verificare provider, Node disponibile, OS/libc, CDN/cache e modalità di rilascio/rollback.
- [ ] Creare branch implementativo e test minimi, mantenendo una baseline ripristinabile.
- [ ] Fissare Node/npm, aggiornare framework/React e adattare Link/Image; verificare con Webpack.
- [ ] Migrare CSS in gruppo separato e correggere transitive/lockfile con audit.
- [ ] Eseguire installazione, build e regressioni sull'intero target e OS di destinazione.
- [ ] Presentare diff, risultati e rischi residui per revisione; chiedere separatamente autorizzazione a merge/deploy.

## Rollback

Prima della futura migrazione registrare SHA base, runtime/npm, manifest/lockfile e procedura hosting; conservare l'artefatto rilasciato attuale e le variabili senza inserirle in Git. Checkpoint separati framework, CSS e transitive consentono di isolare una regressione. Non riutilizzare `.next` o node_modules costruite con altra versione.

In sviluppo scartare il candidato isolato o ripristinare i soli file della migrazione da una base nota, senza cancellare lavoro altrui e senza reset distruttivi. Se le modifiche sono condivise, usare revert espliciti, mai force-push. Ricostruire con npm ci e il runtime della baseline, poi ripetere lo smoke.

Se un futuro deploy approvato introduce 5xx, route mancanti, hydration bloccante, immagini rotte o regressioni di consenso, ripristinare l'artefatto precedente con la procedura concordata del provider e ricontrollare le nove pagine. La procedura non è ancora provata perché hosting/deploy non sono stati ispezionati. Tornare a Next 12 riapre il rischio della baseline obsoleta: rollback temporaneo, con mitigazioni concordate e nuova correzione prioritaria, non soluzione di sicurezza permanente.

## Criteri di accettazione

**Piano S1/S2:** inventario advisory completo qui sotto; target motivati e verificati nelle fonti; baseline install/build/HTTP eseguita senza cambiare checkout/lockfile; limiti dichiarati. La chiusura dell'implementazione resta distinta dall'approvazione del piano.

**Futura migrazione:** Next su linea supportata e patch ri-verificata, Node LTS disponibile nell'hosting, peer React coerenti; nessun App Router, TypeScript o cambio URL. Nove pagine e 404 corrette, Markdown sanitizzato e leggibile, immagini e navigazione verificati, nessuna regressione di metadata/consenso. Nessuna vulnerabilità critical/high pertinente lasciata senza correzione o decisione esplicita documentata con prerequisiti, mitigazione e scadenza. Non basta un numero audit più basso e non si promette zero finding prima di aver risolto il tree target.

Npm ci e build devono riuscire sul target; suite minima e controlli browser realmente eseguiti, warning residui motivati. Nuovo lockfile revisionato, rollback definito e collaudato dove possibile. Merge e deploy rimangono soggetti ad approvazione separata.

## Appendice — Inventario individuale degli advisory

Elenco ricavato dalla risposta audit del lockfile originale. Ogni riga collega la fonte e riporta il range comunicato dal registry: non è un range target consigliato. Le valutazioni sono inferenze dall'uso del progetto, non exploit testati. La gravità è quella del singolo advisory, che può differire dalla massima assegnata al pacchetto. Non duplicare come advisory i riferimenti transitivi di tipo stringa (`next → postcss`, `react-cookie-consent → js-cookie`).


### brace-expansion ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-v6h2-p8h4-qcjw](https://github.com/advisories/GHSA-v6h2-p8h4-qcjw) ? brace-expansion Regular Expression Denial of Service vulnerability | low | `>=1.0.0 <=1.1.11` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-f886-m6hf-6m8v](https://github.com/advisories/GHSA-f886-m6hf-6m8v) ? brace-expansion: Zero-step sequence causes process hang and memory exhaustion | moderate | `<1.1.13` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-3jxr-9vmj-r5cp](https://github.com/advisories/GHSA-3jxr-9vmj-r5cp) ? brace-expansion: DoS via exponential-time expansion of consecutive non-expanding {} groups | high | `<1.1.16` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-mh99-v99m-4gvg](https://github.com/advisories/GHSA-mh99-v99m-4gvg) ? brace-expansion: DoS via unbounded expansion length causing an out-of-memory process crash | high | `<1.1.17` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-rgw5-rvv9-x895](https://github.com/advisories/GHSA-rgw5-rvv9-x895) ? brace-expansion: DoS via unbounded intermediate arrays, bypassing the CVE-2026-14257 mitigation | high | `<1.1.18` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-q2hr-2g5m-vwhr](https://github.com/advisories/GHSA-q2hr-2g5m-vwhr) ? brace-expansion: Quadratic-time expansion of the `{a},b}` rewrite causes CPU denial of service | moderate | `<1.1.21` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-qhr7-859c-m2p7](https://github.com/advisories/GHSA-qhr7-859c-m2p7) ? brace-expansion: DoS via uncontrolled recursion on nested brace groups causing stack exhaustion | high | `<1.1.20` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |
| [GHSA-6j4f-fj2g-mc7p](https://github.com/advisories/GHSA-6j4f-fj2g-mc7p) ? brace-expansion: DoS via uncontrolled recursion in parseCommaParts causing stack exhaustion | high | `<1.1.19` | Build/glob transitiva: espansione di pattern ostili non osservata; aggiornare parent/patch. |

### braces ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-grv7-fg5c-xmjg](https://github.com/advisories/GHSA-grv7-fg5c-xmjg) ? Uncontrolled resource consumption in braces | high | `<3.0.3` | Build/watch transitiva: pattern ostili non osservati; aggiornare risoluzione. |

### browserslist ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-c83g-rgw3-j3cx](https://github.com/advisories/GHSA-c83g-rgw3-j3cx) ? Browserslist: Unbounded memory growth (no cache eviction) via distinct query results, leading to eventual OOM | high | `<=4.28.6` | Build/autoprefixer transitiva: query distinte o stats non fidati non osservati. |
| [GHSA-73wf-gq98-2v4g](https://github.com/advisories/GHSA-73wf-gq98-2v4g) ? Browserslist: Uncaught crash / prototype write via untrusted browserslist-stats.json custom stats (normalizeStats) | high | `<=4.28.6` | Build/autoprefixer transitiva: query distinte o stats non fidati non osservati. |

### js-cookie ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-qjx8-664m-686j](https://github.com/advisories/GHSA-qjx8-664m-686j) ? JavaScript Cookie: Per-instance prototype hijack in assign() enables cookie-attribute injection | high | `<=3.0.5` | Residuo lockfile, assente dopo ci e nessun import applicativo: esposizione attuale non dimostrata. |

### js-yaml ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-mh29-5h37-fv8m](https://github.com/advisories/GHSA-mh29-5h37-fv8m) ? js-yaml has prototype pollution in merge (<<) | moderate | `<3.14.2` | Build/frontmatter transitiva: parser realmente usato, input ostile possibile da contributori; nessun exploit eseguito. |
| [GHSA-h67p-54hq-rp68](https://github.com/advisories/GHSA-h67p-54hq-rp68) ? JS-YAML: Quadratic-complexity DoS in merge key handling via repeated aliases | moderate | `<3.15.0` | Build/frontmatter transitiva: parser realmente usato, input ostile possibile da contributori; nessun exploit eseguito. |
| [GHSA-52cp-r559-cp3m](https://github.com/advisories/GHSA-52cp-r559-cp3m) ? js-yaml: YAML merge-key chains can force quadratic CPU consumption | high | `>=3.0.0 <3.15.0` | Build/frontmatter transitiva: parser realmente usato, input ostile possibile da contributori; nessun exploit eseguito. |
| [GHSA-5p4m-2wfm-xmqj](https://github.com/advisories/GHSA-5p4m-2wfm-xmqj) ? JS-YAML: Quadratic CPU consumption in !!omap resolution (3.x and 4.x) — CVE-2026-59870 fix not backported | high | `>=3.0.0 <3.15.1` | Build/frontmatter transitiva: parser realmente usato, input ostile possibile da contributori; nessun exploit eseguito. |
| [GHSA-2883-xcg3-v3hh](https://github.com/advisories/GHSA-2883-xcg3-v3hh) ? js-yaml: maxTotalMergeKeys does not limit CPU use for empty merge sources | high | `>=3.0.0 <3.15.2` | Build/frontmatter transitiva: parser realmente usato, input ostile possibile da contributori; nessun exploit eseguito. |

### lodash ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-r5fr-rjxr-66jc](https://github.com/advisories/GHSA-r5fr-rjxr-66jc) ? lodash vulnerable to Code Injection via `_.template` imports key names | high | `>=4.0.0 <=4.17.23` | Build/plugin transitiva: chiamate vulnerabili con input non fidati non dimostrate. |
| [GHSA-xxjr-mmjv-4gpg](https://github.com/advisories/GHSA-xxjr-mmjv-4gpg) ? Lodash has Prototype Pollution Vulnerability in `_.unset`, `_.omit`, and `_.pullAt` functions | moderate | `>=4.0.0 <=4.17.22` | Build/plugin transitiva: chiamate vulnerabili con input non fidati non dimostrate. |

### micromatch ? moderate (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-952p-6rrq-rcjv](https://github.com/advisories/GHSA-952p-6rrq-rcjv) ? Regular Expression Denial of Service (ReDoS) in micromatch | moderate | `<4.0.8` | Build/glob transitiva: pattern ostile non osservato. |

### minimatch ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-3ppc-4f35-3m26](https://github.com/advisories/GHSA-3ppc-4f35-3m26) ? minimatch has a ReDoS via repeated wildcards with non-matching literal in pattern | high | `<3.1.3` | Build/glob transitiva: pattern ostile non osservato. |
| [GHSA-7r86-cg39-jmmj](https://github.com/advisories/GHSA-7r86-cg39-jmmj) ? minimatch has ReDoS: matchOne() combinatorial backtracking via multiple non-adjacent GLOBSTAR segments | high | `<3.1.3` | Build/glob transitiva: pattern ostile non osservato. |
| [GHSA-23c5-xmqv-rm74](https://github.com/advisories/GHSA-23c5-xmqv-rm74) ? minimatch ReDoS: nested *() extglobs generate catastrophically backtracking regular expressions | high | `<3.1.4` | Build/glob transitiva: pattern ostile non osservato. |

### nanoid ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-mwcw-c2x4-8c55](https://github.com/advisories/GHSA-mwcw-c2x4-8c55) ? Predictable results in nanoid generation when given non-integer values | moderate | `<3.3.8` | Build/PostCSS transitiva: nessuna size controllata da visitatore n? uso per token osservati. |
| [GHSA-28wg-ghj8-5hjv](https://github.com/advisories/GHSA-28wg-ghj8-5hjv) ? nanoid: non-secure generators can loop indefinitely with negative size | high | `<3.3.16` | Build/PostCSS transitiva: nessuna size controllata da visitatore n? uso per token osservati. |
| [GHSA-2v37-7h3g-55p8](https://github.com/advisories/GHSA-2v37-7h3g-55p8) ? nanoid: custom generators can loop indefinitely when size is zero | high | `<3.3.18` | Build/PostCSS transitiva: nessuna size controllata da visitatore n? uso per token osservati. |
| [GHSA-xwg4-73v4-xw9w](https://github.com/advisories/GHSA-xwg4-73v4-xw9w) ? nanoid: Integer Overflow or Wraparound | high | `<3.3.12` | Build/PostCSS transitiva: nessuna size controllata da visitatore n? uso per token osservati. |

### next ? critical (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-c59h-r6p8-q9wc](https://github.com/advisories/GHSA-c59h-r6p8-q9wc) ? Next.js missing cache-control header may lead to CDN caching empty reply | low | `>=0.9.9 <13.4.20-canary.13` | Runtime/cache CDN: mancanza header; hosting/CDN non verificati, esposizione non dimostrata. |
| [GHSA-g77x-44xx-532m](https://github.com/advisories/GHSA-g77x-44xx-532m) ? Denial of Service condition in Next.js image optimization | moderate | `>=10.0.0 <14.2.7` | Runtime/image: optimizer presente e locale HTTP 200; DoS remoto non provato. |
| [GHSA-g5qg-72qw-gw5v](https://github.com/advisories/GHSA-g5qg-72qw-gw5v) ? Next.js Affected by Cache Key Confusion for Image Optimization API Routes | moderate | `>=0.9.9 <14.2.31` | Runtime/image cache: superficie presente; comportamento cache/proxy da verificare. |
| [GHSA-7gfc-8cq8-jh5f](https://github.com/advisories/GHSA-7gfc-8cq8-jh5f) ? Next.js authorization bypass vulnerability | high | `>=9.5.5 <14.2.15` | Runtime/auth: nessun middleware/autorizzazione applicativo trovato; prerequisito non osservato. |
| [GHSA-4342-x723-ch2f](https://github.com/advisories/GHSA-4342-x723-ch2f) ? Next.js Improper Middleware Redirect Handling Leads to SSRF | moderate | `>=0.9.9 <14.2.32` | Runtime/middleware redirect: middleware assente nel repository; configurazioni esterne non verificate. |
| [GHSA-xv57-4mr9-wg8v](https://github.com/advisories/GHSA-xv57-4mr9-wg8v) ? Next.js Content Injection Vulnerability for Image Optimization | moderate | `>=0.9.9 <14.2.31` | Runtime/image content injection: optimizer presente; input ostile e cache produttiva non verificati. |
| [GHSA-qpjv-v59x-3qc4](https://github.com/advisories/GHSA-qpjv-v59x-3qc4) ? Next.js Race Condition to Cache Poisoning | low | `>=0.9.9 <14.2.24` | Runtime/cache race: SSR/ISR non trovati; sito SSG, prerequisiti e CDN da verificare. |
| [GHSA-9g9p-9gw9-jx7f](https://github.com/advisories/GHSA-9g9p-9gw9-jx7f) ? Next.js self-hosted applications vulnerable to DoS via Image Optimizer remotePatterns configuration | moderate | `>=10.0.0 <15.5.10` | Runtime/image remotePatterns: nessuna configurazione remota trovata; prerequisito non osservato. |
| [GHSA-f82v-jwr5-mffw](https://github.com/advisories/GHSA-f82v-jwr5-mffw) ? Authorization Bypass in Next.js Middleware | critical | `>=12.0.0 <12.3.5` | Runtime/middleware auth: nessun middleware o area autenticata, bypass non dimostrato. |
| [GHSA-ggv3-7p47-pfv8](https://github.com/advisories/GHSA-ggv3-7p47-pfv8) ? Next.js: HTTP request smuggling in rewrites | moderate | `>=9.5.0 <15.5.13` | Runtime/rewrites: rewrites applicative assenti; proxy esterno non ispezionato. |
| [GHSA-3x4c-7xq6-9pq8](https://github.com/advisories/GHSA-3x4c-7xq6-9pq8) ? Next.js: Unbounded next/image disk cache growth can exhaust storage | moderate | `>=10.0.0 <15.5.14` | Runtime/image disco: optimizer locale presente; crescita cache/quota in produzione non misurate. |
| [GHSA-h64f-5h5j-jqjh](https://github.com/advisories/GHSA-h64f-5h5j-jqjh) ? Next.js has a Denial of Service in the Image Optimization API | moderate | `>=10.0.0 <15.5.16` | Runtime/image: superficie presente; DoS non tentato e sfruttabilit? non dimostrata. |
| [GHSA-p9j2-gv94-2wf4](https://github.com/advisories/GHSA-p9j2-gv94-2wf4) ? Next.js: Server-Side Request Forgery in rewrites via attacker-controlled destination hostname | high | `>=12.0.0 <15.5.21` | Runtime/rewrites SSRF: rewrites applicative assenti; destinazioni ostili non dimostrate. |
| [GHSA-2xp9-vwfh-vxw4](https://github.com/advisories/GHSA-2xp9-vwfh-vxw4) ? Next.js: Unauthenticated Remote Code Execution in Image Optimization API when AVIF files are used | critical | `>=10.0.0 <15.5.24` | Runtime/image AVIF: sharp/libheif e formati raggiungibili da verificare; sharp assente nel vecchio lockfile. |
| [GHSA-2464-fhr4-w9xw](https://github.com/advisories/GHSA-2464-fhr4-w9xw) ? Next.js: Unauthenticated Remote Code Execution in Image Optimization API when SVG files are used | critical | `>=10.0.0 <=15.5.27` | Runtime/image SVG: Linux glibc e sharp upstream richiesti dall?advisory; baseline Windows senza sharp, produzione non verificata. |

### picomatch ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-3v7f-55p6-f55p](https://github.com/advisories/GHSA-3v7f-55p6-f55p) ? Picomatch: Method Injection in POSIX Character Classes causes incorrect Glob Matching | moderate | `<2.3.2` | Build/watch transitiva: pattern ostile non osservato. |
| [GHSA-c2c7-rcm5-vvqj](https://github.com/advisories/GHSA-c2c7-rcm5-vvqj) ? Picomatch has a ReDoS vulnerability via extglob quantifiers | high | `<2.3.2` | Build/watch transitiva: pattern ostile non osservato. |

### postcss ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-7fh5-64p2-3v2j](https://github.com/advisories/GHSA-7fh5-64p2-3v2j) ? PostCSS line return parsing error | moderate | `<8.4.31` | Build CSS diretto e transitivo Next: elaborazione presente, CSS/sourcemap ostile non dimostrato; correggere entrambe le copie. |
| [GHSA-qx2v-qp2m-jg93](https://github.com/advisories/GHSA-qx2v-qp2m-jg93) ? PostCSS has XSS via Unescaped </style> in its CSS Stringify Output | moderate | `<8.5.10` | Build CSS diretto e transitivo Next: elaborazione presente, CSS/sourcemap ostile non dimostrato; correggere entrambe le copie. |
| [GHSA-6g55-p6wh-862q](https://github.com/advisories/GHSA-6g55-p6wh-862q) ? PostCSS: Arbitrary file read and information disclosure via attacker-controlled sourceMappingURL in CSS comments | high | `<=8.5.11` | Build CSS diretto e transitivo Next: elaborazione presente, CSS/sourcemap ostile non dimostrato; correggere entrambe le copie. |
| [GHSA-fxqj-rqcc-2cmp](https://github.com/advisories/GHSA-fxqj-rqcc-2cmp) ? PostCSS: incomplete fix of GHSA-6g55-p6wh-862q — attacker-controlled sourceMappingURL reads arbitrary .map files when `from` is unset | moderate | `<=8.5.22` | Build CSS diretto e transitivo Next: elaborazione presente, CSS/sourcemap ostile non dimostrato; correggere entrambe le copie. |
| [GHSA-r28c-9q8g-f849](https://github.com/advisories/GHSA-r28c-9q8g-f849) ? PostCSS: Path Traversal in Previous Source Map Auto-Loading (sourceMappingURL) leads to Arbitrary .map File Disclosure | high | `<=8.5.17` | Build CSS diretto e transitivo Next: elaborazione presente, CSS/sourcemap ostile non dimostrato; correggere entrambe le copie. |

### postcss-selector-parser ? moderate (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-rj75-hqrm-r3gf](https://github.com/advisories/GHSA-rj75-hqrm-r3gf) ? PostCSS: Quadratic complexity in flat selector parsing allows CPU exhaustion | moderate | `<6.1.5` | Build/Tailwind transitiva: selector ostile non osservato. |

### react-cookie-consent ? high (massima pacchetto)

Segnalazione ereditata da js-cookie, senza advisory diretto aggiuntivo. Nel caso di react-cookie-consent il pacchetto non viene installato da ci.

### source-map-js ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-68fv-2mgg-jv7q](https://github.com/advisories/GHSA-68fv-2mgg-jv7q) ? source-map-js allows event-loop denial of service through indexed source-map section offsets | high | `>=1.0.0 <1.2.2` | Build/PostCSS transitiva, due copie: sourcemap ostile non dimostrata. |

### tmp ? high (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-52f5-9888-hmc6](https://github.com/advisories/GHSA-52f5-9888-hmc6) ? tmp allows arbitrary temporary file / directory write via symbolic link `dir` parameter | low | `<=0.2.3` | Build/Tailwind transitiva: accesso locale o prefix/postfix ostile non dimostrati. |
| [GHSA-ph9p-34f9-6g65](https://github.com/advisories/GHSA-ph9p-34f9-6g65) ? tmp has Path Traversal via unsanitized prefix/postfix that enables directory escape | high | `<0.2.6` | Build/Tailwind transitiva: accesso locale o prefix/postfix ostile non dimostrati. |

### yaml ? moderate (massima pacchetto)

| Advisory | Gravit? | Range segnalato | Valutazione sul progetto |
|---|---|---|---|
| [GHSA-48c2-rrv3-qjmp](https://github.com/advisories/GHSA-48c2-rrv3-qjmp) ? yaml is vulnerable to Stack Overflow via deeply nested YAML collections | moderate | `>=1.0.0 <1.10.3` | Build/config transitiva: YAML non fidato profondamente annidato non osservato. |

Totale: **54 advisory diretti**, distribuiti sui pacchetti segnalati; gli effetti transitivi non sono conteggiati una seconda volta. La risposta audit ? uno snapshot del registry: va ripetuta prima di implementare e dopo aver generato il nuovo lockfile.
