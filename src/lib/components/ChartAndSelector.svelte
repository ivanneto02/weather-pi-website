<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import TimeWindowSelector from './TimeWindowSelector.svelte';

	let { title = '', initialWindow = '1h' } = $props();

	const dispatch = createEventDispatcher<{ select: string }>();

	let selectedWindow = initialWindow;

	function handleSelect(event: CustomEvent<string>) {
		selectedWindow = event.detail;
		dispatch('select', selectedWindow);
	}
</script>

<div class="flex flex-col gap-2 pb-6">
	{#if title}
		<h2 class="text-center">{title}</h2>
	{/if}

	<slot {selectedWindow} />

	<TimeWindowSelector selectedValue={selectedWindow} on:select={handleSelect} />
</div>
