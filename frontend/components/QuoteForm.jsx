import { useState } from 'react';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';
import apiClient from '@/lib/apiClient';

export default function QuoteForm() {
    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        address: '',
        province: 'British Columbia',
        city: '',
        email: '',
        phone: '',
        serviceType: '',
        roofType: '',
        message: '',
        hearAboutUs: '',
    });
    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validation
        if (!form.firstName || !form.lastName || !form.city || !form.email || !form.phone || !form.hearAboutUs) {
            toast.error('Please fill in all required fields');
            return;
        }

        try {
            setLoading(true);
            const response = await apiClient.post('/leads', {
                leadType: 'quote',
                source: 'website',
                name: `${form.firstName} ${form.lastName}`,
                email: form.email,
                phone: form.phone,
                address: form.address,
                province: form.province,
                city: form.city,
                serviceType: form.serviceType,
                roofType: form.roofType,
                message: form.message,
                hearAboutUs: form.hearAboutUs,
            });

            // Show success toast
            toast.success(response.data.message || 'Thank you! We will contact you soon.');

            // Reset form
            setForm({
                firstName: '',
                lastName: '',
                address: '',
                province: 'British Columbia',
                city: '',
                email: '',
                phone: '',
                serviceType: '',
                roofType: '',
                message: '',
                hearAboutUs: '',
            });
        } catch (err) {
            console.error(err);
            // Show error toast
            toast.error(err.response?.data?.message || 'Failed to submit quote request. Please try again.');
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
                            {/* First Name and Last Name */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="firstName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="firstName"
                                        name="firstName"
                                        value={form.firstName}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Firstname"
                                        required
                                    />
                                </div>
                                <div>
                                    <label htmlFor="lastName" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        id="lastName"
                                        name="lastName"
                                        value={form.lastName}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Lastname"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Address */}
                            <div>
                                <label htmlFor="address" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Address
                                </label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={form.address}
                                    onChange={handleChange}
                                    className="input-field"
                                    placeholder="Enter a location"
                                />
                            </div>

                            {/* Province and City */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="province" className="block text-sm font-semibold text-gray-700 mb-2">
                                        Province
                                    </label>
                                    <select
                                        id="province"
                                        name="province"
                                        value={form.province}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="British Columbia">British Columbia</option>
                                        <option value="Alberta">Alberta</option>
                                        <option value="Saskatchewan">Saskatchewan</option>
                                        <option value="Manitoba">Manitoba</option>
                                        <option value="Ontario">Ontario</option>
                                        <option value="Quebec">Quebec</option>
                                        <option value="New Brunswick">New Brunswick</option>
                                        <option value="Nova Scotia">Nova Scotia</option>
                                        <option value="Prince Edward Island">Prince Edward Island</option>
                                        <option value="Newfoundland and Labrador">Newfoundland and Labrador</option>
                                        <option value="Yukon">Yukon</option>
                                        <option value="Northwest Territories">Northwest Territories</option>
                                        <option value="Nunavut">Nunavut</option>
                                    </select>
                                    <p className="text-xs text-gray-500 mt-1">
                                        Servicing BC's Lower Mainland to Bowen Island to Hope, and Everywhere in Between!
                                    </p>
                                </div>
                                <div>
                                    <label htmlFor="city" className="block text-sm font-semibold text-gray-700 mb-2">
                                        City *
                                    </label>
                                    <input
                                        type="text"
                                        id="city"
                                        name="city"
                                        value={form.city}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="Enter city"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Email and Phone */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                                        E-mail Address *
                                    </label>
                                    <input
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={form.email}
                                        onChange={handleChange}
                                        className="input-field"
                                        placeholder="example@email.com"
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
                                        placeholder="xxx-xxx-xxxx"
                                        required
                                    />
                                </div>
                            </div>

                            {/* Service Type and Roof Type */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <label htmlFor="serviceType" className="block text-sm font-semibold text-gray-700 mb-2">
                                        What service are you interested in having?
                                    </label>
                                    <select
                                        id="serviceType"
                                        name="serviceType"
                                        value={form.serviceType}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="">Select one</option>
                                        <option value="Roof Replacement">Roof Replacement</option>
                                        <option value="Roof Repair">Roof Repair</option>
                                        <option value="New Construction">New Construction</option>
                                        <option value="Roof Inspection">Roof Inspection</option>
                                        <option value="Gutter Services">Gutter Services</option>
                                        <option value="Emergency Repair">Emergency Repair</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                                <div>
                                    <label htmlFor="roofType" className="block text-sm font-semibold text-gray-700 mb-2">
                                        What type of roof do you have?
                                    </label>
                                    <select
                                        id="roofType"
                                        name="roofType"
                                        value={form.roofType}
                                        onChange={handleChange}
                                        className="input-field"
                                    >
                                        <option value="">Select one</option>
                                        <option value="Asphalt Shingles">Asphalt Shingles</option>
                                        <option value="Metal Roofing">Metal Roofing</option>
                                        <option value="Tile Roofing">Tile Roofing</option>
                                        <option value="Flat Roof">Flat Roof</option>
                                        <option value="Cedar Shake">Cedar Shake</option>
                                        <option value="Slate">Slate</option>
                                        <option value="Not Sure">Not Sure</option>
                                    </select>
                                </div>
                            </div>

                            {/* Tell Us More */}
                            <div>
                                <label htmlFor="message" className="block text-sm font-semibold text-gray-700 mb-2">
                                    Tell Us More
                                </label>
                                <textarea
                                    id="message"
                                    name="message"
                                    value={form.message}
                                    onChange={handleChange}
                                    rows={4}
                                    className="input-field resize-none"
                                    placeholder="Tell us about your roofing project..."
                                />
                            </div>

                            {/* How did you hear about us */}
                            <div>
                                <label htmlFor="hearAboutUs" className="block text-sm font-semibold text-gray-700 mb-2">
                                    How did you hear about us? *
                                </label>
                                <select
                                    id="hearAboutUs"
                                    name="hearAboutUs"
                                    value={form.hearAboutUs}
                                    onChange={handleChange}
                                    className="input-field"
                                    required
                                >
                                    <option value="">Select one</option>
                                    <option value="Google Search">Google Search</option>
                                    <option value="Social Media">Social Media</option>
                                    <option value="Friend/Family Referral">Friend/Family Referral</option>
                                    <option value="Previous Customer">Previous Customer</option>
                                    <option value="Advertisement">Advertisement</option>
                                    <option value="Drive By">Drive By</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>

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
