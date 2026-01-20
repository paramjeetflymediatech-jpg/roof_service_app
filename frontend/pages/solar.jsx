import { motion } from 'framer-motion';
import Layout from '@/components/LayoutShell';
import SolarServices from '@/components/SolarServices';

export default function SolarPage() {
    return (
        <Layout>
            {/* Page Hero */}
            <section className="bg-gradient-to-br from-yellow-500 to-orange-600 text-white py-24">
                <div className="container-custom text-center">
                    <motion.h1
                        className="text-4xl md:text-6xl font-bold mb-6"
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        Sustainable Solar Solutions
                    </motion.h1>
                    <motion.p
                        className="text-xl max-w-2xl mx-auto opacity-90"
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Combine your roofing needs with clean energy production.
                        Reduce your bills and help the planet with our expert solar installations.
                    </motion.p>
                </div>
            </section>

            {/* Solar Content */}
            <SolarServices />

            {/* Solar Process */}
            <section className="py-24 bg-white">
                <div className="container-custom">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Our Solar Installation Process</h2>
                        <div className="w-24 h-1.5 bg-orange-500 mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
                        {[
                            { step: '01', title: 'Consultation', text: 'Free assessment of your roof capacity and sun exposure.', icon: '📋' },
                            { step: '02', title: 'Design', text: 'Custom engineered systems to maximize your energy output.', icon: '✏️' },
                            { step: '03', title: 'Permitting', text: 'We handle all city and utility paperwork for you.', icon: '📑' },
                            { step: '04', title: 'Installation', text: 'Expert rooftop installation in as little as one day.', icon: '⚡' }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                className="group relative p-10 bg-gray-50 rounded-3xl border-2 border-transparent hover:border-orange-500 hover:bg-white hover:shadow-2xl transition-all duration-500"
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1 }}
                            >
                                <div className="text-6xl font-black text-orange-500/10 absolute top-6 right-8 group-hover:text-orange-500/20 transition-colors">
                                    {item.step}
                                </div>
                                <div className="text-5xl mb-6 transform group-hover:scale-110 transition-transform duration-500">
                                    {item.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 text-gray-900 group-hover:text-orange-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-gray-600 text-lg leading-relaxed">
                                    {item.text}
                                </p>

                                {/* Connector Line (Desktop Only) */}
                                {idx < 3 && (
                                    <div className="hidden lg:block absolute top-1/2 -right-6 w-12 h-0.5 bg-gray-200 z-0"></div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>
        </Layout>
    );
}
