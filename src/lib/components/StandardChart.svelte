
<script lang="ts">
    let { children } = $props();
</script>

<fluent-card class="p-2 text-white flex-grow bg-gray-900 text-center">
    {@render children?.()}
</fluent-card>
