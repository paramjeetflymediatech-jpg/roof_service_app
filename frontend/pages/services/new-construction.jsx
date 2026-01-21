import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import Button from '@/components/Button';

export default function NewConstructionPage() {
  return (
    <Layout>
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary-600 to-accent-600 text-white py-20">
        <div className="container-custom text-center">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            New Construction Roofing
          </motion.h1>
        </div>
      </section>

      {/* Intro Paragraph */}
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
            When building a new home or commercial property, the roof is one of the most critical components. Our new construction roofing services ensure your project starts with the highest quality foundation. Expert roofing solutions for new construction projects with quality materials and professional installation.
          </motion.p>
        </div>
      </section>

      {/* Two Column Section */}
      <section className="section-padding">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Professional New Construction Roofing</h2>
              <p className="text-lg text-gray-700 mb-6">
                We work closely with builders, contractors, and architects to ensure your roofing is completed on schedule and within budget. Our experience with new construction projects means we understand the unique requirements and timelines involved.
              </p>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Custom roof design tailored to your architectural plans</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Quality material selection and sourcing</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Expert installation by certified professionals</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="text-primary-600 font-bold">✓</span>
                  <span>Project management and timeline coordination</span>
                </li>
              </ul>
            </motion.div>

            {/* Right Image */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="bg-gradient-to-br from-primary-200 to-accent-200 rounded-lg h-96 flex items-center justify-center hover:shadow-2xl hover:scale-105 transition-all duration-300"
            >
              <div className="text-center">
                <div className="text-6xl mb-4">🏗️</div>
                <p className="text-gray-700 font-semibold">New Construction Roofing</p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Final Section with Button */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom max-w-3xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <p className="text-lg text-gray-700 mb-8">
              We have successfully completed hundreds of new construction roofing projects across the region. Our commitment to quality, punctuality, and professionalism makes us the preferred choice for builders and developers. Let us help you build the perfect roof for your new project.
            </p>
            <Button variant="primary" href="/contact" className="text-lg px-8 py-4">
              Get Your Project Quote
            </Button>
          </motion.div>
        </div>
      </section>
    </Layout>
  );
}
