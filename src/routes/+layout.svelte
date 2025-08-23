<script lang="ts">
	import '../app.css';
	import favicon from '$lib/assets/favicon.svg';
    
    import Header from "$lib/components/Header.svelte";
    import Footer from "$lib/components/Footer.svelte";
    import Content from "$lib/components/Content.svelte";
    import Main from "$lib/components/Main.svelte";

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
