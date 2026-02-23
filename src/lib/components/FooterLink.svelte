<script lang="ts">
	import Icon from '@iconify/svelte';

	let { to = 'none', icon = '', text = '' }: { to?: string; icon?: string; text?: string } = $props();
</script>

<a
	class="flex w-full cursor-pointer items-center justify-start gap-1 text-left"
	href={to}
	target="_blank"
	rel="noreferrer"
>
	<Icon icon={icon} />
	{text}
</a>
