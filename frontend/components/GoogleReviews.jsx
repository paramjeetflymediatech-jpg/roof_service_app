import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiStar, HiChatAlt2, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import apiClient from '@/lib/apiClient';

export default function GoogleReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentIndex, setCurrentIndex] = useState(0);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                const response = await apiClient.get('/reviews/public');
                if (response.data.success) {
                    setReviews(response.data.reviews);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                setLoading(false);
            }
        };
        fetchReviews();
    }, []);

    const nextReview = () => {
        setCurrentIndex((prev) => (prev + 1) % reviews.length);
    };

    const prevReview = () => {
        setCurrentIndex((prev) => (prev - 1 + reviews.length) % reviews.length);
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        );
    }

    if (reviews.length === 0) {
        return null;
    }

    return (
        <section className="section-padding bg-gray-50 overflow-hidden relative">
            <div className="container-custom relative z-10">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 uppercase tracking-tight"
                        initial={{ opacity: 0, y: 30 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Real Stories from <span className="gradient-text">Our Clients</span>
                    </motion.h2>
                    <motion.p
                        className="text-xl text-gray-600 max-w-2xl mx-auto"
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        See why we're highly rated on Google and trusted by homeowners across Canada.
                    </motion.p>
                </div>

                {/* Testimonial Slider */}
                <div className="relative max-w-4xl mx-auto px-12">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentIndex}
                            initial={{ opacity: 0, x: 50 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -50 }}
                            className="bg-white p-10 md:p-16 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center text-center relative"
                        >
                            <div className="text-primary/10 absolute top-8 left-8">
                                <HiChatAlt2 size={60} />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(reviews[currentIndex].rating)].map((_, i) => (
                                    <HiStar key={i} className="text-2xl text-yellow-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-xl md:text-2xl text-gray-700 mb-10 italic leading-relaxed">
                                "{reviews[currentIndex].text}"
                            </p>

                            {/* Author */}
                            <div className="flex flex-col items-center mt-auto">
                                <img 
                                    src={reviews[currentIndex].authorPhoto} 
                                    alt={reviews[currentIndex].authorName}
                                    className="w-16 h-16 rounded-full border-4 border-white shadow-md mb-4"
                                />
                                <p className="font-bold text-gray-900 uppercase text-lg tracking-wider">
                                    {reviews[currentIndex].authorName}
                                </p>
                                <p className="text-primary font-semibold text-sm">
                                    Verified Google Review
                                </p>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Navigation Buttons */}
                    <button 
                        onClick={prevReview}
                        className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary transition-colors z-20"
                    >
                        <HiChevronLeft size={24} />
                    </button>
                    <button 
                        onClick={nextReview}
                        className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-4 w-12 h-12 bg-white rounded-full shadow-lg flex items-center justify-center text-gray-600 hover:text-primary transition-colors z-20"
                    >
                        <HiChevronRight size={24} />
                    </button>
                </div>

                {/* Progress Indicators */}
                <div className="flex justify-center gap-2 mt-8">
                    {reviews.map((_, i) => (
                        <button
                            key={i}
                            onClick={() => setCurrentIndex(i)}
                            className={`h-2 transition-all duration-300 rounded-full ${i === currentIndex ? 'w-8 bg-primary' : 'w-2 bg-gray-300'}`}
                        />
                    ))}
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl"></div>
        </section>
    );
}
