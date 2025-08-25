export const meanAirQualityData = (data: Array<any>) => {

    let count_03_sum = 0;
    let count_05_sum = 0;
    let count_10_sum = 0;
    let count_25_sum = 0;
    let count_50_sum = 0;

    const total = data.length || 1;

    data.forEach(item => {
        count_03_sum += item.count_03;
        count_05_sum += item.count_05;
        count_10_sum += item.count_10;
        count_25_sum += item.count_25;
        count_50_sum += item.count_50;
    });

    return {
        count_03: count_03_sum / total,
        count_05: count_05_sum / total,
        count_10: count_10_sum / total,
        count_25: count_25_sum / total,
        count_50: count_50_sum / total
    }
}
