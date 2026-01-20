import { useState } from 'react';
import { motion } from 'framer-motion';
import { HiPhone, HiMail, HiLocationMarker, HiClock } from 'react-icons/hi';
import Layout from '@/components/Layout';
import apiClient from '@/lib/apiClient';
import { COMPANY_INFO } from '@/lib/constants';

export default function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError('');
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!form.name || !form.email) {
      setError('Name and email are required');
      return;
    }

    try {
      setLoading(true);
      await apiClient.post('/leads', {
        leadType: 'contact',
        source: 'website',
        name: form.name,
        email: form.email,
        phone: form.phone,
        message: form.message,
      });
      setSuccess('Thank you! We have received your request and will contact you soon.');
      setForm({ name: '', email: '', phone: '', message: '' });
    } catch (err) {
      console.error(err);
      setError(err.response?.data?.message || 'Failed to send message');
    } finally {
      setLoading(false);
    }
  }

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
            Get in Touch
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Have a question or ready to start your roofing project? We're here to help!
          </motion.p>
        </div>
      </section>

      {/* Contact Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Information */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
            >
              <h2 className="text-3xl font-bold mb-6 text-gray-900">Contact Information</h2>
              <p className="text-gray-600 mb-8">
                Reach out to us through any of the following methods. We're available 24/7 for emergency services.
              </p>

              <div className="space-y-6">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiPhone className="text-2xl text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Phone</h3>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="text-primary-600 hover:text-primary-700">
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiMail className="text-2xl text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Email</h3>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="text-primary-600 hover:text-primary-700">
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiLocationMarker className="text-2xl text-primary-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Address</h3>
                    <p className="text-gray-600">{COMPANY_INFO.address}</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-accent-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <HiClock className="text-2xl text-accent-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-1">Business Hours</h3>
                    <p className="text-gray-600">{COMPANY_INFO.hours}</p>
                    <p className="text-accent-600 font-semibold mt-1">{COMPANY_INFO.emergency}</p>
                  </div>
                </div>
              </div>

              {/* Emergency Banner */}
              <div className="mt-8 bg-accent-50 border-l-4 border-accent-600 p-6 rounded-lg">
                <h3 className="font-bold text-accent-900 mb-2">Emergency Services</h3>
                <p className="text-accent-800">
                  Roof leak or storm damage? Call us now for immediate assistance!
                </p>
              </div>
            </motion.div>

            {/* Contact Form */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              <div className="bg-white rounded-2xl shadow-xl p-8">
                <h2 className="text-3xl font-bold mb-6 text-gray-900">Send us a Message</h2>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                      Full Name *
                    </label>
                    <input
                      id="name"
                      name="name"
                      className="input-field"
                      value={form.name}
                      onChange={handleChange}
                      placeholder="John Doe"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                      Email Address *
                    </label>
                    <input
                      id="email"
                      name="email"
                      type="email"
                      className="input-field"
                      value={form.email}
                      onChange={handleChange}
                      placeholder="john@example.com"
                      required
                    />
                  </div>

                  <div>
                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                      Phone Number
                    </label>
                    <input
                      id="phone"
                      name="phone"
                      className="input-field"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+1 (555) 123-4567"
                    />
                  </div>

                  <div>
                    <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                      Message
                    </label>
                    <textarea
                      id="message"
                      name="message"
                      className="input-field resize-none"
                      rows={5}
                      value={form.message}
                      onChange={handleChange}
                      placeholder="Tell us about your roofing needs..."
                    />
                  </div>

                  {error && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">
                      {error}
                    </div>
                  )}

                  {success && (
                    <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg">
                      {success}
                    </div>
                  )}

                  <motion.button
                    type="submit"
                    disabled={loading}
                    className="w-full btn btn-primary text-lg py-4 disabled:opacity-50"
                    whileHover={{ scale: loading ? 1 : 1.02 }}
                    whileTap={{ scale: loading ? 1 : 0.98 }}
                  >
                    {loading ? 'Sending...' : 'Send Message'}
                  </motion.button>
                </form>
              </div>
            </motion.div>
          </div>
        </div>
      </section>
    </Layout>
  );
}

