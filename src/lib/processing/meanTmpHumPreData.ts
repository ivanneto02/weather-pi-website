export const meanTmpHumPreData = (data: Array<any>) => {

    let dataMeans: Record<string, number> = {
        temperature: 0,
        humidity: 0,
        pressure: 0
    };

    data.forEach((sample) => {
        Object.keys(dataMeans).forEach((key) => {
            dataMeans[key] += sample[key];
        });
    });

    let total = data.length || 1;

    Object.keys(dataMeans).forEach((key) => {
        dataMeans[key] /= total;
    });

    return dataMeans;
}
