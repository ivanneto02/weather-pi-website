<script lang="ts">
    import TempChart from "$lib/components/TempChart.svelte";
    import PreChart from "$lib/components/PreChart.svelte";
    import HumChart from "$lib/components/HumChart.svelte";

    import { onMount } from "svelte";
    import { getCurrentDateString } from "$lib/date/getCurrentDateString.ts";

    let tmp: number | null = null;
    let hum: number | null = null;
    let pre: number | null = null;
    let dt = getCurrentDateString();
    
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

        const clock = setInterval(() => { dt = getCurrentDateString() }, 1000);
        const tmpHumPreData = setInterval(fetchTmpHumPreData, 20000);

        return () => {
            clearInterval(clock);
            clearInterval(tmpHumPreData);
        };
    });

</script>

<h1>WeatherPI Data Viewer</h1>

<p>{dt.dayName}, {dt.month} {dt.day}, {dt.year} ({dt.thour}:{dt.minute}:{dt.second} {dt.ampm})</p>

<div class="flex flex-row gap-1">
    <TempChart reading={tmp}/>
    <HumChart reading={hum}/>
    <PreChart reading={pre}/>
</div>
