import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import Button from '@/components/Button';

export default function ReroofsPage() {
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
            Roof Replacement Services
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
            When your roof reaches the end of its lifespan, a complete replacement is the best solution to protect your property. Our reroof services are comprehensive and designed to minimize disruption to your daily life with complete roof replacement solutions.
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
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Complete Roof Replacement</h2>
              <p className="text-lg text-gray-700 mb-6">
                Our experienced team works efficiently to complete your project quickly and with minimal mess. We handle every aspect of the reroof process, from old material disposal to the final inspection.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Complete removal of old roofing materials</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Structural inspection and repairs if needed</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>High-quality underlayment installation</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Professional installation of new roofing</span>
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
                <div className="text-6xl mb-4">🔨</div>
                <p className="text-gray-700 font-semibold">Roof Replacement</p>
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
              Signs you need a reroof include age exceeding 20-25 years, multiple leaks, missing shingles, sagging, and deterioration. Let us help you make the right decision for your property with a professional inspection and honest assessment.
            </p>
            <Button variant="primary" href="/contact" className="text-lg px-8 py-4">
              Schedule Your Inspection
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
