# Patch PostCSS ed eccezione temporanea picomatch

Data 17 novembre 2026. PR #26, branch `release/next16-analytics`.
Remediation approvata dal proprietario. Commit di partenza
`72393dbdbfb56989bc05b1411f908bfebc62171e`, inizialmente allineato a origin
con working tree pulito.

## Modifica e controllo del lockfile

PostCSS diretto passa da `^8.4.12` al pin esatto `8.5.33`. Il lockfile è
aggiornato con npm 11.19.1 tramite installazione mirata package-lock-only.
Il confronto strutturale individua soltanto due voci modificate, la root
del progetto e `node_modules/postcss`. Le nuove specifiche delle dipendenze
di PostCSS sono soddisfatte dalle versioni già risolte nel lockfile.
Nessun pacchetto aggiunto o rimosso e nessun altro nodo aggiornato.

Restano Next 16.4.6, React/React DOM 19.3.1, Tailwind 2.2.19,
Autoprefixer 10.4.4 e picomatch 2.3.2. Next mantiene la propria copia
PostCSS 8.5.23. Nessun override, audit fix o cambio di configurazione CSS.
Le cinque segnalazioni PostCSS del precedente audit non compaiono più
nell'audit dopo la patch.

## Baseline e confronto della build

Due directory temporanee separate sono state estratte dallo stesso commit
di partenza. Solo manifest e lockfile della candidate sono stati sostituiti
con quelli della patch. Per entrambe sono stati eseguiti npm ci, npm run build
e npm test con Node 24.22.3 e npm 11.19.1, senza .env.local e senza riutilizzare
cache .next. Ogni suite conta 29 test passati e 0 falliti.

| Controllo | Baseline | Candidate |
|---|---|---|
| PostCSS root | 8.4.12 | 8.5.33 |
| npm ci | Exit 0, 231 pacchetti | Exit 0, 231 pacchetti |
| Build Next 16.4.6 Webpack | Exit 0 | Exit 0 |
| Suite completa | 29 passati, 0 falliti | 29 passati, 0 falliti |
| npm audit --json | Exit 1, 8 High, 0 Critical | Exit 1, 7 High, 0 Critical |
| npm audit --omit=dev --json | Non ripetuto su questa baseline | Exit 1, 7 High, 0 Critical |
| npm ls postcss picomatch | Copie precedenti | Exit 0, root 8.5.33, Next 8.5.23, picomatch 2.3.2 |

Il CSS compilato è identico byte per byte, inclusi nomi dei file e ordine
delle dichiarazioni. Hash SHA-256 comuni alle due build sono riportati sotto.

| File | Byte | SHA-256 |
|---|---|---|
| 6d3ce08be6cb9748.css | 604 | b3a536ec8d6d0b4beed68bd1956106b00844ea81ce3f037d9bd1415914d17c6a |
| acb44b0ab7ad5230.css | 8489 | e585388b684ae58e5c1527220fbe98dc69840a70501bbb74c556a8a9839efcdb |

Il controllo AST rileva 61 regole typography, 4 regole dark e 10 regole del
gruppo layout/immagini. Sono conservati `.prose`, flex, margini automatici,
padding, max-width 64rem e immagini con max-width 100% e height auto.
Il CSS attuale non contiene media query, il comportamento responsive esaminato
dipende dai vincoli fluidi e di larghezza massima già presenti.

Classi HTML, stili inline e attributi width/height coincidono nelle 11 pagine
generate, comprese home, About, sette articoli e pagine di errore. Questa
verifica copre gli input CSS/markup di typography, responsive, dark mode e
layout. Il browser connesso restituisce The browser access host is unavailable.
Non sono stati eseguiti screenshot comparativi o prove interattive di viewport
e dark mode. Non viene dichiarata una verifica visuale browser sulla sola base
dei test HTTP. Restano i controlli manuali del rilascio su dominio autorizzato.

## Eccezione temporanea GHSA-fc5q-39xc-vjpf

L'advisory descrive una ReDoS tramite pattern extglob ripetuti. Picomatch 2.3.2
è coinvolto. Alla verifica corrente il registry indica latest 4.0.7 e l'advisory
comprende le versioni fino a 4.0.7, senza una patch pubblicata. Il proprietario
ha approvato il mantenimento temporaneo della dipendenza con mitigazioni.
[Advisory ufficiale](https://github.com/advisories/GHSA-fc5q-39xc-vjpf).

I sette pacchetti High residui sono picomatch 2.3.2, anymatch 3.1.3,
readdirp 3.6.0, chokidar 3.6.0, micromatch 4.0.8, fast-glob 3.3.3 e
tailwindcss 2.2.19. Le segnalazioni ereditate descrivono un solo advisory.

I percorsi coinvolti partono da Tailwind e raggiungono picomatch attraverso
chokidar/anymatch, chokidar/readdirp e fast-glob/micromatch. Tailwind è una
devDependency diretta e anche un peer di @tailwindcss/typography, dichiarato
nelle dependencies. Questa relazione mantiene la catena nell'audit omit=dev.

### Motivazione

Il blog usa Markdown locale e SSG con fallback false. I glob Tailwind sono
costanti del repository. Non sono presenti endpoint applicativi che accettano
pattern glob, upload o CSS da compilare a runtime. L'esposizione individuata
è nel tooling/build e nel watch di sviluppo. Non è stato dimostrato un percorso
da una richiesta pubblica alle funzionalità vulnerabili.

Un override verso picomatch 4.0.7 resterebbe nel range vulnerabile e uscirebbe
dai range 2.x dei chiamanti. La migrazione major Tailwind suggerita da npm
non è stata applicata. L'eccezione conserva il risultato audit exit 1.

### Mitigazioni da mantenere

- Revisionare modifiche a glob, configurazioni CSS e sorgenti prima delle build.
- Mantenere i pattern nel repository, evitando input da query, form, upload,
  contenuti di terzi o configurazioni remote non fidate.
- Eseguire le build di contributi non fidati in ambienti isolati, con accesso
  minimo alle credenziali. Verificare le impostazioni effettive del provider.
- Usare il percorso di produzione Next previsto e conservare next dev/watch
  negli ambienti di sviluppo controllati.
- Conservare lockfile e installazione riproducibile, evitando aggiornamenti
  major o sostituzioni globali introdotti per eliminare soltanto il conteggio.

### Rivalutazione e responsabilità

Il proprietario del repository mantiene la decisione sul rischio residuo.
Rivalutare l'eccezione prima di ogni successivo rilascio, quando cambia l'advisory,
quando viene pubblicata una patch e quando cambia il modello degli input o
la configurazione di build/deployment. Alla disponibilità di una correzione,
verificare prima aggiornamenti nei range dei parent. Ogni override deve avere
compatibilità dimostrata e una motivazione specifica.

### Condizioni che bloccano il rilascio

- Un input controllato da visitatori raggiunge glob o compilazione vulnerabili.
- Si riproduce una ReDoS nel percorso supportato dal blog o nel deployment.
- Le build devono elaborare pattern non fidati e non è possibile isolarle
  o limitare adeguatamente le risorse e le credenziali accessibili.
- Un cambiamento porta il watcher vulnerabile nel percorso di produzione
  esposto a input non fidati.
- Nuove evidenze dell'advisory invalidano la valutazione di raggiungibilità
  e non è disponibile una mitigazione verificabile.

Le impostazioni Vercel e l'artefatto Linux effettivo restano da verificare.
L'eccezione riguarda questo advisory e non chiude i controlli Cookiebot/GA4
o gli altri prerequisiti del rilascio documentati nella PR #26.
