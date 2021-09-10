import Head from "next/head";
import Layout from "../components/Layout";
import { siteTitle } from "../helpers/config";
import utilStyles from "../styles/utils.module.css";
export default function About() {
    return (
        <Layout>
      <Head>
        <title>{siteTitle}</title>
      </Head>
      <section className={utilStyles.headingMd}>
        <p>Ciao! <br />Sono Pietro Della Notte e da 8 anni lavoro come sviluppatore web. Per i primi 6 mi sono occupato di stack LAMP (PHP/MySQL), con uno sguardo anche al vecchio mondo FE (JQuery & co).</p>
        <p>Da due anni lavoro come sviluppatore BE e Technical Leader su piattaforma Salesforce Commerce Cloud.<br/>
        Al momento sono impegnato su progetti e-commerce di alta moda, una novità assoluta per me.
        </p>
        <p>Sono aperto alla collaborazione, e ad imparare nuove tecnologie, se ti va, restiamo in contatto!</p>
        <p><a href="mailto:pdellanotte@gmail.com">Questa</a> è la mia mail (pdellanotte@gmail.com)</p> 

        <p><a target="_blank" href="https://www.linkedin.com/in/pietro-della-notte/">Questo</a> è il mio profilo LinkedIn (https://www.linkedin.com/in/pietro-della-notte/)</p>
        <p><a target="_blank" href="https://github.com/pedrozebra">Questo</a> è il mio profilo GitHub (https://github.com/pedrozebra)</p>
      </section>
    </Layout>
    )
}