'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiPhone, HiMail, HiLocationMarker } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

import { COMPANY_INFO, NAV_LINKS, SERVICES_DROPDOWN, SOCIAL_LINKS } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function LayoutShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [servicesDropdownOpen, setServicesDropdownOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [showAppModal, setShowAppModal] = useState(false);
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

  /* App Modal Logic */
  useEffect(() => {
    // Show modal after 2 seconds if not dismissed in current session
    const isDismissed = sessionStorage.getItem('app_modal_dismissed');
    if (!isDismissed) {
      const timer = setTimeout(() => setShowAppModal(true), 10000);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleCloseModal = () => {
    setShowAppModal(false);
    sessionStorage.setItem('app_modal_dismissed', 'true');
  };

  return (
    <div className="min-h-screen flex flex-col max-w-full">
      {/* Header & Top Bar Wrapper (Fixed) */}
      <div className="fixed top-0 left-0 right-0 z-50">
        {/* Top Bar */}
        <div className="bg-dark-900 text-white py-2 hidden md:block">
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
              <Logo className="w-14 h-14 md:w-16 md:h-16 transition-transform duration-300 group-hover:scale-105" />

            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-8 items-center">
              {NAV_LINKS.map(link => {
                if (link.label === 'Services') {
                  return (
                    <div key={link.href} className="relative group">
                      <button className="text-gray-700 hover:text-primary-600 font-medium flex items-center gap-1">
                        {link.label}
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
            <div className="hidden md:flex items-center gap-2">
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
              className="md:hidden"
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
              className="md:hidden bg-white shadow-lg border-t"
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
                <div className="mt-auto pt-6 border-t space-y-4">
                  <a
                    href={`tel:${COMPANY_INFO.phone}`}
                    className="flex items-center justify-center gap-2 text-gray-900 font-bold text-lg"
                  >
                    <HiPhone className="text-xl text-primary-600" />
                    <span>{COMPANY_INFO.phone}</span>
                  </a>
                  <Link href="/contact">
                    <button className="btn btn-primary w-full py-4 text-lg">
                      Get a Quote
                    </button>
                  </Link>
                  {/* App Promo Card */}
                  <div className="bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl p-6 text-white shadow-xl relative overflow-hidden group mt-4">
                    {/* Decorative Background Elements */}
                    <div className="absolute -right-4 -top-4 w-24 h-24 bg-white/10 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-500"></div>

                    <div className="relative z-10">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center shadow-lg">
                          <Logo className="w-8 h-8" />
                        </div>
                        <div>
                          <h4 className="font-bold text-lg leading-tight">Our App is Live!</h4>
                          <p className="text-primary-100 text-xs">Better roofing experience</p>
                        </div>
                      </div>

                      <a
                        href="/download/roof-service.apk"
                        download
                        className="flex items-center justify-center gap-2 w-full py-3 bg-white text-primary-700 font-bold rounded-lg hover:bg-primary-50 transition-colors shadow-md text-sm"
                      >
                        Download APK
                      </a>
                    </div>
                  </div>
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Content */}
      <main className="flex-1 pt-[102px] md:pt-[138px]">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-dark-900 text-gray-300 pt-16 pb-8">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 mb-12">
            {/* Company Info */}
            <div className="space-y-6">
              <Link href="/" className="flex items-center justify-start group">
                <Logo className="w-16 h-16 transition-transform duration-300 group-hover:scale-105 brightness-0 invert" />
              </Link>
              <p className="text-white leading-relaxed">
                {COMPANY_INFO.tagline || 'Quality materials designed to protect your investment for decades.'}
              </p>
              <div className="flex gap-4">
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
            </div>

            {/* Quick Links */}
            <div>
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
                <li>
                  <a
                    href="/download/roof-service.apk"
                    download
                    className="hover:text-primary-400 transition-colors flex items-center gap-2 font-semibold text-primary-400"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary-600"></span>
                    Download Android App
                  </a>
                </li>
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Our Services</h3>
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
            </div>

            {/* Contact Info */}
            <div>
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

      {/* App Download Promo Modal */}
      <AnimatePresence>
        {showAppModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-2xl shadow-2xl max-w-md w-full overflow-hidden relative"
            >
              {/* Close Button */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-colors z-10"
              >
                <HiX size={24} />
              </button>

              <div className="p-8 flex flex-col items-center text-center">
                {/* Icon/Logo area */}
                <div className="w-20 h-20 bg-primary-50 rounded-2xl flex items-center justify-center mb-6">
                  <Logo className="w-14 h-14" />
                </div>

                <h2 className="text-2xl font-bold text-gray-900 mb-3">
                  Download Our Official App
                </h2>
                <p className="text-gray-600 mb-8 leading-relaxed">
                  Get a faster, more convenient way to manage your roofing needs. Access our services anywhere, anytime from your Android device.
                </p>

                <div className="flex flex-col w-full gap-3">
                  <a
                    href="/download/roof-service.apk"
                    download
                    onClick={handleCloseModal}
                    className="flex items-center justify-center gap-2 w-full py-4 bg-primary-600 text-white font-bold rounded-xl hover:bg-primary-700 transition-all shadow-lg shadow-primary-200"
                  >
                    Download for Android
                  </a>
                  <button
                    onClick={handleCloseModal}
                    className="w-full py-3 text-gray-500 font-medium hover:text-gray-700 transition-colors"
                  >
                    Maybe Later
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div >
  );
}
