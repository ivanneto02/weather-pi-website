<script lang="ts">
    let { children, title } = $props();
</script>

<div>
    <h2 class="mb-2">{title ? title : "No title"}</h2>
    <div class="flex flex-col items-left pl-[10%] gap-1">
        {@render children?.()}
    </div>
</div>
