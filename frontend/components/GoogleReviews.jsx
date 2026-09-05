import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { HiStar, HiChatAlt2 } from 'react-icons/hi';
import apiClient from '@/lib/apiClient';

export default function GoogleReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        let isMounted = true;
        const fetchReviews = async () => {
            try {
                const response = await apiClient.get('/reviews/public');
                if (response.data.success && isMounted) {
                    // Duplicate reviews for seamless infinite marquee loop
                    setReviews([...response.data.reviews, ...response.data.reviews]);
                }
            } catch (error) {
                console.error('Error fetching reviews:', error);
            } finally {
                if (isMounted) setLoading(false);
            }
        };
        fetchReviews();
        return () => { isMounted = false; };
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-primary"></div>
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
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                    >
                        Real Stories from <span className="gradient-text">Our Clients</span>
                    </motion.h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        See why we're highly rated on Google and trusted by homeowners across Canada.
                    </p>
                </div>

                {/* GPU-Accelerated CSS Marquee Container */}
                <div className="relative overflow-hidden">
                    <div className="animate-review-marquee flex gap-6 py-4">
                        {reviews.map((review, index) => (
                            <div 
                                key={`${review.id || index}-${index}`}
                                className="w-[300px] flex-shrink-0 bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col hover:shadow-2xl transition-all duration-300"
                            >
                                <div className="text-primary/10 mb-4">
                                    <HiChatAlt2 size={30} />
                                </div>

                                {/* Stars */}
                                <div className="flex gap-1 mb-4">
                                    {[...Array(review.rating || 5)].map((_, i) => (
                                        <HiStar key={i} className="text-lg text-yellow-400" />
                                    ))}
                                </div>

                                {/* Quote */}
                                <p className="text-gray-700 mb-6 italic text-sm leading-relaxed line-clamp-4 flex-grow">
                                    "{review.text}"
                                </p>

                                {/* Author */}
                                <div className="flex items-center gap-4 mt-auto border-t border-gray-50 pt-4">
                                    <img 
                                        src={review.profile_photo_url || "/assets/roofing-logo.png"} 
                                        alt={review.author_name || "Customer Review"}
                                        width={48}
                                        height={48}
                                        loading="lazy"
                                        referrerPolicy="no-referrer"
                                        className="w-12 h-12 rounded-full border-2 border-white shadow-sm object-cover"
                                    />
                                    <div className="min-w-0">
                                        <p className="font-bold text-gray-900 uppercase text-xs tracking-wider truncate">
                                            {review.author_name}
                                        </p>
                                        <p className="text-primary font-semibold text-[10px]">
                                            Verified Google Review
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Gradient Fade Overlays */}
                    <div className="absolute top-0 left-0 w-24 md:w-32 h-full bg-gradient-to-r from-gray-50 to-transparent z-20 pointer-events-none"></div>
                    <div className="absolute top-0 right-0 w-24 md:w-32 h-full bg-gradient-to-l from-gray-50 to-transparent z-20 pointer-events-none"></div>
                </div>
            </div>

            {/* Background Decoration */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/5 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/5 rounded-full translate-y-1/2 -translate-x-1/2 blur-3xl pointer-events-none"></div>
        </section>
    );
}
