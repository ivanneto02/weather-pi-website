<script lang="ts">
	import TempChart from './TempChart.svelte';
	import HumChart from './HumChart.svelte';
	import PreChart from './PreChart.svelte';

	import TmpInfo from './TmpInfo.svelte';
	import HumInfo from './HumInfo.svelte';
	import PreInfo from './PreInfo.svelte';

	export let tmp: number | null = null;
	export let hum: number | null = null;
	export let pre: number | null = null;

	let currentInfo: string = '';
	let visibility: boolean = false;

	const handleClick = (chart: string) => {
		console.log(`handling ${chart} click ${visibility}`);
		if (currentInfo == chart) {
			visibility = !visibility;
			return;
		}
		visibility = true;
		currentInfo = chart;
	};
</script>

<div class="flex flex-row gap-1 mb-1">
	<TempChart
		on:click={() => {
			handleClick('temperature');
		}}
		reading={tmp}
	/>
	<HumChart
		on:click={() => {
			handleClick('humidity');
		}}
		reading={hum}
	/>
	<PreChart
		on:click={() => {
			handleClick('pressure');
		}}
		reading={pre}
	/>
</div>
<div>
	{#if visibility && currentInfo == 'temperature'}
		<TmpInfo />
	{/if}
	{#if visibility && currentInfo == 'humidity'}
		<HumInfo />
	{/if}
	{#if visibility && currentInfo == 'pressure'}
		<PreInfo />
	{/if}
</div>
