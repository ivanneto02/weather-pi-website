<script lang="ts">
    import TempChart from "$lib/components/TempChart.svelte";
    import PreChart from "$lib/components/PreChart.svelte";
    import HumChart from "$lib/components/HumChart.svelte";
</script>

<h1>WeatherPI Data Viewer</h1>

<h2>Welcome</h2>

<p>Date and Time</p>

<div class="flex flex-row gap-1">
    <TempChart/>
    <HumChart/>
    <PreChart/>
</div>
