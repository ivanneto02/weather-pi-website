
<script lang="ts">
    import StandardChart from "$lib/components/StandardChart.svelte";

    let { reading } = $props();

    import { processTmpHumPreReading } from "$lib/processing/processTmpHumPreReading.ts";
</script>

<StandardChart>
    <h2>Hum %</h2>
    <h1>{reading ? processTmpHumPreReading(reading) : (0.00).toFixed(2)}</h1>
</StandardChart>

