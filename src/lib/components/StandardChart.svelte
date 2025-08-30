<script lang="ts">
	let { children } = $props();
</script>

<fluent-card
	on:click
	class="p-2 text-white text-xs flex-grow border bg-inherit border-1 border-indigo-700 text-center hover:border-2 hover:transition-all hover:duration-100 hover:bg-gray-900 hover:text-sm transition-all duration-100"
>
	{@render children?.()}
</fluent-card>
