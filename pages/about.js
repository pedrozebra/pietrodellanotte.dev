import Head from "next/head";
import Layout from "components/Layout";
import { siteTitleAbout } from "helpers/config";
export default function About() {
    return (
        <Layout>
          <Head>
            <title>{siteTitleAbout}</title>
          </Head>
          <section className='font-base'>
            <p>Ciao! <br />Sono Pietro Della Notte, sono di Battipaglia, e dal 2013, dopo la Laurea triennale in Informatica, lavoro come sviluppatore web. <br/> <br/>
            Dal Novembre 2013 all'Agosto 2019 ho lavorato presso l'azienda <a target="_blank" href="https://contactsud.it/">Contact Centre Sud</a> mi sono occupato prevalentemente di stack LAMP (PHP/MySQL), con uno sguardo anche al vecchio mondo FE (JQuery & co).</p><br/>
            <p>Dal Settembre 2019 al Dicembre 2022 ho lavorato (full-remote) presso l'azienda <a target="_blank" href="https://alpenite.com/">alpenite</a> come sviluppatore BE e Technical Leader su piattaforma Salesforce Commerce Cloud.<br/>
            Sono stato impegnato su progetti e-commerce di alta moda & luxury, una novità assoluta per me.
            </p>
            <p>
              Da Gennaio 2023 lavoro presso l'azienda <a target="_blank" href="https://www.docebo.com">docebo</a> SaaS LMS come sviluppatore BE su stack LAMP, dando un occhio anche al mondo Frontend con Angular.
            </p>
            <p>Sono aperto alla collaborazione, e ad imparare nuove tecnologie, se ti va, restiamo in contatto!</p>
            <p><a href="mailto:pdellanotte@gmail.com">Questa</a> è la mia mail (pdellanotte@gmail.com)</p> 

            <p><a target="_blank" href="https://www.linkedin.com/in/pietrodellanotte/">Questo</a> è il mio profilo LinkedIn (https://www.linkedin.com/in/pietrodellanotte/)</p>
            <p><a target="_blank" href="https://github.com/pedrozebra">Questo</a> è il mio profilo GitHub (https://github.com/pedrozebra)</p>
          </section>
        </Layout>
    )
}
