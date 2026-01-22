import { useEffect } from 'react';
import Layout from '@/components/LayoutShell';
import Hero from '@/components/Hero';
// import AboutPage from './about';
// import WhyChooseUs from '@/components/WhyChooseUs';
// import RoofingProducts from '@/components/RoofingProducts';
import FeaturedProjects from '@/components/FeaturedProjects';
import Testimonials from '@/components/Testimonials';
import QuoteForm from '@/components/QuoteForm';
import { cleanupScrollTriggers } from '@/lib/animations';
import Services from '@/components/Services';

export default function HomePage() {
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
      {/* <div id="about">
        <WhyChooseUs />
      </div> */}
      {/* <AboutPage /> */}

      <Services />
      {/* <RoofingProducts /> */}
      <FeaturedProjects />
      <div id="testimonials">
        <Testimonials />
      </div>
      <div id="contact">
        <QuoteForm />
      </div>
    </Layout>
  );
}


