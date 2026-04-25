import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronDown } from 'react-icons/hi';
import { gsap } from 'gsap';
import Link from 'next/link';

// ✅ Local images
import banner1 from '@/assets/aw-banner-1.jpg';
import banner2 from '@/assets/aw-banner-2.jpg';
import banner3 from '@/assets/aw-banner-3.jpg';

export default function Hero() {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const ctaRef = useRef(null);

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
    }, []);

    // GSAP animation
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.fromTo(
                titleRef.current.children,
                { y: 80, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 1,
                    stagger: 0.15,
                    ease: 'power4.out',
                }
            );

            gsap.fromTo(
                ctaRef.current,
                { y: 30, opacity: 0 },
                {
                    y: 0,
                    opacity: 1,
                    duration: 0.8,
                    delay: 0.8,
                    ease: 'power3.out',
                }
            );
        }, heroRef);

        return () => ctx.revert();
    }, []);

    const scrollToContent = () => {
        window.scrollTo({
            top: window.innerHeight,
            behavior: 'smooth',
        });
    };

    return (
        <section
            ref={heroRef}
            className="relative min-h-[calc(100vh-4rem)] flex items-center justify-center overflow-hidden"
        >
            {/* Background slider */}
            <div className="absolute inset-0 z-0">
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0 bg-cover bg-center"
                        style={{
                            backgroundImage: `url(${slides[currentSlide].image.src})`,
                        }}
                    />
                </AnimatePresence>

                <div className="absolute inset-0 bg-black/30" />
            </div>

            {/* Content */}
            <div className="relative text-center px-4 max-w-4xl mx-auto text-white">
                <div ref={titleRef} className="mb-6">
                    <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        <span className="block mb-3">
                            Welcome to Mainstreet Roofing LTD
                        </span>

                        <AnimatePresence mode="wait">
                            <motion.span
                                key={currentSlide}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.6 }}
                                className="block text-accent-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl"
                            >
                                {slides[currentSlide].headline}
                            </motion.span>
                        </AnimatePresence>
                    </h2>
                </div>

                {/* CTA Button */}
                <div ref={ctaRef} className="mt-8 flex justify-center">
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
