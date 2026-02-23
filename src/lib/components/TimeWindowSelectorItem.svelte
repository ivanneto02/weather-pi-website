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
	class={`min-w-[3.1rem] px-3 py-2 text-center text-xs font-semibold rounded-full border transition-colors duration-150 ${
		selected
			? 'bg-[#181824] border-white/20 text-white shadow-[0_10px_30px_rgba(0,0,0,0.45)]'
			: 'bg-transparent border-white/10 text-gray-300 hover:bg-[#12121a] hover:border-white/20 hover:text-white'
	}`}
	aria-pressed={selected}
	on:click={onClick}
>
	{label}
</button>
