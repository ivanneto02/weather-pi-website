<script lang="ts">
    import TempChart from "$lib/components/TempChart.svelte";
    import PreChart from "$lib/components/PreChart.svelte";
    import HumChart from "$lib/components/HumChart.svelte";
    import AirQualityChart from "$lib/components/AirQualityChart.svelte";

    import { onMount } from "svelte";
    import { getCurrentDateString } from "$lib/date/getCurrentDateString.ts";
    import { meanAirQualityData } from "$lib/processing/meanAirQualityData.ts";

    // temperature, humidity, pressure data
    let tmp: number | null = null;
    let hum: number | null = null;
    let pre: number | null = null;
    
    // air quality data
    let count_03: number | null = null;
    let count_05: number | null = null;
    let count_10: number | null = null;
    let count_25: number | null = null;
    let count_50: number | null = null;

    let dt = getCurrentDateString();

    async function fetchAirQualityData() {
        let response = fetch(
           "https://jbn6u8l8h7.execute-api.us-west-1.amazonaws.com/prod/samples",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then(response => {
                if (!response.ok) {
                    console.log("Unable to retrieve data");
                }
                return response.json();
        }).then(response => {
            // UPDATE UI
            let processed_response = meanAirQualityData(response);
            count_03 = processed_response.count_03;
            count_05 = processed_response.count_05;
            count_10 = processed_response.count_10;
            count_25 = processed_response.count_25;
            count_50 = processed_response.count_50;
        });
    }
    
    async function fetchTmpHumPreData() {
        let response = fetch(
           "https://93xdazuw09.execute-api.us-west-1.amazonaws.com/prod/samples",
            {
                method: "GET",
                headers: {
                    "Content-Type": "application/json",
                },
            }
        ).then(response => {
                if (!response.ok) {
                    console.log("Unable to retrieve data");
                }
                return response.json();
        }).then(response => {
                // UPDATE UI
                tmp = response[0].temperature;
                hum = response[0].humidity;
                pre = response[0].pressure;
        });
    }

    onMount(() => {
        dt = getCurrentDateString();
        fetchTmpHumPreData();
        fetchAirQualityData();

        const clock = setInterval(() => { dt = getCurrentDateString() }, 1000);
        const tmpHumPreData = setInterval(fetchTmpHumPreData, 20000);
        const airQualityData = setInterval(fetchAirQualityData, 20000);

        return () => {
            clearInterval(clock);
            clearInterval(tmpHumPreData);
            clearInterval(airQualityData);
        };
    });

</script>

<h1>WeatherPI Data Viewer</h1>

<p>{dt.dayName}, {dt.month} {dt.day}, {dt.year} ({dt.thour}:{dt.minute}:{dt.second} {dt.ampm})</p>

<div class="flex flex-row gap-1 mb-1">
    <TempChart reading={tmp}/>
    <HumChart reading={hum}/>
    <PreChart reading={pre}/>
</div>

<h2>Air Quality</h2>

<div class="flex flex-col gap-1">
    <AirQualityChart reading={count_03} title={"0.3 µm³ particles per 0.1L"}/>
    <AirQualityChart reading={count_05} title={"0.5 µm³ particles per 0.1L"}/>
    <AirQualityChart reading={count_10} title={"1.0 µm³ particles per 0.1L"}/>
    <AirQualityChart reading={count_25} title={"2.5 µm³ particles per 0.1L"}/>
    <AirQualityChart reading={count_50} title={"5.0 µm³ particles per 0.1L"}/>
</div>

<div>
    Future: will contain counts for heavy metal particles, contaminants, etc.
</div>
