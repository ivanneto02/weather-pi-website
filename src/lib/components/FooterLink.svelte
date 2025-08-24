<script lang="ts">
	let { children, to, icon, text } = $props();
    import Icon from "@iconify/svelte";
</script>

<a class="flex items-center gap-1 cursor-pointer" href={to ? to : "none"} target="_blank" rel="noreferrer">
    <Icon icon={icon}/>
    {text}
</a>
