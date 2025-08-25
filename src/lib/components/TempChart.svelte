
<script lang="ts">
    import StandardChart from "$lib/components/StandardChart.svelte";

    let { reading } = $props();

    import { processTmpHumPreReading } from "$lib/processing/processTmpHumPreReading.ts";

</script>

<StandardChart>
    <div class="flex flex-row justify-center items-center">
        <h2>Temp</h2>
        <h2>(C)</h2>
    </div>
    <h1>{reading ? processTmpHumPreReading(reading) : (0.00).toFixed(2)}</h1>
</StandardChart>

