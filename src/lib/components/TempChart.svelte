
<script lang="ts">
    import StandardChart from "$lib/components/StandardChart.svelte";

    let { reading } = $props();

    import { processTmpHumPreReading } from "$lib/processing/processTmpHumPreReading.ts";

</script>

<StandardChart>
    <div class="flex flex-row justify-center items-center gap-1">
        <h3>Temp</h3>
        <p>(%)</p>
    </div>
    <h1>{reading ? processTmpHumPreReading(reading) : (0.00).toFixed(2)}</h1>
</StandardChart>

