import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import WhyChooseUs from '@/components/WhyChooseUs';
import { COMPANY_INFO } from '@/lib/constants';

export default function CompanyPage() {
    return (
        <Layout>
            {/* Page Hero */}
            <section className="bg-gradient-to-br from-dark-900 to-dark-700 text-white py-24">
                <div className="container-custom text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        About Our Company
                    </motion.h1>
                    <motion.p
                        className="text-xl max-w-2xl mx-auto opacity-90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        {COMPANY_INFO.tagline || 'Leading the industry with excellence in craftsmanship and customer service.'}
                    </motion.p>
                </div>
            </section>

            {/* Why Choose Us Section */}
            <WhyChooseUs />

            {/* About Content */}
            <section className="py-20 bg-gray-50 text-gray-900">
                <div className="container-custom">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
                        <div>
                            <h2 className="text-3xl font-bold mb-6">Our Legacy of Excellence</h2>
                            <p className="text-gray-600 mb-6 leading-relaxed">
                                Founded on the principles of integrity, quality, and community, Mainstreet Roofing Ltd Solutions
                                has been serving property owners for over 5 years. We've built our reputation one roof
                                at a time, combining traditional craftsmanship with modern roofing technology.
                            </p>
                            <p className="text-gray-600 leading-relaxed">
                                Our team consists of expert technicians who are not just skilled laborers, but true artisans
                                of their craft. We take pride in protecting your most valuable asset—your home.
                            </p>
                        </div>
                        <div className="relative h-[400px] rounded-2xl overflow-hidden shadow-xl">
                            <img
                                src="/assets/project-residential.jpg"
                                alt="Our Work"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute inset-0 bg-primary-900/10 hover:bg-transparent transition-colors duration-500" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="py-20 bg-white border-t border-gray-100">
                <div className="container-custom text-center">
                    <h2 className="text-3xl font-bold mb-12">Our Core Values</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl font-bold text-primary-600 mb-2">01</div>
                            <h3 className="text-xl font-bold mb-2">Integrity</h3>
                            <p className="text-gray-600 text-sm">Honesty in every estimate and transparency in every project.</p>
                        </div>
                        <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl font-bold text-accent-600 mb-2">02</div>
                            <h3 className="text-xl font-bold mb-2">Quality</h3>
                            <p className="text-gray-600 text-sm">Using only the best materials and techniques available.</p>
                        </div>
                        <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl font-bold text-primary-600 mb-2">03</div>
                            <h3 className="text-xl font-bold mb-2">Safety</h3>
                            <p className="text-gray-600 text-sm">Rigorous safety standards for our team and your property.</p>
                        </div>
                        <div className="p-8 border border-gray-100 rounded-2xl shadow-sm hover:shadow-md transition-all">
                            <div className="text-3xl font-bold text-accent-600 mb-2">04</div>
                            <h3 className="text-xl font-bold mb-2">Service</h3>
                            <p className="text-gray-600 text-sm">Dedicated customer support from first call to final inspection.</p>
                        </div>
                    </div>
                </div>
            </section>
        </Layout>
    );
}
