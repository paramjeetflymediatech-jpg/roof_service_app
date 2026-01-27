"use client";
import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { HiHome } from 'react-icons/hi';
import LayoutShell from "@/components/LayoutShell";
import { COMPANY_INFO } from "@/lib/constants";
import { useSeo } from '@/hooks/useSeo';

import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
  try {
    const data = await getSeoData('about');
    return {
      props: {
        seoData: data.success ? data.data : null,
      },
    };
  } catch (error) {
    console.error('Error fetching SEO data:', error);
    return {
      props: {
        seoData: null,
      },
    };
  }
}

export default function AboutPage({ seoData }) {

  return (
    <LayoutShell>
      <SeoHead pageName="about" initialSeoData={seoData} />
      {/* Breadcrumb / Hero Section */}
      <section className="relative h-[300px] md:h-[400px] bg-dark-900 overflow-hidden">
        {/* Dark overlay with background image */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/assets/roofing-background.jpg')" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight"
          >
            About Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm md:text-base font-medium"
          >
            <Link href="/" className="hover:text-amber-500 transition-colors flex items-center gap-1">
              Home
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-amber-500">About Us</span>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-24 bg-[#f8f8f8]">
        <div className="container-custom">
          <div className="grid lg:grid-cols-2 gap-16 items-center">

            {/* LEFT SIDE: STAGGERED IMAGES */}
            <div className="relative px-4 pb-12 lg:pb-0">
              <div className="grid grid-cols-2 gap-4 relative">

                {/* Image 1: Top Left (Blue House) */}
                <motion.div
                  initial={{ opacity: 0, x: -30 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  className="rounded-lg overflow-hidden shadow-xl z-20"
                >
                  <img
                    src="/assets/ab-house-blue.jpg"
                    alt="Mainstreet Roofing Projects"
                    className="w-full h-[250px] object-cover"
                  />
                </motion.div>

                {/* Image 2: Right/Middle (Chimneys) - offset down */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                  className="rounded-lg overflow-hidden shadow-xl -mt-6 z-20"
                >
                  <img
                    src="/assets/ab-roof-chimney.jpg"
                    alt="Professional Roofing Services"
                    className="w-full h-[320px] object-cover object-center"
                  />
                </motion.div>

                {/* Image 3: Bottom Left (Roof Window) - offset up */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 }}
                  className="rounded-lg overflow-hidden shadow-xl -mt-12 z-20"
                >
                  <img
                    src="/assets/ab-roof-window.jpg"
                    alt="Expert Workmanship"
                    className="w-full h-[250px] object-cover"
                  />
                </motion.div>

                {/* Gold Circle Icon Decoration */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[80%] z-30">
                  <motion.div
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ type: 'spring', delay: 0.6 }}
                    className="w-16 h-16 md:w-20 md:h-20 bg-amber-600 rounded-full border-4 border-white shadow-lg flex items-center justify-center"
                  >
                    <svg className="w-8 h-8 md:w-10 md:h-10 text-white" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 3L2 12h3v8h14v-8h3L12 3zm0 4.84L16.16 12H15v6H9v-6H7.84L12 7.84zM10 16h4v-2h-4v2z" />
                    </svg>
                  </motion.div>
                </div>
              </div>
            </div>

            {/* RIGHT SIDE: TEXT CONTENT */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              className="flex flex-col gap-6"
            >
              <div className="space-y-2">
                <p className="text-amber-600 font-bold uppercase tracking-[0.2em] text-sm">
                  Who We Are
                </p>
                <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-amber-600 leading-tight">
                  Mainstreet Roofing <br /> is a trusted name in <br /> the roofing industry,
                </h2>
              </div>

              <div className="text-gray-600 text-base md:text-lg leading-relaxed flex flex-col gap-4">
                <p>
                  specializing in a wide range of services to meet all your roofing needs.
                  With expertise in reroofs, metal roofing, wall metals, torch on, Edpm,
                  metal gutters and downspouts, leak repair, and rain and storm damage repairs
                  — Mainstreet Roofing has you covered from top to bottom.
                </p>
                <p>
                  Our team of skilled professionals is dedicated to providing high-quality
                  workmanship and exceptional customer service on every project we undertake.
                  Whether you are looking to upgrade your roof with durable metal materials
                  or need fast and reliable leak repairs after a storm — Mainstreet Roofing has
                  the knowledge and experience to get the job done right the first time.
                </p>
              </div>

              {/* Call to Action or extra info could go here if needed */}
              <div className="pt-4 flex flex-wrap gap-4">
                <Link href="/contact" className="btn btn-primary px-8 py-3 rounded-full font-bold shadow-lg hover:shadow-amber-500/20 transition-all">
                  Get in Touch
                </Link>
                <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-3 text-gray-900 font-bold hover:text-amber-600 transition-colors px-4 py-3">
                  <div className="w-10 h-10 bg-white shadow-md rounded-full flex items-center justify-center text-amber-600">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1v3.94a1 1 0 01-1 1A16 16 0 013 4a1 1 0 011-1h3.94a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11z" /></svg>
                  </div>
                  <span>{COMPANY_INFO.phone}</span>
                </a>
              </div>
            </motion.div>

          </div>
        </div>
      </section>

      {/* Optional: Mission Section (consistent with previous design but simplified) */}
      <section className="py-20 bg-white border-t border-gray-100">
        <div className="container-custom text-center max-w-3xl mx-auto">
          <h3 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">Our Mission</h3>
          <p className="text-gray-600 text-lg">
            At Mainstreet Roofing LTD, our mission is to provide superior roofing solutions
            built on a foundation of quality, integrity, and exceptional service. We strive
            to protect and enhance the properties of our community, one roof at a time.
          </p>
        </div>
      </section>
    </LayoutShell>
  );
}
