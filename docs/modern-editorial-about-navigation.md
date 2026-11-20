# About e navigazione — Modern Engineering

20 novembre 2026. Branch `feat/modern-editorial-about-navigation`, base
`origin/main` **95d0608**, merge della PR #33. Working tree iniziale pulito.
La Home pubblica espone la presentazione della #33; l'API GitHub deployments
non restituisce un record associato al commit: identità esatta del deploy
non verificata tramite tale API.

## Modifiche

- About: palette chiara e font locale della Home, colonna di massimo 65ch,
  titoli H1/H2, paragrafi senza `br`. Testo sintetizzato mantenendo luogo,
  laurea, esperienze, aziende, date e ambiti tecnici. Contatti espliciti.
- Home/About sempre nella navigazione, inclusi About e i sette articoli.
  `useRouter().pathname` determina `aria-current="page"` anche nelle transizioni
  client; sugli articoli nessuno dei due link è la pagina corrente.
- `editorial.module.css` raccoglie token, misura, font, navigazione, focus e
  variante `.dark` della #33. Home li riusa tramite CSS Modules composition:
  nessuna modifica a `pages/index.js`, alla composizione o ai suoi contenuti.
- Layout applica lo stesso ritmo verticale della navigazione agli articoli.
  Misura e padding di cover e corpo conservati; su mobile la navigazione resta
  allineata alla loro colonna. Nessun redesign del contenuto degli articoli.
- La About precedente non contiene foto. Ritratto Home e asset conservati.
  Nessuna dipendenza, animazione, nuova richiesta font o logica tema aggiunta.

## Verifiche

`npm ci`: riuscito, 231 pacchetti installati, zero vulnerabilità segnalate.
Build production prima/dopo riuscite. `npm test`: **49 pass, 0 fail**, incluso
un nuovo controllo navigazione SSR sulle nove pagine. Le suite esistenti
verificano metadata/canonical/Open Graph, sitemap/robots, route e 404,
i sette articoli e relative immagini, Markdown e consenso.

Un primo tentativo di build è partito prima della conclusione di `npm ci`
ed è fallito per un modulo temporaneamente assente. Ripetuto dopo l'installazione
con esito positivo. Warning preesistenti Tailwind JIT e
MODULE_TYPELESS_PACKAGE_JSON presenti, senza modifiche di configurazione.

Chrome headless su Windows, Puppeteer Core e axe-core temporanei esterni al
progetto. Viewport 320, 375, 768 e 1280 × 900 px, DPR 1. Google Fonts esistenti
consentiti e attesa `document.fonts.ready`; Cookiebot e altri servizi esterni
esclusi nelle scansioni responsive.

Home, About, articolo PHP sulla destrutturazione e articolo sulle versioni
Node.js: **32 combinazioni per fase** (4 pagine × 4 larghezze × 2 temi).
Nessun overflow, immagine rotta o errore JavaScript dopo. Zero violazioni axe
sui tag wcag2a/wcag2aa/wcag21aa/wcag22aa prima e dopo, inclusi i controlli
automatici di contrasto. DOM completo del main dei due articoli campionati
identico prima/dopo in tutte le combinazioni. La suite verifica tutti e sette.

Primo link articolo Home: **297,375 → 297,375 px** a tutte le larghezze e nei
due temi. Scostamento **0 px**, nessuna tolleranza usata. Screenshot Home
a 375 e 1280 identici anche nei byte.

24 controlli tastiera finali su Home/About/articolo PHP, quattro larghezze
e due temi: Tab passa da skip link a Home e About, outline visibile 3 px;
Shift+Tab ritorna a Home. Skip link + Invio focalizza `main-content` nelle
32 combinazioni. Verificata attivazione con Invio Home → About → Home.
Transizioni client Home → About → Home → articolo → About → Home senza
ricaricamento documento, controllato con un valore sentinella su window.

Sorgenti Home, articoli, Markdown, immagini, SEO, sitemap/robots, Cookiebot/GA4,
dipendenze e lockfile invariati. Nessuna nuova misura Lighthouse/CWV:
non si rivendicano miglioramenti prestazionali.

## Screenshot

About full-page; Home e articoli prima viewport. Stesse dimensioni/font per fase.
Revisione visuale di About desktop/mobile, Home desktop e articolo mobile:
gerarchia leggibile, niente sovrapposizioni.

| Pagina | Prima 375 | Dopo 375 | Prima 1280 | Dopo 1280 |
|---|---|---|---|---|
| About | [Prima](modern-editorial-about-navigation/before-about-375.png) | [Dopo](modern-editorial-about-navigation/after-about-375.png) | [Prima](modern-editorial-about-navigation/before-about-1280.png) | [Dopo](modern-editorial-about-navigation/after-about-1280.png) |
| Home / navigazione | [Prima](modern-editorial-about-navigation/before-home-375.png) | [Dopo](modern-editorial-about-navigation/after-home-375.png) | [Prima](modern-editorial-about-navigation/before-home-1280.png) | [Dopo](modern-editorial-about-navigation/after-home-1280.png) |
| Articolo PHP / navigazione | [Prima](modern-editorial-about-navigation/before-article-375.png) | [Dopo](modern-editorial-about-navigation/after-article-375.png) | [Prima](modern-editorial-about-navigation/before-article-1280.png) | [Dopo](modern-editorial-about-navigation/after-article-1280.png) |
| Articolo Node.js | [Prima](modern-editorial-about-navigation/before-article-long-375.png) | [Dopo](modern-editorial-about-navigation/after-article-long-375.png) | [Prima](modern-editorial-about-navigation/before-article-long-1280.png) | [Dopo](modern-editorial-about-navigation/after-article-long-1280.png) |

Evidenze: [risultati](modern-editorial-about-navigation/results.json) e
[tastiera](modern-editorial-about-navigation/keyboard.json). Script e snapshot
integrali di sessione in `%TEMP%/pdn-about-*`, esterni al progetto.

## Limiti e note editoriali

**Da riconfermare dal proprietario:** «Da gennaio 2023 lavoro in docebo» e
l'attualità di ruolo/stack; informazione conservata senza aggiornamenti
arbitrari. Anche i periodi storici sono riportati senza correzioni presunte.

Non verificati Safari/Firefox, dispositivi fisici, screen reader, zoom nativo,
font di altri sistemi e CMP reale sul dominio autorizzato. Axe e controlli
tastiera non certificano conformità WCAG.
Un primo controllo client ha incontrato un elemento DOM sostituito durante
una transizione: sincronizzata l'automazione al completamento della navigazione
e ripetuta con successo l'intera matrice finale.

Aggiornamenti professionali e sostituzione della foto restano interventi
successivi del proprietario. Nessun ampliamento dello scope, merge o deploy.
