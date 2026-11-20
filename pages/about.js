import Seo from "components/Seo";
import Layout from "components/Layout";
import styles from "styles/about.module.css";
import { siteTitleAbout, aboutDescription, siteUrl } from "helpers/config";

export default function About() {
  return (
    <Layout className={styles.page}>
      <Seo title={siteTitleAbout} description={aboutDescription} canonical={siteUrl + "/about"} />
      <article className={styles.content}>
        <h1>About</h1>
        <p className={styles.introduction}>
          Sono Pietro Della Notte, <strong>Senior Product Engineer I in Docebo</strong>,
          con oltre 12 anni di esperienza nello sviluppo software.
        </p>
        <p>
          Mi occupo principalmente di backend, con una specializzazione in <strong>PHP, Yii2, Laravel e MySQL</strong>.
          Nel corso degli anni ho lavorato su applicazioni web, piattaforme e-commerce e prodotti SaaS.
        </p>
        <h2>Di cosa mi occupo oggi</h2>
        <p>
          Dal 2023 lavoro in <strong><a target="_blank" rel="noreferrer" href="https://www.docebo.com">Docebo</a></strong>,
          una piattaforma SaaS dedicata al Learning Management.
        </p>
        <p>
          Il mio lavoro comprende lo sviluppo e l'evoluzione di funzionalità backend,
          la progettazione di API, il miglioramento del codice esistente e la risoluzione di problemi tecnici.
        </p>
        <p>
          Mi interessa soprattutto costruire soluzioni che siano mantenibili, affidabili
          e comprensibili anche da chi dovrà lavorarci in futuro.
        </p>
        <h2>Il mio percorso</h2>
        <p>
          Mi sono laureato in Informatica nel 2013 e ho iniziato a lavorare nello sviluppo web nello stesso anno.
        </p>
        <p>
          Dal 2013 al 2019 ho lavorato in <strong><a target="_blank" rel="noreferrer" href="https://contactsud.it/">Contact Centre Sud</a></strong>,
          principalmente con PHP, MySQL e jQuery.
        </p>
        <p>
          Dal 2019 al 2022 ho lavorato in <strong><a target="_blank" rel="noreferrer" href="https://alpenite.com/">alpenite</a></strong>,
          occupandomi di backend e ricoprendo anche il ruolo di Technical Leader
          su progetti Salesforce Commerce Cloud nel settore luxury.
        </p>
        <p>
          Dal 2023 sono in <strong>Docebo</strong>, dove continuo a sviluppare le mie competenze
          nell'ingegneria del software e nello sviluppo di prodotti SaaS.
        </p>
        <h2>Perché scrivo</h2>
        <p>
          Uso questo blog per condividere esperienze, problemi tecnici e soluzioni incontrate durante il mio lavoro.
        </p>
        <p>
          Scrivere mi aiuta ad approfondire gli argomenti, mettere ordine nelle idee
          e confrontarmi con altri sviluppatori.
        </p>
        <h2>Restiamo in contatto</h2>
        <p>Puoi contattarmi via email oppure trovarmi su LinkedIn e GitHub.</p>
        <ul className={styles.contacts}>
          <li><a href="mailto:pdellanotte@gmail.com">pdellanotte@gmail.com</a></li>
          <li><a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/pietrodellanotte/">LinkedIn</a></li>
          <li><a target="_blank" rel="noreferrer" href="https://github.com/pedrozebra">GitHub</a></li>
        </ul>
      </article>
    </Layout>
  );
}
