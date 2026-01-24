'use client';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';
import { HiPhone, HiChevronRight, HiX, HiChevronLeft } from 'react-icons/hi';
import { COMPANY_INFO, PROJECTS } from '@/lib/constants';
import LayoutShell from '@/components/LayoutShell';
import { useState, useCallback, useEffect } from 'react';
import { useSeo } from '@/hooks/useSeo';

export default function GalleryPage() {
  // Load SEO meta tags for gallery page
  useSeo('gallery');

  const [selectedIndex, setSelectedIndex] = useState(null);

  const nextImage = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev + 1) % PROJECTS.length);
  }, []);

  const prevImage = useCallback((e) => {
    e?.stopPropagation();
    setSelectedIndex((prev) => (prev - 1 + PROJECTS.length) % PROJECTS.length);
  }, []);

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
    <LayoutShell>
      {/* Hero Section */}
      <div className="relative h-80 bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('/assets/project-1.jpg')", backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/60"></div>
        <div className="relative z-10 text-center text-white px-4">
          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-4 uppercase tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            OUR WORK <span className="text-primary">GALLERY</span>
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto text-gray-200"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our portfolio of quality roofing projects and craftsmanship
          </motion.p>
        </div>
      </div>

      {/* Main Gallery Content */}
      <div className="min-h-screen bg-white py-20">
        <div className="container-custom">

          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Recently Completed Projects</h2>
            <div className="w-24 h-1 bg-primary mx-auto"></div>
          </div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 mb-16">
            {PROJECTS.map((project, index) => (
              <motion.div
                key={project.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                onClick={() => setSelectedIndex(index)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-2xl shadow-lg aspect-[4/3] bg-gray-100">
                  <img
                    src={project.image}
                    alt={project.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6">
                    <p className="text-primary font-bold text-sm mb-1 uppercase tracking-wider">{project.category}</p>
                    <h3 className="text-white font-bold text-xl">{project.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Lightbox */}
          <AnimatePresence>
            {selectedIndex !== null && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={closeLightbox}
                className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 md:p-8"
              >
                <button
                  onClick={closeLightbox}
                  className="absolute top-6 right-6 text-white/70 hover:text-white transition-colors z-[110]"
                >
                  <HiX size={40} />
                </button>

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

                <motion.div
                  key={selectedIndex}
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="relative max-w-5xl w-full h-full flex items-center justify-center"
                  onClick={(e) => e.stopPropagation()}
                >
                  <img
                    src={PROJECTS[selectedIndex].image}
                    alt={PROJECTS[selectedIndex].title}
                    className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl"
                  />
                  <div className="absolute bottom-[-40px] left-0 right-0 text-center">
                    <h3 className="text-white text-2xl font-bold">{PROJECTS[selectedIndex].title}</h3>
                    <p className="text-primary font-semibold">{PROJECTS[selectedIndex].category}</p>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Stats Section */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 my-20">
            {[
              { number: '500+', label: 'Projects Completed' },
              { number: '5+', label: 'Years of Experience' },
              { number: '100+', label: 'Satisfied Customers' },
              { number: '100%', label: 'Satisfaction Guarantee' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <p className="text-4xl md:text-5xl font-extrabold text-primary mb-2 tracking-tight">{stat.number}</p>
                <p className="text-gray-600 font-bold uppercase text-sm tracking-widest">{stat.label}</p>
              </motion.div>
            ))}
          </div>

          {/* Call to Action */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gray-900 text-white rounded-3xl p-8 md:p-16 text-center shadow-2xl relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-64 h-64 bg-primary/10 rounded-full -mr-32 -mt-32 blur-3xl"></div>
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-primary/10 rounded-full -ml-32 -mb-32 blur-3xl"></div>

            <div className="relative z-10">
              <h3 className="text-3xl md:text-5xl font-bold mb-6">Let Us Protect Your Property</h3>
              <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">
                Whether you need a new roof installation, repairs, or maintenance, our experienced team is ready to deliver quality results.
              </p>
              <div className="flex flex-col sm:flex-row gap-6 justify-center">
                <a
                  href={`tel:${COMPANY_INFO.phone}`}
                  className="bg-primary hover:bg-primary/90 text-white font-bold py-4 px-10 rounded-full transition-all flex items-center justify-center gap-3 shadow-lg shadow-primary/30"
                >
                  <HiPhone className="text-xl" />
                  <span>{COMPANY_INFO.phone}</span>
                </a>
                <Link
                  href="/#contact"
                  className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-4 px-10 rounded-full transition-all flex items-center justify-center gap-3 shadow-lg"
                >
                  <span>Get a Free Quote</span>
                  <HiChevronRight className="text-xl" />
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutShell>
  );
}
