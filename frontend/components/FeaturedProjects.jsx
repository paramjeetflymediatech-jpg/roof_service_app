import { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import Image from 'next/image';
import { HiX, HiChevronLeft, HiChevronRight } from 'react-icons/hi';
import { PROJECTS } from '@/lib/constants';

export default function FeaturedProjects() {
    const [selectedIndex, setSelectedIndex] = useState(null);

    // Show only first 4 projects
    const displayedProjects = PROJECTS.slice(0, 4);

    const nextImage = useCallback((e) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev + 1) % displayedProjects.length);
    }, [displayedProjects.length]);

    const prevImage = useCallback((e) => {
        e?.stopPropagation();
        setSelectedIndex((prev) => (prev - 1 + displayedProjects.length) % displayedProjects.length);
    }, [displayedProjects.length]);

    const closeLightbox = useCallback(() => {
        setSelectedIndex(null);
    }, []);

    // Keyboard navigation
    useEffect(() => {
        const handleKeyDown = (e) => {
            if (selectedIndex === null) return;
            if (e.key === 'ArrowRight') nextImage();
            if (e.key === 'ArrowLeft') prevImage();
            if (e.key === 'Escape') closeLightbox();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [selectedIndex, nextImage, prevImage, closeLightbox]);

    return (
        <section className="py-20 bg-gray-50">
            <div className="container-custom">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-12">
                    <div>
                        <p className="text-sm font-semibold text-accent-600 uppercase tracking-wide mb-2">
                            Our Projects
                        </p>
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">
                            Recently Completed <br className="hidden sm:block" />
                            Projects
                        </h2>
                    </div>

                    {/* More Project Button */}
                    <Link
                        href="/gallery"
                        className="mt-6 md:mt-0 inline-block bg-accent-600 text-white text-sm font-semibold px-6 py-3 rounded-full hover:bg-accent-700 transition"
                    >
                        More Project
                    </Link>
                </div>

                {/* Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {displayedProjects.map((project, index) => (
                        <div
                            key={project.id}
                            className="bg-white shadow-lg rounded-xl overflow-hidden group cursor-pointer"
                            onClick={() => setSelectedIndex(index)}
                        >
                            <div className="relative h-64 overflow-hidden">
                                <Image
                                    src={project.image}
                                    alt={project.title || "Mainstreet Roofing Project"}
                                    fill
                                    quality={75}
                                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                                    className="object-cover transform group-hover:scale-105 transition-transform duration-500"
                                />
                            </div>

                            <div className="p-6">
                                <h3 className="text-lg font-semibold text-accent-600">
                                    Mainstreet Roofing Ltd
                                </h3>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Lightbox / Fullscreen Viewer */}
            <AnimatePresence>
                {selectedIndex !== null && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeLightbox}
                        className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
                    >
                        {/* Close button */}
                        <button
                            onClick={closeLightbox}
                            className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
                        >
                            <HiX size={40} />
                        </button>

                        {/* Navigation Buttons */}
                        <button
                            onClick={prevImage}
                            className="absolute left-4 md:left-10 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 hover:bg-white/20 p-2 rounded-full"
                        >
                            <HiChevronLeft size={48} />
                        </button>
                        <button
                            onClick={nextImage}
                            className="absolute right-4 md:right-10 text-white/50 hover:text-white transition-colors z-[110] bg-white/10 hover:bg-white/20 p-2 rounded-full"
                        >
                            <HiChevronRight size={48} />
                        </button>

                        {/* Image Container */}
                        <motion.div
                            key={selectedIndex}
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="relative max-w-5xl w-full h-full flex items-center justify-center"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <img
                                src={displayedProjects[selectedIndex].image}
                                alt="Project"
                                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                            />
                            <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                                <p className="text-white text-lg font-medium">
                                    Mainstreet Roofing Ltd - {displayedProjects[selectedIndex].title}
                                </p>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </section>
    );
}
