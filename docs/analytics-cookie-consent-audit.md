# Audit Cookiebot e Google Analytics

Data 17 novembre 2026. Branch `fix/analytics-cookie-consent`, creato dall'ultimo
commit locale di `chore/upgrade-nextjs-react`, `cfe2d94` (Fix profile image).
Prima fase di analisi per A12/A13 dell'audit tecnico e S3 della roadmap.
Stack mantenuto Next.js 16, Pages Router e JavaScript.

## Perimetro ed evidenze

Letti `AGENTS.md`, `docs/technical-audit.md`, `docs/roadmap.md`, `pages/_app.js`,
`pages/_document.js`, `lib/ga/index.js` e la documentazione Script della versione
Next installata. Il vecchio audit descrive lo stack precedente alla migrazione.
Questo documento contiene una proposta da approvare prima dell'implementazione.

Sono confermate le proprietà del codice riportate sotto. Il proprietario ha
comunicato che il banner è visibile sul sito pubblico e che localhost non è
autorizzato nel Cookiebot Manager. Non sono stati osservati in questa fase
traffico browser, cookie, Tag Assistant o pannelli Cookiebot/GA4. Il comportamento
effettivo dell'integrazione automatica e del consenso resta quindi da misurare.
La visibilità del banner da sola non dimostra il blocco dei tag.

## Ordine attuale di caricamento

1. `_document.js` non contiene inizializzazione del consenso o CMP nel suo Head.
2. `_app.js` rende un normale script Cookiebot nel corpo, prima dei componenti
   Script. Imposta `data-blockingmode="auto"`, senza async/defer e senza
   `data-consentmode="disabled"`. La posizione nel corpo lascia gli script
   precedenti fuori dalla garanzia di un autoblocker installato per primo.
3. gtag.js viene richiesto con `afterInteractive`. Il caricamento è indipendente
   da un controllo applicativo del consenso e dall'esistenza dell'ID Analytics.
   Cookiebot può intercettarlo, ma questo va osservato sul dominio configurato.
4. L'inline `gtag-init`, anch'esso afterInteractive, crea dataLayer e la funzione
   di accodamento gtag, imposta solo analytics_storage denied, accoda js e config.
   Il default precede config nel medesimo inline, ma arriva dopo il tag CMP.
   Non esiste una barriera esplicita fra CMP, inizializzazione e tag remoto.
5. Un ulteriore Script inline, senza id, registra Accept/Decline. Il suo ordine
   nel JSX non garantisce che intercetti eventi CMP già avvenuti. L'effetto
   React registra routeChangeComplete e hashChangeComplete indipendentemente
   dal completamento degli script. I listener router hanno già cleanup.

Next documenta afterInteractive come caricamento client dopo l'inizio
dell'hydration e richiede id agli inline. La documentazione locale ammette
beforeInteractive in `_document.js` per Pages Router. Cookiebot propone invece
un normale script nel Head di `_document` e conferma la compatibilità
dell'autoblocker con afterInteractive. La frase della guida Cookiebot che
esclude genericamente next/script da Document è più restrittiva della guida
Next installata. Per la CMP si propone il tag normale documentato da Cookiebot,
senza cambiare router o introdurre un wrapper aggiuntivo.
[Cookiebot e Next.js, sezione Pages Router](https://support.cookiebot.com/hc/en-us/articles/27408568285212-Implementing-Cookiebot-CMP-in-a-Next-js-site-App-Router),
[Next Script](https://nextjs.org/docs/pages/api-reference/components/script).

## Problemi confermati e rischi condizionali

| Evidenza nel codice | Implicazione e verifica necessaria |
|---|---|
| Accept con statistics true imposta ad_storage granted | Consenso advertising derivato dalla categoria sbagliata. Il consenso analytics non viene aggiornato dal listener |
| Decline modifica solo ad_storage | La logica manuale non revoca analytics_storage. Anche una modifica parziale con statistics false non produce una revoca nel ramo Accept |
| Default limitato ad analytics_storage | Il codice non definisce esplicitamente gli altri tre segnali Consent Mode v2, ad_storage, ad_user_data e ad_personalization. La CMP potrebbe integrarli |
| config iniziale senza send_page_view false | È abilitato l'invio automatico della pageview da configurazione |
| ga.pageview richiama config a ogni evento router/hash | Potenziale sovrapposizione con la misurazione avanzata GA4 degli eventi history. Duplicazioni effettive da contare in rete |
| ga.pageview e ga.event invocano window.gtag senza guard | Possibile TypeError con inline bloccato/non eseguito o navigazione precoce. Il solo blocco del download gtag.js non implica gtag assente se lo stub inline è già pronto |
| Nessun controllo statistics in pageview/event | Chiamate accodate anche prima della scelta o dopo revoca. Il loro invio dipende dai tag, dalla CMP e dal consumo della coda |
| Nessun controllo dell'ID Analytics | Possibile richiesta/configurazione con valore mancante |
| Inline listener senza id e nessuna sincronizzazione iniziale | Registrazione e ripristino dello stato fragili. Mancata gestione esplicita di consenso già disponibile prima del mount |

Il comando config genera normalmente una pageview. GA4 permette di disabilitarla
con send_page_view false e inviare eventi page_view espliciti. La configurazione
history della proprietà deve essere verificata quando si usa tracking manuale.
[Google, pageview](https://developers.google.com/analytics/devguides/collection/ga4/views),
[Google, applicazioni SPA](https://developers.google.com/analytics/devguides/collection/ga4/single-page-applications).

### Integrazione automatica e conflitti

Cookiebot documenta aggiornamenti automatici Consent Mode v2 per il tag diretto
e un default da predisporre prima dei tag Google. Il repository non disabilita
questa integrazione. È quindi attesa un'autorità CMP già attiva, da confermare
osservando i comandi dataLayer e gli stati in Tag Assistant. L'attributo auto
controlla il blocco degli script, mentre data-consentmode riguarda Consent Mode.
[Cookiebot, integrazione Consent Mode](https://support.cookiebot.com/hc/en-us/articles/360016047000-Implementing-Google-Consent-Mode),
[Cookiebot, attributi del tag](https://www.cookiebot.com/en/developer/).

Se la CMP aggiorna i segnali, i listener manuali scrivono sugli stessi stati
con una mappatura differente. L'ultimo comando elaborato può sovrascrivere quello
corretto. Anche il default tardivo può seguire un consenso salvato già ripristinato.
Il conflitto è strutturalmente possibile, la sequenza effettiva va registrata.

### Privacy e limiti

L'errata concessione advertising e la revoca incompleta richiedono correzione.
Con tag Google caricati e analytics_storage denied, Advanced può comunque
trasmettere ping senza cookie. Assenza di cookie e assenza di trasmissioni sono
controlli distinti. Nessuna trasmissione non consentita o violazione normativa
è stata dimostrata in questa analisi. URL, query e referrer possono contenere
dati personali e vanno esclusi dai payload quando non necessari.
[Google, comportamento Consent Mode](https://developers.google.com/tag-platform/security/concepts/consent-mode).

## Architettura consigliata da approvare

Si propone **Basic Consent Mode**. Il requisito operativo è zero caricamenti
gtag.js e zero richieste di misurazione GA prima del consenso statistics,
anche dopo rifiuto. Advanced carica i tag prima del consenso e permette ping
senza cookie, con maggiore copertura di modellazione e maggiori trasmissioni.
Basic comporta conteggi inferiori e nessun recupero delle visite precedenti
all'accettazione. Per questo blog il compromesso privilegia minimizzazione
e una regola applicativa verificabile.
[Google, Basic e Advanced](https://developers.google.com/tag-platform/security/concepts/consent-mode).

Il piano mantiene Cookiebot come unica autorità degli update Consent Mode.
L'applicazione predispone il default negato e decide quando caricare/invocare
Analytics leggendo lo stato CMP. I listener applicativi sincronizzano il ciclo
di vita del tag, senza inviare update di consenso concorrenti. Statistics
abilita analytics_storage. La scelta statistics non concede advertising.
Le categorie marketing e i tre segnali pubblicitari vanno verificati nella
mappatura CMP, senza introdurre tag pubblicitari.

Automatic Blocking resta attivo per le altre risorse. Per Analytics il blocco
primario è il caricamento condizionale applicativo. Nessun bypass generico
dell'autoblocker. L'eventuale ignore è limitato al bootstrap del consenso che
non invia misurazioni. Un'attesa temporale non sostituisce il controllo CMP.
La guida Basic Cookiebot illustra lo stesso principio di caricamento dopo
consenso attraverso GTM, ma qui viene applicato senza introdurre GTM.
[Cookiebot, Automatic Blocking](https://support.cookiebot.com/hc/en-us/articles/360009074960-Automatic-cookie-blocking),
[Cookiebot, configurazione Basic](https://support.cookiebot.com/hc/en-us/articles/14448386844700-Configuring-tags-for-basic-consent-mode).

## Piano preciso delle modifiche applicative

1. In `pages/_document.js`, inserire nel Head il bootstrap inline con id stabile,
   dataLayer/stub e default denied per i quattro segnali v2, prima della CMP
   e di ogni config/event Google. Non accodare misurazioni nel bootstrap.
   Spostare subito dopo il tag Cookiebot attuale, conservandone identificativo
   e auto blocking, senza async/defer. Verificare l'HTML SSR e l'hydration.
2. In `pages/_app.js`, rimuovere il tag CMP duplicato nel corpo e i due listener
   che scrivono ad_storage. Sostituire l'inizializzazione incondizionata con
   un coordinamento unico di stato CMP, caricamento Google e navigazione.
3. Registrare ConsentReady, Accept e Decline con cleanup, poi leggere anche
   immediatamente lo snapshot CMP per coprire eventi precedenti al mount.
   ConsentReady copre consenso nuovo e ripristinato. Prima della disponibilità
   CMP o in caso di errore mantenere il tag disabilitato. La sincronizzazione
   deve essere idempotente rispetto a eventi ripetuti e remount React.
   [Eventi e API Cookiebot](https://www.cookiebot.com/en/developer/).
4. Caricare un solo gtag.js con next/script afterInteractive soltanto con ID
   configurato e statistics true. Inizializzare una sola volta con config e
   send_page_view false. Verificare che l'update CMP sia già disponibile prima
   di questa inizializzazione. Al completamento del caricamento rileggere
   consenso e route corrente, perché entrambi possono cambiare durante la rete.
5. In `lib/ga/index.js`, proteggere pageview ed event per ambiente browser,
   configurazione, consenso corrente e tag pronto. Inviare pageview tramite
   event page_view. Scartare eventi precedenti al consenso, senza conservarli
   per un successivo invio. Impostare page_location, page_title e page_referrer
   coerenti, con URL privi di query non necessarie e frammenti.
6. Inviare una pageview della pagina corrente all'attivazione, poi una per ogni
   routeChangeComplete riuscito, incluso back/forward. Eliminare il tracking
   hashChangeComplete. Deduplicare eventi della stessa transizione e della
   sincronizzazione del consenso, consentendo una nuova visita A → B → A.
   Navigazioni completate durante il caricamento producono solo la pageview
   corrente quando il tag diventa pronto. Gli hash e gli eventi cancellati
   non generano pageview. Il filtro query è una scelta proposta da approvare.
7. Nel pannello GA4 verificare e disabilitare la generazione automatica di
   pageview history per evitare una seconda sorgente di eventi. È una modifica
   esterna da concordare con il proprietario, da completare prima del rilascio
   del tracking manuale. Verificare send_page_view false a ogni nuovo documento.
8. Alla revoca, bloccare subito helper ed eventuale caricamento pendente e usare
   il flag di disabilitazione Analytics per l'ID esistente. La sola rimozione
   del nodo script non arresta il codice già eseguito. Proposta conservativa
   da approvare, ricaricare il documento dopo la revoca per scaricare il runtime
   GA già attivo. Al refresh il gate CMP deve impedire un nuovo caricamento.
   Verificare rimozione dei cookie GA tramite CMP e scansione, con eventuale
   pulizia mirata di nomi/domain/path effettivamente osservati. Conservare la
   scelta CookieConsent. Richieste già partite non possono essere annullate
   retroattivamente. La verifica di revoca comprende gli eventi automatici GA.
9. Verificare un comando accessibile per riaprire le preferenze dal sito.
   Se la UI CMP non lo espone stabilmente, proporre un pulsante con Cookiebot.renew,
   senza cambiare le altre parti della navigazione. Aggiornare il documento
   con evidenze, impostazioni approvate e limiti residui.

Il flag ga-disable è documentato da Google come controllo applicativo della
raccolta Analytics. La sua efficacia durante revoca e caricamenti concorrenti
va verificata insieme al reload e alla CMP.
[Google, disabilitare Analytics](https://developers.google.com/tag-platform/security/guides/privacy#turn_off_google_analytics).

## Verifiche nel Cookiebot Manager e in GA4

- Confermare Domain Group e domini autorizzati, www/apice e dominio di test.
  Localhost non autorizzato non consente una prova completa della CMP. Scegliere
  un ambiente autorizzato prima di dichiarare superati i test di consenso.
- Verificare disponibilità dell'integrazione Consent Mode v2, mappatura delle
  categorie, eventuale TCF, configurazioni regionali e consensi salvati. Cercare
  integrazioni duplicate tramite hosting, GTM o altri snippet esterni al repo.
- Controllare scansione recente, classificazione Statistics di gtag/cookie GA,
  domini di raccolta, eccezioni e risorse bloccate. Confermare che l'autoblocker
  lasci eseguire runtime Next e navigazione senza autorizzare Analytics in anticipo.
- Verificare durata del consenso, rinnovo/revoca, cookie rimossi e disponibilità
  del centro preferenze. Ripetere test nelle regioni con policy differenti.
- In GA4 controllare measurement ID attuale, Enhanced Measurement/history,
  Google signals, personalizzazione pubblicitaria, destinazioni collegate ed
  eventuali tag aggiuntivi. Registrare le impostazioni pertinenti senza copiare
  credenziali. Nessuna modifica ai pannelli eseguita in questa fase.

## Strategia browser e matrice di accettazione

Usare un browser con profilo pulito e DevTools aperti prima del caricamento,
su dominio autorizzato con build production. Prima acquisire la baseline attuale,
poi ripetere la matrice dopo l'implementazione. Network con Preserve log e cache
disabilitata, filtri gtag/js, collect, g/collect e domini di raccolta osservati.
Controllare Initiator, tempi e payload, contando en=page_view anche nei batch.
Distinguere le richieste CMP e Google Fonts dalle richieste Analytics.
Application mostra CookieConsent, _ga e _ga_* con domain/path e scadenza.
Console deve restare senza errori durante ogni transizione.

Aprire anche Tag Assistant e verificare default e update dei quattro segnali,
con ordine precedente al primo config/event. In Basic la mancata connessione
prima della scelta può dipendere dal blocco corretto del tag. Confermare sempre
con Network. Dopo consenso usare DebugView per confrontare page_view e parametri.
Ripetere il controllo rete anche senza Tag Assistant, che aggiunge traffico di
debug. Conservare evidenze depurate di identificativi client e dati personali.
[Google, debug del consenso](https://developers.google.com/tag-platform/security/guides/consent-debugging).

Tutti i casi sotto sono **da eseguire**. Le attese descrivono la proposta Basic.

| Caso | Azione | Attesa di accettazione |
|---|---|---|
| Prima visita | Cancellare dati sito, aprire home e attendere senza scelta | Default negati, nessun download gtag.js, cookie GA o richiesta Analytics |
| Navigazione senza scelta | Home → About → post → back | Zero misurazioni e nessun errore gtag |
| Rifiuto | Rifiutare tutto e navigare | Statistics false, zero tag/misurazioni, advertising negato |
| Rifiuto persistito | Refresh e accesso diretto a un post | Stesso blocco, scelta ripristinata |
| Solo statistics | Accettare statistiche, negare marketing | Analytics granted, advertising denied, un tag e una pageview corrente |
| Solo preferences/marketing | Negare statistics e accettare altra categoria | Nessun Analytics. Advertising conforme alla scelta marketing comunicata dalla CMP |
| Accettazione totale | Accettare e attendere | Segnali coerenti con categorie CMP, una pageview corrente, nessuna duplicazione |
| Accettazione salvata | Refresh su post e nuova tab dello stesso dominio | Consenso ripristinato prima della misura, una pageview per documento |
| Route consentite | Home → About → post → back/forward | Una pageview per visita completata, titolo/location/referrer corretti |
| Hash e query | Cambiare ancora, query e URL equivalente | Zero per hash; query escluse secondo politica proposta; nessun dato personale |
| Eventi CMP ripetuti | Salvare le stesse preferenze più volte | Nessun nuovo config, tag o pageview duplicata |
| Revoca | Da consenso attivo togliere statistics, poi navigare | Blocco immediato, reload proposto, zero nuove misurazioni dopo revoca e cookie GA rimossi secondo verifica CMP |
| Nuovo consenso | Riaccettare dopo revoca | Una pageview corrente, nessun invio retroattivo delle visite negate |
| Race di caricamento | Rete lenta, accettare, cambiare route e revocare prima del load | Nessuna inizializzazione tardiva non consentita; nessuna coda di eventi negati |
| CMP/tag bloccati | Bloccare separatamente uc.js e gtag.js con DevTools | Sito navigabile, nessun errore JS, blocco Analytics in assenza di stato valido |
| ID assente | Build locale di prova senza ID, senza stampare env | Nessuna richiesta con undefined, nessun errore o evento |
| JavaScript disabilitato | Aprire home e post | Contenuto SSG accessibile, nessun Analytics |
| Regioni/browser | Ripetere scelta, reload e revoca su policy/browser supportati | Stessa regola statistics e nessuna raccolta anticipata |

Prima dell'implementazione sono richieste approvazione dell'architettura Basic,
della politica pageview e del reload alla revoca. Gli accessi ai pannelli e il
dominio autorizzato servono a completare le verifiche esterne, mentre le modifiche
applicative possono essere preparate dopo l'approvazione del piano.

## Validazione di questa fase

Creato soltanto questo documento. Codice, dipendenze e identificativi invariati.
Revisione del diff e `git diff --check` eseguite. Build, suite automatica e
matrice browser non rieseguite per questa analisi documentale. I test HTTP e
Markdown esistenti non provano consenso, richieste browser o comportamento CMP.
Per l'implementazione prevedere build e suite esistenti, test mirati senza nuove
dipendenze per gate/deduplicazione/race, quindi matrice browser con evidenze.
Nessun commit, push, merge o deploy effettuato.
