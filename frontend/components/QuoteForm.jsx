import { useState } from 'react';
import { motion } from 'framer-motion';
import apiClient from '@/lib/apiClient';

export default function QuoteForm() {
    const [form, setForm] = useState({
        name: '',
        email: '',
        phone: '',
        serviceType: '',
        message: '',
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
        setError('');
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess(false);

        // Validation
        if (!form.name || !form.email || !form.phone) {
            setError('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            await apiClient.post('/leads', {
                leadType: 'quote',
                source: 'website',
                name: form.name,
                email: form.email,
                phone: form.phone,
                serviceType: form.serviceType,
                message: form.message,
            });
            setSuccess(true);
            setForm({ name: '', email: '', phone: '', serviceType: '', message: '' });
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Failed to submit quote request');
        } finally {
            setLoading(false);
        }
    };

    return (
        <section className="section-padding bg-white">
            <div className="container-custom">
                <div className="max-w-4xl mx-auto">
                    {/* Section Header */}
                    <div className="text-center mb-12">
                        <motion.h2
                            className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            Get a <span className="gradient-text">Free Quote</span>
                        </motion.h2>
                        <motion.p
                            className="text-xl text-gray-600"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6, delay: 0.2 }}
                        >
                            Fill out the form below and we'll get back to you within 24 hours
                        </motion.p>
                    </div>

                    {/* Form */}
                    <motion.div
                        className="bg-gray-50 rounded-2xl shadow-xl p-8 md:p-12"
                        initial={{ opacity: 0, y: 50 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.3 }}
                    >
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Name */}
                            <div>
                                <label htmlFor="name" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    id="name"
                                    name="name"
                                    value={form.name}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="John Doe"
                                    required
                                />
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="john@example.com"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="phone" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        value={form.phone}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="+1 (555) 123-4567"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Service Type */}
                            <div>
                                <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Service Type
                                </label>
                                <select
                                    id="serviceType"
                                    name="serviceType"
                                    value={form.serviceType}
                                    onChange={handleChange}
                                    className="input-field"
                                >
                                    <option value="">Select a service...</option>
                                    <option value="residential">Residential Roofing</option>
                                    <option value="commercial">Commercial Roofing</option>
                                    <option value="repair">Roof Repair</option>
                                    <option value="new-construction">New Construction</option>
                                    <option value="inspection">Roof Inspection</option>
                                    <option value="gutter">Gutter Services</option>
                                    <option value="other">Other</option>
                                </select>
                            </div>

                            {/* Message */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Project Details
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={5}
                                    className="input-field resize-none"
                                    placeholder="Tell us about your roofing project..."
                                />
                            </div>

                            {/* Error Message */}
                            {error && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg"
                                >
                                    {error}
                                </motion.div>
                            )}

                            {/* Success Message */}
                            {success && (
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg"
                                >
                                    ✓ Thank you! We've received your quote request and will contact you soon.
                                </motion.div>
                            )}

                            {/* Submit Button */}
                            <motion.button
                                type="submit"
                                disabled={loading}
                                className="w-full btn btn-primary text-lg py-4 disabled:opacity-50 disabled:cursor-not-allowed"
                                whileHover={{ scale: loading ? 1 : 1.02 }}
                                whileTap={{ scale: loading ? 1 : 0.98 }}
                            >
                                {loading ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                                            <circle
                                                className="opacity-25"
                                                cx="12"
                                                cy="12"
                                                r="10"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                fill="none"
                                            />
                                            <path
                                                className="opacity-75"
                                                fill="currentColor"
                                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                                            />
                                        </svg>
                                        Sending...
                                    </span>
                                ) : (
                                    'Get Free Quote'
                                )}
                            </motion.button>

                            <p className="text-sm text-gray-500 text-center">
                                By submitting this form, you agree to be contacted about your project.
                            </p>
                        </form>
                    </motion.div>
                </div>
            </div>
        </section>
    );
}
