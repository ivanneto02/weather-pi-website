<script lang="ts">
	let { children } = $props();
</script>

<fluent-card
	on:click
	class="flex flex-grow origin-center flex-col items-center justify-center gap-1 border border-indigo-700 bg-inherit p-3 text-center text-xs text-white [&>*]:m-0 will-change-transform transition-[transform,filter,background-color] duration-150 hover:scale-[1.02] hover:bg-gray-900 hover:brightness-110"
>
	{@render children?.()}
</fluent-card>
