<script lang="ts">
	import StandardChart from '$lib/components/StandardChart.svelte';

	let { reading, title, color } = $props();
</script>

<StandardChart>
	<h2>{title ? title : 'count'}</h2>
	<h1 class={color ? color : ''}>{reading ? reading : 0}</h1>
</StandardChart>
