import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import LayoutShell from "@/components/LayoutShell";
import SeoHead from "@/components/SeoHead";
import QuoteForm from "@/components/QuoteForm";
import Faq from "@/components/Faq";
import apiClient from "@/lib/apiClient";
import { getSeoData } from "@/lib/api/seo";
import { HiLocationMarker, HiPhone, HiChevronRight, HiCheckCircle } from "react-icons/hi";



export async function getServerSideProps({ params }) {
  const { locationSlug } = params;

  try {
    // Fetch location and services dynamically
    const [locationResponse, servicesResponse] = await Promise.all([
      apiClient.get(`/locations/slug/${locationSlug}`).catch(() => null),
      apiClient.get("/services/location-services?limit=100").catch(() => null),
    ]);

    const location = locationResponse?.data || null;
    const services = servicesResponse?.data?.items || [];

    if (!location) {
      return {
        notFound: true,
      };
    }

    // Safely parse neighborhoods JSON
    let neighborhoods = [];
    if (location.neighborhoods) {
      try {
        neighborhoods = typeof location.neighborhoods === "string"
          ? JSON.parse(location.neighborhoods)
          : location.neighborhoods;
      } catch (e) {
        console.error("Failed to parse neighborhoods:", e);
      }
    }

    // Fetch SEO data from the database
    const seoPath = `services/${locationSlug}`;
    const seoResponse = await getSeoData(seoPath).catch(() => null);

    // Dynamically build local SEO (fallback)
    const fallbackSeo = {
      pageTitle: `Roofing Services in ${location.name} BC | Mainstreet Roofing Ltd`,
      metaDescription: `Looking for top-rated roofing contractors in ${location.name}, BC? Mainstreet Roofing offers expert residential and commercial roofing solutions, including metal roofs, torch-on, and emergency repairs.`,
      metaRobots: "index, follow",
      ogTitle: `Expert Roofing Contractors in ${location.name}, BC`,
      ogDescription: `Mainstreet Roofing offers durable and affordable roofing services in ${location.name}. Free estimates, certified professionals, and guaranteed quality.`,
      ogImage: location.image,
    };

    let seoData = fallbackSeo;
    if (seoResponse && seoResponse.success && seoResponse.data) {
      const dbSeo = seoResponse.data;
      seoData = {
        ...fallbackSeo,
        ...dbSeo,
        pageTitle: dbSeo.pageTitle || fallbackSeo.pageTitle,
        metaDescription: dbSeo.metaDescription || fallbackSeo.metaDescription,
        metaRobots: dbSeo.metaRobots || fallbackSeo.metaRobots,
        ogTitle: dbSeo.ogTitle || fallbackSeo.ogTitle,
        ogDescription: dbSeo.ogDescription || fallbackSeo.ogDescription,
        ogImage: dbSeo.ogImage || fallbackSeo.ogImage,
        canonicalUrl: dbSeo.canonicalUrl || fallbackSeo.canonicalUrl,
        schemaMarkup: dbSeo.schemaMarkup || fallbackSeo.schemaMarkup,
        headerScripts: dbSeo.headerScripts || fallbackSeo.headerScripts,
        globalHeaderScripts: dbSeo.globalHeaderScripts || fallbackSeo.globalHeaderScripts,
        googleAnalyticsId: dbSeo.googleAnalyticsId || fallbackSeo.googleAnalyticsId,
        googleTagManagerId: dbSeo.googleTagManagerId || fallbackSeo.googleTagManagerId,
      };
    }

    return {
      props: {
        location: {
          ...location,
          neighborhoods,
        },
        services,
        seoData,
      },
    };
  } catch (error) {
    console.error("Error fetching location detail props:", error);
    return {
      notFound: true,
    };
  }
}

export default function LocationDetailPage({ location, services = [], seoData }) {
  // Filter services associated with this location. If a service has no locationIds, it's considered global.
  const filteredServices = services.filter((service) => {
    if (!service.locationIds || !Array.isArray(service.locationIds) || service.locationIds.length === 0) {
      return true;
    }
    return service.locationIds.includes(location.id);
  });

  // Localized FAQs
  const localFaqs = [
    {
      id: 1,
      question: `Do you offer emergency roofing repairs in ${location.name}?`,
      answer: `Yes, Mainstreet Roofing provides 24/7 emergency roof leak repair services in ${location.name} and surrounding communities. If you have active storm damage or severe leaks, contact us immediately at 604-720-4313.`,
    },
    {
      id: 2,
      question: `How long does a roof replacement take in ${location.name}?`,
      answer: `Most residential roof replacements in ${location.name} take between 1 to 3 days to complete, depending on the complexity, size, and weather conditions. We always ensure the site is cleaned and left in perfect condition.`,
    },
    {
      id: 3,
      question: `Are your roofing services in ${location.name} fully insured and licensed?`,
      answer: `Absolutely! We are fully licensed, bonded, and carry extensive liability insurance (up to $5M) plus WCB coverage for all roofing projects in ${location.name}. We are also BBB accredited, ensuring peace of mind for our clients.`,
    },
    {
      id: 4,
      question: `What roofing materials do you recommend for ${location.name}'s weather?`,
      answer: `For ${location.name}'s wet climate, we recommend high-quality fiberglass asphalt shingles, torch-on membranes (for flat roofs), or metal roofing. These materials offer outstanding moisture protection, wind resistance, and longevity.`,
    },
  ];

  return (
    <LayoutShell>
      <SeoHead pageName={`services-${location.slug}`} initialSeoData={seoData} />

      {/* Hero Section */}
      <div className="relative h-[40vh] min-h-[350px] flex items-center justify-center bg-gray-900 overflow-hidden">
        {location.image && (
          <div className="absolute inset-0 z-0">
            <Image
              src={location.image}
              alt={`Roofing Contractor in ${location.name}`}
              fill
              className="object-cover opacity-60"
              priority
            />
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-dark-900/90 via-dark-900/50 to-transparent"></div>

        <div className="relative z-10 container-custom px-4 text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-accent-600/90 text-white rounded-full text-xs font-semibold mb-4 tracking-wider uppercase">
              <HiLocationMarker />
              <span>Lower Mainland Service Area</span>
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 font-heading tracking-tight">
              Roofing Services in {location.name}, BC
            </h1>
            <p className="text-lg md:text-xl text-gray-200 max-w-2xl mx-auto">
              Professional residential & commercial roofing solutions tailored for {location.name} properties.
            </p>
          </motion.div>
        </div>
      </div>

      {/* Breadcrumbs Navigation */}
      <div className="bg-gray-100 border-b border-gray-200 py-3">
        <div className="container-custom px-4 text-sm text-gray-600 flex items-center gap-2">
          <Link href="/" className="hover:text-primary-600 transition-colors">
            Home
          </Link>
          <HiChevronRight className="text-gray-400" />
          <Link href="/locations" className="hover:text-primary-600 transition-colors">
            Locations
          </Link>
          <HiChevronRight className="text-gray-400" />
          <span className="text-gray-900 font-semibold">{location.name}</span>
        </div>
      </div>

      {/* Introduction Section */}
      <section className="py-16 bg-white">
        <div className="container-custom px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className="space-y-6"
            >
              <span className="text-sm font-semibold uppercase tracking-wider text-accent-600">Why Mainstreet Roofing?</span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading">
                Top-Tier Roofing Contractors in {location.name}
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">
                At Mainstreet Roofing, we provide expert roofing repair, reroofing, and installation services to homeowners and commercial property managers in {location.name}. Our local crews understand the unique weather patterns of BC, ensuring your roof is built to withstand heavy rains, wind, and snow.
              </p>
              
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  <HiCheckCircle className="text-accent-500 text-2xl shrink-0" />
                  <span className="text-gray-800 font-medium">Licensed, Bonded, and Fully Insured ($5M Liability)</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheckCircle className="text-accent-500 text-2xl shrink-0" />
                  <span className="text-gray-800 font-medium">Over 5 Years of Local Lower Mainland Experience</span>
                </div>
                <div className="flex items-center gap-3">
                  <HiCheckCircle className="text-accent-500 text-2xl shrink-0" />
                  <span className="text-gray-800 font-medium">Premium Warranties on Both Labor and Materials</span>
                </div>
              </div>

              {/* Neighborhoods served info */}
              {Array.isArray(location.neighborhoods) && location.neighborhoods.length > 0 && (
                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                  <h4 className="font-bold text-gray-900 mb-3 flex items-center gap-2">
                    <HiLocationMarker className="text-accent-600" />
                    <span>Neighborhoods We Serve in {location.name}:</span>
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {location.neighborhoods.map((n) => (
                      <span key={n} className="bg-white text-gray-800 border border-gray-200 px-3 py-1 rounded-lg text-sm font-medium shadow-sm">
                        {n}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </motion.div>

            {/* Local image illustration / visual card */}
            {location.image && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="relative h-[400px] w-full rounded-3xl overflow-hidden shadow-xl"
              >
                <Image
                  src={location.image}
                  alt={`Premium Roofing in ${location.name}`}
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-dark-900 via-transparent to-transparent"></div>
                <div className="absolute bottom-8 left-8 text-white">
                  <p className="text-accent-400 font-semibold tracking-widest uppercase text-xs mb-1">Local Roofing Specialist</p>
                  <h3 className="text-2xl font-bold font-heading">Protecting {location.name} Homes</h3>
                  <p className="text-gray-300 text-sm mt-1">Reliable, durable roofing systems built for decades.</p>
                </div>
              </motion.div>
            )}
          </div>
        </div>
      </section>

      {/* Services Grid Section */}
      <section className="py-16 bg-gray-50 border-y border-gray-200">
        <div className="container-custom px-4">
          <div className="text-center mb-12">
            <span className="text-sm font-semibold uppercase tracking-wider text-accent-600">Local Services</span>
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mt-1">
              Our Services in {location.name}
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto mt-3">
              We specialize in flat, sloped, metal, and shingle roofing systems. Check out our main service options:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service, index) => (
              <motion.div
                key={service.slug}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.05 }}
                className="bg-white rounded-2xl shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 p-6 flex flex-col justify-between hover:-translate-y-1 group"
              >
                <div>
                  <div className="flex items-start gap-4 mb-4">
                    <span className="text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                      {service.icon || "🛠️"}
                    </span>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 font-heading leading-tight group-hover:text-primary-600 transition-colors">
                        {service.name} in {location.name}
                      </h3>
                      {service.category && (
                        <span className="text-xs text-gray-500 font-medium">
                          {service.category.name}
                        </span>
                      )}
                    </div>
                  </div>
                  <p className="text-gray-600 text-sm leading-relaxed mb-6">
                    {service.shortDescription}
                  </p>
                </div>
                <div>
                  <Link href={`/services/${service.slug}?location=${location.slug}`}>
                    <span className="inline-flex items-center gap-1.5 text-sm font-bold text-primary-600 hover:text-primary-700 transition-colors cursor-pointer">
                      <span>Learn More</span>
                      <HiChevronRight />
                    </span>
                  </Link>
                </div>
              </motion.div>
            ))}

            {filteredServices.length === 0 && (
              <div className="col-span-3 text-center py-12">
                <p className="text-gray-500 text-lg">No services configured for this location. Please add some in the admin panel.</p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Localized FAQ Section */}
      <Faq
        data={localFaqs}
        title={`${location.name} Roofing`}
        highlight="FAQs"
      />

      {/* Localized Lead Form */}
      <div id="quote-form-section" className="bg-white">
        <div className="text-center pt-16">
          <span className="text-sm font-semibold uppercase tracking-wider text-accent-600">Free Estimate</span>
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 font-heading mt-1">
            Get Your Free Estimate in {location.name}
          </h2>
          <p className="text-gray-600 max-w-2xl mx-auto mt-3 px-4">
            Fill out the form below. Our local team will assess your roofing requirements and provide a detailed quote.
          </p>
        </div>
        <QuoteForm initialCity={location.name} />
      </div>
    </LayoutShell>
  );
}
