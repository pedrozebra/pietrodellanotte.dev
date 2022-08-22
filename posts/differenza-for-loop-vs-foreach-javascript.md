---
title: 'Differenza simpatica tra for loop e forEach in JavaScript'
canonical: 'differenza-for-loop-vs-foreach-javascript'
description: "JavaScript, cos'è un array, accesso casuale, differenza tra for loop e metodo forEach"
coverImage: 'cover.png'
date: '2022-08-22'
time: '11:15:00 GMT+2'
---


Usiamo quotidianamente questi due strumenti per ciclare i nostri amici per la pelle **array**, sto parlando naturalmente del ciclo **for**, e del metodo **forEach**.

E' doveroso fare una piccola - e scontata - introduzione, ma ci tengo a segnalarvi anche una nozione [Bonus](/posts/differenza-for-loop-vs-foreach-javascript#user-content-bonus) teorica che una volta mi ha permesso di essere fatto fuori dignitosamente ad un colloquio 🧠🦾

## Cos'è un array...

Un array è una struttura che memorizza una collezione di dati, ordinati in base al loro indice.

L'indice dell'array parte da 0 e scala fino al numero totale degli elementi dell'array meno 1 (da 0 a n-1)

## Creare un array

Possiamo creare un array sostanzialmente tramite la square bracket notation [] o tramite la classe Array

Ad esempio possiamo definire un array di 5 elementi in uno dei seguenti modi:

```javascript
let items = ['Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5'];
```

oppure

```javascript
let items = new Array ('Item 1', 'Item 2', 'Item 3', 'Item 4', 'Item 5');
```

oppure ancora

```javascript
let items = new Array ();
items[0] = 'Item 1';
items[1] = 'Item 2';
items[2] = 'Item 3';
items[3] = 'Item 4';
items[4] = 'Item 5';
```
## Come accedere agli elementi di un array

- ### Tramite il suo indice
    - items[0] per accedere al primo elemento dell'array
    - items[1] per accedere al secondo elemento dell'array
    - items[4] per accedere all'ultimo elemento dell'array
- ### Tramite un ciclo for
    - ```javascript
        for (let i = 0; i<items.length; i++) {
	        console.log('items[' + i + '] = ' + items[i]);
        }
        //output
        items[0] = Item 1
        items[1] = Item 2
        items[2] = Item 3
        items[3] = Item 4
        items[4] = Item 5
        ```
        Ad ogni iterazione possiamo stampare l'elemento dell'array, o modificarne il valore 👉 items[i] = 'Nuovo valore'

- ### Tramite il metodo forEach
    - ```javascript
        items.forEach(function(el, index){
	        console.log('items[' + index + '] = ' + el)
        });
        //output
        items[0] = Item 1
        items[1] = Item 2
        items[2] = Item 3
        items[3] = Item 4
        items[4] = Item 5
        ```
        Ad ogni iterazione possiamo stampare l'elemento dell'array, o modificarne il valore 👉 items[index] = 'Nuovo valore'

## Differenza (simpatica) tra ciclo for e metodo forEach
Veniamo al punto di questa chiacchierata 😅

Supponiamo di aggiungere un nuovo elemento all'array **items** definito in precedenza, alla posizione 10, sapendo che l'ultimo indice dell'array è 4, quindi:

```javascript
items[10] = 'Item 11';
```

Come reagiranno a questa espansione dell'array i due approcci utilizzati in precedenza per iterarlo?

Andiamo di nuovo a stampare le due iterazioni:

```javascript
for (let i = 0; i<items.length; i++) {
    console.log('items[' + i + '] = ' + items[i]);
}
//output
items[0] = Item 1
items[1] = Item 2
items[2] = Item 3
items[3] = Item 4
items[4] = Item 5
items[5] = undefined
items[6] = undefined
items[7] = undefined
items[8] = undefined
items[9] = undefined
items[10] = Item 11
```

```javascript
items.forEach(function(el, index){
    console.log('items[' + index + '] = ' + el)
});
//output
items[0] = Item 1
items[1] = Item 2
items[2] = Item 3
items[3] = Item 4
items[4] = Item 5
items[10] = Item 11
```

La visualizzazione del ciclo for() mostra che gli elementi con indici da 5 a 9 esistono ma hanno un valore **undefined**, perché di fatto non sono stati inseriti valori per questi indici dell'array. 

Tuttavia, gli indici da 5 a 9 con i loro valori **undefined** vengono visualizzati dal ciclo for().

Al contrario, il metodo forEach() fornisce la funzione di callback indicata nei parametri solo agli elementi dell'array che sono stati effettivamente interessati nell'array.
In questo modo si evitano gli elementi agli indici da 5 a 9, che non sono stati assegnati.

## Bonus {#bonus}
## Domanda da colloquio, perché l'array è considerata una struttura dati ad accesso casuale (randomico)?


Da [Wikipedia](https://it.wikipedia.org/wiki/Accesso_casuale):

> In informatica, con accesso casuale o accesso diretto si indica la caratteristica di poter accedere ad un elemento arbitrario di una sequenza in tempo costante e indipendente dalla dimensione della sequenza stessa. L'elemento è arbitrario nel senso che la sua posizione non è prevedibile, motivo per il quale si usa il termine "casuale". Il concetto opposto è quello di accesso sequenziale, in cui l'accesso ad un elemento richiede più o meno tempo a seconda della sua posizione.

Quindi, possiamo affermare che una struttura dati è considerata ad accesso casuale o randomico perché il tempo di accesso ad uno dei suoi elementi è costante, ed è indipendente dalla posizione dell'elemento e dalla dimensione della struttura.

Se ho un array di 100 elementi, impiegherò lo stesso tempo per accedere ad array[0] oppure ad array[99]


Un saluto, Pietro