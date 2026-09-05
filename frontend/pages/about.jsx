"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { HiHome } from 'react-icons/hi';
import LayoutShell from "@/components/LayoutShell";
import SeoHead from '@/components/SeoHead';
import { getSeoData } from '@/lib/api/seo';

import { ABOUT_SERVICES, COST_FACTORS, ABOUT_FAQS, COMPANY_INFO } from "@/lib/constants";
import Faq from '@/components/Faq';
import { HiCheckCircle, HiArrowRight } from 'react-icons/hi';

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
        <Image
          src="/assets/roofing-background.jpg"
          alt="Mainstreet Roofing Surrey BC"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/20" />

        <div className="relative z-10 h-full flex flex-col items-center justify-center text-white px-4">
          <motion.h1
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-6xl font-bold mb-4 tracking-tight uppercase"
          >
            About Us
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm md:text-base font-medium"
          >
            <Link href="/" className="hover:text-primary transition-colors flex items-center gap-1">
              Home
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-primary">About Us</span>
          </motion.div>
        </div>
      </section>

      {/* Intro Section - Key Services & Options */}
      <section className="py-20 bg-white">
        <div className="container-custom">
          <div className="max-w-4xl mb-16">
            <motion.h2
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 uppercase tracking-tight"
            >
              Mainstreet Roofing: <span className="gradient-text">Key Services and Options</span> in Surrey
            </motion.h2>
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              className="text-lg text-gray-600 leading-relaxed"
            >
              For any of your problems related to your house roofing, we provide the optimal solution for it.
              Mainstreet roofing provides the most affordable cost roofing repair and restoration in Surrey, BC.
              We offer our services for residential, commercial and layered buildings with the specialisation
              of the most cost-effective materials. Our trusted local contractors provide 24/7 repair services
              for emergencies, leak detection and maintenance to extend the life of the roof.
            </motion.p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {ABOUT_SERVICES.map((service, index) => (
              <motion.div
                key={service.id}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: index * 0.1 }}
                className="p-8 bg-gray-50 rounded-3xl border border-gray-100 hover:shadow-xl transition-all duration-300 group"
              >
                <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center text-primary mb-6 group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <HiCheckCircle size={28} />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-4 uppercase tracking-wide">
                  {service.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {service.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Cost Factors Section */}
      <section className="py-20 bg-gray-900 text-white overflow-hidden relative">
        <div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 -skew-x-12 translate-x-1/4" />
        <div className="container-custom relative z-10">
          <div className="flex flex-col lg:flex-row gap-16 items-center">
            <div className="lg:w-1/2">
              <motion.h2
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                className="text-3xl md:text-4xl lg:text-5xl font-bold mb-8 uppercase tracking-tight"
              >
                Major <span className="text-primary">Factors</span> Affecting Cost
              </motion.h2>
              <motion.p
                initial={{ opacity: 0, x: -30 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="text-lg text-gray-400 mb-12"
              >
                The major factors which affect the repair and restoration of the roof include the following key aspects.
                Understanding these helps you make the right investment for your property.
              </motion.p>

              <div className="space-y-8">
                {COST_FACTORS.map((factor, index) => (
                  <motion.div
                    key={factor.id}
                    initial={{ opacity: 0, x: -30 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ delay: index * 0.1 + 0.2 }}
                    className="flex gap-6"
                  >
                    <div className="flex-shrink-0 w-12 h-12 rounded-full border border-primary/30 flex items-center justify-center text-primary font-bold">
                      0{index + 1}
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-2 uppercase tracking-wide text-primary">{factor.title}</h4>
                      <p className="text-gray-400 leading-relaxed">{factor.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="lg:w-1/2">
              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                className="relative"
              >
                <div className="absolute inset-0 bg-primary blur-[100px] opacity-20 pointer-events-none" />
                <Image
                  src="/assets/ab-roof-chimney.jpg"
                  alt="Roof Complexity"
                  width={600}
                  height={450}
                  sizes="(max-width: 768px) 100vw, 600px"
                  className="rounded-3xl shadow-2xl relative z-10 border border-white/10 w-full h-auto object-cover"
                />
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* Perfection Section */}
      <section className="py-24 bg-white">
        <div className="container-custom">
          <div className="bg-gray-50 rounded-[3rem] p-8 md:p-16 border border-gray-100 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-12 text-primary/5 pointer-events-none">
              <HiHome size={200} />
            </div>

            <div className="relative z-10 max-w-4xl">
              <motion.h3
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-8 uppercase tracking-wide leading-tight"
              >
                Mainstreet Roofing <span className="gradient-text">restores your roof</span> to perfection.
              </motion.h3>

              <div className="space-y-6 text-gray-600 text-lg leading-relaxed">
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.1 }}
                >
                  Your home is your biggest investment, and it is important to protect it with a roof
                  that stands the test of time and extreme weather. Our team in Surrey is committed to
                  delivering outstanding expertise in each and every service.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.2 }}
                >
                  Mainstreet roofing ensures that your home remains safe, dry and beautiful in the
                  extreme weather conditions of Surrey at a price that fits your budget. We ensure that
                  every project, from small residential repairs to major renovations, is handled with proper care and safety.
                </motion.p>
                <motion.p
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.3 }}
                  className="font-bold text-gray-900"
                >
                  Don't wait for long; if you see a small fault in the roof, it can lead to big damage
                  and a lot of expenses. Protect your most valuable investment with a durable roof today.
                </motion.p>
              </div>

              <div className="mt-12 flex flex-col sm:flex-row gap-6">
                <Link href="/contact" className="btn btn-primary px-10 py-4 rounded-full font-bold shadow-xl hover:shadow-primary/30 transition-all flex items-center justify-center gap-2">
                  FREE INSPECTION <HiArrowRight />
                </Link>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-md text-primary">
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M6.62 10.79a15.15 15.15 0 006.59 6.59l2.2-2.2a1 1 0 011.11-.27 11.72 11.72 0 003.7.59 1 1 0 011 1v3.94a1 1 0 01-1 1A16 16 0 013 4a1 1 0 011-1h3.94a1 1 0 011 1 11.72 11.72 0 00.59 3.7 1 1 0 01-.27 1.11z" /></svg>
                  </div>
                  <div className="flex flex-col">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider">Call Experts</span>
                    <span className="text-gray-900 font-bold">{COMPANY_INFO.phone}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About FAQs */}
      <Faq data={ABOUT_FAQS} title="About Roofing" highlight="Common" />

    </LayoutShell>
  );
}
