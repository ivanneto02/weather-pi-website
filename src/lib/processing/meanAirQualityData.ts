export const meanAirQualityData = (data: Array<any>) => {

    let dataMeans: Record<string, number> = {
        count_03: 0,
        count_05: 0,
        count_10: 0,
        count_25: 0,
        count_50: 0,
        "PM1.0_1": 0,
        "PM2.5_1": 0,
        "PM10_1": 0,
        "PM1.0_2": 0,
        "PM2.5_2": 0,
        "PM10_2": 0
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

