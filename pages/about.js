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
          Sono Pietro Della Notte, sviluppatore web di Battipaglia.
          Lavoro dal 2013, dopo la laurea triennale in Informatica.
        </p>
        <h2>Il mio percorso</h2>
        <p>
          Da novembre 2013 ad agosto 2019 ho lavorato in <a target="_blank" rel="noreferrer" href="https://contactsud.it/">Contact Centre Sud</a>,
          soprattutto con lo stack LAMP (PHP/MySQL), occupandomi anche di frontend con jQuery.
        </p>
        <p>
          Da settembre 2019 a dicembre 2022 ho lavorato da remoto in <a target="_blank" rel="noreferrer" href="https://alpenite.com/">alpenite</a>,
          come sviluppatore backend e Technical Leader su Salesforce Commerce Cloud.
          Mi sono occupato di progetti e-commerce nel settore alta moda e luxury, un ambito nuovo per me.
        </p>
        <p>
          Da gennaio 2023 lavoro in <a target="_blank" rel="noreferrer" href="https://www.docebo.com">docebo</a>,
          piattaforma SaaS LMS, come sviluppatore backend su stack LAMP,
          occupandomi anche di frontend con Angular.
        </p>
        <h2>Restiamo in contatto</h2>
        <p>Sono aperto a collaborare e a imparare nuove tecnologie. Puoi scrivermi o trovarmi qui:</p>
        <ul className={styles.contacts}>
          <li><a href="mailto:pdellanotte@gmail.com">pdellanotte@gmail.com</a></li>
          <li><a target="_blank" rel="noreferrer" href="https://www.linkedin.com/in/pietrodellanotte/">LinkedIn</a></li>
          <li><a target="_blank" rel="noreferrer" href="https://github.com/pedrozebra">GitHub</a></li>
        </ul>
      </article>
    </Layout>
  );
}
