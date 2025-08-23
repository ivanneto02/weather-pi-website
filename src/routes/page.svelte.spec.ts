import { page } from '@vitest/browser/context';
import { describe, expect, it } from 'vitest';
import { render } from 'vitest-browser-svelte';

import Page from './+page.svelte';
import AboutPage from "./about/+page.svelte";
import BuildingThisWebsitePage from "./building-this-website/+page.svelte";

describe('/+page.svelte', () => {
    it('should render h1', async () => {
        render(Page);

        const heading = page.getByRole('heading', { level: 1 });
        await expect.element(heading).toBeInTheDocument();
    });
});

describe('/about/+page.svelte', () => {
    it('should render h1', async () => {
        render(AboutPage);

        const heading = page.getByRole('heading', { level: 1 });
        await expect.element(heading).toBeInTheDocument();
    });
});

describe('/building-this-website/+page.svelte', () => {
    it('should render h1', async () => {
        render(BuildingThisWebsitePage);

        const heading = page.getByRole('heading', { level: 1 });
        await expect.element(heading).toBeInTheDocument();
    });
});
