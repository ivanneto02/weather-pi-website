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

<div class="mean-shell">
	<div class="mean-list">
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
	<div class="mean-info">
		{#if visibility && currentInfo == 'temperature'}
			<TmpInfo />
		{:else if visibility && currentInfo == 'humidity'}
			<HumInfo />
		{:else if visibility && currentInfo == 'pressure'}
			<PreInfo />
		{:else}
			<p class="placeholder">Tap a tile to see what this measurement means.</p>
		{/if}
	</div>
</div>

<style>
	.mean-shell {
		display: grid;
		grid-template-columns: minmax(180px, 220px) 1fr;
		gap: 0.85rem;
		align-items: stretch;
	}

	.mean-list {
		display: flex;
		flex-direction: column;
		gap: 0.55rem;
	}

	.mean-info {
		background: #0b0b12;
		border: 1px solid rgba(255, 255, 255, 0.06);
		border-radius: 10px;
		padding: 0.85rem 1rem;
		color: #e5e7eb;
		height: 100%;
	}

	.placeholder {
		margin: 0;
		color: #94a3b8;
		font-size: 0.9rem;
	}

	@media (max-width: 640px) {
		.mean-shell {
			grid-template-columns: 1fr;
		}
	}
</style>
