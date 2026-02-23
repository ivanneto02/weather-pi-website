<script>
	let { children } = $props();
</script>

<div
	class="mx-auto flex min-h-screen w-full max-w-500 flex-col justify-between gap-8 border-x border-indigo-950 bg-black px-8 text-white sm:px-14 lg:px-50"
>
	{@render children?.()}
</div>
