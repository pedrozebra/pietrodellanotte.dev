---
title: 'Come gestire ed utilizzare versioni multiple di Node.js su Windows'
canonical: 'versioni-differenti-nodejs-su-windows'
description: 'Come poter gestire differenti versioni di Node.js su Windows a seconda del progetto?'
coverImage: 'cover.png'
date: '2021-09-17'
time: '12:00:00 GMT+2'
---
### Come gestire ed utilizzare versioni multiple di Node.js su Windows

Se lavorate su progetti diversi, potrebbe capitarvi di dover utilizzare una specifica versione di Node.js a seconda del progetto, mi capita quotidianamente, e se sei fortunato, nel README.md è indicata anche la versione da utilizzare, true story ✌️

Quindi, per poter gestire contestualmente più versioni di NodeJs su Windows, esiste questo splendido tool chiamato <a href="https://github.com/coreybutler/nvm-windows" target="_blank">NVM Windows</a>, che deriva dal classico <a href="https://github.com/nvm-sh/nvm" target="_blank">NVM </a> per Unix/Mac


Per prima cosa installiamo la versione che preferiamo, scaricando il file nvm-setup.zip da <a href="https://github.com/coreybutler/nvm-windows/releases" target="_blank">qui</a>.

In questo momento la versione più recente disponibile al download è la <a href="https://github.com/coreybutler/nvm-windows/releases/download/1.1.8/nvm-setup.zip" target="_blank">1.1.8</a>

Procediamo all'installazione. 

Una volta completata l'installazione apriamo il prompt dei comandi/PowerShell/Git Bash e digitiamo:

```javascript
nvm
```

nvm ci darà la lista dei comandi utilizzabili, ad esempio:


```javascript
nvm install [VERSIONE] [ARCHITETTURA] 

nvm install lts

nvm install latest

nvm list 

nvm version 

nvm current 

nvm uninstall [VERSIONE]

nvm use [VERSIONE] [ARCHITETTURA]
```

Se ad esempio avete bisogno di utilizzare la versione 12.2.2 di Node.js potrete installarla con il seguente comando:

```javascript
nvm install 12.2.2
```

Visualizzare le versioni di Node.js installate, per questo c'è **nvm list**, l'asterisco evidenzia la versione corrente utilizzata

```javascript
nvm list

  16.1.0
  14.16.1
  14.1.0
  13.8.0
* 12.22.2 (Currently using 64-bit executable)
  10.20.1
  10.16.3
  8.11.3
  6.17.1
```


Visualizzare velocemente la versione di Node.js corrente utilizzata:

```javascript
nvm current
```

Utilizzare una specifica versione di Node.js installata, in questo caso la 14.16.1

```javascript
nvm use 14.16.1
```

Installare l'ultima versione LTS (Long Time Support) di Node.js disponibile

```javascript
nvm install lts
```

Installare l'ultima versione di Node.js disponibile

```javascript
nvm install latest
```

Disinstallare una specifica versione di Node.js installata, in questo caso la 16.1.0

```javascript
nvm uninstall 16.1.0
```

Visualizzare la versione di nvm installata:

```javascript
nvm version
```

Alla prossima!

Pietro