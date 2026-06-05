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
  const [selectedLoc, setSelectedLoc] = useState(locations[0] || null);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCity, setSelectedCity] = useState("");
  const [currentPage, setCurrentPage] = useState(1);

  // Filtered services based on selected city and search query (service name or location name)
  const filteredServices = services.filter((service) => {
    // Rule: if a service is not linked with any location, we don't show it at all
    const isLinked = service.locationIds && Array.isArray(service.locationIds) && service.locationIds.length > 0;
    if (!isLinked) return false;

    // 1. City/Location Dropdown Filter
    if (selectedCity) {
      if (!service.locationIds.includes(Number(selectedCity))) {
        return false;
      }
    }

    // 2. Search Query Filter (matches service name or linked location names)
    if (searchQuery) {
      const q = searchQuery.toLowerCase();

      // Check service name
      const serviceNameMatch = service.name.toLowerCase().includes(q);

      // Check linked location names
      const matchedLocations = locations.filter((loc) => service.locationIds.includes(loc.id));
      const locationNameMatch = matchedLocations.some((loc) => loc.name.toLowerCase().includes(q));

      if (!serviceNameMatch && !locationNameMatch) {
        return false;
      }
    }

    return true;
  });

  const itemsPerPage = 6;
  const totalPages = Math.ceil(filteredServices.length / itemsPerPage);

  // Slice services list for active page
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentServices = filteredServices.slice(indexOfFirstItem, indexOfLastItem);

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
                    setCurrentPage(1);
                  }}
                  className="w-full pl-12 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900 text-sm placeholder-gray-400 transition-all duration-200"
                />
                {searchQuery && (
                  <button
                    onClick={() => {
                      setSearchQuery("");
                      setCurrentPage(1);
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
                    setCurrentPage(1);
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
                    setCurrentPage(1);
                  }}
                  className="w-full lg:w-auto px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl text-sm transition-all duration-200"
                >
                  Reset Filters
                </button>
              )}
            </div>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
            {currentServices.map((service, idx) => (
              <motion.div
                key={service.slug}
                className="bg-white rounded-2xl overflow-hidden shadow-md border border-gray-100 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between group"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.05 }}
                whileHover={{ y: -5 }}
              >
                <div>
                  <div className="relative h-48 w-full overflow-hidden bg-gray-100 flex items-center justify-center">
                    {service.featuredImageUrl ? (
                      <Image
                        src={
                          service.featuredImageUrl.startsWith("http")
                            ? service.featuredImageUrl
                            : `${process.env.NEXT_PUBLIC_BACKEND_URL}${service.featuredImageUrl}`
                        }
                        alt={service.name}
                        fill
                        className="object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="text-6xl">{service.icon || "🛠️"}</div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent"></div>
                    <div className="absolute bottom-4 left-4 text-white flex items-center gap-2">
                      <h3 className="text-xl font-bold font-heading">{service.name}</h3>
                    </div>
                  </div>

                  <div className="p-6">
                    <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                      {service.shortDescription}
                    </p>

                    {/* Location tags linked to this service */}
                    <div className="flex flex-wrap gap-1.5 mb-4">
                      {locations
                        .filter((loc) => service.locationIds.includes(loc.id))
                        .slice(0, 4)
                        .map((loc) => (
                          <span key={loc.id} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded-md flex items-center gap-1">
                            <HiLocationMarker size={10} className="text-primary-500" />
                            <span>{loc.name}</span>
                          </span>
                        ))}
                      {locations.filter((loc) => service.locationIds.includes(loc.id)).length > 4 && (
                        <span className="text-xs bg-accent-50 text-accent-700 font-semibold px-2 py-1 rounded-md">
                          +{locations.filter((loc) => service.locationIds.includes(loc.id)).length - 4} more
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="p-6 pt-0">
                  <Link href={`/services/${service.slug}`}>
                    <span className="w-full inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-accent-600 text-white py-2.5 px-4 rounded-xl font-medium transition-all duration-300 cursor-pointer">
                      <span>View Service Details</span>
                      <HiArrowRight size={16} />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}

            {services.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No services configured.</p>
              </div>
            ) : currentServices.length === 0 ? (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No services match your search or filter criteria.</p>
              </div>
            ) : null}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mb-20">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Previous
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => (
                <button
                  key={pageNum}
                  onClick={() => setCurrentPage(pageNum)}
                  className={`w-10 h-10 rounded-xl font-medium transition-all ${currentPage === pageNum
                      ? "bg-primary-600 text-white shadow-md shadow-primary-600/20"
                      : "bg-white border border-gray-200 text-gray-700 hover:bg-gray-50"
                    }`}
                >
                  {pageNum}
                </button>
              ))}

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="px-4 py-2 rounded-xl bg-white border border-gray-200 text-gray-700 font-medium hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
              >
                Next
              </button>
            </div>
          )}

      
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
