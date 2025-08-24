<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Content from "$lib/components/Content.svelte";
    import Main from "$lib/components/Main.svelte";

    import { onMount } from "svelte";
    import { browser } from "$app/environment";
    
    // ensures fluent is registered before mounting
    onMount(async () => {
        if (!browser) return;
        const { ensureFluentRegistered } = await import("$lib/components/fluent");
        await ensureFluentRegistered();
    });

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<Content>
    <Header/>
    <Main>
        {@render children?.()}
    </Main>
    <Footer/>
</Content>
