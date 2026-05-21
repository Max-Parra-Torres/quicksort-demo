/**
 * De partition functie neemt een array en twee indices (low en high) als input.
 * Het kiest het laatste element in de array als de pivot en herordent de elementen
 * in de array zodat alle elementen kleiner dan de pivot aan de linkerkant staan
 * en alle elementen groter dan de pivot aan de rechterkant staan.
 * Uiteindelijk plaatst het de pivot op zijn juiste positie in de gesorteerde array
 * en retourneert het de index van de pivot.
 *
 * @param {Array} arr - De array die gesorteerd moet worden
 * @param {number}low - De index van het eerste element in de array
 * @param {number} high - De index van het laatste element in de array
 * @returns {number} - De index van de pivot na het plaatsen op de juiste positie
 */
export default function partition(arr, low, high) {

    // We kiezen het laatste element in de lijst als de pivot
    let pivot = arr[high];

    // We initialiseren de index van het kleinere element
    let i = low - 1;

    // We itereren door alle elementen en vergelijken ze met de pivot
    for (let j = low; j < high; j++) {
        if (arr[j] < pivot) {
            i++;

            // We wisselen het kleinere element met het grotere element op index i
            [arr[i], arr[j]] = [arr[j], arr[i]];
        }
    }
    // We wisselen het pivot element met het element op index i + 1
    // Hierdoor komt de pivot op de juiste positie in de gesorteerde array
    [arr[i + 1], arr[high]] = [arr[high], arr[i + 1]];

    // We returnen de index van de pivot na het plaatsen op de juiste positie
    return (i + 1);
}