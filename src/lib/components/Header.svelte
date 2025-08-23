<script lang="ts">
    import HeaderLink from "$lib/components/HeaderLink.svelte";
</script>

<div class="text-lg h-20 bg-inherit flex gap-5 flex-row justify-center border-solid border-indigo-900 border-b-2">
    <HeaderLink to="/" text={"Home"} icon={"line-md:home"}/>
    <HeaderLink to="/about" text={"About"} icon={"line-md:question"}/>
    <HeaderLink to="/building-this-website" text={"Website"} icon={"pixel:technology"}/>
    <HeaderLink to="/data-gathering" text={"Data"} icon={"rivet-icons:data"}/>
</div>
