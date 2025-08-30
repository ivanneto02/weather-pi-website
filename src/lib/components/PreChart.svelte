<script lang="ts">
	import StandardChart from '$lib/components/StandardChart.svelte';

	export let reading: number | null = null;

	import { processTmpHumPreReading } from '$lib/processing/processTmpHumPreReading';
</script>

<StandardChart on:click>
	<div class="flex flex-row justify-center items-center gap-1">
		<h3>Pressure</h3>
		<p>(Pa)</p>
	</div>
	<h1>{reading ? processTmpHumPreReading(reading) * 100 : (0.0).toFixed(2)}</h1>
</StandardChart>
