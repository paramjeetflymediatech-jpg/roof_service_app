import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiPlus, HiMinus } from 'react-icons/hi';
import Head from 'next/head';
import { FAQS, getFAQSchema } from '@/lib/constants';

const FaqItem = ({ question, answer, isOpen, onClick }) => {
    return (
        <div className="border-b border-gray-200 last:border-0">
            <button
                className="w-full py-4 md:py-6 flex justify-between items-center text-left hover:text-primary transition-colors duration-200 group"
                onClick={onClick}
                aria-expanded={isOpen}
            >
                <span className={`text-base md:text-lg font-semibold ${isOpen ? 'text-primary' : 'text-gray-900'} group-hover:text-primary transition-colors pr-4`}>
                    {question}
                </span>
                <span className={`flex-shrink-0 p-2 rounded-full transition-all duration-300 ${isOpen ? 'bg-primary text-white rotate-0' : 'bg-gray-100 text-gray-500 hover:bg-gray-200'}`}>
                    {isOpen ? <HiMinus size={18} /> : <HiPlus size={18} />}
                </span>
            </button>
            <AnimatePresence initial={false}>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="overflow-hidden"
                    >
                        <div className="pb-6 md:pb-8 text-gray-600 leading-relaxed text-sm md:text-base">
                            {answer}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default function Faq({ data = FAQS, title = "Questions", highlight = "Have" }) {
    const [openIndex, setOpenIndex] = useState(0);
    const faqSchema = getFAQSchema(data);

    return (
        <>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
            </Head>
            <section className="section-padding bg-white" id="faq">
                <div className="container-custom">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-16">
                        {/* Left Column - Content */}
                        <div className="lg:w-1/3">
                            <motion.div
                                initial={{ opacity: 0, x: -30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6 }}
                                className="lg:sticky lg:top-24"
                            >
                                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6 text-gray-900 uppercase tracking-tight">
                                    {highlight} <span className="gradient-text">{title}</span>?
                                </h2>
                                <p className="text-base md:text-lg text-gray-600 mb-8">
                                    Here are some of the most frequently asked questions about our roofing services. If you don't find what you're looking for, feel free to contact us.
                                </p>
                                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 hidden md:block">
                                    <h4 className="font-bold text-gray-900 mb-2 font-secondary uppercase text-sm tracking-wider">Still need help?</h4>
                                    <p className="text-gray-600 text-sm mb-4 leading-relaxed">Our expert team is always ready to assist you with your roofing needs.</p>
                                    <a
                                        href="/contact"
                                        className="inline-flex items-center text-primary font-bold hover:gap-2 transition-all duration-300 text-sm"
                                    >
                                        CONTACT US NOW <span className="ml-1 text-lg">→</span>
                                    </a>
                                </div>
                            </motion.div>
                        </div>

                        {/* Right Column - Accordion */}
                        <div className="lg:w-2/3">
                            <motion.div
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.6, delay: 0.2 }}
                                className="bg-white rounded-3xl p-6 md:p-10 shadow-[0_0_50px_rgba(0,0,0,0.03)] border border-gray-100"
                            >
                                {data.map((faq, index) => (
                                    <FaqItem
                                        key={index}
                                        question={faq.question}
                                        answer={faq.answer}
                                        isOpen={openIndex === index}
                                        onClick={() => setOpenIndex(openIndex === index ? -1 : index)}
                                    />
                                ))}
                            </motion.div>
                        </div>
                    </div>
                </div>
            </section>
        </>
    );
}
