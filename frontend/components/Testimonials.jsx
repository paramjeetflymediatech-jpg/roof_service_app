import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiChevronLeft, HiChevronRight, HiStar } from 'react-icons/hi';
import { TESTIMONIALS } from '@/lib/constants';

export default function Testimonials() {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            handleNext();
        }, 5000);

        return () => clearInterval(timer);
    }, [currentIndex]);

    const handleNext = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % TESTIMONIALS.length);
    };

    const handlePrev = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + TESTIMONIALS.length) % TESTIMONIALS.length);
    };

    const slideVariants = {
        enter: (direction) => ({
            x: direction > 0 ? 1000 : -1000,
            opacity: 0,
        }),
        center: {
            x: 0,
            opacity: 1,
        },
        exit: (direction) => ({
            x: direction < 0 ? 1000 : -1000,
            opacity: 0,
        }),
    };

    return (
        <section className="section-padding bg-gradient-to-br from-primary-50 to-accent-50">
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
                        What Our <span className="gradient-text">Customers Say</span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        Don't just take our word for it - hear from our satisfied customers
                    </motion.p>
                </div>

                {/* Testimonial Carousel */}
                <div className="relative max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-12 min-h-[300px] flex items-center">
                        <AnimatePresence initial={false} custom={direction} mode="wait">
                            <motion.div
                                key={currentIndex}
                                custom={direction}
                                variants={slideVariants}
                                initial="enter"
                                animate="center"
                                exit="exit"
                                transition={{
                                    x: { type: 'spring', stiffness: 300, damping: 30 },
                                    opacity: { duration: 0.2 },
                                }}
                                className="w-full"
                            >
                                {/* Stars */}
                                <div className="flex justify-center mb-6">
                                    {[...Array(TESTIMONIALS[currentIndex].rating)].map((_, i) => (
                                        <HiStar key={i} className="text-3xl text-yellow-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-xl md:text-2xl text-gray-700 text-center mb-8 italic leading-relaxed">
                                    "{TESTIMONIALS[currentIndex].text}"
                                </p>

                                {/* Author */}
                                <div className="text-center">
                                    <p className="font-bold text-lg text-gray-900">
                                        {TESTIMONIALS[currentIndex].name}
                                    </p>
                                    <p className="text-gray-600">{TESTIMONIALS[currentIndex].location}</p>
                                </div>
                            </motion.div>
                        </AnimatePresence>
                    </div>

                    {/* Navigation Buttons */}
                    <button
                        onClick={handlePrev}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 md:-translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300"
                        aria-label="Previous testimonial"
                    >
                        <HiChevronLeft className="text-2xl" />
                    </button>
                    <button
                        onClick={handleNext}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 md:translate-x-12 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-primary-600 hover:bg-primary-600 hover:text-white transition-all duration-300"
                        aria-label="Next testimonial"
                    >
                        <HiChevronRight className="text-2xl" />
                    </button>

                    {/* Dots Indicator */}
                    <div className="flex justify-center gap-2 mt-8">
                        {TESTIMONIALS.map((_, index) => (
                            <button
                                key={index}
                                onClick={() => {
                                    setDirection(index > currentIndex ? 1 : -1);
                                    setCurrentIndex(index);
                                }}
                                className={`w-3 h-3 rounded-full transition-all duration-300 ${index === currentIndex
                                        ? 'bg-primary-600 w-8'
                                        : 'bg-gray-300 hover:bg-gray-400'
                                    }`}
                                aria-label={`Go to testimonial ${index + 1}`}
                            />
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}
