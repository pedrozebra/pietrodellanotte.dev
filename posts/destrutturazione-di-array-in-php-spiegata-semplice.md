---
title: 'Destrutturazione di array in PHP, spiegata semplice'
canonical: 'destrutturazione-di-array-in-php-spiegata-semplice'
description: "Che cos'è la destrutturazione in PHP? Come di destruttura un array associativo in PHP? Ed un nested array?"
coverImage: 'cover.png'
date: '2023-05-06'
time: '18:34:00 GMT+2'
---
### Cosa significa destrutturare un array?
La destrutturazione è la tecnica di estrazione di tutti o alcuni elementi da un array, assegnandone i valori a delle variabili, senza dover ciclare l'array in oggetto.

In PHP è possibile destrutturare un array tramite il metodo [**list()**](https://www.php.net/manual/en/function.list.php) ma anche senza, come vedremo più avanti.

### Destrutturazione array ad indice numerico, con metodo list()
```php
$values = [10, 20, 30];

list($a, $b, $c) = $values;

var_dump($a, $b, $c);

//output

int(10)
int(20)
int(30)
```
Abbiamo estratto tutti i valori dell'array **$values**, rispettivamente nelle variabili **$a**, **$b** e **$c**.

Nel caso in cui stiamo lavorando con array ad **indice numerico**, **l'ordine** in cui destrutturiamo **è importante**, quindi se ci aspettiamo di ottenere il valore **10** nella variabile **$a**, dovrà essere la prima variabile passata al metodo list, andando a creare un vero e proprio **mapping 1:1 variabile destinazione:indice array sorgente**

### Destrutturazione parziale (skippare alcuni elementi)

Supponiamo di aver bisogno solo dell'elemento con indice 2 e valore 30 dell'array **$values = [10, 20, 30]**

Possiamo farlo facilmente in questo modo, aggiungendo una **,** (virgola) in prossimità dell'indice del valore che vogliamo skippare:

```php

list( , , $c) = $values;

var_dump($c);

//output
int(30)

```

Gli elementi dell'array verranno ignorati se la variabile non viene fornita.

La destrutturazione dell'array inizia sempre dall'indice 0.

Prima di PHP **7.1.0**, il metodo **list()** funzionava solo su array con **indice numerico**, presupponendo che gli indici numerici inizino da 0.

A partire da PHP 7.1.0 possiamo usare list() anche con **array associativi**.

### Destrutturazione array associativo con metodo list()

```php
$valuesAssociative = ['username' => 'pedrozebra', 'language' => 'PHP'];

list(
    'username' => $shortUsername, 
    'language' => $shortLanguage
    ) = $valuesAssociative;

var_dump($shortUsername, $shortLanguage);

//output
string(10) "pedrozebra"
string(3) "PHP"

```

Nel caso degli array associativi, al metodo **list()** oltre alla variabile destinazione andremo ad indicare anche la chiave associativa dell'array, in più, in questo caso, l'ordine di destrutturazione non è importante, proprio perché l'indice dell'array sorgente è una chiave associativa e non un indice.

Infatti, invertendo language con username, otterremmo lo stesso output:

```php
list(
    'language' => $shortLanguage, 
    'username' => $shortUsername
    ) = $valuesAssociative;

var_dump($shortUsername, $shortLanguage);

//output
string(10) "pedrozebra"
string(3) "PHP"
```

### Destrutturazione con sintassi abbreviata (shorthand syntax)

Un'altra novità interessante a partire da PHP **7.1** è la possibilità di utilizzare la **shorthand syntax**, utilizzando la notazione array con parentesi quadre anziché il metodo list()

Scrivere: 

```php
[$a, $b, $c] = $values;
```

equivale a scrivere:

```php
list($a, $b, $c) = $values;
```

stessa cosa per gli array associativi:

```php
[
    'username' => $shortUsername, 
    'language' => $shortLanguage
] = $valuesAssociative; 
```

equivale a scrivere:

```php
list(
    'username' => $shortUsername, 
    'language' => $shortLanguage
    ) = $valuesAssociative;
```

### Destrutturazione array nidificati (nested array)

Possiamo destrutturare un **array nidificato**, leggermente più complesso degli array visti in precedenza, con **shorthand syntax**, e a partire dalla versione **7.1** di PHP.

Sostanzialmente andando a replicare la struttura dell'array di partenza **$product** e sostituendo i valori desiderati con le variabili in cui vogliamo inserire i valori.

```php
$product = [
	'code' => '12339876',
	'store' => [
		'address' => 'Condotti street 18',
		'quantity' => 7
		]
	];


['code' => $code,
'store' => [
	'address' => $storeAddress,
	'quantity' => $storeQuantity
	]
] = $product;

var_dump($code, $storeAddress, $storeQuantity);

//output
string(8) "12339876"
string(18) "Condotti street 18"
int(7)

```

Spero vi sarà utile! Ciao alla prossima!

Pietro