<script>
	let { children } = $props();
</script>

<div class="pl-2 pr-2 bg-inherit text-white flex flex-col min-h-screen justify-between">
	{@render children?.()}
</div>
