import quickSort from "./quickSort.js";


let data = [8, 5, 13, 9, 6, 7, 4, 11, 10, 12];
console.log("Unsorted Array: " + data + "\n");

let size = data.length;

quickSort(data, 0, size - 1);

console.log("Sorted Array: " + data);
