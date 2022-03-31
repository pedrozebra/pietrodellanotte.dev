---
title: 'Salesforce Commerce Cloud (SFCC) una panoramica sul Job Framework'
canonical: 'salesforce-commerce-cloud-job-framework'
description: "Salesforce Commerce Cloud, cos'è il job framework, scopriamone le potenzialità."
coverImage: 'cover.png'
date: '2022-03-26'
time: '19:00:00 GMT+2'
---


Salesforce Commerce Cloud per gli amici **SFCC** dispone di uno strumento che ti verrà spesso in aiuto (sopratutto se sei uno sviluppatore Backend): 
il **Job Framework**.

## Cos'è il Job Framework

Il Job framework è una parte molto importante della piattaforma Commerce Cloud.

Per scopi integrativi il sistema avrà la necessità di creare o importare diversi tipi di files, ad esempio esportare un ordine tramite un file verso un OMS, oppure importare liste di inventari da un OMS, importare prodotti, pricebooks, o ancora esportare custom objects e successivamente cancellarli dalla piattaforma e così via.

Il Job Framework viene incontro a queste necessità e ci consente di effettuare queste operazioni.


## Principali Considerazioni quando si crea un job

1. Definire gli step
2. Usare quanto più possibile gli step predefiniti dal framework
3. Creare step custom solo quando ne abbiamo realmente bisogno
4. Se vengono utilizzati i custom step, ricordarsi di aggiungere la cartridge che contiene i custom step al Business Manager cartridge path

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/sfcc-job-framework.png)](../images/posts/salesforce-commerce-cloud-job-framework/sfcc-job-framework.png)

## Come si crea un Job?

1. Da Business Manager selezionare Administration > Operations > Jobs
2. Cliccare New Job
3. Inserire un ID ed una descrizione
4. Cliccare su Create

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/operations-job.png)](../images/posts/salesforce-commerce-cloud-job-framework/operations-job.png)
[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/newjob.png)](../images/posts/salesforce-commerce-cloud-job-framework/newjob.png)


## Aggiungere un Job Step

1. Cliccare su **Job Steps**
2. Cliccare su **Configure a step**
3. Selezionare uno step
4. Configurare i parametri dello step, quelli **required** saranno marcati con un asterisco rosso, per alcuni parametri puoi passare il mouse sul nome del parametro per ottenere informazioni, su di esso
5. Configurare le «**Exit Status Rule**» per stabilire come si deve comportare il lo step in caso di errore o di success (Fermare il Job, Continuare, Fermare il Flusso)
6. Cliccare **Assign**

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/step-job.png)](../images/posts/salesforce-commerce-cloud-job-framework/step-job.png)
[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/exitstatusrule.png)](../images/posts/salesforce-commerce-cloud-job-framework/exitstatusrule.png)

## Configurare un Job Flow

1. Cliccare su Job Steps

2. Per aggiungere un set di flusso di pari livello cliccare sull'icona [![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/icon1.png)](../images/posts/salesforce-commerce-cloud-job-framework/icon1.png)

3. Per ogni set di flussi di pari livello, specificare se l'elaborazione deve essere parallela o sequenziale, cliccando sull'icona [![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/icon2.png)](../images/posts/salesforce-commerce-cloud-job-framework/icon2.png)

4. Per aggiungere un altro flusso sequenziale, fare clic sull'icona [![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/icon3.png)](../images/posts/salesforce-commerce-cloud-job-framework/icon3.png)nella parte inferiore di un flusso. 

5. Selezionare lo scope per il flusso:
    * **Organization** -> Il flusso viene eseguito per l’istanza
    * **All Storefront Sites** -> il flusso viene eseguito su tutti i siti vetrina disponibili al momento dell'esecuzione del job. 
    Il flusso non viene eseguito sul sito di Business Manager o su siti con stato da eliminare. 
    * **Specific Sites** -> il flusso viene eseguito solo sui siti vetrina selezionati.
    * **Site Parameter** -> il flusso viene eseguito sui siti che gli vengono passati utilizzando le OCAPI Data API.
    Non è possibile eseguire il job da Business Manager e non è possibile schedulare l'esecuzione automatica del job. 
    Il pulsante **Run Now** e le opzioni di schedulazione in Business Manager sono disabilitate. Se si seleziona questa opzione, al job viene aggiunto un parametro SiteScope con un valore vuoto. Utilizzando le OCAPI Data API, possono essere specificati uno o più siti specifici o tutti i siti vetrina per il parametro SiteScope

## Gestione degli errori per il Job

1. Seleziona **Failure Handling**
2. Seleziona una regola di errore
    La regola di errore viene richiamata al termine di un job che ha restituito uno stato **ERRORE**
3. Esistono 3 possibili opzioni:
    - **Continue As Scheduled**: Il job viene eseguito alla successiva schedulazione
    - **Stop On Error**: Viene disabilitata la schedulazione per prevenire future esecuzioni
    - **Retry**: Il job viene fatto ripartire in caso di errore. Per questa opzione, devono essere configurati il numero di tentativi e l'intervallo tra ogni tentativo

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/failurehandling.png)](../images/posts/salesforce-commerce-cloud-job-framework/failurehandling.png)


## Invio notifiche sullo stato del Job

1. Seleziona **Notification**
2. Seleziona **Enabled**
3. Seleziona gli eventi che triggerano la notifica (Ok, Error, Retry, Long Runtime)
4. Inserisci gli indirizzi email per il mittente ed i destinatari (TO, CC, BCC)

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/notification.png)](../images/posts/salesforce-commerce-cloud-job-framework/notification.png)

## Schedulazione di un job

1. Seleziona **Schedule and History**
2. Seleziona **Enabled**
3. Seleziona quando triggerare il job, se una sola volta, oppure in maniera ricorrente

E’ possibile stabilire nello specifico i giorni in cui deve essere eseguito ed anche la tipologia e l’ampiezza degli intervalli

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/schedulehistory.png)](../images/posts/salesforce-commerce-cloud-job-framework/schedulehistory.png)

## Creare un Job Step Custom

Per creare uno step custom per un Job, è necessario innanzitutto creare un file di configurazione chiamato **steptypes.json** che descriva lo step, per quanto concerne la configurazione, gli attributi e così via.

Poi bisogna creare lo script che definisce il funzionamento vero e proprio del job, quindi interazione con SFCC, invio mail, creazione/eliminazione CO ecc

Il file **steptypes.json** dovrà essere inserito nella root della cartridge che ospita lo script

Ecco come si presenta un file steptypes.json:

[![SFCC Job Framework](../images/posts/salesforce-commerce-cloud-job-framework/steptypes.png)](../images/posts/salesforce-commerce-cloud-job-framework/steptypes.png)


A presto, Pietro