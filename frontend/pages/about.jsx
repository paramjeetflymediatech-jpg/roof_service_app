"use client";
import { motion } from "framer-motion";
import Link from "next/link";
import { HiPhone, HiCheckCircle } from "react-icons/hi";
import { COMPANY_INFO } from "@/lib/constants";
import LayoutShell from "@/components/LayoutShell";

export default function AboutPage() {
  const values = [
    {
      title: "Quality",
      description:
        "We use only the highest quality materials and employ skilled professionals.",
    },
    {
      title: "Integrity",
      description:
        "Honest pricing, transparent communication, and reliable service every time.",
    },
    {
      title: "Excellence",
      description:
        "Every project is completed with meticulous attention to detail and craftsmanship.",
    },
    {
      title: "Community",
      description:
        "We are proud members of the community we serve and support local initiatives.",
    },
  ];

  const teamMembers = [
    {
      name: "John Smith",
      role: "Founder & Lead Contractor",
      experience: "25+ years",
    },
    {
      name: "Sarah Johnson",
      role: "Operations Manager",
      experience: "15+ years",
    },
    { name: "Mike Wilson", role: "Senior Technician", experience: "20+ years" },
    {
      name: "David Brown",
      role: "Project Coordinator",
      experience: "12+ years",
    },
  ];

  return (
    <LayoutShell>
      {/* Hero Section */}
      <div
        className="relative h-96 bg-cover bg-center flex items-center justify-center"
        style={{
           backgroundImage: "url('/assets/ban.jpg')",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50"></div>
        <div className="relative z-10 text-center text-white">
          <motion.h1
            className="text-4xl md:text-5xl font-bold mb-4"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            About Mainstreet Roofing
          </motion.h1>
          <motion.p
            className="text-xl max-w-2xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            Leading the roofing industry with excellence, integrity, and quality
            craftsmanship
          </motion.p>
        </div>
      </div>

      {/* Main Content */}
      <div className="min-h-screen bg-gray-50 py-16">
        <div className="container-custom">
          {/* Who We Are Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center mb-20">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
                
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
              Mainstreet Roofing is a trusted name in the roofing industry
              </h2>
              <p className="text-gray-700 text-lg leading-relaxed mb-4">
                Mainstreet Roofing is a trusted leader in the roofing industry,
                serving residential and commercial clients across the region.
                With over two decades of experience, we have built our
                reputation on delivering exceptional results and outstanding
                customer service.
              </p>
              <p className="text-gray-700 text-lg leading-relaxed mb-6">
                Our team of certified professionals is dedicated to providing
                innovative roofing solutions that protect your property and
                enhance its value. From new installations to repairs and
                maintenance, we handle every project with precision and care.
              </p>
              <div className="flex flex-wrap gap-4">
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-3xl font-bold text-amber-600">500+</p>
                  <p className="text-gray-700">Projects Completed</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-3xl font-bold text-amber-600">20+</p>
                  <p className="text-gray-700">Years Experience</p>
                </div>
                <div className="bg-white rounded-lg p-4 shadow-md">
                  <p className="text-3xl font-bold text-amber-600">100%</p>
                  <p className="text-gray-700">Satisfaction Rate</p>
                </div>
              </div>
            </motion.div>
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="rounded-lg overflow-hidden shadow-2xl"
            >
              <img
                src="https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=600&h=600&fit=crop"
                alt="Team working"
                className="w-full h-full object-cover"
              />
            </motion.div>
          </div>

          {/* Our Values */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Core Values
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                These principles guide everything we do and define our
                commitment to our customers
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {values.map((value, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg p-6 shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="w-12 h-12 bg-amber-600 rounded-full flex items-center justify-center mb-4">
                    <HiCheckCircle className="text-white text-xl" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">
                    {value.title}
                  </h3>
                  <p className="text-gray-700">{value.description}</p>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Our Team */}
          <div className="mb-20">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Our Expert Team
              </h2>
              <p className="text-gray-700 text-lg max-w-2xl mx-auto">
                Meet the skilled professionals dedicated to delivering
                excellence on every project
              </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {teamMembers.map((member, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  viewport={{ once: true }}
                  className="bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow"
                >
                  <div className="h-48 bg-gradient-to-br from-amber-400 to-amber-600"></div>
                  <div className="p-6">
                    <h3 className="text-lg font-bold text-gray-900 mb-1">
                      {member.name}
                    </h3>
                    <p className="text-amber-600 font-semibold text-sm mb-2">
                      {member.role}
                    </p>
                    <p className="text-gray-700 text-sm">{member.experience}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>

          {/* Why Choose Us */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-white rounded-lg shadow-lg p-12 mb-16"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8">
              Why Choose Mainstreet Roofing?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                "Licensed, insured, and bonded contractors",
                "Free estimates and consultations",
                "Quality materials and expert installation",
                "24/7 emergency repair services",
                "Warranty on all work performed",
                "Trusted by hundreds of satisfied customers",
                "Competitive pricing without compromising quality",
                "Transparent communication throughout the project",
              ].map((reason, index) => (
                <div key={index} className="flex items-start gap-4">
                  <div className="w-6 h-6 rounded-full bg-amber-600 flex-shrink-0 flex items-center justify-center mt-1">
                    <span className="text-white text-sm font-bold">✓</span>
                  </div>
                  <p className="text-gray-700">{reason}</p>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Contact CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="bg-gradient-to-br from-gray-800 to-gray-900 text-white rounded-lg p-12 text-center"
          >
            <h3 className="text-3xl font-bold mb-4">Ready to Work With Us?</h3>
            <p className="text-gray-300 text-lg mb-8 max-w-2xl mx-auto">
              Contact us today for a free consultation and quote. Our team is
              ready to help protect your property.
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
                className="bg-white hover:bg-gray-100 text-gray-900 font-bold py-3 px-8 rounded-lg transition-colors"
              >
                Get a Free Quote
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </LayoutShell>
  );
}
