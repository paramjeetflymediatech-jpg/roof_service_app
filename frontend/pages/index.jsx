import { useEffect } from "react";
import Layout from "@/components/LayoutShell";
import Hero from "@/components/Hero";
// import AboutPage from './about';
// import WhyChooseUs from '@/components/WhyChooseUs';
// import RoofingProducts from '@/components/RoofingProducts';
import FeaturedProjects from "@/components/FeaturedProjects";
import Testimonials from "@/components/Testimonials";
// import QuoteForm from '@/components/QuoteForm';
import { cleanupScrollTriggers } from "@/lib/animations";
import Services from "@/components/Services";
import Secondsechome from "@/components/Secondsechome";
import OurProcess from "@/components/OurProcess";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from "@/lib/api/seo";
import apiClient from "@/lib/apiClient";
import Faq from "@/components/Faq";


export async function getServerSideProps() {
  try {
    const [seoResponse, servicesResponse] = await Promise.all([
      getSeoData("home"),
      apiClient.get("/services?limit=6"), // Fetch top 6 services for home
    ]);

    return {
      props: {
        seoData: seoResponse.success ? seoResponse.data : null,
        services: servicesResponse.data?.items || [],
      },
    };
  } catch (error) {
    console.error("Error fetching Home data:", error);
    return {
      props: {
        seoData: null,
        services: [],
      },
    };
  }
}

export default function HomePage({ seoData, services }) {
  useEffect(() => {
    // Cleanup GSAP ScrollTriggers on unmount
    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  return (
    <Layout>
      <SeoHead pageName="home" initialSeoData={seoData} />
      <Hero />
      <div id="services"></div>

      <Secondsechome />
      {/* <div id="about">
        <WhyChooseUs />
      </div> */}
      {/* <AboutPage /> */}

      {/* <AboutPage /> */}
      <Services services={services} />
      {/* <RoofingProducts /> */}

      <OurProcess />
      <FeaturedProjects />
     
      <div id="testimonials">
        <Testimonials />
      </div>
 <Faq />
    </Layout>
  );
}
