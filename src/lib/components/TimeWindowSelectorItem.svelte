<script lang="ts">
	let { children } = $props();

	let selected = 0;
</script>

<button
	class="border p-2 text-gray-500 border-gray-800 text-center text-xs font-bold w-15 border-2 rounded-lg"
>
	{@render children?.()}
</button>
