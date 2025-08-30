<script lang="ts">
	let { children } = $props();

	export let visible: boolean = true;
</script>

<div class="invisible h-[0px]">
	{#if visible}
		{@render children?.()}
	{/if}
</div>
