Hi, this is my personal web site, based on starter template for [Learn Next.js](https://nextjs.org/learn).

Have a nice code!

## Sviluppo e verifiche

Usare Node.js **24.22.3** (vedi `.nvmrc`) e npm **11.19.1**. Con nvm-windows
selezionare esplicitamente la versione prima di eseguire i comandi; `.nvmrc` non
la cambia automaticamente. La versione Node del provider va verificata prima
di un eventuale deploy.

```sh
npm ci
npm run build
npm test
npm run dev
```

Sviluppo e build usano Webpack. Il progetto mantiene Pages Router, JavaScript,
SSG, Tailwind CSS 2 e l'attuale pipeline Markdown.

`npm test` richiede una build di produzione aggiornata. Usa il test runner Node,
avvia un server production su una porta locale libera e lo arresta alla fine.
Verifica home, About, sette URL storici, 404, metadata, immagini e contenuti
Markdown. Le fixture HTML sono state acquisite dal loader originale prima
dell'upgrade: non aggiornarle automaticamente per far passare una regressione.
I test di sanitizzazione lavorano su contenuti temporanei, senza scrivere in
`posts/`. Non sostituiscono i controlli browser su navigazione, hydration e
consenso Analytics/Cookiebot.
