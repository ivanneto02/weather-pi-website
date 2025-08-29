
let chunkSize = 3;

let data = [
    { index: 1, value: 2 },
    { index: 2, value: 2 },
    { index: 3, value: 2 },
    { index: 4, value: 2 },
    { index: 5, value: 2 },
    { index: 6, value: 2 },
    { index: 7, value: 2 },
    { index: 8, value: 2 },
    { index: 9, value: 2 },
    { index: 10, value: 2 },
    { index: 11, value: 2 },
    { index: 12, value: 2 },
    { index: 13, value: 2 },
    { index: 14, value: 2 },
    { index: 15, value: 2 },
    { index: 16, value: 2 },
    { index: 17, value: 2 },
    { index: 18, value: 2 },
    { index: 19, value: 2 },
]

let chunkNumber = 1;
for (let i = 0; i < data.length; i += chunkSize) {
    console.log(chunkNumber);
    chunkNumber += 1;
    console.log(data.slice(i, i + chunkSize));
}
