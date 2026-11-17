# Roadmap tecnica — pietrodellanotte.dev

Data: 15 novembre 2026. Basata su [technical-audit.md](technical-audit.md). Tutte le attività sono proposte: questo lavoro crea soltanto documentazione. Nessun aggiornamento, pubblicazione, merge o deploy è autorizzato dalla checklist.

Priorità: P0 urgente per triage di sicurezza; P1 alta; P2 media; P3 bassa. Stime in giornate di lavoro di una persona, indicative, escluse attese, approvazioni e pubblicazione. Small fino a 1 giorno, Medium 2–5, Large oltre 5. Ogni intervento va su branch dedicato; modifiche significative richiedono proposta concreta con rischi e approvazione. Conservare Pages Router, JavaScript e tutti gli URL attuali; non introdurre servizi o framework senza approvazione.

## Phase 1 — Stabilization

- [ ] **S1 — Classificare gli advisory e definire il piano dipendenze**
  - **Priorità:** P0. **Riferimenti:** A01.
  - **Descrizione:** ripetere audit del lockfile, separare runtime/build/extraneous e verificare prerequisiti degli advisory, hosting e image optimizer; proporre matrice Node/Next/React/plugin e percorso incrementale. Nessun aggiornamento forzato automatico.
  - **File:** `package.json`, `package-lock.json`, `README.md`, `docs/technical-audit.md`; configurazione hosting da identificare.
  - **Dipendenze:** nessuna.
  - **Accettazione:** ogni segnalazione classificata con fonte e applicabilità; target compatibili e rischi documentati; piano sottoposto ad approvazione prima di modifiche significative. Nessuna deduzione di compromissione dal solo audit.
  - **Impegno:** Medium, 2–3 giorni.

- [ ] **S2 — Riprodurre installazione e build da lockfile**
  - **Priorità:** P1. **Riferimenti:** A02, A05.
  - **Descrizione:** in checkout/ambiente isolato eseguire `npm ci`, build e smoke HTTP di home, About, sette post e 404; documentare runtime e comandi. Verificare prima l'eventuale necessità di credenziali senza copiarle nei log.
  - **File:** `package.json`, `package-lock.json`, `README.md`; route `pages/` come oggetto dei controlli.
  - **Dipendenze:** nessuna per la baseline; coordinamento con S1 per il runtime futuro.
  - **Accettazione:** installazione pulita senza extraneous oppure divergenze spiegate; build exit 0; route attuali HTTP 200 e slug inesistente 404; lockfile invariato per il controllo baseline. Registrare blocker senza correggerli implicitamente.
  - **Impegno:** Small, 0,5–1 giorno.

- [ ] **S3 — Correggere e verificare Analytics/Cookiebot**
  - **Priorità:** P1. **Riferimenti:** A12, A13.
  - **Descrizione:** ispezionare configurazione CMP e rete; definire modalità di consenso appropriata, responsabile degli aggiornamenti e mappatura statistics/analytics. Correggere stato advertising improprio, ordine/id script, guard su gtag/configurazione e politica hash pageview.
  - **File:** `pages/_app.js`, `lib/ga/index.js`; impostazioni Cookiebot esterne da verificare con il proprietario.
  - **Dipendenze:** nessuna per diagnosi; S2 per regressione riproducibile. Approvazione della proposta concreta prima di cambiamenti significativi al consenso.
  - **Accettazione:** verifiche browser su prima visita, accettazione, rifiuto, consenso parziale, revoca, reload, navigazione e tag bloccati; nessun consenso advertising derivato dai soli statistics; nessun errore JS; richieste e cookie coerenti con le scelte e la modalità approvata, senza duplicazioni di pageview.
  - **Impegno:** Medium, 2–3 giorni, escluso accesso al pannello.

- [ ] **S4 — Validare inventario e frontmatter Markdown**
  - **Priorità:** P1. **Riferimenti:** A03, A04.
  - **Descrizione:** filtrare file regolari `.md`, validare campi/date/slug/asset, proteggere id e contentHtml dallo spread, rendere l'ordinamento deterministico. Mantenere sanitizzazione e formati attuali.
  - **File:** `lib/posts.js`, `components/date.js`, `posts/*.md`; test mirati da introdurre.
  - **Dipendenze:** S2 per baseline; nessun cambio di schema obbligatorio.
  - **Accettazione:** sette articoli attuali accettati senza modificare URL; input errati, chiavi riservate e file estranei gestiti con errori comprensibili; payload script/onerror/javascript rimossi; fixture per immagini, code fence e heading; sort stabile a date uguali.
  - **Impegno:** Medium, 2–3 giorni.

- [ ] **S5 — Applicare gli aggiornamenti di sicurezza approvati**
  - **Priorità:** P1. **Riferimenti:** A01, A02.
  - **Descrizione:** aggiornare per passi compatibili secondo S1, revisionare changelog e dipendenze transitive, evitare migrazioni non necessarie; valutare per prime le correzioni indipendenti a basso rischio.
  - **File:** `package.json`, `package-lock.json`, configurazioni strettamente necessarie fra `postcss.config.js`, `tailwind.config.js`, `pages/`, `lib/`.
  - **Dipendenze:** S1 approvato e S2; S4 per regressioni Markdown quando si aggiorna quella pipeline.
  - **Accettazione:** `npm ci` e build riusciti, route preservate, smoke/rendering verificati, audit ripetuto con segnalazioni residue e mitigazioni motivate; nessun App Router o TypeScript introdotto implicitamente.
  - **Impegno:** Large, 6–10 giorni, da rivedere dopo S1.

## Phase 2 — SEO & Performance

- [ ] **E1 — Centralizzare dominio, canonical e metadata**
  - **Priorità:** P1. **Riferimenti:** A06–A08.
  - **Descrizione:** verificare i due host, concordare quello preferito e allineare URL; aggiungere canonical/description/OG specifici a home e About, usare article per i post, correggere entità nel frontmatter. Verificare redirect dell'hosting con modifica separatamente approvata.
  - **File:** `helpers/config.js`, `components/Layout.js`, `pages/index.js`, `pages/about.js`, `pages/posts/[id].js`, `public/robots.txt`, description nei due Markdown indicati da A08.
  - **Dipendenze:** S2, S4; decisione sul dominio preferito.
  - **Accettazione:** un canonical assoluto e una description significativa per pagina; OG coerenti; apostrofi corretti nel DOM; path attuali identici; eventuale redirect host permanente testato senza catene.
  - **Impegno:** Medium, 2 giorni.

- [ ] **E2 — Generare sitemap automaticamente**
  - **Priorità:** P1. **Riferimenti:** A07.
  - **Descrizione:** generazione semplice dallo stesso inventario validato dei post e delle pagine statiche, integrata nella build senza un servizio aggiuntivo; lastmod solo da fonte affidabile.
  - **File:** `public/sitemap.xml`, `public/robots.txt`, `lib/posts.js`, `package.json`, eventuale script di generazione da aggiungere.
  - **Dipendenze:** S4, E1.
  - **Accettazione:** XML valido con URL assoluti del dominio preferito; home, About e tutti i post presenti una volta; un nuovo articolo valido appare automaticamente dopo build; nessuna data inventata, nessun URL non generato.
  - **Impegno:** Small, 1 giorno.

- [ ] **E3 — Misurare e ottimizzare immagini/font**
  - **Priorità:** P2. **Riferimenti:** A09, A10.
  - **Descrizione:** baseline ripetibile su home e post rappresentativi, confronto rete/LCP/CLS; compressione sorgenti e dimensioni/lazy loading per img Markdown; valutare pesi font, fallback e hosting locale.
  - **File:** `public/images/`, `components/Layout.js`, `lib/posts.js`, `styles/global.css`, `tailwind.config.js`.
  - **Dipendenze:** S2, S4; ripetere baseline dopo S5 se il runtime cambia.
  - **Accettazione:** nessuna immagine deformata o link rotto; varianti e dimensioni appropriate; priorità riservata agli elementi necessari; confronto prima/dopo con ambiente dichiarato e controllo visivo. Nessun obiettivo numerico CWV dichiarato raggiunto senza misura.
  - **Impegno:** Medium, 2–3 giorni.

- [ ] **E4 — Correggere semantica e verificare accessibilità/responsive**
  - **Priorità:** P2. **Riferimenti:** A11.
  - **Descrizione:** h1 About, nomi accessibili dei link e alt contestuali; controllo browser con tastiera, zoom, contrasto, screenshot e code block su viewport rappresentative.
  - **File:** `pages/about.js`, `components/Layout.js`, `pages/posts/[id].js`, `posts/salesforce-commerce-cloud-job-framework.md`, `styles/`.
  - **Dipendenze:** S2; coordinamento con E3 per le immagini.
  - **Accettazione:** titolo principale riconoscibile per pagina; freccia con nome accessibile; focus visibile e navigazione completa; niente overflow di pagina a 320/375/768/1280 px e zoom 200%, codice eventualmente scrollabile; esiti automatici e manuali documentati senza dichiarare conformità completa sulla sola scansione.
  - **Impegno:** Medium, 2–3 giorni.

## Phase 3 — Multilingual Blog

- [ ] **M1 — Approvare modello delle lingue e convenzione URL**
  - **Priorità:** P2. **Riferimenti:** A14.
  - **Descrizione:** definire italiano come default, mantenere `/posts/<id>` e proporre `/en/posts/<slug>`; scegliere collocazione dei file e regole per traduzioni mancanti, evitando duplicati italiani con prefisso aggiuntivo.
  - **File:** `docs/roadmap.md`, `README.md`; analisi di `lib/posts.js`, `pages/posts/[id].js`, `helpers/config.js`.
  - **Dipendenze:** S4, E1, E2.
  - **Accettazione:** matrice route/lingua/canonical e compatibilità approvata prima dell'implementazione; nessun articolo pregresso da tradurre automaticamente; nessun nuovo framework o database.
  - **Impegno:** Small, 1 giorno.

- [ ] **M2 — Estendere frontmatter e parser in modo compatibile**
  - **Priorità:** P2.
  - **Descrizione:** `lang` opzionale default it, `translationKey` opzionale e `tags` opzionali; validare lingue, associazioni e unicità della coppia lingua/translationKey. Tenere distinto slug di route da identificatore di traduzione.
  - **File:** `lib/posts.js`, `posts/`, test parser, `README.md`.
  - **Dipendenze:** M1 approvato, S4.
  - **Accettazione:** tutti i Markdown attuali ancora validi senza nuovi campi; fixture it/en associate correttamente; duplicati e lingue non supportate segnalati; catalogo filtrabile senza mescolare lingue involontariamente.
  - **Impegno:** Medium, 2 giorni.

- [ ] **M3 — Implementare route, lingua HTML e navigazione**
  - **Priorità:** P2.
  - **Descrizione:** route inglesi su Pages Router, liste per lingua, date localizzate, html lang derivato dalla pagina e switch solo verso traduzioni esistenti. Verificare il comportamento SSG del Document nella versione effettiva.
  - **File:** `pages/posts/[id].js`, nuove pagine sotto `pages/en/` secondo M1, `pages/index.js`, `pages/_document.js`, `components/date.js`, `components/Navigation.js`, `lib/posts.js`.
  - **Dipendenze:** M2; S5 se cambia la versione Next durante il progetto.
  - **Accettazione:** vecchi URL italiani HTTP 200 invariati; fixture inglese con lang en e date inglesi nell'HTML statico; traduzione inesistente senza link fantasma; sconosciuti 404; tastiera e responsive verificati sullo switch.
  - **Impegno:** Medium, 3–5 giorni.

- [ ] **M4 — Completare SEO multilingua**
  - **Priorità:** P2.
  - **Descrizione:** canonical autonomi, hreflang it/en reciproci e autoreferenziali quando le versioni esistono; valutare x-default solo con destinazione appropriata; sitemap estesa alle nuove route e locale OG coerente.
  - **File:** `pages/posts/[id].js`, pagine inglesi introdotte, `helpers/config.js`, generatore sitemap di E2, eventuale componente metadata condiviso.
  - **Dipendenze:** E1, E2, M3.
  - **Accettazione:** ogni versione canonicalizza se stessa; hreflang punta solo a URL 200 realmente associati; nessuna traduzione inglese canonicalizzata all'italiano; sitemap e lang HTML coerenti; test preservano tutti i vecchi slug.
  - **Impegno:** Medium, 2 giorni.

## Phase 4 — Content & Automation

- [ ] **C1 — Preparare template e checklist editoriale**
  - **Priorità:** P2.
  - **Descrizione:** template breve con campi esistenti e optional bilingui, esempi di codice con linguaggio, regole alt, percorsi asset, titoli e descrizioni in testo naturale; istruzioni per associare traduzioni.
  - **File:** `README.md`, template Markdown da collocare fuori da `posts/` per evitare pubblicazione accidentale, documentazione editoriale da concordare.
  - **Dipendenze:** M2, M4 per esempi definitivi.
  - **Accettazione:** articolo campione validabile; template escluso dall'inventario pubblicabile; nessun nuovo campo obbligatorio per gli articoli precedenti; checklist include fonti, anteprima, link, immagini e metadata.
  - **Impegno:** Small, 0,5–1 giorno.

- [ ] **C2 — Scrivere e verificare Laravel N+1 in italiano e inglese**
  - **Priorità:** P2.
  - **Descrizione:** “Laravel e il problema N+1: quando una query diventa cento” e “Laravel and the N+1 Problem: When One Query Becomes a Hundred”. Usare relazioni realistiche, lazy loading, eager loading con `with`, rilevazione delle query e prevenzione del lazy loading dove supportata. Dichiarare versione Laravel verificata, contare query su fixture controllata e distinguere conteggio da tempi; descrivere relazioni vuote, accessi inversi e limiti dell'eager loading pertinenti.
  - **File:** due nuovi `posts/*.md` o collocazione approvata da M1; asset sotto `public/images/posts/`.
  - **Dipendenze:** C1, M3, M4; S4 e controlli C3 prima della pubblicazione.
  - **Accettazione:** esempi verificati contro documentazione ufficiale della versione scelta e, quando possibile, eseguiti; nessun benchmark inventato; traduzione tecnica naturale e translationKey comune; immagini esistenti e alt appropriati; build, route, canonical, hreflang e HTML validati. Pubblicazione/deploy solo con approvazione esplicita separata.
  - **Impegno:** Medium, 3–4 giorni.

- [ ] **C3 — Automatizzare i controlli essenziali**
  - **Priorità:** P1, anticipabile durante Phase 1 per la baseline; estensione bilingue dopo M4.
  - **Descrizione:** comandi ripetibili per test parser/sanitizzazione, metadati, asset/link locali, sitemap e route; pipeline con installazione da lockfile e build. Audit dipendenze periodico con triage delle eccezioni, evitando blocchi non motivati su advisory non applicabili.
  - **File:** `package.json`, test e script da aggiungere, workflow sotto `.github/workflows/` se confermato GitHub come piattaforma CI, `README.md`.
  - **Dipendenze:** S2 e S4 per il nucleo; E2 e M4 per le verifiche complete.
  - **Accettazione:** fixture invalida fallisce con messaggio utile; sette route storiche protette; payload ostili, associazioni bilingui, canonical e sitemap coperti; pipeline eseguita con successo e senza segreti nei log. Nessun test dichiarato passato senza esecuzione.
  - **Impegno:** Medium, 2–4 giorni per nucleo ed estensioni.

- [ ] **C4 — Consolidare il processo di revisione e rilascio**
  - **Priorità:** P3.
  - **Descrizione:** checklist PR per contenuti e codice, verifica fonti, anteprima locale, controlli e approvazione di pubblicazione; audit periodico di dipendenze, link e asset senza nuova infrastruttura.
  - **File:** `README.md`, eventuale template PR e documentazione del processo da concordare.
  - **Dipendenze:** C1, C3; prima esecuzione completa su C2.
  - **Accettazione:** revisore in grado di riprodurre i controlli seguendo il README; responsabilità e cadenza definite; merge e deploy richiedono sempre approvazione; costi e manutenzione delle automazioni esplicitati.
  - **Impegno:** Small, 0,5–1 giorno.

## Prime cinque attività consigliate

1. **S1:** triage degli advisory e piano compatibilità, prima di scegliere aggiornamenti.
2. **S2:** installazione e build pulite per ottenere una baseline riproducibile.
3. **S3:** correggere la mappatura del consenso con verifica reale di Cookiebot e rete.
4. **S4:** validare Markdown/frontmatter e proteggere i campi interni.
5. **S5:** applicare gli aggiornamenti approvati e verificarne le regressioni.

Le fasi indicano un ordine logico, non un divieto di anticipare interventi indipendenti: E1 e il nucleo di C3 possono procedere prima del completamento di una migrazione di dipendenze lunga. Le stime non vanno sommate come impegno certo finché S1, hosting e comportamento CMP non sono chiariti.
