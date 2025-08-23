<script lang="ts">
    import FooterLink from "$lib/components/FooterLink.svelte";
    import FooterSection from "$lib/components/FooterSection.svelte";
</script>

<div class="h-auto bg-inherit flex gap-5 pb-10 flex-col text-center border-solid border-indigo-900 border-t-2">
    <FooterSection title="Contact Information">
        <FooterLink icon={"mdi:email"} text={"ivanbatallon1@gmail.com"} />
        <FooterLink icon={"mdi:graduation-cap"} text={"University of California, Riverside"}/>
        <FooterLink icon={"mdi:map"} text={"Riverside, CA"}/>
        <FooterLink icon={"mdi:computer"} text={"Computer Scienve"}/>
    </FooterSection> 

    <FooterSection title="Tech Stack">
        <FooterLink icon={"mdi:language-typescript"} text={"Typescript"} />
        <FooterLink icon={"ri:svelte-fill"} text={"Svelte"}/>
        <FooterLink icon={"mdi:tailwind"} text={"Tailwind"}/>
        <FooterLink icon={"simple-icons:iconify"} text={"Iconify"}/>
        <FooterLink icon={"mdi:aws"} text={"AWS"}/>
        <FooterLink icon={"devicon-plain:netlify"} text={"Netlify"}/>
    </FooterSection> 

    <FooterSection title="Other work">
        <FooterLink icon={"basil:document-solid"} text={"Resume"} />
        <FooterLink icon={"mdi:linkedin"} text={"Linkedin"}/>
        <FooterLink icon={"mdi:github"} text={"Github"}/>
        <FooterLink icon={"streamline-plump:browser-website-1-solid"} text={"ivanneto.dev"}/>
    </FooterSection> 
</div>
