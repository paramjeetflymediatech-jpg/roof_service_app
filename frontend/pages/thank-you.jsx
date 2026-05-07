import React from "react";
import Head from "next/head";
import Link from "next/link";
import { motion } from "framer-motion";
import { HiCheckCircle, HiHome, HiPhone, HiMail } from "react-icons/hi";
import LayoutShell from "@/components/LayoutShell";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from '@/lib/api/seo';

export async function getServerSideProps() {
    try {
        const data = await getSeoData('thank-you');
        return {
            props: {
                seoData: data.success ? data.data : null,
            },
        };
    } catch (error) {
        console.error('Error fetching Thank You SEO data:', error);
        return {
            props: {
                seoData: null,
            },
        };
    }
}
export default function ThankYouPage({ seoData }) {
  return (
    <LayoutShell>
      <SeoHead pageName="thank-you" initialSeoData={seoData} />

      <section className="min-h-[70vh] flex items-center justify-center py-20 bg-gradient-to-b from-gray-50 to-white">
        <div className="container-custom max-w-3xl text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-8 flex justify-center"
          >
            <div className="relative">
              <div className="absolute inset-0 bg-primary-100 rounded-full animate-ping opacity-20"></div>
              <HiCheckCircle className="text-primary-600 w-24 h-24 relative z-10" />
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 mb-6">
              Thank You!
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              Your quote request has been received successfully. One of our experts will review your details and contact you within 24-48 hours.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <HiPhone className="text-primary-600 w-8 h-8 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Call Us Directly</h3>
                <p className="text-gray-600">Need immediate help?</p>
                <a href="tel:604-720-4313" className="text-primary-600 font-bold hover:underline">604-720-4313</a>
              </div>
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                <HiMail className="text-primary-600 w-8 h-8 mx-auto mb-4" />
                <h3 className="font-bold text-gray-900 mb-2">Email Us</h3>
                <p className="text-gray-600">Send additional info to:</p>
                <a href="mailto:mainstreetroofing604@gmail.com" className="text-primary-600 font-bold hover:underline">mainstreetroofing604@gmail.com</a>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/" className="w-full sm:w-auto btn btn-primary text-lg px-10 py-4 flex items-center justify-center gap-2">
                <HiHome className="text-xl" />
                Back to Home
              </Link>
              <Link href="/services" className="w-full sm:w-auto btn btn-primary   text-lg px-10 py-4 flex items-center justify-center gap-2">
                Explore Services
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </LayoutShell>
  );
}
