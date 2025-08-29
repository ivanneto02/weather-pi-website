
let chunkSize = 3;

let flattenedSeriesData = [];

let data = [
    { index: 1, value1: 3, value2: 4 },
    { index: 2, value1: 3, value2: 4 },
    { index: 3, value1: 3, value2: 4 },
    { index: 4, value1: 3, value2: 4 },
    { index: 5, value1: 3, value2: 4 },
    { index: 6, value1: 3, value2: 4 },
    { index: 7, value1: 3, value2: 4 },
    { index: 8, value1: 3, value2: 4 },
    { index: 9, value1: 3, value2: 4 },
    { index: 10, value1: 3, value2: 4 },
    { index: 11, value1: 3, value2: 4 },
    { index: 12, value1: 3, value2: 4 },
    { index: 13, value1: 3, value2: 4 },
    { index: 14, value1: 3, value2: 4 },
    { index: 15, value1: 3, value2: 4 },
    { index: 16, value1: 3, value2: 4 },
    { index: 17, value1: 3, value2: 4 },
    { index: 18, value1: 3, value2: 4 },
    { index: 19, value1: 3, value2: 4 },
]

const values = ["value1", "value2"];

data.map((d) => {
    values.map((c) => {
        flattenedSeriesData.push({ value: d[c], type: c });
    });
});

console.log(flattenedSeriesData);

