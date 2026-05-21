# Notes for quicksort demo

## 1. Step-by-step

- Laatste element in array (meest rechts) wordt pivot
- i start op -1, j op 0
- Item op arr[j] (index 0, waarde 8) is lager dan pivot, dus i gaat 1 omhoog. j en i zijn nu allebei 0, dus we zien een self-swap.
- Volgend item in de loop: j++, dus we kijken nu naar index 1, waarde 5
- 5 is lager dan pivot, dus we krijgen hetzelfde: i gaat omhoog, i == j, self-swap.
- Volgend item: 13, op index 2. Deze is HOGER dan de pivot. j++, maar i blijft 1. Geen swap.
- Volgend item: 9, op index 3. Deze is lager dan de pivot. j++, en i gaat ook 1 omhoog, maar j is nu 3 terwijl i nog steeds 2 is. We krijgen dus een actual swap: 13 schuift naar index 3.
- Tot het einde van de array is het hetzelfde; elk item is lager dan de pivot, i loopt 1 achter j, dus 13 loopt de array af tot het bij de pivot komt.
- Aan t end: wissel de pivot met i + 1. Waarom i + 1? i wijst naar het element het verst recht in de array waarvan we weten dat die lager is dan de pivot. Het enige andere overgebleven element is hoger dan de pivot. Deze staat rechts naast i, dus bevindt zich die op i + 1. Daarom switchen we deze met de pivot; we weten dat i + 1 hoger is dan de pivot.

- Nu beginnen we opnieuw, maar we geven een subarray mee ipv. de hele array. De array is van begin tot en met de index van de vorige pivot, min 1. Dit is alles links van de vorige pivot. Ofwel; de vorige pivot en het element, of elementen, daarna worden weggelaten. We weten dat deze op de goede volgorde staan.
- Hierna sorteren we ook de rechterkant van de originele pivot.
- Ga zo door totdat de hele array gesorteerd is.


## 2. Timed run

- Sorteert een array met 100 elements. Pittig snel (like 1.2 microseconde).
- Sorteert trouwens de array 500 keer, en neemt t gemiddelde.


## 3. Scaling

- Drie tests: 1K, 10K en 100K elements. Eerst JIT-warmup voor consistente tijden.
- Komt ruwweg overeen met geschatte tijden op basis van O(n * log(n)).
