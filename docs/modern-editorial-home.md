# Home minimale — Modern Engineering

19 novembre 2026. Branch `feat/modern-editorial-design`, base **4c202c2**,
come autorizzato dal proprietario senza attendere il merge della #32.
Riferimento: [audit della #32](https://github.com/pedrozebra/pietrodellanotte.dev/blob/8524259/docs/ux-ui-audit.md),
senza incorporare i prototipi nella nuova PR.

## Scelte e ambito

Home a colonna unica: foto piccola e nome, presentazione di due righe, elenco
completo dei sette articoli. Il testo è «Senior Backend Engineer. PHP, Laravel,
Yii2 e MySQL». Titoli, date, ordinamento e URL dei post rimangono invariati.

Palette B chiara: fondo `#F6F8F5`, testo `#172A32`, secondario `#4E6269`,
link `#24634B`. Font proporzionale locale Corbel/Candara/Trebuchet MS con fallback
sans-serif; date in Source Code Pro già presente, a 14 px. Nessun nuovo download
di font o dipendenza. La resa del proporzionale dipende dai font dell'OS.
Hover più marcato e sottolineature restano riconoscibili senza movimento.

La foto originale resta in next/image, larga **56 px**, proporzioni riservate,
sizes aggiornato e singolo preload conservato; niente conversioni degli asset.
Il nome è H1 nel main. La misura utile desktop è 760 px, il padding mobile
20 px. Non si riproduce la hero del prototipo B.

`styles/home.module.css` è importato soltanto da Home. Layout accetta una
className opzionale per circoscrivere lo stile; senza className restituisce il
markup precedente. Foto/nome sono spostati dal ramo Home di Layout alla Home
stessa. Navigation aggiunge aria-current solo al link Home nella Home.
La navigazione rimane Home/About. Il supporto alla classe `.dark` usa la palette
B scura, senza nuovo selettore o logica di tema.

## Prima/dopo e responsive

Screenshot full-page, viewport alta 900 px, DPR 1. Font Google esistenti consentiti
e caricati; CMP e altri servizi esterni esclusi. Coordinate dopo document.fonts.ready,
riferite al bordo superiore del link del primo articolo, dalla cima del documento.

| Larghezza | Primo articolo prima→dopo | Screenshot prima | Screenshot dopo |
|---:|---:|---|---|
| 320 px | 574,81→297,38 px | [Prima](modern-editorial-home/before-home-320.png) | [Dopo](modern-editorial-home/after-home-320.png) |
| 375 px | 550,81→297,38 px | [Prima](modern-editorial-home/before-home-375.png) | [Dopo](modern-editorial-home/after-home-375.png) |
| 768 px | 502,81→297,38 px | [Prima](modern-editorial-home/before-home-768.png) | [Dopo](modern-editorial-home/after-home-768.png) |
| 1280 px | 502,81→297,38 px | [Prima](modern-editorial-home/before-home-1280.png) | [Dopo](modern-editorial-home/after-home-1280.png) |

[Scuro 375 prima](modern-editorial-home/before-home-dark-375.png) ·
[Scuro 375 dopo](modern-editorial-home/after-home-dark-375.png).
Revisione visuale: lista senza card, foto compatta, presentazione di **due righe
in tutte le quattro larghezze**, nessun elemento sovrapposto. Tutti i sette post
sono presenti nel flusso e raggiungibili, senza filtro o paginazione.

Otto combinazioni per fase (quattro larghezze × due temi): nessun overflow,
immagine rotta o violazione axe nei criteri selezionati. Contrasto minimo fra
i testi campionati e sfondo: **6,00:1 chiaro**, **9,33:1 scuro**. Focus outline
3 px sullo skip link, i due link nav e i sette post; Tab/Shift+Tab/Invio verificati,
skip link focalizza main. Provata navigazione client verso About e ritorno Home.
Nessuna certificazione WCAG completa o prova con screen reader.

## LCP e CLS: confronto ripetibile

Windows, Node 24.22.3, npm 11.19.1, Chrome headless 157.0.8103.78,
Lighthouse 13.6.0. Tre navigazioni seriali per fase, build production Webpack su
`http://127.0.0.1:3221/`; nuovo profilo Chrome e storage reset. Mobile 412×823,
DPR 1,75, throttling simulate (RTT 150 ms, throughput 1638,4 Kbps, CPU 4×).
Workstation condivisa, senza isolamento esclusivo. L'optimizer è usato normalmente,
senza svuotare la cache fra run; prima di ogni serie viene percorsa la medesima
matrice viewport. Primo run e run successivi restano distinguibili nei risultati.

Per isolare il sito, entrambe le serie Lighthouse bloccano `https://*`, inclusi
Google Fonts e Cookiebot. Quindi il confronto usa il fallback della vecchia Home
e il font locale della nuova; non misura l'esperienza con CMP/font reali. I controlli
visuali/CLS con font consentiti sono uno scenario separato.

```sh
lighthouse http://127.0.0.1:3221/ \
  --chrome-flags="--headless=new --disable-gpu --no-first-run" \
  --only-categories=performance --blocked-url-patterns="https://*" \
  --output=json --output-path=home-mobile.json --quiet
```

| Metrica | Prima, run 1 / 2 / 3 | Dopo, run 1 / 2 / 3 | Mediana prima→dopo |
|---|---|---|---|
| Performance | 98 / 97 / 97 | 99 / 99 / 97 | 97→99 |
| LCP, secondi | 2,088 / 2,161 / 2,210 | 1,551 / 1,552 / 1,549 | 2,161→1,551 |
| CLS | 0 / 0 / 0 | 0 / 0 / 0 | 0→0 |
| TBT, ms | 91,5 / 116 / 127,5 | 103 / 97,5 / 179,5 | 116→103 |

Il candidato LCP osservato cambia: prima il ritratto, dopo la voce for/forEach
dell'elenco. Il cambiamento di contenuto/gerarchia è parte del risultato, non
un'accelerazione attribuibile soltanto all'immagine. Il terzo TBT dopo oscilla
verso l'alto, senza una corrispondente regressione LCP; campione piccolo e CPU
condivisa non consentono garanzie statistiche.

Byte immagine mediani **3612→1784**, un'unica richiesta; il ritratto mobile passa
da variante w=256 a w=128. Byte totali **166774→169215** (+1,5%), richieste
registrate **28→30**, incluse richieste bloccate e accessi da cache: il nuovo CSS
è circoscritto alla route e più articoli visibili attivano il prefetch esistente
(ora anche il JSON del settimo post). Viene inoltre precaricato il CSS condiviso
necessario alle altre pagine. Non si modifica la politica prefetch in questa PR.

Con font Google consentiti, il browser rileva CLS prima/dopo: 0,04077→0 a 320,
0,00192→0 a 375, 0,00398→0 a 768 e 0→0 a 1280, in entrambi i temi. Sono singole
osservazioni per combinazione, con cache browser non resettata fra tutte le pagine,
non mediane Lighthouse né misure sul campo. Non si attribuisce una garanzia di
CLS zero in produzione. **CrUX, RUM e INP non raccolti**.

## Regressione e limiti

- `npm ci`: exit 0, 231 pacchetti e zero vulnerabilità segnalate in questa esecuzione.
- `npm run build`: exit 0 prima/dopo; `npm test`: **48 pass, 0 fail** dopo.
- Otto snapshot DOM header/main di About e dei sette articoli esattamente identici
  prima/dopo; screenshot About e articolo PHP desktop identici anche nei byte.
- Metadata/canonical, sitemap/robots, route/404, Markdown e immagini verificati
  dalla suite esistente. Nessuna modifica a SEO, sitemap, robots, post, loader,
  asset originali, Cookiebot/GA4, dipendenze o CSS globale.
- Evidenze sintetiche: [results.json](modern-editorial-home/results.json).
  JSON Lighthouse integrali e script locali in `%TEMP%/pdn-home-design/`.
  Puppeteer Core 25.18.1 e axe-core 4.14.1 sono strumenti temporanei, non dipendenze
  del progetto. La build usa l'ambiente locale esistente senza copiarne i valori.

Restano da verificare Safari/Firefox, font disponibili su altri OS, zoom nativo,
dispositivi fisici e CMP reale sul dominio autorizzato. I dati di laboratorio
non dimostrano un miglioramento dei Core Web Vitals degli utenti. Warning noti
Tailwind JIT e MODULE_TYPELESS_PACKAGE_JSON invariati. Nessun merge o deploy.
