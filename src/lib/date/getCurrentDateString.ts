export function getCurrentDateString() {
    let date = new Date();

    // date
    let dayName = date.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", weekday: "long" });
    let day = date.getDate();
    let month = date.toLocaleDateString("en-US", { timeZone: "America/Los_Angeles", month: "long" });
    let year = date.getFullYear();

    // time
    let hour = date.getHours();
    let thour = hour % 12 ? hour % 12 : 12;
    let ampm = thour <= 12 ? "pm" : "am";
    let minute = String(date.getMinutes()).padStart(2, '0');
    let second = String(date.getSeconds()).padStart(2, '0');

    return {
        dayName: dayName,
        day: day,
        month: month,
        year: year,
        hour: hour,
        thour: thour,
        ampm: ampm,
        minute: minute,
        second: second
    }
}
