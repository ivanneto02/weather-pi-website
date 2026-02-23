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

<div class="grid w-full items-stretch gap-[0.85rem] sm:grid-cols-[minmax(180px,220px)_1fr]">
	<div class="flex flex-col gap-[0.55rem]">
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
	<div class="h-full rounded-[10px] border border-white/[0.06] bg-black px-4 py-[0.85rem] text-[#e5e7eb]">
		{#if visibility && currentInfo == 'temperature'}
			<TmpInfo />
		{:else if visibility && currentInfo == 'humidity'}
			<HumInfo />
		{:else if visibility && currentInfo == 'pressure'}
			<PreInfo />
		{:else}
			<p class="m-0 text-[0.9rem] text-[#94a3b8]">Tap a tile to see what this measurement means.</p>
		{/if}
	</div>
</div>
