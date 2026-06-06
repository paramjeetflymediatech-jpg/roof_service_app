import { useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import LayoutShell from "@/components/LayoutShell";
import SeoHead from "@/components/SeoHead";
import apiClient from "@/lib/apiClient";
import { HiLocationMarker, HiArrowRight, HiShieldCheck, HiOutlineSparkles, HiSearch, HiX } from "react-icons/hi";

export async function getServerSideProps() {
  try {
    // Attempt to load SEO data, services, and dynamic locations
    const [seoResponse, servicesResponse, locationsResponse] = await Promise.all([
      apiClient.get("/seo/locations").catch(() => null),
      apiClient.get("/services?limit=100").catch(() => null),
      apiClient.get("/locations?limit=100").catch(() => null),
    ]);

    return {
      props: {
        seoData: seoResponse?.data?.success ? seoResponse.data.data : null,
        services: servicesResponse?.data?.items || [],
        locations: locationsResponse?.data?.items || [],
      },
    };
  } catch (error) {
    console.error("Error fetching locations data:", error);
    return {
      props: {
        seoData: null,
        services: [],
        locations: [],
      },
    };
  }
}

export default function LocationsPage({ seoData, services = [], locations = [] }) {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");

  // Build all service-location pairs
  const allPairs = [];
  services.forEach((service) => {
    // Only map locations linked to this service
    const linkedLocations = locations.filter((loc) =>
      service.locationIds && Array.isArray(service.locationIds) && service.locationIds.includes(loc.id)
    );
    linkedLocations.forEach((loc) => {
      // composite slug matching uniqueSlug generated in seed script
      const compositeSlug = `${service.slug}-in-${loc.slug}`;
      allPairs.push({
        service,
        location: loc,
        name: `${service.name} in ${loc.name}`,
        slug: compositeSlug,
      });
    });
  });

  // Filter pairs
  const filteredPairs = allPairs.filter((pair) => {
    if (selectedCity && pair.location.id !== Number(selectedCity)) {
      return false;
    }
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      return pair.name.toLowerCase().includes(q);
    }
    return true;
  });

  // Group filtered pairs by service
  const groupedByService = {};
  filteredPairs.forEach((pair) => {
    if (!groupedByService[pair.service.id]) {
      groupedByService[pair.service.id] = {
        service: pair.service,
        pairs: [],
      };
    }
    groupedByService[pair.service.id].pairs.push(pair);
  });

  const groupedSections = Object.values(groupedByService);

  // Fallback metadata if not set in DB
  const fallbackSeo = seoData || {
    pageTitle: "Our Service Locations | Mainstreet Roofing Ltd",
    metaDescription: "We provide high-quality roofing, torch-on, metal roofing, and leak repairs across Surrey, Vancouver, Burnaby, Langley, Richmond, and the Lower Mainland.",
    metaRobots: "index, follow",
    ogTitle: "Our Service Locations | Mainstreet Roofing Ltd",
    ogDescription: "Professional residential and commercial roofing services across Surrey, Vancouver, and Greater Vancouver.",
  };

  return (
    <LayoutShell>
      <SeoHead pageName="locations" initialSeoData={fallbackSeo} />

      {/* Hero Banner */}
      <div
        className="relative h-72 md:h-96 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=1600&h=600&fit=crop')",
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-r from-dark-900/90 to-dark-900/40"></div>
        <div className="relative z-10 text-center text-white container-custom px-4">
          <motion.h1
            className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading mb-4 tracking-tight"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            Service Locations
          </motion.h1>
          <motion.p
            className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto mb-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Providing expert roofing solutions across Surrey, Vancouver, and the Lower Mainland.
          </motion.p>
          <motion.div
            className="flex items-center justify-center gap-2 text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
          >
            <Link href="/" className="hover:text-accent-500 transition-colors">
              Home
            </Link>
            <span>›</span>
            <span>Locations</span>
          </motion.div>
        </div>
      </div>

      {/* Main Grid Section */}
      <section className="section-padding bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 font-heading">
              Communities We Serve
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Mainstreet Roofing is a licensed, bonded, and insured roofing company. We deliver durable, high-quality roofing systems to homes and businesses across BC.
            </p>
          </div>

          {/* Filters & Search Panel */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-10">
            <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
              {/* Search Bar */}
              <div className="relative w-full lg:flex-1">
                <HiSearch className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-xl" />
                <input
                  type="text"
                  placeholder="Search services or locations..."
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                  }}
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm placeholder-gray-400 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                    }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                  >
                    <HiX className="text-lg" />
                  </button>
                )}
              </div>

              {/* City Filter Dropdown */}
              <div className="w-full lg:w-64">
                <select
                  value={selectedCity}
                  onChange={(e) => {
                    setSelectedCity(e.target.value);
                  }}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm bg-white cursor-pointer transition-all duration-200"
                >
                  <option value="">All Locations / Cities</option>
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Reset Button */}
              {(searchQuery || selectedCity) && (
                <button
                  onClick={() => {
                    setSearchQuery("");
                    setSelectedCity("");
                  }}
                  className="w-full lg:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-all duration-200"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Grouped Services Sections */}
          <div className="space-y-16 mb-20">
            {groupedSections.map(({ service, pairs }) => (
              <div key={service.id} className="border-b border-gray-200 pb-12 last:border-0 last:pb-0">
                <div className="flex items-center gap-4 mb-6">
                  <span className="text-4xl shrink-0">{service.icon || "🛠️"}</span>
                  <div>
                    <h3 className="text-2xl font-bold text-gray-900 font-heading">
                      {service.name} Services
                    </h3>
                    <p className="text-gray-550 text-sm mt-1 max-w-3xl">
                      {service.shortDescription}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                  {pairs.map((pair) => (
                    <motion.div
                      key={pair.slug}
                      initial={{ opacity: 0, y: 15 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3 }}
                    >
                      <Link href={`/services/${pair.slug}`}>
                        <span className="group block bg-dark-800 hover:bg-dark-900 border border-dark-700 hover:border-accent-500 rounded-2xl p-5 md:p-6 shadow-md hover:shadow-accent-500/10 hover:-translate-y-1 transition-all duration-300 cursor-pointer">
                          <div className="flex items-start gap-3.5">
                            <span className="bg-dark-700 group-hover:bg-accent-600/20 text-accent-500 p-2.5 rounded-xl shrink-0 transition-colors duration-300">
                              <HiLocationMarker className="text-xl" />
                            </span>
                            <div>
                              <h4 className="text-white font-semibold text-sm md:text-base leading-snug group-hover:text-accent-400 transition-colors duration-300">
                                {pair.service.name}
                              </h4>
                              <p className="text-gray-300 text-xs md:text-sm mt-1 font-medium flex items-center gap-1 group-hover:text-white transition-colors duration-300">
                                in <span className="text-accent-400 font-bold">{pair.location.name}</span>
                              </p>
                            </div>
                          </div>
                        </span>
                      </Link>
                    </motion.div>
                  ))}
                </div>
              </div>
            ))}

            {services.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services configured.</p>
              </div>
            ) : groupedSections.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-gray-500 text-lg">No services or locations match your search criteria.</p>
              </div>
            ) : null}
          </div>

      
        </div>
      </section>

      {/* Trust factors bar */}
      <section className="bg-dark-900 text-white py-12">
        <div className="container-custom grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center shrink-0">
              <HiShieldCheck size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Licensed & Insured</h4>
              <p className="text-gray-400 text-sm mt-1">Full liability & coverage in all served cities.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center shrink-0">
              <HiLocationMarker size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Local BC Roofers</h4>
              <p className="text-gray-400 text-sm mt-1">Specialized in Lower Mainland climate resilience.</p>
            </div>
          </div>
          <div className="flex items-center gap-4 flex-col md:flex-row">
            <div className="w-12 h-12 bg-accent-600 rounded-full flex items-center justify-center shrink-0">
              <HiOutlineSparkles size={24} />
            </div>
            <div>
              <h4 className="font-bold text-lg">Satisfaction Guarantee</h4>
              <p className="text-gray-400 text-sm mt-1">Warranties on work and top-tier materials.</p>
            </div>
          </div>
        </div>
      </section>
    </LayoutShell>
  );
}
