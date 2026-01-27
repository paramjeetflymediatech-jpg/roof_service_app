'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin, FaWhatsapp } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

import { COMPANY_INFO, NAV_LINKS, SERVICES_DROPDOWN, SOCIAL_LINKS } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function LayoutShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const pathname = usePathname();

  /* Detect scroll */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* Close menu on route change */
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  /* Lock body scroll */
  useEffect(() => {
    document.body.style.overflow = mobileMenuOpen ? 'hidden' : '';
    return () => (document.body.style.overflow = '');
  }, [mobileMenuOpen]);


  return (
    <div className="min-h-screen flex flex-col max-w-full">
      {/* Header & Top Bar Wrapper (Fixed) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar */}
        <div className="bg-dark-900 text-white py-2 hidden lg:block">
          <div className="container-custom flex justify-between items-center text-sm">
            <div className="flex gap-6">
              <a href={`tel:${COMPANY_INFO.phone}`} className="flex gap-2">
                <HiPhone className="text-accent-500" />
                {COMPANY_INFO.phone}
              </a>
              <a href={`mailto:${COMPANY_INFO.email}`} className="flex gap-2">
                <HiMail className="text-accent-500" />
                {COMPANY_INFO.email}
              </a>
            </div>
            <div className="flex gap-4">
              <FaFacebook />
              <FaTwitter />
              <FaInstagram />
              <FaLinkedin />
            </div>
          </div>
        </div>

        {/* Header */}
        <header
          className={`transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-md py-2' : 'bg-white py-4'
            }`}
        >
          <div className="container-custom flex justify-between items-center">
            <Link href="/" className="flex items-center gap-3 group">
              <Logo className="w-20 h-20 lg:w-24 lg:h-24 transition-transform duration-300 group-hover:scale-105" />
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden lg:flex gap-8 items-center">
              {NAV_LINKS.map(link => {
                if (link.label === 'Services') {
                  return (
                    <div key={link.href} className="relative group">
                      <button className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                        {link.label}
                        <svg className="w-5 h-5 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                        </svg>
                      </button>
                      <div className="absolute left-0 mt-0 w-[600px] bg-white rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 p-4">
                        <div className="grid grid-cols-2 gap-2">
                          {SERVICES_DROPDOWN.map(service => (
                            <Link
                              key={service.href}
                              href={service.href}
                              className="flex items-center gap-3 px-4 py-3 text-gray-700 hover:bg-primary-50 hover:text-primary-600 transition-colors rounded-md"
                            >
                              <span className="text-xl flex-shrink-0">{service.icon}</span>
                              <span className="text-sm font-medium">{service.label}</span>
                            </Link>
                          ))}
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="text-gray-700 hover:text-primary-600 font-medium"
                  >
                    {link.label}
                  </Link>
                );
              })}
            </nav>


            {/* Phone & CTA Group */}
            <div className="hidden lg:flex items-center gap-2">
              {/* Phone Number */}
              <a
                href="tel:604-720-4313"
                className="flex items-center gap-2 text-gray-700 hover:text-primary-600 font-medium transition-colors"
              >
                <HiPhone className="text-xl text-primary-600" />
                <span>604-720-4313</span>
              </a>

              {/* CTA */}
              <Link href="/contact">
                <button className="btn btn-primary">Get a Quote</button>
              </Link>
            </div>

            {/* Mobile Button */}
            <button
              onClick={() => setMobileMenuOpen(prev => !prev)}
              className="lg:hidden"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiX size={30} /> : <HiMenu size={30} />}
            </button>
          </div>
        </header>

        {/* ✅ MOBILE MENU INSIDE FIXED WRAPPER */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.25 }}
              className="lg:hidden bg-white shadow-lg border-t max-h-[85vh] overflow-y-auto"
            >
              <nav className="container-custom py-6 flex flex-col gap-4">
                {NAV_LINKS.map(link => {
                  if (link.label === 'Services') {
                    return (
                      <div key={link.href}>
                        <button
                          onClick={() => setServicesDropdownOpen(!servicesDropdownOpen)}
                          className="w-full border-b py-2 text-gray-700 flex justify-between items-center"
                        >
                          {link.label}
                          <svg className={`w-4 h-4 transition-transform ${servicesDropdownOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                          </svg>
                        </button>
                        {servicesDropdownOpen && (
                          <div className="bg-gray-50 py-2">
                            {SERVICES_DROPDOWN.map(service => (
                              <Link
                                key={service.href}
                                href={service.href}
                                className="flex items-center gap-3 px-6 py-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50"
                              >
                                <span className="text-lg">{service.icon}</span>
                                <span>{service.label}</span>
                              </Link>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  }
                  return (
                    <Link
                      key={link.href}
                      href={link.href}
                      className="border-b py-2 text-gray-700"
                    >
                      {link.label}
                    </Link>
                  );
                })}

              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <main className="flex-1 pt-[102px] lg:pt-[138px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 text-gray-300 pt-16 pb-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center justify-center md:justify-start group w-full">
                <Logo className="w-16 h-16 transition-transform duration-300 group-hover:scale-105 brightness-0 invert" />
              </Link>
              <p className="text-white leading-relaxed text-center md:text-left">
                {COMPANY_INFO.tagline || 'Quality materials designed to protect your investment for decades.'}
              </p>
            </div>

            {/* Quick Links */}
            {/* <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Quick Links</h3>
              <ul className="space-y-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-primary-400 transition-colors flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div> */}

            {/* Services */}
            {/* <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider flex items-center gap-2">
                Our Services
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </h3>
              <ul className="space-y-4">
                <li>
                  <Link href="/services/new-construction" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    New construction
                  </Link>
                </li>
                <li>
                  <Link href="/services/wall-metals" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Wall Metals
                  </Link>
                </li>
                <li>
                  <Link href="/services/solar-panels" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Solar panels
                  </Link>
                </li>
                <li>
                  <Link href="/services/leak-repair" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Leak repair
                  </Link>
                </li>
                <li>
                  <Link href="/services/torch-on" className="hover:text-primary-400 transition-colors flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Torch on
                  </Link>
                </li>
              </ul>
            </div> */}

            {/* Contact Info */}
            {/* <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Contact Us</h3>
              <ul className="space-y-4">
                <li className="flex gap-4 items-start text-gray-400">
                  <div className="mt-1 text-primary-500"><HiPhone size={20} /></div>
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <a href={`tel:${COMPANY_INFO.phone}`} className="hover:text-primary-400 transition-colors">{COMPANY_INFO.phone}</a>
                  </div>
                </li>
                <li className="flex gap-4 items-start text-gray-400">
                  <div className="mt-1 text-primary-500"><HiMail size={20} /></div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a href={`mailto:${COMPANY_INFO.email}`} className="hover:text-primary-400 transition-colors">{COMPANY_INFO.email}</a>
                  </div>
                </li>
                <li className="flex gap-4 items-start text-gray-400">
                  <div className="mt-1 text-primary-500"><HiLocationMarker size={20} /></div>
                  <div>
                    <p className="text-white font-medium">Location</p>
                    <p className="hover:text-primary-400 transition-colors">{COMPANY_INFO.address}</p>
                  </div>
                </li>
              </ul>
              <div className="flex gap-4 mt-8">
                <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                  <FaFacebook />
                </a>
                <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                  <FaTwitter />
                </a>
                <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                  <FaInstagram />
                </a>
                <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all">
                  <FaLinkedin />
                </a>
              </div>
            </div> */}


            {/* Quick Links */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">
                Quick Links
              </h3>

              <ul className="space-y-4">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider flex justify-center md:justify-start items-center gap-2">
                Our Services
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              </h3>

              <ul className="space-y-4">
                <li>
                  <Link href="/services/new-construction" className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    New construction
                  </Link>
                </li>
                <li>
                  <Link href="/services/wall-metals" className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Wall Metals
                  </Link>
                </li>
                <li>
                  <Link href="/services/solar-panels" className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Solar panels
                  </Link>
                </li>
                <li>
                  <Link href="/services/leak-repair" className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Leak repair
                  </Link>
                </li>
                <li>
                  <Link href="/services/torch-on" className="hover:text-primary-400 transition-colors flex justify-center md:justify-start items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Torch on
                  </Link>
                </li>
              </ul>
            </div>




            <div className="text-center md:text-left">
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">
                Contact Us
              </h3>

              <ul className="space-y-4">
                <li className="flex flex-col md:flex-row gap-3 md:gap-4 items-center md:items-start text-gray-400">
                  <div className="text-primary-500">
                    <HiPhone size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">Phone</p>
                    <a
                      href={`tel:${COMPANY_INFO.phone}`}
                      className="hover:text-primary-400 transition-colors"
                    >
                      {COMPANY_INFO.phone}
                    </a>
                  </div>
                </li>

                <li className="flex flex-col md:flex-row gap-3 md:gap-4 items-center md:items-start text-gray-400">
                  <div className="text-primary-500">
                    <HiMail size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">Email</p>
                    <a
                      href={`mailto:${COMPANY_INFO.email}`}
                      className="hover:text-primary-400 transition-colors"
                    >
                      {COMPANY_INFO.email}
                    </a>
                  </div>
                </li>

                <li className="flex flex-col md:flex-row gap-3 md:gap-4 items-center md:items-start text-gray-400">
                  <div className="text-primary-500">
                    <HiLocationMarker size={20} />
                  </div>
                  <div>
                    <p className="text-white font-medium">Location</p>
                    <p className="hover:text-primary-400 transition-colors">
                      {COMPANY_INFO.address}
                    </p>
                  </div>
                </li>
              </ul>

              {/* Social Icons */}
              <div className="flex justify-center md:justify-start gap-4 mt-8">
                <a
                  href={SOCIAL_LINKS.facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"
                >
                  <FaFacebook />
                </a>
                <a
                  href={SOCIAL_LINKS.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"
                >
                  <FaTwitter />
                </a>
                <a
                  href={SOCIAL_LINKS.instagram}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"
                >
                  <FaInstagram />
                </a>
                <a
                  href={SOCIAL_LINKS.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-full bg-dark-800 flex items-center justify-center hover:bg-primary-600 hover:text-white transition-all"
                >
                  <FaLinkedin />
                </a>
              </div>
            </div>


          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 pt-8 mt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 text-sm">
              <p className="text-gray-500">
                © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
              </p>
              <p className="text-gray-500">
                Design and Developed by{' '}
                <a
                  href="https://flymediatech.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary-400 hover:text-primary-300 font-semibold transition-colors"
                >
                  Fly Media Technology
                </a>
              </p>
            </div>
          </div>
        </div>
      </footer >

      <div className="fixed bottom-4 left-0 right-0 z-50 flex justify-between gap-3 px-4 lg:hidden">
        {/* Phone Number */}
        <a
          href="tel:604-720-4313"
          className="flex items-center justify-center gap-2 bg-[#ea580c] text-white px-4 py-3 rounded-lg 
                   font-semibold shadow-lg hover:bg-black transition w-[48%]"
        >
          <HiPhone className="text-xl" />
          <span>Call Now</span>
        </a>

        {/* Get a Quote */}
        <Link
          href="/contact"
          className="flex items-center justify-center bg-black text-white px-4 py-3 rounded-lg 
                   font-semibold shadow-lg hover:bg-[#ea580c] transition w-[48%]"
        >
          Get a Quote
        </Link>
      </div>

      {/* WhatsApp Floating Button */}
      <a
        href="https://wa.me/16047204313"
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-24 right-6 md:bottom-8 md:right-8 z-50 bg-[#25D366] text-white p-4 rounded-full shadow-2xl hover:scale-110 hover:bg-[#128C7E] transition-all duration-300 group"
        aria-label="Chat on WhatsApp"
      >
        <FaWhatsapp size={30} />
        <span className="absolute right-full mr-3 bg-white text-gray-800 px-3 py-1 rounded-lg text-sm font-medium shadow-md opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all whitespace-nowrap">
          Chat with us
        </span>
      </a>
    </div>

  );
}
