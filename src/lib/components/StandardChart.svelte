
<script lang="ts">
    let { children } = $props();
</script>

<fluent-card class="p-2 bg-gray-900 flex-grow text-center">
    {@render children?.()}
</fluent-card>
