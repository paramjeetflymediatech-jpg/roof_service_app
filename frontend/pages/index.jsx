import dynamic from "next/dynamic";
import Layout from "@/components/LayoutShell";
import Hero from "@/components/Hero";
import Services from "@/components/Services";
import Secondsechome from "@/components/Secondsechome";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from "@/lib/api/seo";
import apiClient from "@/lib/apiClient";

// Dynamically import below-the-fold components for optimal mobile Performance & TBT
const OurProcess = dynamic(() => import("@/components/OurProcess"), { ssr: true });
const FeaturedProjects = dynamic(() => import("@/components/FeaturedProjects"), { ssr: true });
const GoogleReviews = dynamic(() => import("@/components/GoogleReviews"), { ssr: false });
const Faq = dynamic(() => import("@/components/Faq"), { ssr: true });

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
  return (
    <Layout>
      <SeoHead pageName="home" initialSeoData={seoData} />
      <Hero />
      <div id="services"></div>
      <Secondsechome />
      <Services services={services} />
      <OurProcess />
      <FeaturedProjects />
      <div id="testimonials">
        <GoogleReviews />
      </div>
      <Faq />
    </Layout>
  );
}
