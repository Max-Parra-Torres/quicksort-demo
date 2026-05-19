import partition from "./partition.js";


/**
 * We partitioneren de array en krijgen de index van de pivot.
 * Wat we eigenlijk doen is de array in 2 delen splitsen waarbij de elementen aan de linker kant
 * kleiner zijn dan de pivot en de elementen aan de rechter kant groter zijn dan de pivot.
 * Daarna sorteren we de twee delen van de array recursief op dezelfde manier.
 *
 * @param {Array} arr - De array die gesorteerd moet worden
 * @param {number} low - De index van het eerste element in de array
 * @param {number} high - De index van het laatste element in de array
 */
export default function quickSort(arr, low, high) {
    if (low < high) {
        let pivot = partition(arr, low, high);

        // Recursive call op de linker kant van de pivot
        quickSort(arr, low, pivot - 1);
        console.log("Current Array: " + arr + "\n");

        // Recursive call op de rechter kant van de pivot
        quickSort(arr, pivot + 1, high);
        console.log("Current Array: " + arr + "\n");
    }
}