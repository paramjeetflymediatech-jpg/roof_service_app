import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';

// Local images
import banner1 from '@/assets/aw-banner-1.jpg';
import banner2 from '@/assets/aw-banner-2.jpg';
import banner3 from '@/assets/aw-banner-3.jpg';

export default function Hero() {
    const [currentSlide, setCurrentSlide] = useState(0);

    const slides = [
        { image: banner1, headline: 'Premium Roofing Solutions' },
        { image: banner2, headline: 'Expert Leak Repair' },
        { image: banner3, headline: 'Best Roofer Contractor' },
    ];

    // Auto slide
    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev + 1) % slides.length);
        }, 5000);

        return () => clearInterval(interval);
    }, [slides.length]);

    return (
        <section
            className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
        >
            {/* Background slider with Next.js Image for top LCP performance */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.0 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slides[currentSlide].image}
                            alt={slides[currentSlide].headline}
                            fill
                            priority={currentSlide === 0}
                            quality={75}
                            sizes="100vw"
                            className="object-cover object-center"
                        />
                    </motion.div>
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/40 z-10" />
            </div>

            {/* Content */}
            <div className="relative z-20 text-center px-4 max-w-4xl mx-auto text-white">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        <span className="block mb-3">
                            Welcome to Mainstreet Roofing LTD
                        </span>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentSlide}
                                initial={{ opacity: 0, y: 15 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -15 }}
                                transition={{ duration: 0.4 }}
                                className="block text-accent-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                            >
                                {slides[currentSlide].headline}
                            </motion.span>
                        </AnimatePresence>
                    </h1>
                </div>

                {/* CTA Button */}
                <div className="mt-8 flex justify-center">
                    <Link
                        href="/contact"
                        className="bg-accent-500 hover:bg-accent-600 text-white text-base sm:text-lg font-semibold px-8 py-4 rounded-lg shadow-xl transition-transform duration-300 hover:scale-105"
                    >
                        Our Solution
                    </Link>
                </div>
            </div>
        </section>
    );
}
