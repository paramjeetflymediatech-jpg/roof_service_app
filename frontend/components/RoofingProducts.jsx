import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function RoofingProducts() {
    const sectionRef = useRef(null);
    const titleRef = useRef(null);
    const cardsRef = useRef([]);

    useEffect(() => {
        const ctx = gsap.context(() => {
            // Title animation
            gsap.from(titleRef.current, {
                scrollTrigger: {
                    trigger: titleRef.current,
                    start: 'top 80%',
                    end: 'top 50%',
                    scrub: 1,
                },
                opacity: 0,
                scale: 0.9,
                ease: 'power2.out',
            });

            // Cards batch animation
            ScrollTrigger.batch(cardsRef.current, {
                onEnter: (batch) =>
                    gsap.to(batch, {
                        duration: 0.8,
                        opacity: 1,
                        y: 0,
                        stagger: 0.12,
                        overwrite: true,
                    }),
                onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -50, overwrite: true }),
                onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.12, overwrite: true }),
                onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 50, overwrite: true }),
                start: 'top 85%',
            });
        }, sectionRef);

        return () => ctx.revert();
    }, []);

    const products = [
        {
            id: 1,
            title: 'Asphalt Shingles',
            description: 'Durable and cost-effective roofing solution with a wide variety of colors and styles.',
            image: '/assets/asphalt-shingles.jpg',
            features: ['25-30 Year Warranty', 'Wind Resistant', 'Energy Efficient'],
        },
        {
            id: 2,
            title: 'Metal Roofing',
            description: 'Long-lasting, eco-friendly roofing with superior durability and modern aesthetics.',
            image: '/assets/metal-roofing.jpg',
            features: ['50+ Year Lifespan', 'Fire Resistant', 'Low Maintenance'],
        },
        {
            id: 3,
            title: 'Tile Roofing',
            description: 'Mainstreet Roofing Ltd option offering timeless beauty and exceptional longevity.',
            image: '/assets/tile-roofing.jpg',
            features: ['Lifetime Durability', 'Weather Resistant', 'Classic Style'],
        },
        {
            id: 4,
            title: 'Flat Roofing',
            description: 'Modern commercial roofing solution with excellent waterproofing and accessibility.',
            image: '/assets/flat-roofing.jpg',
            features: ['TPO & EPDM Options', 'Easy Maintenance', 'Cost Effective'],
        },
    ];

    return (
        <section ref={sectionRef} id="products" className="relative py-24 bg-gray-50 overflow-hidden">
            <div className="container-custom relative z-10">
                {/* Section Title */}
                <div ref={titleRef} className="text-center mb-16">
                    <motion.div
                        className="text-6xl font-bold mb-4 text-primary-600"
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        viewport={{ once: true }}
                    >
                        &#8220;
                    </motion.div>
                    <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                        Premium <span className="gradient-text">Roofing Products</span>
                    </h2>
                    <p className="text-xl text-gray-600 max-w-3xl mx-auto italic">
                        Quality materials designed to protect your investment for decades
                    </p>
                </div>

                {/* Products Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
                    {products.map((product, index) => (
                        <div
                            key={product.id}
                            ref={(el) => (cardsRef.current[index] = el)}
                            className="opacity-0 translate-y-12"
                        >
                            <motion.div
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group h-full flex flex-col"
                                whileHover={{ y: -6 }}
                            >
                                {/* Product Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <Image
                                        src={product.image}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, 50vw"
                                        className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent pointer-events-none" />
                                    <div className="absolute bottom-4 left-4 right-4 z-10">
                                        <h3 className="text-2xl font-bold text-white">{product.title}</h3>
                                    </div>
                                </div>

                                {/* Product Content */}
                                <div className="p-6 flex-1 flex flex-col justify-between">
                                    <p className="text-gray-700 mb-4">{product.description}</p>
                                    <ul className="space-y-2">
                                        {product.features.map((feature, idx) => (
                                            <li key={idx} className="flex items-center text-sm text-gray-600">
                                                <span className="text-accent-500 mr-2">✓</span>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            </motion.div>
                        </div>
                    ))}
                </div>

                {/* CTA */}
                <div className="text-center">
                    <Link
                        href="/contact"
                        className="btn btn-primary text-lg inline-block transition-transform duration-300 hover:scale-105"
                    >
                        Request Product Consultation
                    </Link>
                </div>
            </div>
        </section>
    );
}
