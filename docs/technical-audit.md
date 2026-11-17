# Technical audit — pietrodellanotte.dev

Data: 15 novembre 2026. Analisi locale del repository, nel rispetto di `AGENTS.md`. Nessuna modifica applicativa o alle dipendenze; nessun commit, push, merge o deploy. Branch dedicato: `docs/technical-audit-roadmap`.

## Perimetro e metodo

Sono stati letti componenti, pagine, utility, configurazioni, sette articoli Markdown, sitemap, robots e manifest delle dipendenze. Sono stati controllati anche gli HTML prodotti dalla build. Le righe citate si riferiscono al codice analizzato, non agli artefatti generati.

**Verificato** indica un comportamento osservato o una proprietà direttamente visibile nel codice. **Da verificare** indica un rischio condizionale, non una vulnerabilità dimostrata. Le gravità Critical, High, Medium e Low esprimono priorità tecnica; Small indica indicativamente fino a un giorno, Medium 2–5 giorni, Large oltre 5 giorni. Non sono preventivi.

## Architettura e aspetti positivi

Il progetto usa Next.js 12 Pages Router, React 17 e JavaScript, senza backend applicativo né database. `pages/index.js` genera staticamente l'elenco; `pages/posts/[id].js:65–79` usa `getStaticPaths`, `getStaticProps` e `fallback: false`. About è statica. Questa architettura è adatta a un blog piccolo e ai costi contenuti: non serve una riscrittura.

`lib/posts.js` legge il filesystem e converte Markdown in HTML durante la generazione. `components/Layout.js` concentra struttura e cover, `helpers/config.js` parte della configurazione SEO, `lib/ga` gli eventi analytics. Tailwind JIT e typography gestiscono gli stili. Le immagini sono locali; profilo e cover usano già `next/image` con dimensioni e `priority`.

I sette articoli hanno tutti i sei campi attuali, date interpretabili, `canonical` uguale al filename senza estensione e cover esistenti. Le 13 destinazioni locali distinte estratte dai riferimenti Markdown esaminati esistono. Le sette route sono state generate dalla build. L'HTML prodotto contiene una sola description per pagina: non è stato confermato un problema di duplicazione fra Layout e articolo.

## Dipendenze

Versioni effettive del lockfile v1, coincidenti con quelle installate per le dipendenze dichiarate:

| Pacchetto | Range dichiarato | Versione risolta |
|---|---|---|
| next | ^12.1.1 | 12.1.1 |
| react / react-dom | 17.0.1 | 17.0.1 |
| tailwindcss | ^2.2.19 | 2.2.19 |
| @tailwindcss/typography | ^0.4.1 | 0.4.1 |
| date-fns | ^2.28.0 | 2.28.0 |
| gray-matter | ^4.0.3 | 4.0.3 |
| remark | ^13.0.0 | 13.0.0 |
| remark-html | ^13.0.2 | 13.0.2 |
| remark-images | ^3.1.0 | 3.1.0 |
| remark-heading-id | ^1.0.0 | 1.0.0 |
| autoprefixer | ^10.4.4 | 10.4.4 |
| postcss | ^8.4.12 | 8.4.12 |

### A01 — Segnalazioni di sicurezza nelle dipendenze

- **Gravità:** Critical, come massima gravità riportata dal registry; **stato:** segnalazioni verificate, sfruttabilità sul sito da verificare; **complessità:** Large per il percorso completo di aggiornamento.
- **File:** `package.json:10–27`, `package-lock.json` (voci delle dipendenze).
- **Problema:** `npm audit --json --package-lock-only` termina con exit code 1 e riporta 17 pacchetti segnalati: 1 critical, 13 high, 3 moderate. Non sono 17 exploit distinti né 17 vulnerabilità dimostrate sul sito.
- **Dettaglio:** critical: `next`; high: `brace-expansion`, `braces`, `browserslist`, `js-cookie`, `js-yaml`, `lodash`, `minimatch`, `nanoid`, `picomatch`, `postcss`, `react-cookie-consent`, `source-map-js`, `tmp`; moderate: `micromatch`, `postcss-selector-parser`, `yaml`. Moderate del registry corrisponde a Medium nella classificazione del documento. Alcune segnalazioni sono transitive o riguardano strumenti di build; `js-cookie` e `react-cookie-consent` sono anche extraneous nell'installazione locale e presenti nel lockfile, non dipendenze dichiarate nell'attuale package.json.
- **Impatto:** esposizione potenziale di runtime e pipeline; non tutti gli advisory si applicano alle funzionalità usate. Nessun middleware o endpoint API applicativo è presente. L'advisory sul bypass middleware, per esempio, non dimostra un bypass su questo blog. Hosting e accessibilità dell'image optimizer non sono stati verificati.
- **Proposta:** classificare advisory, prerequisiti e dipendenze raggiungibili; scegliere versioni corrette e supportate con matrice Node/React/Next/plugin; aggiornare incrementalmente con regressione delle route e del rendering. Non eseguire `npm audit fix --force` alla cieca. Next.js 12 è fuori dal supporto di sicurezza secondo il [postmortem ufficiale Vercel](https://vercel.com/blog/postmortem-on-next-js-middleware-bypass). Pages Router può essere conservato; App Router e TypeScript richiedono approvazione e non sono prerequisiti dell'intervento.

### A02 — Installazione non pulita e ambiente non riproducibile

- **Gravità:** Medium; **stato:** verificato; **complessità:** Small.
- **File:** `package.json:5–8`, `package-lock.json`, `README.md:1–3`.
- **Problema:** `npm ls --depth=0` mostra quattro pacchetti extraneous: `js-cookie`, `prop-types`, `react-cookie-consent`, `react-is`. Mancano un vincolo Node/gestore pacchetti e istruzioni operative sufficienti.
- **Impatto:** una build sulla node_modules esistente non certifica la riproducibilità da checkout pulito.
- **Proposta:** scegliere e documentare una versione Node supportata, eseguire `npm ci` in ambiente isolato e confrontare il risultato; revisionare il lockfile senza aggiornamenti indiscriminati.

## Codice, contenuti e sicurezza

### A03 — File Markdown e frontmatter non validati

- **Gravità:** Medium; **stato:** verificato nel codice, nessun articolo attuale invalido; **complessità:** Medium.
- **File:** `lib/posts.js:10–48,51–71`, `components/date.js:3–5`, `pages/posts/[id].js:12–24`.
- **Problema:** `readdirSync` non filtra file regolari `.md`; non esiste uno schema per campi, date, slug, unicità e asset. Lo spread del frontmatter segue `id` e `contentHtml`, consentendo a campi omonimi di sovrascriverli. A parità di data il comparatore restituisce -1 invece di 0.
- **Impatto:** directory o file estranei possono interrompere la build; metadati errati generano errori, canonical incoerenti o HTML sovrascritto. Il rischio di sovrascrittura di `contentHtml` riguarda chi può modificare i contenuti, non un input HTTP pubblico.
- **Proposta:** filtrare estensione e tipo, validare i campi esistenti, non accettare chiavi interne, comporre i valori derivati dopo i dati ammessi, garantire ordinamento deterministico e messaggi con filename. Conservare i formati e gli URL attuali.

### A04 — Sanitizzazione da proteggere durante l'evoluzione

- **Gravità:** Low per il controllo mancante; **stato:** sanitizzazione verificata, possibili regressioni da verificare; **complessità:** Small.
- **File:** `lib/posts.js:59–64`, `pages/posts/[id].js:45–48`.
- **Problema:** l'HTML viene inserito con `dangerouslySetInnerHTML`, ma **remark-html 13.0.2 sanitizza per default**. Il sorgente installato e tre prove in memoria confermano rimozione di script, img con onerror e URL javascript. Non è stata dimostrata una XSS attraverso il normale corpo Markdown.
- **Impatto:** aggiornamenti di plugin o impostazioni potrebbero cambiare le garanzie; le prove eseguite non coprono ogni payload e non proteggono la sovrascrittura da frontmatter di A03.
- **Proposta:** rendere esplicita la politica, aggiungere test di regressione per input ostili, link, immagini, code fence e heading ID, senza introdurre un secondo sanitizer se non necessario.

### A05 — Copertura automatica e documentazione assenti

- **Gravità:** Medium; **stato:** verificato; **complessità:** Medium.
- **File:** `package.json:5–8`, `README.md:1–3`; nessuna suite o workflow CI tracciato individuato.
- **Problema:** non ci sono script test/lint né configurazione ESLint; la build avverte dell'assenza di quest'ultima. Import inutilizzati (`useRouter`, relativo `router` in `pages/posts/[id].js:6,11`) e convenzioni non uniformi aumentano il rumore di manutenzione.
- **Impatto:** regressioni su route, metadati, rendering e consenso richiedono controlli manuali.
- **Proposta:** pochi test significativi su parser, sicurezza, URL e pagine prodotte; lint compatibile con lo stack scelto; README con ambiente, comandi e processo editoriale. Evitare test che duplicano soltanto l'implementazione.

## SEO e metadata

### A06 — Dominio sitemap diverso dai canonical

- **Gravità:** Medium; **stato:** verificato; **complessità:** Small.
- **File:** `helpers/config.js:1–2`, `public/sitemap.xml:4–28`, `public/robots.txt:5`, `pages/posts/[id].js:23,28`.
- **Problema:** canonical/OG e robots usano www, i sette URL della sitemap non lo usano. Il dominio preferito e i redirect dell'hosting non sono verificati.
- **Impatto:** segnali SEO discordanti e possibili redirect superflui; duplicate content effettivo non dimostrato.
- **Proposta:** verificare il comportamento pubblico dei due host, concordare il dominio preferito e centralizzarlo; allineare sitemap, robots e metadata preservando path e slug.

### A07 — Sitemap manuale e metadata incompleti

- **Gravità:** Medium; **stato:** verificato; **complessità:** Medium.
- **File:** `public/sitemap.xml:1–31`, `pages/index.js:21–23`, `pages/about.js:7–9`, `components/Layout.js:18–24`, `pages/posts/[id].js:23–38`.
- **Problema:** sitemap statica senza home e About, ma con tutti e sette gli articoli attuali; nessuna generazione automatica. Home e About non hanno canonical o OG dedicati e condividono la description del Layout. Gli articoli dichiarano `og:type=website`.
- **Impatto:** future omissioni editoriali e condivisioni meno informative. L'assenza di home/About dalla sitemap non prova mancata indicizzazione. Le differenze fra `lastmod` e data di pubblicazione non provano date errate: manca una fonte verificata delle modifiche.
- **Proposta:** generare sitemap dallo stesso inventario delle route, con XML escaping e lastmod solo attendibili; metadata per pagina, `article` per gli articoli e canonical derivati dalla route validata. Non inventare date di aggiornamento.

### A08 — Entità HTML nel frontmatter testuale

- **Gravità:** Low; **stato:** verificato nell'HTML generato; **complessità:** Small.
- **File:** `posts/destrutturazione-di-array-in-php-spiegata-semplice.md:4`, `posts/differenza-let-var-const-javascript.md:4`, `pages/posts/[id].js:24,31,36`.
- **Problema:** description con `&#039;` già codificato, reso da React come `&amp;#039;`. Il valore DOM contiene quindi l'entità letterale anziché l'apostrofo atteso.
- **Impatto:** possibile visualizzazione di entità nei metadata e nelle anteprime.
- **Proposta:** usare testo Unicode naturale nel frontmatter, affidando a React l'escaping e mantenendo validazione dei testi.

## Performance, immagini e accessibilità

### A09 — Immagini del corpo prive di pipeline responsive

- **Gravità:** Medium; **stato:** markup verificato, impatto CWV da misurare; **complessità:** Medium.
- **File:** `lib/posts.js:59–63`, immagini in `posts/salesforce-commerce-cloud-job-framework.md:30–116` e `posts/il-mio-miglior-snippet-di-codice-in-assoluto.md:21`; `components/Layout.js:32–53`.
- **Problema:** le immagini Markdown passano a normali img senza una gestione esplicita di dimensioni, lazy loading e varianti responsive. Le cover usano già next/image: non vanno considerate tutte non ottimizzate. Asset sorgente maggiori: cover for/forEach 977.408 byte, cover snippet 816.821 byte, profilo 786.419 byte, cover Salesforce 701.563 byte.
- **Impatto:** trasferimenti e layout shift potenziali; questi byte su disco non equivalgono ai byte effettivamente trasferiti dal browser tramite image optimizer.
- **Proposta:** misurare prima LCP/CLS e rete, comprimere sorgenti con confronto visivo, aggiungere dimensioni e caricamento differito nel corpo, conservando la priorità solo per immagini rilevanti above the fold. Valutare requisiti hosting dell'optimizer.

### A10 — Font esterno caricato mediante CSS import

- **Gravità:** Low; **stato:** verificato, ritardo da misurare; **complessità:** Small.
- **File:** `styles/global.css:1`, `tailwind.config.js:69–70`.
- **Problema:** Google Fonts esterno con cinque pesi; font-family senza fallback esplicito nel tema.
- **Impatto:** dipendenza di rete esterna, possibile ritardo di rendering e necessità di considerare la richiesta nella verifica privacy. Nessun benchmark eseguito.
- **Proposta:** verificare pesi realmente usati, aggiungere fallback e valutare font locali previa analisi licenza. Non usare API disponibili soltanto in Next più recente senza verificarne la compatibilità.

### A11 — Semantica e testi accessibili migliorabili

- **Gravità:** Medium; **stato:** difetti di markup verificati, conformità complessiva da verificare; **complessità:** Medium.
- **File:** `pages/about.js:10–24`, `components/Layout.js:49–62`, `pages/posts/[id].js:52–57`, `posts/salesforce-commerce-cloud-job-framework.md:30–116`.
- **Problema:** About non ha h1, confermato nell'HTML; la cover usa lo slug come alt; vari screenshot differenti hanno lo stesso alt. Il link con sola freccia si affida a title e a un attributo alt non valido per gli anchor.
- **Impatto:** orientamento e descrizioni meno chiari per tecnologie assistive.
- **Proposta:** h1 descrittivo, alt contestuali o vuoti per elementi decorativi, nome accessibile esplicito per la freccia. Verificare tastiera, focus, zoom 200%, contrasto e overflow a 320/375/768/1280 px. I container max-width e padding sono presenti, ma non certificano il responsive design; non sono stati osservati difetti visuali in browser.

## Google Analytics e Cookiebot

### A12 — Mappatura incoerente del consenso

- **Gravità:** High; **stato:** errore nel codice verificato, comportamento CMP/rete da verificare; **complessità:** Medium.
- **File:** `pages/_app.js:27–65`.
- **Problema:** default `analytics_storage=denied`; accettazione dei cookie statistics aggiorna invece `ad_storage=granted`, rifiuto aggiorna solo `ad_storage=denied`. La gestione custom non collega quindi correttamente la scelta statistica al relativo stato analytics. L'eventuale integrazione automatica esterna di Cookiebot non è stata ispezionata.
- **Impatto:** stato analytics potenzialmente sempre negato e stato advertising non coerente con la categoria scelta; non è stata accertata una violazione normativa né osservato traffico non consentito.
- **Proposta:** verificare insieme configurazione CMP e tag, scegliere un unico responsabile degli aggiornamenti, mappare ciascuna categoria e controllare prima visita, rifiuto, consenso parziale, revoca, reload e navigazione client. Valutare i parametri Consent Mode pertinenti alle funzionalità effettive, senza abilitare advertising per il consenso statistics. Riferimento: [guida ufficiale Google](https://developers.google.com/tag-platform/security/guides/consent).

### A13 — Analytics senza guard e caricamento script fragile

- **Gravità:** Medium; **stato:** chiamate prive di guard verificate, errore runtime condizionale non riprodotto; **complessità:** Small.
- **File:** `lib/ga/index.js:2–10`, `pages/_app.js:13–17,27–31,49–65`.
- **Problema:** `window.gtag` è invocato senza controllo; gli script sono richiesti anche senza un controllo esplicito della variabile analytics. Cookiebot è un normale script nel componente App; lo Script inline dei listener non ha id. Vengono tracciati anche gli hash change.
- **Impatto:** possibili errori quando il tag non è inizializzato o è bloccato, conteggi non desiderati e gestione meno prevedibile degli script; non è dimostrato che ogni hash change sia erroneo.
- **Proposta:** guard di disponibilità e configurazione, strategia script compatibile con Next.js 12 e CMP, id stabile e test navigazione con tag bloccati. Definire se gli hash debbano essere pageview e verificarne la deduplicazione. Non riportare valori di `.env.local` nei documenti.

## Multilingual blog

### A14 — Lingua fissa e assenza di associazione traduzioni

- **Gravità:** Medium rispetto al requisito bilingue futuro; **stato:** verificato, non un bug per gli attuali articoli italiani; **complessità:** Large.
- **File:** `pages/_document.js:11`, `components/date.js:2–5`, `lib/posts.js:10–71`, `pages/index.js:36–43`, `pages/posts/[id].js:21–38,65–79`.
- **Problema:** HTML e date sono sempre italiani; nessun filtro lingua, translationKey, language switch o hreflang. La route attuale è un segmento id; l'algoritmo non legge sottodirectory.
- **Impatto:** aggiungere soltanto un file inglese lo inserirebbe nell'elenco comune con lingua HTML e date italiane.
- **Proposta da approvare:** mantenere `/posts/<id>` per l'italiano esistente; introdurre, per esempio, `/en/posts/<slug>` per l'inglese, restando su Pages Router. Usare `lang` opzionale con default `it`, `translationKey` opzionale per collegare versioni e `tags` opzionali. Decidere convenzione dei file prima dell'implementazione. Canonical autonomi e hreflang reciproci solo per traduzioni presenti; lingua HTML e locale date coerenti. Nessuna traduzione automatica degli articoli precedenti e nessun cambio di slug esistente.

## Verifiche eseguite e limiti

| Controllo | Risultato |
|---|---|
| Ambiente | Node 20.20.2, npm 10.8.2; non è una certificazione di supporto dello stack |
| `npm ls --depth=0` | Eseguito; dipendenze dichiarate presenti e quattro extraneous |
| `npm audit --json --package-lock-only` | Eseguito, exit 1 per segnalazioni; riepilogo in A01; risposta del registry corrente, non prova di compromissione |
| `npm run build` | Exit 0; tutte le sette route articolo generate, più home/About/404; scritti solo artefatti ignorati `.next` |
| Warning build | caniuse-lite obsoleto, ESLint non configurato, Tailwind JIT dichiarato preview dalla versione installata |
| Frontmatter e asset | 7/7 con campi attuali, date interpretabili, slug coerenti e cover esistenti; nessun riferimento immagine locale mancante fra quelli estratti |
| HTML generato | Lang it su home/About/articoli; una description per pagina; canonical sui sette post; About senza h1; entità doppie nelle description indicate |
| Markdown | Tre payload sintetici rimossi; heading `{#bonus}` produce `id="user-content-bonus"`; non è una suite esaustiva |
| `npm ci` | Non eseguito: rimuove/sostituisce node_modules; mantenuto l'ambiente esistente per il vincolo di non distruttività. Riproducibilità pulita ancora da verificare |
| Test/lint | Nessuna suite/script o configurazione lint disponibile; non sono dichiarati passati |
| HTTP delle route | Non eseguito avvio server/smoke HTTP; la generazione HTML non prova status e redirect runtime |
| Browser, CWV, accessibilità | Nessuna sessione browser, Lighthouse, axe o misura sul campo; responsive, contrasto, tastiera e metriche restano da verificare |
| Produzione e privacy | Non verificati DNS, redirect www, header, cache/CDN, richieste cookie/tag e pannello Cookiebot; nessuna conclusione legale |

La build riporta First Load JS condiviso di 71,9 kB e circa 88 kB per i post: sono dati del report del bundler, non un benchmark di navigazione o una misura dei Core Web Vitals. Nessun segreto è stato riprodotto; `.env.local` esiste ed è ignorato, il suo contenuto non è stato stampato. `.gitignore` protegge varianti `.env.*.local`, non qualsiasi possibile file di credenziali: eventuali nuove convenzioni vanno controllate prima del commit.

## Direzione raccomandata

Prima stabilizzare sicurezza, consenso e riproducibilità; poi unificare URL e pipeline SEO; introdurre il bilingue in modo incrementale; infine pubblicare Laravel N+1 con controlli editoriali. Le modifiche architetturali e gli aggiornamenti importanti restano proposte soggette ad approvazione secondo AGENTS.md. Le attività operative sono in `roadmap.md`.
