<script lang="ts">
	import TimeWindowSelectorItem from './TimeWindowSelectorItem.svelte';

	type WindowOption = { label: string; value: string };

	const windows: WindowOption[] = [
		{ label: '1H', value: '1h' },
		{ label: '10H', value: '10h' },
		{ label: '1D', value: '1d' },
		{ label: '10D', value: '10d' },
		{ label: '3M', value: '3m' },
		{ label: '12M', value: '12m' }
	];

	let selectedWindow = windows[0].value;

	function handleSelect(event: CustomEvent<string>) {
		selectedWindow = event.detail;
	}
</script>

<div class="flex flex-row justify-center gap-5 pb-10">
	{#each windows as window}
		<TimeWindowSelectorItem
			label={window.label}
			value={window.value}
			selected={window.value === selectedWindow}
			on:select={handleSelect}
		/>
	{/each}
</div>
