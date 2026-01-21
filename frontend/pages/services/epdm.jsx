import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import Button from '@/components/Button';

export default function EPDMPage() {
  return (
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
          <motion.h2
            className="text-3xl font-bold text-center mb-4 text-gray-900"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            Overview
          </motion.h2>
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
              className="bg-gradient-to-br from-primary-200 to-accent-200 rounded-lg h-96 flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300"
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
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
