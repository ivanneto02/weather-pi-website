<script lang="ts">
	let { children, to, icon, text } = $props();
    import Icon from "@iconify/svelte";
</script>

<a
	class="flex w-full items-center justify-start gap-1 text-left cursor-pointer"
	href={to ? to : "none"}
	target="_blank"
	rel="noreferrer"
>
    <Icon icon={icon}/>
    {text}
</a>
