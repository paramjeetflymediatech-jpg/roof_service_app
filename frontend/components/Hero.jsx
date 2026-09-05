import { useEffect, useState } from 'react';
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
            {/* Background slider with CSS cross-fade for instant LCP */}
            <div className="absolute inset-0 z-0 overflow-hidden">
                {slides.map((slide, index) => (
                    <div
                        key={index}
                        className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${
                            currentSlide === index ? 'opacity-100 z-10' : 'opacity-0 z-0 pointer-events-none'
                        }`}
                    >
                        <Image
                            src={slide.image}
                            alt={slide.headline}
                            fill
                            priority={index === 0}
                            loading={index === 0 ? "eager" : "lazy"}
                            quality={75}
                            sizes="(max-width: 768px) 100vw, 100vw"
                            className="object-cover object-center"
                        />
                    </div>
                ))}

                <div className="absolute inset-0 bg-black/40 z-20 pointer-events-none" />
            </div>

            {/* Content */}
            <div className="relative z-30 text-center px-4 max-w-4xl mx-auto text-white">
                <div className="mb-6">
                    <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold leading-tight">
                        <span className="block mb-3">
                            Welcome to Mainstreet Roofing LTD
                        </span>
                        <span className="block text-accent-400 text-2xl sm:text-3xl md:text-4xl lg:text-5xl min-h-[1.3em] transition-all duration-500">
                            {slides[currentSlide].headline}
                        </span>
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
