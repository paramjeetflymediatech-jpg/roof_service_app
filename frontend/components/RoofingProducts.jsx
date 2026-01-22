import { useEffect, useRef } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/dist/ScrollTrigger';
import { motion } from 'framer-motion';

if (typeof window !== 'undefined') {
    gsap.registerPlugin(ScrollTrigger);
}

export default function RoofingProducts() {
    const sectionRef = useRef(null);
    const imageRef = useRef(null);
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

            // Background image parallax
            gsap.to(imageRef.current, {
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top bottom',
                    end: 'bottom top',
                    scrub: 1,
                },
                backgroundPosition: '50% 100%',
                ease: 'none',
            });

            // Cards batch animation
            ScrollTrigger.batch(cardsRef.current, {
                onEnter: (batch) =>
                    gsap.to(batch, {
                        duration: 1,
                        opacity: 1,
                        y: 0,
                        stagger: 0.15,
                        overwrite: true,
                    }),
                onLeave: (batch) => gsap.set(batch, { opacity: 0, y: -100, overwrite: true }),
                onEnterBack: (batch) => gsap.to(batch, { opacity: 1, y: 0, stagger: 0.15, overwrite: true }),
                onLeaveBack: (batch) => gsap.set(batch, { opacity: 0, y: 100, overwrite: true }),
                start: 'top 80%',
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
            fallbackImage: 'https://images.unsplash.com/photo-1590482161867-1ff8e3c97a6e?auto=format&fit=crop&w=2070&q=80',
            features: ['25-30 Year Warranty', 'Wind Resistant', 'Energy Efficient'],
        },
        {
            id: 2,
            title: 'Metal Roofing',
            description: 'Long-lasting, eco-friendly roofing with superior durability and modern aesthetics.',
            image: '/assets/metal-roofing.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=2070&q=80',
            features: ['50+ Year Lifespan', 'Fire Resistant', 'Low Maintenance'],
        },
        {
            id: 3,
            title: 'Tile Roofing',
            description: 'Mainstreet Roofing Ltd option offering timeless beauty and exceptional longevity.',
            image: '/assets/tile-roofing.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1513467535987-fd81bc7d62f8?auto=format&fit=crop&w=2070&q=80',
            features: ['Lifetime Durability', 'Weather Resistant', 'Classic Style'],
        },
        {
            id: 4,
            title: 'Flat Roofing',
            description: 'Modern commercial roofing solution with excellent waterproofing and accessibility.',
            image: '/assets/flat-roofing.jpg',
            fallbackImage: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=2070&q=80',
            features: ['TPO & EPDM Options', 'Easy Maintenance', 'Cost Effective'],
        },
    ];

    return (
        <section ref={sectionRef} id="products" className="relative py-24 bg-gray-50 overflow-hidden">
            {/* Background Image with Parallax */}
            <div
                ref={imageRef}
                className="absolute inset-0 opacity-10"
                style={{
                    backgroundImage: "url('/assets/roofing-background.jpg'), url('https://images.unsplash.com/photo-1590482161867-1ff8e3c97a6e?auto=format&fit=crop&w=2070&q=80')",
                    backgroundSize: 'cover',
                    backgroundPosition: '50% 0%',
                }}
            />

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
                            className="opacity-0 translate-y-20"
                        >
                            <motion.div
                                className="bg-white rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 group"
                                whileHover={{ y: -10 }}
                            >
                                {/* Product Image */}
                                <div className="relative h-64 overflow-hidden">
                                    <div
                                        className="absolute inset-0 bg-cover bg-center transform group-hover:scale-110 transition-transform duration-500"
                                        style={{ backgroundImage: `url('${product.image}')` }}
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-dark-900/80 to-transparent" />
                                    <div className="absolute bottom-4 left-4 right-4">
                                        <h3 className="text-2xl font-bold text-white">{product.title}</h3>
                                    </div>
                                </div>

                                {/* Product Content */}
                                <div className="p-6">
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
                    <motion.a
                        href="/contact"
                        className="btn btn-primary text-lg"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        Request Product Consultation
                    </motion.a>
                </div>
            </div>
        </section>
    );
}
