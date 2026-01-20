'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiPhone, HiMail } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { usePathname } from 'next/navigation';

import { COMPANY_INFO, NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function LayoutShell({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
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
              <div className="flex flex-col">
                <span className="text-xl md:text-2xl font-black font-heading leading-tight text-gray-900 group-hover:text-primary-600 transition-colors uppercase tracking-tighter">
                  Premium
                </span>
                <span className="text-xs md:text-sm font-bold leading-none text-accent-600 tracking-[0.2em] uppercase -mt-1">
                  Roofing
                </span>
              </div>
            </Link>

            {/* Desktop Nav */}
            <nav className="hidden md:flex gap-6">
              {NAV_LINKS.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-primary-600 font-medium"
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* CTA */}
            <Link href="/contact" className="hidden md:block">
              <button className="btn btn-primary">Get a Quote</button>
            </Link>

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
                {NAV_LINKS.map(link => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="border-b py-2 text-gray-700"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link href="/contact">
                  <button className="btn btn-primary w-full mt-4">
                    Get a Quote
                  </button>
                </Link>
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
              <Link href="/" className="flex items-center gap-4 group">
                <Logo className="w-16 h-16 transition-transform duration-300 group-hover:scale-105" />
                <div className="flex flex-col">
                  <span className="text-2xl font-black font-heading leading-tight text-white group-hover:text-primary-400 transition-colors uppercase tracking-tighter">
                    Premium
                  </span>
                  <span className="text-xs font-bold leading-none text-accent-500 tracking-[0.2em] uppercase -mt-1">
                    Roofing
                  </span>
                </div>
              </Link>
              <p className="text-gray-400 leading-relaxed">
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
              </ul>
            </div>

            {/* Services */}
            <div>
              <h3 className="text-white font-bold text-lg mb-6 uppercase tracking-wider">Our Services</h3>
              <ul className="space-y-4">
                <li><Link href="/services#residential" className="hover:text-primary-400 transition-colors">Residential Roofing</Link></li>
                <li><Link href="/services#commercial" className="hover:text-primary-400 transition-colors">Commercial Roofing</Link></li>
                <li><Link href="/services#repair" className="hover:text-primary-400 transition-colors">Roof Repairs</Link></li>
                <li><Link href="/services#solar" className="hover:text-primary-400 transition-colors">Solar Solutions</Link></li>
                <li><Link href="/services#gutter" className="hover:text-primary-400 transition-colors">Gutter Services</Link></li>
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
      </footer>
    </div>
  );
}
