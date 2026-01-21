import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import Button from '@/components/Button';

export default function InsulationPage() {
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
            Roof Insulation Services
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
            Proper roof and attic insulation is essential for energy efficiency and comfort. We provide comprehensive insulation solutions to reduce energy costs and improve indoor comfort throughout the year.
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
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Professional Insulation Solutions</h2>
              <p className="text-lg text-gray-700 mb-6">
                Proper insulation works with your roofing system to maintain consistent interior temperatures, reduce heating and cooling costs, and improve overall home comfort throughout the year.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Attic insulation installation and upgrades</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Roof deck insulation systems</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Energy audit and assessment</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Air sealing and vapor barriers</span>
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
                <div className="text-6xl mb-4">🏠</div>
                <p className="text-gray-700 font-semibold">Insulation</p>
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
              Ventilation system optimization with insulation removal and replacement. Fiberglass, cellulose, rigid foam, spray foam, and reflective barrier options available. Extends roof life, improves performance, and enhances energy efficiency.
            </p>
            <Button variant="primary" href="/contact" className="text-lg px-8 py-4">
              Schedule Energy Audit
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
