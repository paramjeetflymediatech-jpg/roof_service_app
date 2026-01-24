'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { SERVICES_DROPDOWN } from '@/lib/constants';
import LayoutShell from '@/components/LayoutShell';
import { useSeo } from '@/hooks/useSeo';

// Service descriptions matching your content
const SERVICE_DETAILS = {
  'New Construction': 'Mainstreet Roofing is a premier roofing company specializing in new construction projects. With years of experience in the industry, we deliver exceptional quality and craftsmanship.',
  'Reroofs': 'Mainstreet Roofing is a trusted and reliable company specializing in Re-roofs. With years of experience in the roofing industry, we provide top-quality services.',
  'Metal Roofing': 'Mainstreet Roofing is a premier company specializing in metal roofing services, offering unparalleled expertise and quality workmanship.',
  'Wall Metals': 'Mainstreet Roofing is a trusted name in the industry, specializing in Wall metals for commercial and residential properties.',
  'Torch On': 'Mainstreet Roofing is a trusted name in the industry, specializing in Torch on roofing services. Our team of experienced professionals is dedicated to providing top-quality workmanship.',
  'EPDM': 'Mainstreet Roofing is a leading provider of high-quality roofing services, specializing in EPDM rubber roofing systems.',
  'Metal Gutters and Downspouts': 'Mainstreet Roofing takes pride in offering top-notch metal gutters and downspouts services to our valued customers.',
  'Leak Repair': 'Mainstreet Roofing is a trusted name in the industry when it comes to leak repair services. Our team of experienced professionals is dedicated to providing efficient solutions.',
  'Rain and Storm Damage': 'Mainstreet Roofing is a trusted name in the industry when it comes to repairing rain and storm damage on roofs.',
  'Tile and Slate Roofing': 'Mainstreet Roofing is a reputable company specializing in top-quality tile and slate roofing services.',
  'Insulation': 'Mainstreet Roofing is a leading provider of roof insulation services, dedicated to enhancing the energy efficiency and comfort of your property.',
  'Restorations Servicing': 'Mainstreet Roofing is a premier provider of roof Restorations servicing in the industry. With years of experience, we restore and rejuvenate your roof.',
  'Solar Panels': 'Mainstreet Roofing is a leading provider of solar panel installation and repair services, dedicated to helping you harness renewable energy.',
};

export default function ServicesPage() {
  // Load SEO meta tags for services page
  useSeo('services');

  return (
    <LayoutShell>
      {/* Hero Banner */}
      <div
        className="relative h-64 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: "url('https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1200&h=400&fit=crop')",
          backgroundPosition: 'center'
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Services
          </motion.h1>
          <motion.div
            className="flex items-center justify-center gap-2 text-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>›</span>
            <span>Services</span>
          </motion.div>
        </div>
      </div>

      {/* Services Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Our Services</h2>
          </motion.div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {SERVICES_DROPDOWN.map((service, index) => (
              <motion.div
                key={service.href}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <Link href={service.href}>
                  <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full hover:scale-105 cursor-pointer">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="text-4xl flex-shrink-0">{service.icon}</div>
                      <h3 className="text-xl font-bold text-gray-900">{service.label}</h3>
                    </div>
                    <p className="text-gray-600 leading-relaxed">
                      {SERVICE_DETAILS[service.label] || `Professional ${service.label.toLowerCase()} services for your property.`}
                    </p>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* CTA Section */}
          <motion.div
            className="mt-16 bg-white rounded-2xl shadow-xl p-12 text-center"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Mainstreet Roofing offers expert roofing solutions with top-quality materials and craftsmanship. From installations to repairs, we ensure durability and customer satisfaction for residential and commercial projects.
            </p>
            <Link href="/contact">
              <motion.button
                className="btn btn-primary text-lg px-8 py-4"
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
              >
                Get a Quote
              </motion.button>
            </Link>
          </motion.div>
        </div>
      </section>
    </LayoutShell>
  );
}
