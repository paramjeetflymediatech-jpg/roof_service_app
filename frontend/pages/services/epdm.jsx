'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiPhone } from 'react-icons/hi';
import { SERVICES_DROPDOWN, COMPANY_INFO } from '@/lib/constants';
import LayoutShell from '@/components/LayoutShell';

export default function EPDMPage() {
  return (
<<<<<<< HEAD
    <Layout>
      <section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
        <div className="container-custom text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            EPDM Roofing Solutions
          </motion.h1>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <motion.p
            className="text-lg text-gray-700 text-center max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            EPDM (Ethylene Propylene Diene Monomer) is one of the most popular and reliable roofing membranes for flat and low-slope roofs. Its proven track record spans over 50 years with exceptional durability.
          </motion.p>
        </div>
      </section>

      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">EPDM Membrane Roofing</h2>
              <p className="text-lg text-gray-700 mb-6">
                We specialize in EPDM installation, repairs, and maintenance. Our experienced team uses quality materials and proven techniques to ensure your flat roof provides decades of reliable protection.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Exceptional durability (30-50 year lifespan)</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Outstanding weather and UV resistance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Excellent waterproofing performance</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Cost-effective installation and repair</span>
                </li>
              </ul>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-200 to-accent-200 rounded-lg h-96 flex items-center justify-center"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">💧</div>
                <p className="text-gray-700 font-semibold">EPDM Roofing</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-700 mb-8">
              Easy to inspect and maintain with environmentally friendly materials. Fully adhered, mechanically fastened, or ballasted system options available. Custom flashing and penetrations with repair and restoration services included.
            </p>
            <Button variant="primary" href="/contact" className="text-lg px-8 py-4">
              Get Your EPDM Quote
            </Button>
=======
    <LayoutShell>
      <div className="relative h-64 bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&h=400&fit=crop')", backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1 className="text-4xl md:text-5xl font-bold mb-4" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>EPDM</motion.h1>
          <motion.div className="flex items-center justify-center gap-2 text-sm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6, delay: 0.2 }}>
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link><span>›</span><span>EPDM</span>
>>>>>>> 6adcaf8b1d1c4b96efde69c1e29f952a25cf57eb
          </motion.div>
        </div>
      </div>
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <motion.div className="mb-8 rounded-lg overflow-hidden shadow-lg" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.2 }}>
                <img src="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&h=400&fit=crop" alt="EPDM Roofing" className="w-full h-[400px] object-cover" />
              </motion.div>
              <motion.div className="bg-white rounded-lg shadow-md p-8 space-y-6" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6, delay: 0.3 }}>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Overview</h2>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    Mainstreet Roofing is a leading provider of high-quality roofing services, specializing in EPDM (Ethylene Propylene Diene Monomer) installations. Our team of skilled professionals are experts in EPDM roofing systems, utilizing the latest techniques and materials to ensure durable and long-lasting results for our clients.
                  </p>
                  <p className="text-gray-700 leading-relaxed mb-4">
                    EPDM roofs offer numerous advantages over traditional roofing materials, including exceptional durability, resistance to UV radiation and extreme weather conditions, as well as ease of installation and maintenance. At Mainstreet Roofing, we understand the importance of protecting your property with a reliable roof that can withstand the test of time. Whether you need a new EPDM roof installed or repairs and maintenance on an existing system, our experienced team is here to help. We take pride in delivering superior craftsmanship and attention to detail on every project we undertake. From residential homes to commercial buildings, no job is too big or small for Mainstreet Roofing.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gray-900 mb-4">Comprehensive Roofing Services</h2>
                  <p className="text-gray-700 leading-relaxed">
                    In addition to our expertise in EPDM roofing systems, we also offer a wide range of other services including shingle roof installations, metal roof replacements, gutter repair and replacement, skylight installation, and more. Whatever your roofing needs may be, Mainstreet Roofing has the knowledge and experience to deliver exceptional results that exceed your expectations.
                  </p>
                </div>
              </motion.div>
            </div>
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-6">
                <motion.div className="bg-white rounded-lg shadow-md overflow-hidden" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.4 }}>
                  <div className="bg-amber-600 text-white px-4 py-3"><h3 className="font-bold text-lg">Our Services</h3></div>
                  <div className="divide-y divide-gray-200">{SERVICES_DROPDOWN.map((service) => (<Link key={service.href} href={service.href} className="flex items-center justify-between px-4 py-3 hover:bg-amber-50 transition-colors group"><span className="text-gray-700 group-hover:text-amber-600 text-sm">{service.label}</span><span className="text-amber-600 group-hover:translate-x-1 transition-transform">→</span></Link>))}</div>
                </motion.div>
                <motion.div className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg shadow-lg p-6 text-center" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.6, delay: 0.5 }}>
                  <div className="mb-4">
                    <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                      <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Mainsheet</h3>
                    <p className="text-sm text-gray-300 mb-4">Professional<br />Roofing Contractors</p>
                  </div>
                  <div className="space-y-3">
                    <p className="text-sm text-gray-300">Call us for a FREE quote!</p>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"><HiPhone className="text-xl" /><span>{COMPANY_INFO.phone}</span></a>
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
