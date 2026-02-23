<script lang="ts">
	let { children, visible = true }: { children?: any; visible?: boolean } = $props();
</script>

<div class="invisible h-[0px]">
	{#if visible}
		{@render children?.()}
	{/if}
</div>
