<script lang="ts">
    import FooterLink from "$lib/components/FooterLink.svelte";
    import FooterSection from "$lib/components/FooterSection.svelte";
</script>

<div class="mt-20 grid h-auto grid-cols-1 gap-8 border-t-2 border-solid border-indigo-900 pb-10 pt-6 text-center md:grid-cols-3">
    <FooterSection title="Contact Information">
        <FooterLink icon={"mdi:email"} text={"ivanbatallon1@gmail.com"} to={"mailto:ivanbatallon1@gmail.com"} />
        <FooterLink icon={"mdi:graduation-cap"} text={"University of California, Riverside"} to={"https://www.ucr.edu/"}/>
        <FooterLink icon={"mdi:map"} text={"Riverside, CA"} to={"https://www.google.com/maps/place/University+of+California,+Riverside"} />
        <FooterLink icon={"mdi:computer"} text={"Computer Scienve"} to={"https://www1.cs.ucr.edu/"}/>
    </FooterSection> 

    <FooterSection title="Tech Stack">
        <FooterLink icon={"mdi:language-typescript"} text={"Typescript"} to={"https://www.typescriptlang.org/docs/"} />
        <FooterLink icon={"ri:svelte-fill"} text={"Svelte"} to={"https://svelte.dev/"}/>
        <FooterLink icon={"mdi:tailwind"} text={"Tailwind"} to={"https://tailwindcss.com"}/>
        <FooterLink icon={"simple-icons:iconify"} text={"Iconify"} to={"https://iconify.design"}/>
        <FooterLink icon={"mdi:aws"} text={"AWS"} to={"https://aws.amazon.com/"}/>
        <FooterLink icon={"devicon-plain:netlify"} text={"Netlify"} to={"https://app.netlify.com"}/>
    </FooterSection> 

    <FooterSection title="Other work">
        <FooterLink icon={"basil:document-solid"} text={"Resume"} to={"https://docs.google.com/document/d/1WJInUWfr5vqFRe2XMcU9oozOaHX8jTv-4adBut4mvHQ/edit?usp=sharing"} />
        <FooterLink icon={"mdi:linkedin"} text={"Linkedin"} to={"https://www.linkedin.com/in/ivan-neto/"}/>
        <FooterLink icon={"mdi:github"} text={"Github"} to={"https://github.com/ivanneto02"}/>
        <FooterLink icon={"streamline-plump:browser-website-1-solid"} text={"ivanneto.dev"} to={"https://ivanneto.dev"}/>
    </FooterSection> 
</div>
