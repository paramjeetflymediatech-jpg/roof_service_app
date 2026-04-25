"use client";
import React from "react";
import Link from "next/link";
import { motion } from "framer-motion";
import LayoutShell from "@/components/LayoutShell";
import { COMPANY_INFO } from "@/lib/constants";
import SeoHead from "@/components/SeoHead";
import { getSeoData } from "@/lib/api/seo";

export async function getServerSideProps() {
  try {
    const data = await getSeoData("privacy_policy");
    return {
      props: {
        seoData: data.success ? data.data : null,
      },
    };
  } catch (error) {
    console.error("Error fetching SEO data:", error);
    return {
      props: {
        seoData: null,
      },
    };
  }
}

export default function PrivacyPolicyPage({ seoData }) {
  const lastUpdated = "February 12, 2026";

  return (
    <LayoutShell>
      <SeoHead pageName="privacy_policy" initialSeoData={seoData} />

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
            Privacy Policy
          </motion.h1>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="flex items-center gap-2 text-sm md:text-base font-medium"
          >
            <Link
              href="/"
              className="hover:text-amber-500 transition-colors flex items-center gap-1"
            >
              Home
            </Link>
            <span className="text-gray-400">›</span>
            <span className="text-amber-500">Privacy Policy</span>
          </motion.div>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-16 md:py-24 bg-[#f8f8f8]">
        <div className="container-custom max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="bg-white rounded-2xl shadow-lg p-8 md:p-12"
          >
            {/* Last Updated */}
            <div className="mb-8 pb-6 border-b border-gray-200">
              <p className="text-sm text-gray-500">
                <span className="font-semibold">Last Updated:</span>{" "}
                {lastUpdated}
              </p>
            </div>

            {/* Introduction */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Introduction
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                At {COMPANY_INFO.name || "Mainstreet Roofing"}, we are committed
                to protecting your privacy and ensuring the security of your
                personal information. This Privacy Policy explains how we
                collect, use, disclose, and safeguard your information when you
                visit our website or use our services.
              </p>
              <p className="text-gray-600 leading-relaxed">
                By using our website or services, you agree to the collection
                and use of information in accordance with this policy. If you do
                not agree with our policies and practices, please do not use our
                services.
              </p>
            </div>

            {/* Information We Collect */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Information We Collect
              </h2>

              <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">
                Personal Information
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                We may collect personal information that you voluntarily provide
                to us when you:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>Request a quote or consultation</li>
                <li>Contact us through our website or phone</li>
                <li>Schedule a service appointment</li>
                <li>Sign up for our newsletter or promotional materials</li>
                <li>Create an account on our platform</li>
              </ul>
              <p className="text-gray-600 leading-relaxed mb-4">
                This information may include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>
                  Name and contact information (email address, phone number,
                  mailing address)
                </li>
                <li>Property information (address, type of roofing project)</li>
                <li>
                  Payment information (processed securely through third-party
                  payment processors)
                </li>
                <li>
                  Photos of your property (if you submit them for project
                  estimates)
                </li>
                <li>Communication preferences</li>
              </ul>

              <h3 className="text-xl font-bold text-gray-800 mb-3 mt-6">
                Automatically Collected Information
              </h3>
              <p className="text-gray-600 leading-relaxed mb-3">
                When you visit our website, we may automatically collect certain
                information about your device, including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>IP address and browser type</li>
                <li>Operating system and device information</li>
                <li>Pages visited and time spent on our website</li>
                <li>Referring website addresses</li>
                <li>Clickstream data</li>
              </ul>
            </div>

            {/* How We Use Your Information */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                How We Use Your Information
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use the information we collect for various purposes,
                including:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>Providing and maintaining our services</li>
                <li>Processing your service requests and quotes</li>
                <li>
                  Communicating with you about your projects, appointments, and
                  inquiries
                </li>
                <li>
                  Sending you marketing communications (with your consent)
                </li>
                <li>Improving our website and services</li>
                <li>Analyzing usage patterns and trends</li>
                <li>Protecting against fraud and unauthorized activities</li>
                <li>Complying with legal obligations</li>
              </ul>
            </div>

            {/* Information Sharing and Disclosure */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Information Sharing and Disclosure
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We do not sell, trade, or rent your personal information to
                third parties. We may share your information only in the
                following circumstances:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>
                  <strong>Service Providers:</strong> We may share information
                  with trusted third-party service providers who assist us in
                  operating our website, conducting our business, or servicing
                  you (e.g., payment processors, email service providers)
                </li>
                <li>
                  <strong>Legal Requirements:</strong> We may disclose your
                  information if required by law or in response to valid
                  requests by public authorities
                </li>
                <li>
                  <strong>Business Transfers:</strong> In the event of a merger,
                  acquisition, or sale of assets, your information may be
                  transferred to the acquiring entity
                </li>
                <li>
                  <strong>With Your Consent:</strong> We may share your
                  information for any other purpose with your consent
                </li>
              </ul>
            </div>

            {/* Data Security */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Data Security
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We implement appropriate technical and organizational security
                measures to protect your personal information against
                unauthorized access, alteration, disclosure, or destruction.
                These measures include:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>Encryption of data in transit and at rest</li>
                <li>Regular security assessments and updates</li>
                <li>
                  Limited access to personal information by authorized personnel
                  only
                </li>
                <li>Secure servers and data storage facilities</li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                However, please note that no method of transmission over the
                internet or electronic storage is 100% secure. While we strive
                to protect your personal information, we cannot guarantee its
                absolute security.
              </p>
            </div>

            {/* Cookies and Tracking Technologies */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Cookies and Tracking Technologies
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                We use cookies and similar tracking technologies to track
                activity on our website and store certain information. Cookies
                are small data files that are placed on your device. You can
                instruct your browser to refuse all cookies or to indicate when
                a cookie is being sent.
              </p>
              <p className="text-gray-600 leading-relaxed">
                We use cookies for the following purposes:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>
                  Essential cookies: Required for the website to function
                  properly
                </li>
                <li>
                  Analytics cookies: Help us understand how visitors use our
                  website
                </li>
                <li>
                  Preference cookies: Remember your settings and preferences
                </li>
                <li>
                  Marketing cookies: Track your online activity to deliver
                  relevant advertisements
                </li>
              </ul>
            </div>

            {/* Your Privacy Rights */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Your Privacy Rights
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                Depending on your location, you may have the following rights
                regarding your personal information:
              </p>
              <ul className="list-disc list-inside text-gray-600 space-y-2 mb-4 ml-4">
                <li>
                  <strong>Access:</strong> Request access to your personal
                  information we hold
                </li>
                <li>
                  <strong>Correction:</strong> Request correction of inaccurate
                  or incomplete information
                </li>
                <li>
                  <strong>Deletion:</strong> Request deletion of your personal
                  information
                </li>
                <li>
                  <strong>Objection:</strong> Object to our processing of your
                  personal information
                </li>
                <li>
                  <strong>Portability:</strong> Request transfer of your
                  information to another service
                </li>
                <li>
                  <strong>Withdraw Consent:</strong> Withdraw consent for
                  marketing communications at any time
                </li>
              </ul>
              <p className="text-gray-600 leading-relaxed">
                To exercise any of these rights, please contact us using the
                information provided below.
              </p>
            </div>

            {/* Third-Party Links */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Third-Party Links
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our website may contain links to third-party websites that are
                not operated by us. We have no control over and assume no
                responsibility for the content, privacy policies, or practices
                of any third-party sites or services. We encourage you to review
                the privacy policy of every site you visit.
              </p>
            </div>

            {/* Children's Privacy */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Children's Privacy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                Our services are not directed to individuals under the age of
                18. We do not knowingly collect personal information from
                children. If you are a parent or guardian and believe that your
                child has provided us with personal information, please contact
                us so we can delete such information.
              </p>
            </div>

            {/* Changes to This Privacy Policy */}
            <div className="mb-10">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Changes to This Privacy Policy
              </h2>
              <p className="text-gray-600 leading-relaxed">
                We may update our Privacy Policy from time to time. We will
                notify you of any changes by posting the new Privacy Policy on
                this page and updating the "Last Updated" date. You are advised
                to review this Privacy Policy periodically for any changes.
                Changes to this Privacy Policy are effective when they are
                posted on this page.
              </p>
            </div>

            {/* Contact Us */}
            <div className="mb-0">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                Contact Us
              </h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                If you have any questions about this Privacy Policy or our
                privacy practices, please contact us:
              </p>
              <div className="bg-gray-50 rounded-lg p-6 space-y-2">
                <p className="text-gray-700">
                  <strong className="text-gray-900">
                    {COMPANY_INFO.name || "Mainstreet Roofing"}
                  </strong>
                </p>
                {COMPANY_INFO.email && (
                  <p className="text-gray-700">
                    <strong>Email:</strong>{" "}
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {COMPANY_INFO.email}
                    </a>
                  </p>
                )}
                {COMPANY_INFO.phone && (
                  <p className="text-gray-700">
                    <strong>Phone:</strong>{" "}
                    <a
                      href={`tel:${COMPANY_INFO.phone}`}
                      className="text-amber-600 hover:text-amber-700 transition-colors"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                  </p>
                )}
                {COMPANY_INFO.address && (
                  <p className="text-gray-700">
                    <strong>Address:</strong> {COMPANY_INFO.address}
                  </p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>
    </LayoutShell>
  );
}
