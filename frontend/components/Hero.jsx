import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import backgroundImage from '@/assets/roofing-background.jpg';
import { HiChevronDown } from 'react-icons/hi';
import { gsap } from 'gsap';
import Button from './Button';

export default function Hero() {
    const heroRef = useRef(null);
    const titleRef = useRef(null);
    const subtitleRef = useRef(null);
    const ctaRef = useRef(null);


    useEffect(() => {
        const ctx = gsap.context(() => {
            // Animate title
            gsap.fromTo(
                titleRef.current.children,
                {
                    y: 100,
                    opacity: 0,
                },
                {
                    duration: 1,
                    y: 0,
                    opacity: 1,
                    stagger: 0.1,
                    ease: 'power4.out',
                    delay: 0.3,
                }
            );

            // Animate subtitle
            gsap.fromTo(
                subtitleRef.current,
                {
                    y: 30,
                    opacity: 0,
                },
                {
                    duration: 0.8,
                    y: 0,
                    opacity: 1,
                    ease: 'power3.out',
                    delay: 0.8,
                }
            );

            // Animate CTA buttons
            gsap.fromTo(
                ctaRef.current.children,
                {
                    y: 20,
                    opacity: 0,
                },
                {
                    duration: 0.6,
                    y: 0,
                    opacity: 1,
                    stagger: 0.15,
                    ease: 'power3.out',
                    delay: 1.2,
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
            className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-dark-900 via-dark-800 to-primary-900"
        >
            {/* Background Image with Overlay */}
            <div className="absolute inset-0 z-0">
                <div
                    className="absolute inset-0 bg-cover bg-center bg-no-repeat"
                    style={{
                        backgroundImage: `url(${backgroundImage.src})`,
                    }}
                />
                <div className="overlay" />
            </div>

            {/* Animated Background Elements */}
            <div className="absolute inset-0 z-0 opacity-20">
                <motion.div
                    className="absolute top-20 left-10 w-72 h-72 bg-accent-500 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.2, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 8,
                        repeat: Infinity,
                        ease: 'easeInOut',
                    }}
                />
                <motion.div
                    className="absolute bottom-20 right-10 w-96 h-96 bg-primary-500 rounded-full blur-3xl"
                    animate={{
                        scale: [1, 1.3, 1],
                        opacity: [0.3, 0.5, 0.3],
                    }}
                    transition={{
                        duration: 10,
                        repeat: Infinity,
                        ease: 'easeInOut',
                        delay: 1,
                    }}
                />
            </div>

            {/* Content */}
            <div className="relative z-10 container-custom text-center text-white px-4">
                <div ref={titleRef} className="mb-6 overflow-hidden">
                    <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold font-heading text-shadow-lg">
                        <span className="block">Premium Roofing</span>
                        <span className="block gradient-text bg-gradient-to-r from-accent-400 to-accent-600">
                            Solutions
                        </span>
                    </h1>
                </div>

                <p
                    ref={subtitleRef}
                    className="text-xl md:text-2xl mb-10 max-w-3xl mx-auto text-gray-200 text-shadow"
                >
                    Protecting your home with expert craftsmanship and quality materials.
                    Licensed, insured, and trusted by thousands of homeowners.
                </p>

                <div ref={ctaRef} className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                    <Button variant="primary" href="/contact" className="text-lg px-8 py-4">
                        Get a Free Quote
                    </Button>
                    <Button variant="outline" href="/services" className="text-lg px-8 py-4">
                        Our Services
                    </Button>
                </div>

                {/* Trust Badges */}
                <div className="mt-16 flex flex-wrap justify-center gap-8 text-sm">
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-2xl">✓</span>
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Licensed & Insured</div>
                            <div className="text-gray-300 text-xs">Fully Certified</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-2xl">⭐</span>
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">5-Star Rated</div>
                            <div className="text-gray-300 text-xs">1000+ Reviews</div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-12 h-12 bg-white/10 backdrop-blur-sm rounded-full flex items-center justify-center">
                            <span className="text-2xl">🛡️</span>
                        </div>
                        <div className="text-left">
                            <div className="font-semibold">Lifetime Warranty</div>
                            <div className="text-gray-300 text-xs">On All Work</div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Scroll Indicator */}
            <motion.button
                onClick={scrollToContent}
                className="absolute bottom-10 left-1/2 transform -translate-x-1/2 z-10 text-white cursor-pointer"
                animate={{ y: [0, 10, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
                <HiChevronDown className="text-4xl" />
            </motion.button>
        </section>
    );
}
