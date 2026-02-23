<script>
	let { children } = $props();
</script>

<div class="content-shell bg-inherit text-white flex flex-col min-h-screen justify-between max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 gap-8">
	{@render children?.()}
</div>
