'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiPhone } from 'react-icons/hi';
import { SERVICES_DROPDOWN, COMPANY_INFO } from '@/lib/constants';
import LayoutShell from '@/components/LayoutShell';
import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
  try {
    console.log('Fetching SEO data for metal-roofing...');
    const data = await getSeoData('metal-roofing');
    console.log('SEO Data received:', data);
    return {
      props: {
        seoData: data.success ? data.data : null,
      },
    };
  } catch (error) {
    console.error('Error fetching Metal Roofing SEO data:', error);
    return {
      props: {
        seoData: null,
      },
    };
  }
}

export default function MetalRoofingPage({ seoData }) {
  return (
    <LayoutShell>
      <SeoHead pageName="metal-roofing" initialSeoData={seoData} />
      <div
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('/assets/ban.jpg')",
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            Metal Roofing
          </motion.h1>
          <motion.div className="flex items-center justify-center gap-2 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>›</span>
            <span>Metal Roofing</span>
          </motion.div>
        </div>
      </div>

      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <motion.div className="mb-8 rounded-lg overflow-hidden shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <img src="/assets/Metal-Roofing-New.jpg" alt="Metal Roofing" className="w-full h-[400px] object-cover" />
              </motion.div>

              <motion.div className="bg-white rounded-lg shadow-md p-8 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Mainstreet Roofing is a premier company specializing in metal roofing services, offering unparalleled expertise and craftsmanship in every project we undertake. Our team of highly skilled professionals possesses the knowledge and experience needed to deliver top-notch metal roofing solutions that are not only durable but also aesthetically pleasing. With a keen attention to detail and a commitment to excellence, we take pride in providing our clients with high-quality metal roofing installations that stand the test of time.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Metal roofing has become increasingly popular in recent years due to its many benefits, including durability, energy efficiency, and low maintenance requirements. At Mainstreet Roofing, we understand the unique advantages that metal roofing offers and strive to provide our customers with superior products and services that exceed their expectations. Whether you are looking to replace an existing roof or install a new one on your residential or commercial property, our expert team can help you choose the right metal roofing solution for your specific needs.
                  </p>
                </div>

                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Mainstreet Roofing?</h2>
                  <p className="text-gray-700 leading-relaxed">
                    When you choose Mainstreet Roofing for your metal roofing project, you can rest assured knowing that you are working with a reputable company dedicated to delivering outstanding results. From start to finish, our team will work closely with you to ensure that your vision becomes a reality while adhering to strict quality standards and safety protocols. Trust Mainstreet Roofing for all your metal roofing needs – we guarantee exceptional service and exceptional results every time.
                  </p>
                </div>
              </motion.div>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <div className="bg-amber-600 text-white px-4 py-3"><h3 className="font-bold text-lg">Our Services</h3></div>
                  <div className="divide-y divide-gray-200">
                    {SERVICES_DROPDOWN.map((service) => (
                      <Link key={service.href} href={service.href} className="flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors group">
                        <span className="text-gray-700 group-hover:text-amber-600 text-sm">{service.label}</span>
                        <span className="text-amber-600 group-hover:translate-x-1 transition-transform">→</span>
                      </Link>
                    ))}
                  </div>
                </motion.div>

                <motion.div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-lg p-6 text-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                      </svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Mainsheet</h3>
                    <p className="text-sm text-gray-300 mb-4">Professional<br />Roofing Contractors</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">Call us for a FREE quote!</p>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors">
                      <HiPhone className="text-xl" />
                      <span>{COMPANY_INFO.phone}</span>
                    </a>
                  </div>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </LayoutShell>
  );
}
