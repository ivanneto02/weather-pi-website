// only runs in browser
export async function ensureFluentRegistered() {
    if (customElements.get('fluent-button')) return;
    const { provideFluentDesignSystem, allComponents } = await import("@fluentui/web-components");
    provideFluentDesignSystem().register(allComponents);
}
