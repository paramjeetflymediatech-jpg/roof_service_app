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
import { useSeo } from '@/hooks/useSeo';

export default function HomePage() {
  // Load SEO meta tags for home page
  useSeo('home');

  useEffect(() => {
    // Cleanup GSAP ScrollTriggers on unmount
    return () => {
      cleanupScrollTriggers();
    };
  }, []);

  return (
    <Layout>
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


