import { motion } from 'framer-motion';
import { HiStar, HiChatAlt2 } from 'react-icons/hi';
import { TESTIMONIALS } from '@/lib/constants';

export default function Testimonials() {
    return (
        <section className="section-padding bg-gray-50 overflow-hidden">
            <div className="container-custom">
                {/* Section Header */}
                <div className="text-center mb-16">
                    <motion.h2
                        className="text-4xl md:text-5xl font-bold mb-4 text-gray-900 uppercase tracking-tight"
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

                {/* Testimonial Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                    {TESTIMONIALS.slice(0, 4).map((testimonial, index) => (
                        <motion.div
                            key={testimonial.id}
                            initial={{ opacity: 0, y: 30 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.5, delay: index * 0.1 }}
                            className="bg-white p-8 rounded-2xl shadow-lg border border-gray-100 flex flex-col relative group hover:shadow-2xl transition-all duration-300"
                        >
                            <div className="text-primary/10 absolute top-6 right-8">
                                <HiChatAlt2 size={40} />
                            </div>

                            {/* Stars */}
                            <div className="flex gap-1 mb-6">
                                {[...Array(testimonial.rating)].map((_, i) => (
                                    <HiStar key={i} className="text-xl text-yellow-400" />
                                ))}
                            </div>

                            {/* Quote */}
                            <p className="text-gray-700 mb-8 italic flex-grow leading-relaxed">
                                "{testimonial.text}"
                            </p>

                            {/* Author */}
                            <div className="border-t border-gray-50 pt-6">
                                <p className="font-bold text-gray-900 uppercase text-sm tracking-wider">
                                    {testimonial.name}
                                </p>
                                <p className="text-primary font-semibold text-xs mt-1">
                                    {testimonial.location}
                                </p>
                            </div>
                        </motion.div>
                    ))}
                </div>
            </div>
        </section>
    );
}
