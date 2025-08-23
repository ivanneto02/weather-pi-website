<script lang="ts">

    let { children } = $props();
</script>

<div class="bg-inherit mb-auto pb-5 overflow-scroll">
    {@render children?.()}
</div>
