---
title: 'Differenze tra var, let e const in JavaScript (secondo me)'
canonical: 'differenza-let-var-const-javascript'
description: 'Quali sono le differenze tra let vs var in Javascript? Cos&#039;è l&#039;hoisting? Qual è la differenza tra scope locale o globale?'
coverImage: 'cover.png'
date: '2021-09-09'
time: '13:00:00 GMT+2'
---
E' vero, si tratta di un argomento ultra diffuso e visto.
Questo vuole essere un riepilogo delle informazioni che ho raccolto nel tempo, dell'idea che mi sono fatto sulla mia pelle 😔 e probabilmente, in fase di colloquio, è ancora una domanda da podio 🏅.

### Qual è la differenza principale tra var, let e const?
La differenza principale è lo **scope**

Variabili e costanti dichiarate come **let** o **const** sono **block scoped**, questo significa che sono disponibili solo all'interno di un blocco di codice delimitato da **{** e **}**

Variabili dichiarate come **var** sono **function scoped**, significa che sono disponibili solo all'interno della funzione in cui sono stati creati o, se non sono stati creati all'interno di una funzione, avranno uno scope **globale**

Le definizioni di classi e funzioni in JavaScript sono blocchi, e lo sono anche i body delle istruzioni if/else, cicli while, cicli for e così via.

Se una variabile o una costante sono dichiarate in un blocco, le { } delimitano la regione di codice dove la variabile o la costante sono definite ed accessibili.

Se usi **var**, **let** o **const** al di fuori del body di una function, viene dichiarata una variabile globale, ma c'è una sostanziale differenza:

variabili globali dichiarate con **var** verranno implementate come proprietà dell'oggetto globale **window**, a differenza dell'utilizzo di **let** o **const** 

Scrivere (in ambito globale): 

```javascript
var name = 'Paolo';
```

equivale a scrivere:

```javascript
window.name = 'Paolo';
```

A differenza delle variabili dichiarate con **let**, è legale dichiarare la stessa variabile più volte con **var**, questo potrebbe portarti a sovrascrivere involontariamente la tua variabile.

### Hoisting

Un cenno sull'<a href="https://developer.mozilla.org/en-US/docs/Glossary/Hoisting" target="_blank">Hoisting</a> è doveroso ad evidenziare un'altra differenza tra **var** **let** e **const**.

In JavaScript tutte le dichiarazioni (function, var, let, const, class) sono *"hoisted"* ma mentre per **var** le dichiarazioni sono inizializzate a *undefined* per *let* e *const* le dichiarazioni rimangono non inizializzate

Ad esempio con **var**, possiamo utilizzare una variabile prima della sua inizializzazione, senza errori:

```javascript
console.log(nome);
// Stampa undefined, la dichiarazione è "hoisted" e la variabile inizializzata ad undefined

var nome = "Diego";
console.log(nome);
// Stampa "Diego" 
```

Mentre con **let** otterremo il seguente errore:

```javascript
console.log(nome);
let name = "Diego";
console.log(nome);
```
```error
Uncaught ReferenceError: Cannot access 'nome' before initialization
```

### Come possono essere dichiarate le variabili e le costanti in JavaScript?

In JavaScript ES5 e inferiori si poteva definire una variabile solo tramite la keyword **var**, mentre a partire da JavaScript ES6 e successive abbiamo due nuove keyword **let** per le variabili e **const** per le costanti.

Nelle versioni moderne di JavaScript (ES6 e successive), le variabili *devono* (*dovrebbero*) essere dichiarate esclusivamente con la keyword **let**.

E' una buona pratica assegnare un valore iniziale ad una variabile quando viene dichiarata e quando è *possibile*:

```javascript 
let message = "Good morning!";
let age = 35;
```

Se non viene specificato un valore iniziale per la variabile con le istruzioni let/var, la variabile è *dichiarata*, ma il suo valore sarà **undefined** fino alla riga di codice in cui gli viene assegnato un valore.

Per dichiarare una *costante* anziché una variabile, dobbiamo utilizzare la keyword **const** anziché let o var

**const** lavora come let, ma deve essere inizializzata quando viene dichiarata:

```javascript 
const PI = 3.14;
```

Se provassimo a dichiarare una constante in questo modo:

```javascript 
const PI;
```
otterremmo il seguente errore:
```error
Uncaught SyntaxError: Missing initializer in const declaration
```

Come ci suggerisce il nome, non possiamo modificare il valore di una const, se proviamo a farlo otterremmo il seguente errore:
```javascript 
const PI = 3.14;
PI = 2;
```
```error
Uncaught TypeError: Assignment to constant variable.
```
Esiste una convenzione diffusa (ma non universale) di dichiarare le costanti usando nomi in maiuscolo per differenziarle dalle variabili, ad esempio: PI, HTTP_CODE, RESULT ecc.

La differenza principale tra let e const è che le costanti non possono essere riassegnabili, tuttavia le const non sono **immutabili**, se sono un **oggetto** o un **array** ne posso modificare le proprietà, possiamo mutare l'oggetto, ad esempio:

```javascript 
const obj = {
    id : 1,
    name: 'Pietro'
}

obj.name = 'Diego';
```
possiamo anche aggiungere nuove proprietà, ad esempio:
```javascript 
obj.color = 'red';

console.log(obj);
{
    id:1,
    name:"Diego",
    color:"red"
}
```
e sugli array:
```javascript 
const arr = [1, 2, 3];
arr.push(4);

console.log(arr);
[1, 2, 3, 4]
```

Spero che questa raccolta di informazioni ti aiuti a chiarire qualche dubbio.

Alla prossima!

Pietro

Torna alla [Home](/).