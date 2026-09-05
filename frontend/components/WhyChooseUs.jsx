import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { WHY_CHOOSE_US, STATS } from '@/lib/constants';

function StatCounter({ value, suffix, label }) {
    const [count, setCount] = useState(0);
    const ref = useRef(null);

    useEffect(() => {
        let startTime = null;
        let animationFrameId;
        const duration = 1500;

        const observer = new IntersectionObserver(([entry]) => {
            if (entry.isIntersecting) {
                const animate = (timestamp) => {
                    if (!startTime) startTime = timestamp;
                    const progress = Math.min((timestamp - startTime) / duration, 1);
                    setCount(Math.floor(progress * value));
                    if (progress < 1) {
                        animationFrameId = requestAnimationFrame(animate);
                    }
                };
                animationFrameId = requestAnimationFrame(animate);
                observer.disconnect();
            }
        }, { threshold: 0.3 });

        if (ref.current) observer.observe(ref.current);

        return () => {
            observer.disconnect();
            if (animationFrameId) cancelAnimationFrame(animationFrameId);
        };
    }, [value]);

    return (
        <div ref={ref} className="text-center">
            <div className="text-4xl md:text-5xl font-bold text-primary-600 mb-2">
                <span>{count}</span>
                {suffix}
            </div>
            <div className="text-gray-600 font-medium">{label}</div>
        </div>
    );
}

export default function WhyChooseUs() {

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
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.5 }}
                    >
                        Why Choose <span className="gradient-text">Us</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Experience the difference of working with true roofing professionals
                    </p>
                </div>

                {/* Stats Section */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-16">
                    {STATS.map((stat, index) => (
                        <StatCounter
                            key={index}
                            value={stat.value}
                            suffix={stat.suffix}
                            label={stat.label}
                        />
                    ))}
                </div>

                {/* Features Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {WHY_CHOOSE_US.map((feature, index) => (
                        <motion.div
                            key={feature.id}
                            className="flex items-start gap-4 p-6 rounded-xl bg-gray-50 hover:bg-white hover:shadow-lg transition-all duration-300"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.4, delay: index * 0.05 }}
                            whileHover={{ y: -4 }}
                        >
                            <div className="flex-shrink-0 w-14 h-14 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl flex items-center justify-center text-2xl shadow-md">
                                {iconMap[feature.icon] || '✨'}
                            </div>
                            <div>
                                <h3 className="text-xl font-bold mb-2 text-gray-900">{feature.title}</h3>
                                <p className="text-gray-600">{feature.description}</p>
                            </div>
                        </motion.div>
                    ))}
                </div>

                {/* Image Section */}
                <div className="mt-16 rounded-2xl overflow-hidden shadow-2xl relative h-96">
                    <Image
                        src="https://images.unsplash.com/photo-1590482161867-1ff8e3c97a6e?q=80&w=1200"
                        alt="Roofing consultation"
                        fill
                        sizes="(max-width: 768px) 100vw, 1200px"
                        className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-primary-900/90 to-accent-900/80 z-10" />
                    <div className="relative z-20 h-full flex items-center justify-center text-white text-center p-8">
                        <div>
                            <h3 className="text-3xl md:text-4xl font-bold mb-4">
                                Ready to Get Started?
                            </h3>
                            <p className="text-xl mb-8 max-w-2xl mx-auto text-gray-100">
                                Get a free, no-obligation quote for your roofing project today
                            </p>
                            <Link
                                href="/contact"
                                className="btn btn-outline text-lg inline-block transition-transform duration-300 hover:scale-105"
                            >
                                Get Free Estimate
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
