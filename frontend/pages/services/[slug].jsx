"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { HiPhone, HiChevronRight } from "react-icons/hi";
import LayoutShell from "@/components/LayoutShell";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from "@/lib/api/seo";
import { getServiceBySlug } from "@/lib/api/service";
import RenderDynamicContent from "@/hooks/htmlconversion";
import { COMPANY_INFO, SERVICE_SUB_FAQS, TILE_ROOF_FAQS, LEAK_REPAIR_FAQS, EPDM_ROOFING_FAQS, WALL_METAL_FAQS, REROOFING_FAQS, ROOF_INSULATION_FAQS, RAIN_STORM_DAMAGE_FAQS, METAL_GUTTERS_FAQS, TORCH_ON_FAQS, METAL_ROOFING_FAQS, NEW_CONSTRUCTION_FAQS } from "@/lib/constants";
import Faq from "@/components/Faq";

export async function getServerSideProps({ params, query }) {
  const { slug } = params;
  const data = await getServiceBySlug(slug, query);

  if (!data) {
    return {
      notFound: true,
    };
  }

  // Transform service data to SEO format (if needed, or usage of existing fields)
  const service = data;
  // Fetch global SEO data
  const globalSeoResponse = await getSeoData('global').catch(() => null);
  const globalSeo = globalSeoResponse && globalSeoResponse.success && globalSeoResponse.data ? globalSeoResponse.data : {};
  // Merge service-specific SEO (already in service.seo) with global fallback values
  const seoData = {
    pageTitle: service.seo?.pageTitle || service.name || globalSeo.pageTitle || null,
    metaDescription: service.seo?.metaDescription || service.shortDescription || globalSeo.metaDescription || null,
    metaRobots: service.seo?.metaRobots || globalSeo.metaRobots || "index, follow",
    ogTitle: service.seo?.ogTitle || service.name || globalSeo.ogTitle || null,
    ogDescription: service.seo?.ogDescription || service.shortDescription || globalSeo.ogDescription || null,
    ogImage: service.seo?.ogImage || service.featuredImageUrl || globalSeo.ogImage || null,
    canonicalUrl: service.seo?.canonicalUrl || globalSeo.canonicalUrl || null,
    schemaMarkup: service.seo?.schemaMarkup || globalSeo.schemaMarkup || null,
    googleAnalyticsId: service.seo?.googleAnalyticsId || globalSeo.googleAnalyticsId || null,
    googleTagManagerId: service.seo?.googleTagManagerId || globalSeo.googleTagManagerId || null,
    headerScripts: service.seo?.headerScripts || globalSeo.headerScripts || "",
    globalHeaderScripts: globalSeo.globalHeaderScripts || globalSeo.headerScripts || "",
  };

  return {
    props: {
      service,
      seoData,
    },
  };
}

export default function ServiceDetail({ service, seoData }) {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className="flex h-screen items-center justify-center">
        Loading...
      </div>
    );
  }


  return (
    <LayoutShell>
      <SeoHead pageName={`service-${service.slug}`} initialSeoData={seoData} />

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[300px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {service.featuredImageUrl ? (
          <div className="absolute inset-0 z-0">
            <Image
              src={
                service.featuredImageUrl.startsWith("http")
                  ? service.featuredImageUrl
                  : `${process.env.NEXT_PUBLIC_BACKEND_URL}${service.featuredImageUrl}`
              }
              alt={service.name}
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
        ) : (
          <div className="absolute inset-0 bg-gradient-to-r from-blue-900 to-slate-900 z-0 opacity-80"></div>
        )}

        <div className="relative z-10 container-custom px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
              {service.name}
            </h1>
            {service.category && (
              <span className="inline-block px-3 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium mb-4">
                {service.category.name}
              </span>
            )}
            <p className="text-xl text-gray-200 max-w-2xl mx-auto">
              {service.shortDescription}
            </p>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="bg-gray-100 border-b border-gray-200 py-3">
        <div className="container-custom px-4 text-sm text-gray-600 flex items-center gap-2 flex-wrap">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <HiChevronRight className="text-gray-400 font-bold" />
          {service.location ? (
            <>
              <Link href="/locations" className="hover:text-primary-600 transition-colors">
                Locations
              </Link>
              <HiChevronRight className="text-gray-400 font-bold" />
              <Link href={`/locations/${service.location.slug}`} className="hover:text-primary-600 transition-colors">
                {service.location.name}
              </Link>
              <HiChevronRight className="text-gray-400 font-bold" />
              <span className="text-gray-900 font-semibold">{service.name}</span>
            </>
          ) : (
            <>
              <Link href="/services" className="hover:text-primary-600 transition-colors">
                Services
              </Link>
              <HiChevronRight className="text-gray-400 font-bold" />
              <span className="text-gray-900 font-semibold">{service.name}</span>
            </>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-white py-12 md:py-20">
        <div className="container-custom px-4 md:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
            {/* Left Column: Content */}
            <div className="lg:col-span-2 space-y-12">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="space-y-8"
              >
                <div className="prose prose-lg max-w-none text-gray-700 leading-relaxed space-y-8">
                  <RenderDynamicContent content={service.longDescription} />
                </div>

              </motion.div>

              
            </div>

            {/* Right Column: Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-24 space-y-8">
                {/* Booking Card */}
                <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
                  <h3 className="text-xl font-bold mb-2">Book This Service</h3>
                  <p className="text-gray-600 mb-6 text-sm">
                    Get a free consultation and quote for your roofing needs.
                  </p>

                  {service.basePrice && (
                    <div className="mb-6 pb-6 border-b border-gray-100">
                      <span className="text-sm text-gray-500">
                        Starting from
                      </span>
                      <div className="text-3xl font-bold text-primary-600">
                        ${service.basePrice}
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    <Link href="/contact" className="block w-full">
                      <button className="w-full btn btn-primary py-3 font-semibold">
                        Request Quote
                      </button>
                    </Link>
                    <div className="text-center text-xs text-gray-500 mt-2">
                      Or call us at{" "}
                      <a
                        href={`tel:${COMPANY_INFO.phone}`}
                        className="flex items-center justify-center gap-2 bg-amber-600 hover:bg-amber-700 text-white font-bold py-3 px-4 rounded-lg transition-colors"
                      >
                        <HiPhone className="text-xl" />
                        <span>{COMPANY_INFO.phone}</span>
                      </a>
                    </div>
                  </div>
                </div>

                {/* Other Services */}
                <div className="bg-gray-50 rounded-2xl p-6">
                  <h4 className="font-bold mb-4 text-gray-900">
                    Other Services
                  </h4>
                  <ul className="space-y-2">
                    <li>
                      <Link
                        href="/services"
                        className="text-gray-600 hover:text-primary-600 transition-colors text-sm"
                      >
                        View All Services
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Service Specific FAQs */}
      {(() => {
        // If the service has FAQs stored in DB (whyChooseUs as objects {q, a}), use them
        const hasDbFaqs =
          Array.isArray(service.whyChooseUs) &&
          service.whyChooseUs.length > 0 &&
          typeof service.whyChooseUs[0] === 'object' &&
          service.whyChooseUs[0] !== null &&
          'q' in service.whyChooseUs[0];

        const faqMap = {
          'restorations-servicing': { data: SERVICE_SUB_FAQS, title: "Roof Restoration", highlight: "Restoration" },
          'tile-slate-roofing': { data: TILE_ROOF_FAQS, title: "Tile & Roof Installation", highlight: "Installation" },
          'leak-repair': { data: LEAK_REPAIR_FAQS, title: "Leak Repair", highlight: "Leak" },
          'epdm': { data: EPDM_ROOFING_FAQS, title: "EPDM Roofing", highlight: "EPDM" },
          'wall-metals': { data: WALL_METAL_FAQS, title: "Wall Metal", highlight: "Metal" },
          'reroofs': { data: REROOFING_FAQS, title: "Reroofing", highlight: "Reroofing" },
          'insulation': { data: ROOF_INSULATION_FAQS, title: "Roof Insulation", highlight: "Insulation" },
          'rain-storm-damage': { data: RAIN_STORM_DAMAGE_FAQS, title: "Rain & Storm Damage", highlight: "Storm" },
          'metal-gutters-downspouts': { data: METAL_GUTTERS_FAQS, title: "Metal Gutters", highlight: "Gutters" },
          'torch-on-roofing': { data: TORCH_ON_FAQS, title: "Torch-on Roofing", highlight: "Torch-on" },
          'metal-roofing': { data: METAL_ROOFING_FAQS, title: "Metal Roofing", highlight: "Metal" },
          'new-construction': { data: NEW_CONSTRUCTION_FAQS, title: "New Construction", highlight: "New" },
        };

        if (hasDbFaqs) {
          // Convert DB FAQs {q, a} to the format expected by the Faq component
          const dbFaqData = service.whyChooseUs.map((f) => ({
            question: f.q,
            answer: f.a,
          }));
          return (
            <Faq
              data={dbFaqData}
              title={service.name}
              highlight="FAQ"
            />
          );
        }

        const faqInfo = faqMap[service.slug] || { data: SERVICE_SUB_FAQS, title: "Roofing Services", highlight: "Expert" };
        return (
          <Faq
            data={faqInfo.data}
            title={faqInfo.title}
            highlight={faqInfo.highlight}
          />
        );
      })()}

      {/* Navigation Footer */}

      <div className="bg-white border-t border-gray-100 py-8">
        <div className="container-custom px-4">
          <Link
            href="/services"
            className="inline-flex items-center text-gray-600 hover:text-primary-600 transition-colors"
          >
            <svg
              className="w-4 h-4 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              ></path>
            </svg>
            Back to All Services
          </Link>
        </div>
      </div>
    </LayoutShell>
  );
}
