import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion } from 'framer-motion';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function SolarServices() {
    const sectionRef = useRef(null);
    const imageRef = useRef(null);
    const benefitsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Parallax image effect
            gsap.to(imageRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
                y: -150,
                ease: 'none',
            });

            // Benefits cards stagger
            gsap.from(benefitsRef.current, {
                scrollTrigger: {
                    trigger: benefitsRef.current[0],
                    start: 'top 80%',
                },
                opacity: 0,
                y: 50,
                stagger: 0.2,
                duration: 1,
                ease: 'power3.out',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const benefits = [
        {
            icon: '☀️',
            title: 'Reduce Energy Bills',
            description: 'Save up to 70% on your monthly electricity costs with solar power.',
        },
        {
            icon: '🌍',
            title: 'Eco-Friendly',
            description: 'Reduce your carbon footprint and contribute to a cleaner environment.',
        },
        {
            icon: '💰',
            title: 'Tax Incentives',
            description: 'Take advantage of federal and state tax credits for solar installation.',
        },
        {
            icon: '🏠',
            title: 'Increase Home Value',
            description: 'Solar panels can increase your property value by up to 4%.',
        },
    ];

    return (
        <section ref={sectionRef} id="solar" className="relative py-24 bg-white overflow-hidden">
            <div className="container-custom">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                    {/* Left: Content */}
                    <div>
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.8 }}
                        >
                            <h2 className="text-4xl md:text-5xl font-bold mb-6 text-gray-900">
                                Solar <span className="gradient-text">Energy Solutions</span>
                            </h2>
                            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
                                Harness the power of the sun with our premium solar panel installation services.
                                We provide end-to-end solutions from consultation to installation and maintenance.
                            </p>

                            {/* Benefits Grid */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
                                {benefits.map((benefit, index) => (
                                    <div
                                        key={index}
                                        ref={(el) => (benefitsRef.current[index] = el)}
                                        className="flex items-start gap-3"
                                    >
                                        <div className="text-4xl">{benefit.icon}</div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 mb-1">{benefit.title}</h3>
                                            <p className="text-sm text-gray-600">{benefit.description}</p>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <motion.a
                                href="/contact"
                                className="btn btn-primary"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Get Solar Quote
                            </motion.a>
                        </motion.div>
                    </div>

                    {/* Right: Image with Parallax */}
                    <div className="relative h-[600px] rounded-2xl overflow-hidden shadow-2xl">
                        <div
                            ref={imageRef}
                            className="absolute inset-0 w-full h-[120%] bg-cover bg-center"
                            style={{
                                backgroundImage:
                                    "url('https://images.unsplash.com/photo-1509391366360-2e959784a276?q=80&w=2072')",
                            }}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/40 to-transparent" />

                        {/* Floating Stats */}
                        <motion.div
                            className="absolute bottom-8 left-8 right-8 bg-white/90 backdrop-blur-sm rounded-xl p-6"
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ delay: 0.5 }}
                        >
                            <div className="grid grid-cols-3 gap-4 text-center">
                                <div>
                                    <div className="text-3xl font-bold text-primary-600">500+</div>
                                    <div className="text-xs text-gray-600">Installations</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-accent-600">25yr</div>
                                    <div className="text-xs text-gray-600">Warranty</div>
                                </div>
                                <div>
                                    <div className="text-3xl font-bold text-primary-600">70%</div>
                                    <div className="text-xs text-gray-600">Savings</div>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </section>
    );
}
