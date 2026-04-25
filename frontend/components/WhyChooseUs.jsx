import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { WHY_CHOOSE_US, STATS } from '@/lib/constants';
import { animateCounter } from '@/lib/animations';

export default function WhyChooseUs() {
    const sectionRef = useRef(null);
    const statsRef = useRef([]);

    useEffect(() => {
        // Animate counters
        statsRef.current.forEach((stat, index) => {
            if (stat) {
                const value = STATS[index]?.value || 0;
                animateCounter(stat, value);
            }
        });
    }, []);

    const iconMap = {
        shield: '🛡️',
        users: '👥',
        star: '⭐',
        certificate: '📜',
        calculator: '🧮',
        clock: '⏰',
    };

    return (
        <section ref={sectionRef} className="section-padding bg-white">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Why Choose <span className="gradient-text">Us</span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Experience the difference of working with true roofing professionals
                    </motion.p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {STATS.map((stat, index) => (
                        <motion.div
                            key={index}
                            className="text-center"
                            initial={{ opacity: 0, scale: 0.8 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                        >
                            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                                <span ref={(el) => (statsRef.current[index] = el)}>0</span>
                                {stat.suffix}
                            </div>
                            <div className="text-gray-600 font-medium">{stat.label}</div>
                        </motion.div>
                    ))}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {WHY_CHOOSE_US.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            whileHover={{ y: -5 }}
                        >
                            <motion.div
                                className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-2xl shadow-md"
                                whileHover={{ rotate: 360 }}
                                transition={{ duration: 0.6 }}
                            >
                                {iconMap[feature.icon] || '✨'}
                            </motion.div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Image Section */}
                <motion.div
                    className="mt-16 rounded-2xl overflow-hidden shadow-2xl"
                    initial={{ opacity: 0, y: 50 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                >
                    <div className="relative h-96 bg-gradient-to-r from-primary-600 to-accent-600">
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-50"
                            style={{
                                backgroundImage: "url('https://images.unsplash.com/photo-1590482161867-1ff8e3c97a6e?q=80&w=2070')",
                            }}
                        />
                        <div className="relative z-10 h-full flex items-center justify-center text-white text-center p-8">
                            <div>
                                <h3 className="text-3xl md:text-4xl font-bold mb-4">
                                    Ready to Get Started?
                                </h3>
                                <p className="text-xl mb-8 max-w-2xl mx-auto">
                                    Get a free, no-obligation quote for your roofing project today
                                </p>
                                <motion.a
                                    href="/contact"
                                    className="btn btn-outline text-lg"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Get Free Estimate
                                </motion.a>
                            </div>
                        </div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}
