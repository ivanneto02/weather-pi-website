let a = [{ a: 1, b: 2, c: 3 }, { a: 4, b: 5, c: 6 }, { a: 7, b: 8, c: 9 }];
let b = { a: 0, b: 0, c: 0 };

// aggregate data
Object.keys(a).forEeach((_, aVal) => {
    b.forEach((bDat, _) => {
        b[bDat] += aVal;
    });
});

console.log(b);
