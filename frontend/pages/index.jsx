import { useEffect } from 'react';
import Layout from '@/components/LayoutShell';
import Hero from '@/components/Hero';
// import AboutPage from './about';
// import WhyChooseUs from '@/components/WhyChooseUs';
// import RoofingProducts from '@/components/RoofingProducts';
import FeaturedProjects from '@/components/FeaturedProjects';
import Testimonials from '@/components/Testimonials';
// import QuoteForm from '@/components/QuoteForm';
import { cleanupScrollTriggers } from '@/lib/animations';
import Services from '@/components/Services';
import Secondsechome from '@/components/Secondsechome';
import OurProcess from '@/components/OurProcess';
import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
  try {
    const data = await getSeoData('home');
    return {
      props: {
        seoData: data.success ? data.data : null,
      },
    };
  } catch (error) {
    console.error('Error fetching Home SEO data:', error);
    return {
      props: {
        seoData: null,
      },
    };
  }
}

export default function HomePage({ seoData }) {
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
      <div id="services">
      </div>


      <Secondsechome />
      {/* <div id="about">
        <WhyChooseUs />
      </div> */}
      {/* <AboutPage /> */}

      <Services />
      {/* <RoofingProducts /> */}

      <OurProcess />
      <FeaturedProjects />
      <div id="testimonials">
        <Testimonials />
      </div>

    </Layout>
  );
}


