<script lang="ts">
    let { children, title } = $props();
</script>

<div class="mx-auto w-full max-w-sm">
    <div class="mx-auto w-fit">
        <h2 class="mb-3 text-left">{title ? title : "No title"}</h2>
        <div class="flex w-fit flex-col items-start gap-1.5 text-left">
            {@render children?.()}
        </div>
    </div>
</div>
