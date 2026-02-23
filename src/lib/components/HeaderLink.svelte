<script lang="ts">
	import Icon from '@iconify/svelte';

	let { to = 'none', icon = '', text = '' }: { to?: string; icon?: string; text?: string } = $props();
</script>

<a class="flex cursor-pointer items-center gap-1" href={to}>
	<Icon icon={icon} />
	{text}
</a>
