import { useEffect } from 'react';
import Layout from '@/components/Layout';
import Hero from '@/components/Hero';
import Services from '@/components/Services';
import WhyChooseUs from '@/components/WhyChooseUs';
import RoofingProducts from '@/components/RoofingProducts';
import SolarServices from '@/components/SolarServices';
import FeaturedProjects from '@/components/FeaturedProjects';
import Testimonials from '@/components/Testimonials';
import QuoteForm from '@/components/QuoteForm';
import { cleanupScrollTriggers } from '@/lib/animations';

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
        <Services />
      </div>
      <div id="about">
        <WhyChooseUs />
      </div>
      <RoofingProducts />
      <SolarServices />
      <FeaturedProjects />
      <div id="testimonials">
        <Testimonials />
      </div>
      <QuoteForm />
    </Layout>
  );
}


