<script lang="ts">
	import { createEventDispatcher } from 'svelte';

	let { label, value, selected = false } = $props();

	const dispatch = createEventDispatcher<{ select: string }>();

	function onClick() {
		dispatch('select', value);
	}
</script>

<button
	type="button"
	class={`border p-2 text-center text-xs font-bold w-15 border-2 rounded-lg transition-colors ${
		selected
			? 'bg-gray-900 border-gray-800 text-gray-300 text-white'
			: 'bg-black text-gray-400 border-gray-800 hover:bg-gray-900'
	}`}
	aria-pressed={selected}
	on:click={onClick}
>
	{label}
</button>
