"use client";

import Footer from "@/components/Footer";
import HomeFeatures from "@/components/site/home/HomeFeatures";
import HomeHero from "@/components/site/home/HomeHero";
import HomeHowItWorks from "@/components/site/home/HomeHowItWorks";
import HomePartners from "@/components/site/home/HomePartners";

function Page() {
  return (
    <>
      <HomeHero />
      <div className="relative z-10 border-t-2 border-t-primary/10 bg-[url('/assets/textures/other-glow.webp')] bg-[#D4DDFF] bg-cover bg-[left_30%_top_30%] pt-16 shadow-2xl shadow-primary/50 [border-radius:53%_47%_0%_0%/1%_1%_100%_100%] md:bg-top md:[border-radius:52%_48%_0%_0%/2%_2%_100%_100%]">
        <HomeFeatures />
        <HomeHowItWorks />
        <HomePartners />
        <Footer />
      </div>
    </>
  );
}

export default Page;
