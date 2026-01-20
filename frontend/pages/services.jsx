import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import ServiceCard from '@/components/ServiceCard';
import apiClient from '@/lib/apiClient';
import { SERVICES } from '@/lib/constants';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      try {
        setLoading(true);
        const res = await apiClient.get('/services');
        setServices(res.data.items || []);
      } catch (err) {
        console.error(err);
        setError('Failed to load services');
      } finally {
        setLoading(false);
      }
    }

    load();
  }, []);

  // Use backend services if available, otherwise use default services
  const displayServices = services.length > 0
    ? services.map((service, index) => ({
      id: service._id,
      title: service.name,
      description: service.shortDescription || service.description || 'Professional roofing service',
      icon: 'star',
      features: [],
      index,
    }))
    : SERVICES;

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
            Our Services
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Comprehensive roofing solutions tailored to your needs
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          {loading && (
            <div className="text-center py-12">
              <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
              <p className="mt-4 text-gray-600">Loading services...</p>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-6 py-4 rounded-lg max-w-2xl mx-auto">
              {error}
            </div>
          )}

          {!loading && !error && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {displayServices.map((service, index) => (
                  <ServiceCard
                    key={service.id}
                    title={service.title}
                    description={service.description}
                    icon={service.icon}
                    features={service.features}
                    index={index}
                  />
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
                  Contact us today for a free, no-obligation quote on your roofing project
                </p>
                <motion.a
                  href="/contact"
                  className="btn btn-primary text-lg"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get Free Quote
                </motion.a>
              </motion.div>
            </>
          )}
        </div>
      </section>
    </Layout>
  );
}

