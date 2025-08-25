<script lang="ts">
	import StandardChart from '$lib/components/StandardChart.svelte';

	let { reading, title } = $props();
</script>

<StandardChart>
	<h2>{title ? title : 'count'}</h2>
	<h1>{reading ? reading : 0}</h1>
</StandardChart>
