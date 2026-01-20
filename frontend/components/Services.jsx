import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { staggerFadeIn } from '@/lib/animations';
import { SERVICES } from '@/lib/constants';
import ServiceCard from './ServiceCard';

export default function Services() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);

    useEffect(() => {
        if (titleRef.current) {
            staggerFadeIn(titleRef.current.children);
        }
    }, []);

    return (
        <section ref={sectionRef} className="section-padding bg-gray-50">
            <div className="container-custom">
                {/* Section Header */}
                <div ref={titleRef} className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-4 text-gray-900"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        Our <span className="gradient-text">Services</span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Comprehensive roofing solutions for residential and commercial properties
                    </motion.p>
                </div>

                {/* Services Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {SERVICES.map((service, index) => (
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
                    className="mt-16 text-center"
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: 0.4 }}
                >
                    <p className="text-lg text-gray-700 mb-6">
                        Don't see what you're looking for? We offer custom solutions for unique roofing needs.
                    </p>
                    <motion.a
                        href="/contact"
                        className="btn btn-primary text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Request Custom Quote
                    </motion.a>
                </motion.div>
            </div>
        </section>
    );
}
