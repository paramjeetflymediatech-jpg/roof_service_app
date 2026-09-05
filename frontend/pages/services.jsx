"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import LayoutShell from "@/components/LayoutShell";
import apiClient from "@/lib/apiClient";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from "@/lib/api/seo";

export async function getServerSideProps() {
  try {
    const [seoResponse, servicesResponse] = await Promise.all([
      getSeoData("services"),
      apiClient.get("/services?limit=100"), // Fetch all services
    ]);

    const services = servicesResponse.data?.items || [];

    return {
      props: {
        seoData: seoResponse.success ? seoResponse.data : null,
        services,
      },
    };
  } catch (error) {
    console.error("Error fetching Services data:", error);
    return {
      props: {
        seoData: null,
        services: [],
      },
    };
  }
}

export default function ServicesPage({ seoData, services = [] }) {
  return (
    <LayoutShell>
      <SeoHead pageName="services" initialSeoData={seoData} />
      {/* Hero Banner with Next.js Image */}
      <div className="relative h-64 bg-dark-900 flex items-center justify-center overflow-hidden">
        <Image
          src="https://images.unsplash.com/photo-1513584684374-8bab748fbf90?w=1200&h=400&fit=crop"
          alt="Roofing Services"
          fill
          priority
          sizes="100vw"
          className="object-cover opacity-50"
        />
        <div className="absolute inset-0 bg-black/40 pointer-events-none"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            Services
          </motion.h1>
          <div className="flex items-center justify-center gap-2 text-sm">
            <Link href="/" className="hover:text-amber-400 transition-colors">
              Home
            </Link>
            <span>›</span>
            <span>Services</span>
          </div>
        </div>
      </div>

      {/* Services Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Our Services
            </h2>
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
              >
                <Link href={`/services/${service.slug}`}>
                  <div className="bg-white rounded-xl shadow-md hover:shadow-xl transition-all duration-300 p-6 h-full hover:-translate-y-1 cursor-pointer border border-gray-100 flex flex-col justify-between">
                    <div>
                      <div className="flex items-start gap-4 mb-4">
                        <div className="text-4xl flex-shrink-0">
                          {service.icon}
                        </div>
                        <h3 className="text-xl font-bold text-gray-900">
                          {service.name}
                        </h3>
                      </div>
                      <p className="text-gray-600 leading-relaxed text-sm">
                        {service.shortDescription}
                      </p>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100 text-primary-600 font-semibold text-sm">
                      Learn More →
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
            {services.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No services found.</p>
              </div>
            )}
          </div>

          {/* CTA Section */}
          <div className="mt-16 bg-white rounded-2xl shadow-xl p-12 text-center border border-gray-100">
            <h2 className="text-3xl font-bold mb-4 text-gray-900">
              Ready to Get Started?
            </h2>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Mainstreet Roofing offers expert roofing solutions with
              top-quality materials and craftsmanship. From installations to
              repairs, we ensure durability and customer satisfaction for
              residential and commercial projects.
            </p>
            <Link
              href="/contact"
              className="btn btn-primary text-lg px-8 py-4 inline-block transition-transform duration-300 hover:scale-105"
            >
              Get a Quote
            </Link>
          </div>
        </div>
      </section>
    </LayoutShell>
  );
}
