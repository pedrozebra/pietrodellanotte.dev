# Prototipi isolati — studio UX/UI

Aprire [index.html](index.html) nel browser. Funziona via file locale, senza build,
pacchetti, font remoti, CMP o Analytics. In alternativa, dalla radice del repository:

```powershell
py -3 -m http.server 3220 --bind 127.0.0.1
```

Visitare `http://127.0.0.1:3220/docs/ux-ui-prototypes/`. Il server è solo locale;
arrestarlo con Ctrl+C. Non usare questo server per pubblicare il repository.

- A, B e C confrontano tre Home con lo stesso profilo e gli stessi articoli.
- About e articolo approfondiscono soltanto B; i link di lettura A/C portano
  esplicitamente allo stesso campione di layout B, non a tre layout articolo.
- Il tema di B cambia con un pulsante nativo, senza memorizzazione. About e
  articolo B partono chiari; Home B parte scura per mostrare l'alternativa.
- Il banner «prototipo» e i placeholder non fanno parte del sito proposto.
- Le immagini provengono da `../../public/`, senza duplicare o modificare gli
  originali. Il caricamento diretto degli originali nel demo non rappresenta
  il delivery `next/image` previsto in produzione.
- Gli unici link esterni sono contatti esistenti e fonti/articolo originale.
  Nessun form invia dati. Nessun selettore lingua o CV finge contenuti disponibili.
- I font utilizzano famiglie già installate con fallback espliciti; nessun font
  Windows viene copiato/distribuito. La resa varia tra OS. Scelta/licenza dei
  font web futuri richiede verifica prima dell'implementazione.
- I file non sono importati da Next né collocati in `pages/` o `public/`.
  `noindex,nofollow` è una precauzione nel demo, non una strategia di isolamento
  sufficiente da sola: non creare route/rewrite o copiarli in public al rilascio.

Audit e roadmap: [ux-ui-audit.md](../ux-ui-audit.md).
