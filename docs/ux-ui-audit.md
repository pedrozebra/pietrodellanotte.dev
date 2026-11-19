# Audit UX/UI e proposta di evoluzione

19 novembre 2026 · `pedrozebra/pietrodellanotte.dev`.
Base `origin/main` **4c202c2**, dopo il merge della PR #31.
Branch `design/ux-ui-audit`. **Solo documentazione e prototipi isolati**:
nessun redesign applicato, aggiornamento dipendenze, merge o deploy.

## 1. Executive summary

Il sito comunica una persona autentica e una scrittura tecnica concreta.
La struttura statica, i pochi elementi e i recenti interventi su accessibilità,
SEO e immagini sono una base da conservare. Oggi funziona soprattutto come
archivio personale: in Home non dichiara il ruolo di Senior Backend Engineer,
la specializzazione PHP/Laravel/Yii2/MySQL o gli oltre 12 anni di esperienza.
Un recruiter deve dedurre il posizionamento dai testi e raggiungere About
per trovare i contatti. Non esistono progetti presentati come casi professionali.

Raccomando **B — Modern Engineering**, con una composizione sobria e una lettura
editoriale: ruolo immediato, competenze contestualizzate, pochi segni tecnici,
articoli facili da esplorare e una CTA professionale chiara. Il monospace diventa
un accento per codice e metadata, non l'unico registro dell'intero sito.
Il tema chiaro è la base di lettura; quello scuro è una variante completa,
non la condizione necessaria per sembrare un engineer.

A — Minimal Editorial è la scelta con minor costo e maggior centralità del blog.
C — Premium Professional valorizza maggiormente persona e relazione, ma richiede
contenuti e ritratto più curati per esprimere davvero il posizionamento.
Le tre direzioni sono confrontabili in [questo indice locale](ux-ui-prototypes/index.html).
Sono incluse tre Home e, per B, About e articolo. Non sono nuovi URL pubblici.

Il primo investimento dovrebbe essere **copy professionale e gerarchia**, poi
tipografia e shell condivisa. Progetti e inglese arrivano quando esistono
contenuti verificati e una capacità editoriale per mantenerli. Non servono
nuovi servizi, un CMS, App Router o una riscrittura del blog.

## 2. Perimetro, metodo e affidabilità

Letti AGENTS.md, README, [audit tecnico](technical-audit.md),
[roadmap](roadmap.md), [audit SEO/performance](seo-performance-audit.md),
[accessibilità](accessibility-improvements.md), [audit immagini](image-performance-audit.md),
[sitemap](automatic-sitemap.md), [consenso](analytics-cookie-consent-audit.md),
[piano dipendenze](dependency-upgrade-plan.md),
[migrazione Next/React](nextjs-react-upgrade-phase1.md) e
[remediation PostCSS](postcss-remediation-and-picomatch-exception.md).
Esaminati pagine, Layout/Navigation/Seo, CSS, Tailwind, metadata e inventario
dei sette articoli. Stack attuale: Next 16.4.6, React 19.3.1, Pages Router,
JavaScript e Tailwind 2; le versioni iniziali citate nei documenti storici
non descrivono automaticamente lo stato attuale.

Audit euristico sui sorgenti e sulla build locale di main. Chrome headless
157.0.8103.78, Windows, Puppeteer Core 25.18.1. Nove pagine a 320/375/768/1280 px,
altezza 900 px, DPR 1. Nelle osservazioni del sito esistente sono consentiti
Google Fonts e i suoi file; Source Code Pro risulta caricato. Cookiebot e gli
altri servizi esterni sono esclusi: **non è una verifica del banner reale**.
La build usa l'ambiente locale già presente senza modificarlo o riportarne valori.

Le evidenze numeriche seguenti sono controlli DOM/viewport, non risultati di
user testing. Le valutazioni di chiarezza e riconoscibilità sono giudizi di design
motivati; l'effetto su candidature, contatti o tempo di lettura resta un'ipotesi.
Nessuna sessione recruiter, heatmap, dato Analytics, Search Console, CrUX o INP
è stato raccolto. Nessun nuovo Lighthouse: le performance storiche dell'audit
immagini rimangono dati di laboratorio di quella PR, non misure di questo studio.

### Evidenze visuali attuali

| Pagina | Desktop 1280 px | Mobile 375 px |
|---|---|---|
| Home | [Screenshot](ux-ui-prototypes/screenshots/current-home-1280.png) | [Screenshot](ux-ui-prototypes/screenshots/current-home-375.png) |
| About | [Screenshot](ux-ui-prototypes/screenshots/current-about-1280.png) | [Screenshot](ux-ui-prototypes/screenshots/current-about-375.png) |
| Articolo PHP | [Screenshot](ux-ui-prototypes/screenshots/current-destrutturazione-di-array-in-php-spiegata-semplice-1280.png) | [Screenshot](ux-ui-prototypes/screenshots/current-destrutturazione-di-array-in-php-spiegata-semplice-375.png) |
| Salesforce, pagina lunga | [Screenshot](ux-ui-prototypes/screenshots/current-salesforce-commerce-cloud-job-framework-1280.png) | [Screenshot](ux-ui-prototypes/screenshots/current-salesforce-commerce-cloud-job-framework-375.png) |

Gli screenshot attuali mostrano la prima viewport; quelli dei prototipi la pagina
completa. Non usarli per dedurre performance o lunghezze di scroll equivalenti.

## 3. Audit delle pagine e del sistema

### Home — una persona riconoscibile, un posizionamento ancora implicito

**Punti di forza.** Nome reale, fotografia autentica, tono personale, sette articoli
con titolo e data. Pochi elementi da apprendere; i link sono visibili e sottolineati.
L'identità familiare e il lavoro remoto danno umanità, da preservare come dettagli
secondari del profilo, senza sostituire il messaggio professionale.

**Criticità verificate.** `pages/index.js` presenta «Sviluppatore web sempre alla
ricerca di migliorarsi» e la nota sul lavoro remoto. Non espone seniority o stack.
`components/Layout.js` rende il nome come H1 di 18 px; i titoli articolo in lista
sono circa 19,2 px. Il nome è presente semanticamente ma ha poco peso visivo.
La fotografia ha forma ovale perché border-radius è applicato a un rettangolo
144×192: non è un aspect ratio errato dopo #31, è una scelta visiva poco deliberata.
Non ci sono CTA professionali, panoramica competenze o link diretto ai contatti.

**Opportunità.** Dichiarare ruolo e campo in apertura, mantenere nome e ritratto,
distinguere azione primaria «Scrivimi» da «Leggi gli articoli». Introdurre tre
ambiti di competenza e una selezione editoriale, lasciando raggiungibili tutti
i sette URL. Il post più recente nell'inventario è del 6 maggio 2023: una Home
solo cronologica può suggerire inattività, ma non prova che il professionista
sia inattivo. Usare «Dall'archivio» o «Scritti scelti», non date o attività nuove.

### About — informazioni concrete, scansione faticosa

**Punti di forza.** Percorso dal 2013, esperienze nominate, contatti email,
LinkedIn e GitHub esistenti. H1, link sottolineati, focus e wrapping sono già
stati migliorati dalla PR #30.

**Criticità verificate.** `pages/about.js` usa lunghi paragrafi e separatori `br`
nello stesso contenitore di 960 px utili a viewport 1280. Non applica la misura
ridotta `.prose` degli articoli. La cronologia è dispersa nel testo; il ruolo
attuale è descritto con la formula «Da Gennaio 2023», da riconfermare oggi.
I contatti sono chiamati «Questa/Questo», comprensibili nel paragrafo ma poco
descrittivi quando si esplorano i link separatamente.

**Opportunità.** Sintesi professionale → ambiti tecnici → cronologia breve →
modo di lavorare con esempi reali → contatti espliciti. Mostrare i nomi «Email»,
«LinkedIn», «GitHub» senza ripetere l'intero URL nel testo. CV solo se fornito
e approvato; nessun pulsante che porti a un documento inesistente.

### Navigazione — semplice ma non costante

`components/Navigation.js` espone Home/About su Home e articoli, soltanto Home
su About. Mancano indicazione della pagina corrente, accesso diretto all'archivio
e contatti persistenti. Non c'è un footer applicativo condiviso. La freccia
articolo ha già nome accessibile e non è più un heading; resta una scorciatoia
visivamente ambigua se non si conosce la destinazione.

I due link principali misurano 52 px in altezza nel campione desktop: non è
giustificato classificarli come controlli troppo piccoli. Serve invece una
gerarchia più coerente e una destinazione esplicita «Tutti gli articoli».
Con tre destinazioni principali non è necessario introdurre un menu hamburger.

### Articoli — buon contenuto, cornice debole

**Punti di forza.** SSG, contenuto disponibile nell'HTML, titoli e date reali,
code block raggiungibili da tastiera e con scroll locale, link riconoscibili.
La PR #31 ha corretto il rapporto cover, i sizes e lo spazio delle immagini
Markdown: questi non sono più difetti aperti da risolvere nel redesign.

**Criticità verificate.** La cover precede ritorno, titolo e data. Nel campione
PHP desktop l'H1 inizia circa a y=479 px: l'immagine domina l'orientamento
iniziale. Il titolo resta fuori dal corpo `.prose`; non c'è un'intestazione
editoriale unitaria con autore, tema e contesto. Alla fine si torna soltanto
alla Home. Le cover di argomenti diversi non costituiscono un sistema visivo
distintivo comune; non è necessario ridisegnarle tutte per migliorare la pagina.

**Lettura misurata.** Corpo 16 px / 28 px, circa 624 px desktop con Source Code
Pro e 311 px a 375. È già una misura contenuta e non un overflow confermato.
Il monospace rende coerente il linguaggio tecnico ma produce densità uniforme
fra prosa, metadata e codice. Proporre un corpo proporzionale da 18 px con
line-height circa 1,7–1,8; verificarlo su esempi lunghi, non assumere che il
cambio font migliori automaticamente la comprensione.

**Opportunità.** Titolo e contesto prima della cover, testo limitato a 60–68ch,
indice opzionale solo quando utile, collegamento all'archivio e profilo autore
discreto in chiusura. Se si cambia ordine della hero, LCP va rimisurato: potrebbe
cambiare l'elemento candidato. Non modificare Markdown, code sample, URL o anchor
per ottenere il nuovo layout. I salti H1/H3 editoriali storici restano un lavoro
separato da approvare, non una correzione silenziosa del template.

### Colori, dark mode e riconoscibilità

Il sistema attuale usa bianco/grigi, indaco per link di navigazione/lista e blu
per i link prose. La palette ha contrasti migliorati in #30; non va descritta
come il vecchio sistema con link insufficienti. I due accenti simili e l'assenza
di una firma visiva danno tuttavia poca continuità al brand.

Il tema scuro è definito tramite classe `.dark`, con varianti prose e focus.
Nei sorgenti applicativi non c'è selettore né attivazione basata sulla preferenza
di sistema: esiste il supporto CSS, manca un percorso utente per scoprirlo.
Non si confonda questo rilievo con una dark mode completamente assente.
Nel futuro: un solo accento per azioni e link, token chiaro/scuro completi,
pulsante con nome accessibile e verifica del primo paint senza flash di tema.

### Responsive e accessibilità

Nelle **36 combinazioni attuali** non è emerso overflow orizzontale del documento.
Il padding fisso di 32 px per lato lascia 256 px a viewport 320: funziona, ma
riduce la misura di lettura. Proposta: 20 px mobile, 32 px tablet, contenitore
1120 px desktop; corpo articolo indipendente dalla larghezza della shell.
La colonna unica mobile è corretta; eventuali sidebar devono spostarsi nel flusso.

Conservare skip link, un H1 per pagina, sottolineature nel testo, focus visibile,
tema scuro leggibile e pre scrollabili. Le scansioni dei precedenti audit sono
evidenze circoscritte, non certificazioni WCAG. Alt cover derivati dallo slug e
alt ripetuti degli screenshot Salesforce rimangono opportunità editoriali note.
Non è stata eseguita una verifica completa con screen reader o CMP reale.

## 4. Criticità ordinate per priorità

P1 = impatto diretto sull'obiettivo professionale; P2 = qualità/continuità;
P3 = estensione condizionata ai contenuti. Nessun blocco P0 rilevato in questo
audit di design. Impatti e difficoltà sono valutazioni, non metriche di conversione.

| Priorità / ID | Evidenza e conseguenza | Intervento proposto | Verifica di accettazione futura |
|---|---|---|---|
| P1 / UX-01 | Home senza ruolo, seniority e stack espliciti | Sintesi professionale sopra la piega | In un test breve si identificano ruolo e ambito senza aprire About |
| P1 / UX-02 | Contatti solo in fondo ad About | CTA principale e contatto persistente | Email/LinkedIn raggiungibili da ogni pagina con un percorso chiaro |
| P1 / UX-03 | About estesa e narrativa poco scansionabile | Sintesi e cronologia con sezioni | Lettura rapida di esperienza e competenze, misura limitata su desktop |
| P2 / UI-01 | Monospace uniforme, H1 Home più piccolo della lista | Scala tipografica e ruoli distinti | Gerarchia riconoscibile, nessun overflow con titoli lunghi e zoom |
| P2 / UX-04 | Menu varia fra pagine e non espone archivio | Shell e destinazioni costanti | Pagina corrente e navigazione tastiera verificate su tutte le route |
| P2 / UX-05 | Cover domina apertura articolo | Header editoriale prima della cover | Orientamento prima del contenuto; LCP/CLS non peggiorano nei confronti |
| P2 / UI-02 | Accenti non unificati e scuro non selezionabile | Token e controllo tema | Contrasto/focus e primo paint verificati in entrambi i temi |
| P2 / UX-06 | Archivio fermo al 2023, competenze backend non rispecchiate nei titoli | Curatela e nuovi contenuti approvati separatamente | Nessuna data fittizia o vecchio post presentato come appena pubblicato |
| P3 / UX-07 | Nessun caso tecnico verificato | Sezione progetti condizionata | Pubblicabile solo con contributo e permessi confermati |
| P3 / UX-08 | Profilo solo italiano | Profilo inglese essenziale prima del blog bilingue | Traduzione naturale, routing/metadata equivalenti, mantenibilità editoriale |

## 5. Tre direzioni di design

### A — Minimal Editorial

**Identità.** Carta avorio, testo scuro, verde bosco, titoli serif e griglia
aperta. Nome come firma, divisori sottili e indice di scritti. Riconoscibilità
attraverso composizione e linguaggio, non decorazioni o dashboard finte.

**Vantaggi.** Blog immediatamente centrale, poche risorse, facile transizione
dall'impianto attuale. Ottima base per italiano/inglese con titoli di lunghezze
diverse. **Svantaggi.** Il profilo engineer emerge soprattutto dal copy; senza
un minimo di firma personale può somigliare a una pubblicazione generica.

**Lettura.** Titoli serif e corpo proporzionale distinguono prosa e codice;
linee contenute e poco rumore. **Complessità:** bassa, soprattutto CSS e template.
**Coerenza:** alta per autore tecnico e blog, media per mostrare immediatamente
la specializzazione backend a chi arriva da un contatto recruiting.

### B — Modern Engineering

**Identità.** Blu ardesia, accento verde, struttura a colonne, numerazione discreta,
titoli sans compatti e monospace soltanto nei dettagli. Firma `[pdn]` proposta,
senza pretendere che sia già un marchio adottato. Diagramma concettuale facoltativo,
esplicitamente non riferito a un progetto reale; sul mobile non è necessario.

**Vantaggi.** Specializzazione leggibile subito; competenze, scrittura e persona
possono coesistere. Il linguaggio è tecnico senza simulare terminali o metriche.
**Svantaggi.** Richiede disciplina: troppi badge, griglie e pannelli trasformerebbero
il sito in una dashboard. Doppio tema aumenta gli stati da validare.

**Lettura.** Corpo proporzionale e sfondi tranquilli, codice con font dedicato;
la variante chiara degli articoli evita una scelta obbligatoria per il lettore.
**Complessità:** media, shell/token e due temi, nessun motore animazioni.
**Coerenza:** molto alta per il profilo backend, se accompagnata da prove reali
e senza claim su performance, scalabilità o leadership non documentati.

### C — Premium Professional

**Identità.** Carta calda, carbone e rame, serif raffinato, ritratto più presente,
spazio generoso e CTA relazionale. Il nome è l'elemento riconoscibile principale.

**Vantaggi.** Comunica esperienza e accessibilità personale; adatto a lettori
non tecnici e contatti recruiter. **Svantaggi.** Rischio di apparire un portfolio
consulenziale generico. Per essere convincente richiede un ritratto intenzionale
e contenuti professionali accurati; la foto attuale è autentica ma informale.
Non sostituirla con una persona sintetica o uno stock di un altro sviluppatore.

**Lettura.** Buona con contrasto sufficiente e serif non troppo sottile; il calore
non deve tradursi in testo beige poco leggibile. **Complessità:** medio-bassa
tecnicamente, media editorialmente/fotograficamente. **Coerenza:** alta per
personal branding, meno immediata di B per identificare il campo ingegneristico.

### Palette e tipografia a confronto

| Direzione | Fondo / testo / secondario | Accento | Display / corpo / codice nel demo |
|---|---|---|---|
| A | `#F7F5EF` / `#222722` / `#596157` | `#235B48` | Georgia / Corbel / Consolas |
| B chiara | `#F6F8F5` / `#172A32` / `#4E6269` | `#24634B` | Bahnschrift / Corbel / Consolas |
| B scura | `#111E26` / `#EAF2EF` / `#B3C3C7` | `#9AE8C1` | Stesse famiglie di B chiara |
| C | `#F4EFE7` / `#302B28` / `#665B51` | `#825134` | Constantia / Calibri / Consolas |

Sono palette proposte, non modifiche ai token applicativi. A/C sono esplorazioni
chiare, non sistemi dark completi. I font dimostrativi sono locali con fallback:
nessun font Windows è copiato nel repository o proposto per redistribuzione.
In produzione scegliere un font web con licenza verificata oppure una pila locale
accettando differenze fra OS; approvare resa e budget prima di sostituire Source
Code Pro. Non è richiesta l'installazione di una libreria tipografica.

## 6. Raccomandazione e specifica della direzione B

Scelgo B perché rende il posizionamento professionale esplicito con strumenti
coerenti al contenuto: struttura, gerarchia e precisione. Integro la sobrietà di A
negli articoli, senza mescolare tre identità. C resta una buona alternativa se
la priorità futura diventa il personal branding più che la scrittura tecnica.
La raccomandazione è una decisione di design da validare, non un vincitore di A/B test.

### Principi e sistema

1. **Identità prima della decorazione:** ruolo, nome e specializzazione leggibili
   nell'apertura. Il testo deve funzionare anche senza ritratto o diagramma.
2. **Una decisione primaria per sezione:** contatto nella hero, lettura negli
   scritti, approfondimento nel profilo. Non tre pulsanti equivalenti in competizione.
3. **Prove prima di claim:** competenze nominate e collegate a esempi reali;
   niente barre al 95%, contatori di progetti o badge di disponibilità inventati.
4. **Template leggeri:** CSS, HTML semantico, immagini già ottimizzate e SSG.
   Nessun video hero, carosello, animazione continua o libreria di componenti necessaria.

Scala proposta: H1 42–82 px desktop/mobile tramite clamp, H2 30–46, titoli lista
24–28, corpo 18 px (19–20 negli articoli dopo verifica), metadata 14, codice 14–15.
Interlinea corpo 1,65–1,8; titoli 1,1–1,2. Non usare tracking negativo sul corpo.
Spazi di base 4/8/12/16/24/32/48/64/80 px; sezioni 36–48 mobile e 56–80 desktop.
Shell 1120 px, testo 60–68ch, padding 20/32 px. Piccoli raggi o angoli netti,
linee come separatori; ombre soltanto se chiariscono uno stato.

Palette B: superfici secondarie `#EAF0EB` e `#192B34`, divisori `#B8C8C0` e
`#3D5662`, bottone verde con testo bianco in chiaro e verde chiaro con testo
`#11251B` in scuro. I divisori decorativi non sostituiscono i confini di controlli
interattivi. Controllare le coppie effettive, non certificare un intero tema
dal contrasto di due soli colori.

### Home

Ordine: **header → hero professionale → competenze → scritti → caso tecnico,
solo se disponibile → contatti → footer**. Su desktop hero a due colonne; mobile
a una, con il testo prima della fotografia e senza schema decorativo.
Il blog resta raggiungibile subito dalla navigazione.

Copy di partenza da approvare: «Pietro Della Notte — Senior Backend Engineer.
Oltre 12 anni di esperienza con PHP, Laravel, Yii2, MySQL e architetture backend».
È basato sul brief del proprietario, non su nuove verifiche delle singole aziende.
Il titolo espressivo del mockup è un'alternativa di tono, non un risultato promesso.
CTA primaria «Parliamo di backend» o «Scrivimi», secondaria «Leggi gli articoli».

Tre gruppi di competenze: sviluppo PHP/framework; dati MySQL; architetture backend.
Per ogni gruppo: tecnologia → contesto → prova/link quando disponibile. Non
attribuire automaticamente esperienza production a ogni tecnica nominata in un
articolo. Non aggiungere cloud, microservizi, DDD o gestione team come competenze
dimostrate senza conferma. I temi degli articoli non sono certificazioni.

Lista scritti con titolo completo, descrizione breve dai metadata esistenti e data
vera. Etichette tematiche facoltative, senza renderle nuovi campi obbligatori.
Con sette post non serve ricerca client o tassonomia complessa; un archivio
semplice raggiungibile su Home è sufficiente. Nei mockup compaiono due voci per
confrontare il layout, non una proposta di rimuovere le altre cinque.

### About

Sintesi iniziale e immagine piccola, competenze, cronologia in ordine inverso,
due o tre principi personali con esempi, contatti. Le esperienze in Contact
Centre Sud, alpenite e Docebo provengono dal sito attuale: confermare ruoli,
periodi e attualità prima di riscriverle. La biografia umana rimane, separata
dalla sintesi professionale. Evitare pareti di loghi o testi aziendali non autorizzati.

Email, LinkedIn e GitHub sono sufficienti per il primo rilascio. Il form contatti
non è necessario e introdurrebbe gestione dati/spam. CV e versione inglese solo
quando esistono realmente. Nessuna promessa di disponibilità immediata o trasferimento.

### Pagina articolo

Header con ritorno agli scritti, tema, H1, autore e data; poi cover 2:1 e corpo.
Una colonna principale 60–68ch; indice desktop laterale facoltativo per testi
lunghi, nel flusso su mobile. Nessun indice per un articolo di poche sezioni.
I pre restano monospace, scorrevoli e focalizzabili; non spezzare le righe di codice
per farle entrare. Mantenerne selezione, copia e contenuto. Niente copia-incolla
automatico o syntax highlighter client indispensabile al redesign.

In chiusura: ritorno all'archivio, autore e contatto discreto. Articoli correlati
soltanto con una regola editoriale sensata, non raccomandazioni casuali. Tempi
di lettura solo con algoritmo dichiarato e validato; date di aggiornamento solo
se esiste una fonte attendibile. Originali delle immagini Markdown linkabili,
dimensioni riservate e lazy loading della PR #31 invariati.

### Navigazione e temi

Desktop: firma/nome come Home, **Scritti / About / Contatti**, controllo tema
secondario. Durante la transizione, Scritti può puntare a `/#blog` e Contatti
a `/about#contatti`, mantenendo le route. L'anchor va creato prima di esporre
il link. Pagina corrente con `aria-current`, nav nominata, skip link conservato.

Mobile: stesso ordine e nomi, link visibili che vanno a capo se necessario;
nessun hamburger per tre voci. Controlli principali con area obiettivo 44×44 px,
focus non coperto e contenuti utilizzabili a 320 px. È un obiettivo di progetto:
WCAG 2.5.8 AA richiede 24×24 px o le condizioni/eccezioni previste, non 44 px
per ogni link inline. [W3C, dimensione dei target](https://www.w3.org/WAI/WCAG22/Understanding/target-size-minimum.html).

Tema: preferenza sistema iniziale e scelta esplicita da progettare in una PR
dedicata, con assenza di flash e fallback senza JavaScript. La demo cambia tema
senza persistenza, quindi non dimostra una soluzione production al primo paint.
Non introdurre nuovi cookie o riscrivere il consenso come parte della scelta tema.

### Progetti: contenuto condizionale, non scenografia

Non esiste un inventario verificato di progetti nel repository. Il placeholder
del demo indica soltanto lo spazio possibile. Per ogni futuro caso raccogliere:
titolo reale; contesto pubblico/autorizzato; problema e vincoli; contributo personale;
scelte e alternative; risultato documentabile; eventuale repository o demo consentiti.
Un esempio anonimo è accettabile solo se accurato e autorizzato, non se inventato.
Se mancano numeri, descrivere l'esito senza KPI. Se manca il caso, nascondere
interamente sezione e voce di navigazione, senza card «coming soon» permanenti.

### Italiano e inglese: necessità, costi e priorità

L'obiettivo internazionale rende utile un profilo inglese accessibile ai recruiter.
Non dimostra la necessità di tradurre subito tutti e sette gli articoli. L'italiano
rimane la lingua primaria e gli URL esistenti rimangono invariati.

| Fase futura | Valore / priorità | Costo e manutenzione | Condizioni |
|---|---|---|---|
| Copy italiano e titoli professionali chiari | Alto, prima del redesign completo | Basso; una revisione del profilo | Approvare fatti e messaggio, senza nuovi URL |
| Profilo equivalente in inglese, es. `/en/about` | Alto per obiettivo recruiting internazionale | Medio: stima preliminare 3–5 giornate tecniche più 0,5–1 editoriale, non preventivo | Contenuto rivisto, routing Pages Router, lang/canonical/hreflang e test; PR separata autorizzata |
| Nuovo articolo pilota bilingue | Medio, quando è pronto il contenuto | Medio; due testi, esempi e immagini da mantenere coerenti | Translation key opzionale, nessun campo imposto ai post storici |
| Intero archivio bilingue | Basso nell'immediato | Alto e ricorrente, proporzionale a sette traduzioni e successivi aggiornamenti | Capacità editoriale e domanda da verificare; nessuna traduzione automatica in massa |

Le stime assumono un engineer sullo stack attuale e testi forniti; non includono
ricerca, nuova fotografia o revisioni professionali estese. Non servono abbonamenti
di localizzazione. Niente bandierine, selettore EN fittizio o redirect automatico
per lingua browser. Inizialmente un link descrittivo «Profile in English» soltanto
se il profilo è pubblicato; il blog italiano va dichiarato tale nella pagina EN.
Le coppie tradotte devono essere equivalenti e autoreferenziali nei canonical,
con hreflang reciproco solo per versioni realmente presenti. Nuove route e relativo
inventario sitemap richiederanno un ambito SEO approvato separatamente: **questa
PR non modifica routing, metadata o sitemap e non abilita alcuna localizzazione**.

## 7. Mockup e prototipi

[Indice e confronto](ux-ui-prototypes/index.html) ·
[Istruzioni offline](ux-ui-prototypes/README.md).

| Direzione / pagina | Prototipo | Desktop | Mobile |
|---|---|---|---|
| A / Home | [HTML](ux-ui-prototypes/minimal-editorial.html) | [1280](ux-ui-prototypes/screenshots/minimal-editorial-1280.png) | [375](ux-ui-prototypes/screenshots/minimal-editorial-375.png) |
| B / Home scura | [HTML](ux-ui-prototypes/modern-engineering.html) | [1280](ux-ui-prototypes/screenshots/modern-engineering-1280.png) | [375](ux-ui-prototypes/screenshots/modern-engineering-375.png) |
| C / Home | [HTML](ux-ui-prototypes/premium-professional.html) | [1280](ux-ui-prototypes/screenshots/premium-professional-1280.png) | [375](ux-ui-prototypes/screenshots/premium-professional-375.png) |
| B / About chiara | [HTML](ux-ui-prototypes/about.html) | [1280](ux-ui-prototypes/screenshots/about-1280.png) | [375](ux-ui-prototypes/screenshots/about-375.png) |
| B / Articolo chiaro | [HTML](ux-ui-prototypes/article.html) | [1280](ux-ui-prototypes/screenshots/article-1280.png) | [375](ux-ui-prototypes/screenshots/article-375.png) |

Le direzioni condividono fatti e selezione articoli; variano composizione e tono.
I titoli espressivi e le descrizioni dei mockup sono **proposte di copy**, non nuovi
contenuti approvati. L'articolo è un estratto del post PHP esistente, senza modificare
il Markdown originale; i suoi H2/ID dimostrativi non autorizzano modifiche agli anchor.
A/C rimandano allo stesso esempio di articolo B: non vengono simulate cinque pagine
complete per ogni direzione. I progetti e i principi About mancanti sono placeholder
etichettati; non ci sono testimonial, certificazioni o risultati fittizi.

HTML/CSS e piccolo script tema restano in `docs/`, senza import dall'app. Nessuna
richiesta a font esterni nel demo, nessun tracking, nessun form. Gli originali delle
immagini sono referenziati, non copiati o convertiti: il trasferimento del demo
non rappresenta l'optimizer Next e non va usato come benchmark. `noindex,nofollow`
è precauzionale; il vero isolamento è l'assenza di route, import o file sotto public.
Verificare che anche le impostazioni hosting future non pubblichino `docs/`.

## 8. Roadmap incrementale proposta

Nessuna PR sotto è avviata da questo audit. Ogni step applicativo richiede
approvazione; non occorre migrare framework o aggiornare dipendenze. Le prime
modifiche possono convivere con il vecchio stile, usando classi circoscritte
e mantenendo URL, componenti di consenso e pipeline Markdown.

| PR proposta / dipendenza | Ambito piccolo e risultato | Accettazione | Reversibilità e convivenza |
|---|---|---|---|
| 1 / nessuna | Approvare copy professionale, contatti e inventario contenuti; aggiungere sintesi Home e nomi link About | Nessun fatto inventato, una CTA email corretta, tutti i sette post raggiungibili | Revert di soli testi/markup, senza cambiare route o stile globale |
| 2 / 1 | Token e tipografia in un'area pilota, es. About; scegliere font/licenza prima di cambiare caricamento | Confronto font/fallback, 320/375/768/1280, zoom, contrasti, niente nuovo JS necessario | Nuove classi limitate al pilota; resto del sito conserva i token precedenti |
| 3 / 1–2 | Header/footer comuni con Scritti/About/Contatti e stato corrente; mantenere gli href esistenti | Tab/Shift+Tab/Invio, skip link, 404, un H1, anchor prima dei link, menu mobile senza trap | Revert della shell; pagine vecchie ancora utilizzabili sotto la stessa navigazione |
| 4 / 2–3 | Hero Home e blocco competenze B; tutti gli articoli ancora presenti sotto l'archivio | Ruolo/stack/contatto chiari, mobile senza diagramma ingombrante, foto next/image conservata | Classe pagina circoscritta, nessuna nuova route o schema dati necessario |
| 5 / 2–3 | About in sintesi + cronologia confermata + contatti | Conferma date/ruoli, misura del testo, nomi link e ordine di lettura | Solo template/testi About, nessuna modifica post o SEO implicita |
| 6 / 2–3 | Header articolo e tipografia prose; preservare Markdown e immagini | Snapshot editoriali/anchor invariati, code block e screenshot leggibili, confronto LCP/CLS prima/dopo | Un solo template reversibile; tutti i post ereditano lo stile senza riscrittura |
| 7 / shell stabile | Tema chiaro/scuro selezionabile | Tutte le pagine in entrambi i temi, preferenza iniziale e primo paint, tastiera, nessun legame con GA/CMP | Scelta tema isolata; in assenza JS resta leggibile il tema iniziale |
| 8 / caso autorizzato | Un solo caso tecnico nella Home; eventuale pagina progetto in scope separato | Contributo, permessi e risultati verificati, nessun placeholder pubblicato | Sezione autonoma rimovibile, nessuna card vuota se il contenuto manca |
| 9 / contenuto EN disponibile | Profilo inglese pilota, fuori da questa PR | Routing/SEO linguistico verificato e manutenzione assegnata | Route aggiuntiva, nessuna migrazione degli URL italiani; piano URL prima di eventuali rimozioni |

PR 6 non dipende dalla riscrittura About, PR 8 non blocca il resto, PR 9 non è un
prerequisito del redesign italiano. Evitare una grande PR con font, navigazione,
contenuti, articoli e lingue contemporaneamente.

### Guardrail per ogni PR applicativa

- Eseguire npm ci/build/test e confronti HTTP per metadata/canonical, sitemap,
  robots, 404 e sette route. Il redesign italiano non richiede cambiare questi
  output. Nessun nuovo required frontmatter e nessuna riscrittura degli slug.
- Preservare esattamente Cookiebot, GA4 e impostazioni di consenso; controllare
  che header/footer e controlli tema non coprano CMP, skip link o focus. Eventuali
  necessità di modifica al consenso devono diventare un incarico separato.
- Rimisurare performance sullo stesso ambiente quando cambiano font, hero o
  template: almeno tre run mobile delle pagine interessate, cache/servizi esterni
  dichiarati, richieste e byte oltre al punteggio. Non usare lo score 100 locale
  come promessa; distinguere Lighthouse da CrUX/RUM.
- Budget di progetto proposto, non dato misurato: nessuna libreria client aggiunta
  per layout/icone; al massimo una nuova famiglia web proporzionale e pochi pesi,
  con obiettivo iniziale ≤80 kB WOFF2 da verificare. Riesaminare il budget prima
  di adottarlo. Mantenere un solo preload immagine utile e sizes coerenti col layout.
- Accessibilità: contrasto testo normale almeno 4,5:1, grande 3:1; focus visibile,
  ordine semantico e link riconoscibili oltre il colore. Il cambio font non deve
  rompere reflow, zoom o spaziatura del testo. [W3C, contrasto](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html),
  [W3C, reflow a 320 CSS px](https://www.w3.org/WAI/WCAG22/Understanding/reflow.html).
- Nessun rilascio implicito: ogni PR revisionabile, revert ordinario e deploy
  solo con autorizzazione. Nessun flag remoto o servizio necessario alla transizione.

### Validazione della direzione prima dell'implementazione

Proporre una revisione con il proprietario e 3–5 persone rappresentative, se
disponibili: un recruiter, uno sviluppatore e un lettore non tecnico. Compiti:
identificare ruolo/specializzazione, trovare un contatto, aprire un articolo PHP,
ricostruire il percorso professionale. Verificare anche senza fotografia e da
mobile. Confrontare errori, comprensione e preferenze motivate, senza interpretare
un campione così piccolo come una stima statistica di conversione.

## 9. Verifiche di questa PR e limiti residui

- `npm ci`: exit 0, 231 pacchetti; zero vulnerabilità segnalate in questa esecuzione.
  Manifest e lockfile invariati, nessun aggiornamento di dipendenze.
- `npm run build`: exit 0; le nove pagine restano statiche/SSG. Il generatore
  sitemap è stato eseguito dalla build, ma il file versionato non cambia.
- `npm test`: **48 pass, 0 fail**, inclusi URL, metadata/canonical, sitemap/robots,
  rendering Markdown, immagini, focus/contrasto e consenso.
- Applicazione, articoli, asset pubblici, CSS, configurazioni e test non modificati.
  Il diff deve contenere soltanto questo report e `docs/ux-ui-prototypes/`.

- Prototipi: sei pagine a quattro larghezze, **24 combinazioni**, nessun overflow
  di documento, immagine rotta o errore JavaScript. Un H1 per pagina. Controllati
  i riferimenti locali HTML a pagine, frammenti, CSS, script e immagini.
- Axe-core 4.14.1: **36 scansioni** (24 iniziali più 12 nel tema alternativo B),
  zero violazioni finali sui tag wcag2a/wcag2aa/wcag21aa/wcag22aa. Il primo giro
  aveva segnalato aria-label su tre contenitori di palette senza ruolo: corretto
  nei soli prototipi con ruolo img, poi ripetuta la matrice interessata.
- Tab e Invio sullo skip link focalizzano main in tutte le sei pagine demo;
  pulsanti tema nativi verificati durante le scansioni dei due stati.
- Revisione visuale degli screenshot A/B/C desktop e mobile e dei layout About/
  articolo B: gerarchia, leggibilità, ritratto e codice. Diagramma metaforico B
  nascosto sul mobile; informazioni professionali rimangono nel testo.
- Evidenze sintetiche versionate in [validation.json](ux-ui-prototypes/validation.json).
  Risultati grezzi e script di sessione in `%TEMP%/pdn-ux-audit/`, esclusi dall'app.

Restano da validare esperienza su dispositivi reali, Safari/Firefox, screen reader,
zoom nativo e testo ingrandito, font definitivi e licenze, CMP reale, primo paint
del tema e impatto delle future implementazioni sui CWV. I controlli automatici
non certificano conformità WCAG, efficacia recruiting o approvazione del redesign.
