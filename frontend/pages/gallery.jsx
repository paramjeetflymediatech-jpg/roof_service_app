'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { HiPhone, HiChevronRight } from 'react-icons/hi';
import { COMPANY_INFO } from '@/lib/constants';
import LayoutShell from '@/components/LayoutShell';
import { useState } from 'react';

export default function GalleryPage() {
  const [selectedImage, setSelectedImage] = useState(null);

  const galleryImages = [
    { id: 1, title: 'Residential Roof Installation', category: 'Residential', src: 'https://images.unsplash.com/photo-1486312338219-ce68d2c6f44d?w=600&h=400&fit=crop' },
    { id: 2, title: 'Metal Roofing Project', category: 'Metal Roofing', src: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=600&h=400&fit=crop' },
    { id: 3, title: 'Shingle Roof Replacement', category: 'Residential', src: 'https://images.unsplash.com/photo-1552664730-d307ca884978?w=600&h=400&fit=crop' },
    { id: 4, title: 'Commercial Flat Roof', category: 'Commercial', src: 'https://images.unsplash.com/photo-1581092916550-e323be2ae537?w=600&h=400&fit=crop' },
    { id: 5, title: 'Storm Damage Repair', category: 'Repairs', src: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=400&fit=crop' },
    { id: 6, title: 'EPDM Installation', category: 'Commercial', src: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&h=400&fit=crop' },
    { id: 7, title: 'Tile Roofing', category: 'Residential', src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
    { id: 8, title: 'Gutter Installation', category: 'Services', src: 'https://images.unsplash.com/photo-1537531173927-aeb928d54385?w=600&h=400&fit=crop' },
    { id: 9, title: 'Roof Maintenance', category: 'Services', src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' },
    { id: 10, title: 'Solar Panel Installation', category: 'Solar', src: 'https://images.unsplash.com/photo-1509391366360-2e938d440dbb?w=600&h=400&fit=crop' },
    { id: 11, title: 'Commercial Building', category: 'Commercial', src: 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&h=400&fit=crop' },
    { id: 12, title: 'Quality Workmanship', category: 'Residential', src: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600&h=400&fit=crop' },
  ];

  const categories = ['All', 'Residential', 'Commercial', 'Metal Roofing', 'Repairs', 'Services', 'Solar'];
  const [selectedCategory, setSelectedCategory] = useState('All');

  const filteredImages = selectedCategory === 'All' 
    ? galleryImages 
    : galleryImages.filter(img => img.category === selectedCategory);

  return (
    <LayoutShell>
      {/* Hero Section */}
      <div className="relative h-80 bg-cover bg-center flex items-center justify-center" style={{ backgroundImage: "url('https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&h=500&fit=crop')", backgroundPosition: 'center' }}>
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1 
            className="text-4xl md:text-5xl font-bold mb-4" 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }}
          >
            Our Work Gallery
          </motion.h1>
          <motion.p 
            className="text-xl max-w-2xl mx-auto" 
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }} 
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Explore our portfolio of quality roofing projects and craftsmanship
          </motion.p>
        </div>
      </div>

      {/* Main Gallery Content */}
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container-custom">
          {/* Category Filter */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
            className="mb-12"
          >
            <div className="flex flex-wrap gap-3 justify-center">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-6 py-2 rounded-full font-semibold transition-all ${
                    selectedCategory === cat
                      ? 'bg-amber-600 text-white shadow-lg'
                      : 'bg-white text-gray-700 hover:bg-gray-100 shadow-md'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </motion.div>

          {/* Gallery Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
            {filteredImages.map((image, index) => (
              <motion.div
                key={image.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.05 }}
                viewport={{ once: true }}
                onClick={() => setSelectedImage(image)}
                className="group cursor-pointer"
              >
                <div className="relative overflow-hidden rounded-lg shadow-lg h-64 bg-gray-200">
                  <img
                    src={image.src}
                    alt={image.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-center">
                      <div className="w-16 h-16 bg-amber-600 rounded-full flex items-center justify-center mx-auto mb-3">
                        <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v6m3-3H7" />
                        </svg>
                      </div>
                      <p className="text-white font-semibold">View</p>
                    </div>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                    <p className="text-white font-semibold text-sm">{image.category}</p>
                    <h3 className="text-white font-bold text-lg">{image.title}</h3>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Image Modal */}
          {selectedImage && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelectedImage(null)}
              className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-4"
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                onClick={(e) => e.stopPropagation()}
                className="max-w-4xl w-full"
              >
                <div className="relative">
                  <img
                    src={selectedImage.src}
                    alt={selectedImage.title}
                    className="w-full h-auto rounded-lg"
                  />
                  <button
                    onClick={() => setSelectedImage(null)}
                    className="absolute top-4 right-4 w-10 h-10 bg-white rounded-full flex items-center justify-center hover:bg-gray-200 transition-colors"
                  >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                  <div className="bg-white p-6 rounded-b-lg">
                    <h3 className="text-2xl font-bold text-gray-900 mb-2">{selectedImage.title}</h3>
                    <p className="text-amber-600 font-semibold">{selectedImage.category}</p>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}

          {/* Stats Section */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-4 gap-6 my-16"
          >
            {[
              { number: '500+', label: 'Projects Completed' },
              { number: '20+', label: 'Years of Experience' },
              { number: '1000+', label: 'Satisfied Customers' },
              { number: '100%', label: 'Satisfaction Guarantee' },
            ].map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white rounded-lg p-6 shadow-md text-center hover:shadow-lg transition-shadow"
              >
                <p className="text-4xl font-bold text-amber-600 mb-2">{stat.number}</p>
                <p className="text-gray-700 font-semibold">{stat.label}</p>
              </motion.div>
            ))}
          </motion.div>

          {/* Call to Action */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            whileInView={{ opacity: 1, y: 0 }} 
            transition={{ duration: 0.6 }} 
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg p-12 text-center"
          >
            <h3 className="text-3xl font-bold mb-4">Let Us Protect Your Property</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Whether you need a new roof installation, repairs, or maintenance, our experienced team is ready to deliver quality results.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a 
                href={`tel:${COMPANY_INFO.phone}`} 
                className="bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <HiPhone className="text-xl" />
                <span>{COMPANY_INFO.phone}</span>
              </a>
              <Link 
                href="/contact" 
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                <span>Get a Free Quote</span>
                <HiChevronRight className="text-xl" />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutShell>
  );
}
