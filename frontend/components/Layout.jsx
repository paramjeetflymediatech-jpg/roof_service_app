import { useState, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { HiMenu, HiX, HiPhone, HiMail } from 'react-icons/hi';
import { FaFacebook, FaTwitter, FaInstagram, FaLinkedin } from 'react-icons/fa';
import { COMPANY_INFO, NAV_LINKS, SOCIAL_LINKS } from '@/lib/constants';
import Logo from '@/components/Logo';

export default function Layout({ children }) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <div className="min-h-screen flex flex-col">
      {/* Top Bar */}
      <div className="bg-dark-900 text-white py-2 hidden md:block">
        <div className="container-custom">
          <div className="flex justify-between items-center text-sm">
            <div className="flex items-center gap-6">
              <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-2 hover:text-accent-400 transition-colors">
                <HiPhone className="text-accent-500" />
                {COMPANY_INFO.phone}
              </a>
              <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2 hover:text-accent-400 transition-colors">
                <HiMail className="text-accent-500" />
                {COMPANY_INFO.email}
              </a>
            </div>
            <div className="flex items-center gap-4">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaFacebook />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaTwitter />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaInstagram />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaLinkedin />
              </a>
            </div>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <header
        className={`sticky top-0 z-50 transition-all duration-300 ${scrolled
          ? 'bg-white shadow-lg py-3'
          : 'bg-white/95 backdrop-blur-sm py-4'
          }`}
      >
        <div className="container-custom">
          <div className="flex justify-between items-center">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-3">
              <Logo className="w-10 h-10 md:w-12 md:h-12" />
              <motion.div
                className="text-2xl md:text-3xl font-bold font-heading"
                whileHover={{ scale: 1.05 }}
              >
                <span className="text-primary-600">Premium</span>
                <span className="text-accent-600">Roofing</span>
              </motion.div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  className="text-gray-700 hover:text-primary-600 font-medium transition-colors relative group text-sm xl:text-base whitespace-nowrap"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary-600 group-hover:w-full transition-all duration-300" />
                </Link>
              ))}
              <Link href="/contact">
                <motion.button
                  className="btn btn-primary text-sm xl:text-base px-4 xl:px-6"
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  Get a Quote
                </motion.button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={toggleMobileMenu}
              className="lg:hidden text-gray-700 hover:text-primary-600 transition-colors"
              aria-label="Toggle menu"
            >
              {mobileMenuOpen ? <HiX className="text-3xl" /> : <HiMenu className="text-3xl" />}
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden bg-white shadow-lg overflow-hidden fixed top-[120px] md:top-[88px] left-0 right-0 z-40"
          >
            <nav className="container-custom py-6 flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className="text-gray-700 hover:text-primary-600 font-medium py-2 border-b border-gray-100 transition-colors"
                >
                  {link.label}
                </Link>
              ))}
              <Link href="/contact" onClick={() => setMobileMenuOpen(false)}>
                <button className="btn btn-primary w-full mt-4">
                  Get a Quote
                </button>
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-dark-900 text-gray-300">
        <div className="container-custom py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Company Info */}
            <div>
              <h3 className="text-2xl font-bold text-white mb-4 font-heading">
                <span className="text-primary-400">Premium</span>
                <span className="text-accent-400">Roofing</span>
              </h3>
              <p className="text-gray-400 mb-4">{COMPANY_INFO.tagline}</p>
              <p className="text-sm text-gray-400">{COMPANY_INFO.emergency}</p>
            </div>

            {/* Quick Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Quick Links</h4>
              <ul className="space-y-2">
                {NAV_LINKS.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="hover:text-accent-400 transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Services */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Our Services</h4>
              <ul className="space-y-2 text-sm">
                <li className="hover:text-accent-400 transition-colors cursor-pointer">Residential Roofing</li>
                <li className="hover:text-accent-400 transition-colors cursor-pointer">Commercial Roofing</li>
                <li className="hover:text-accent-400 transition-colors cursor-pointer">Roof Repairs</li>
                <li className="hover:text-accent-400 transition-colors cursor-pointer">New Construction</li>
                <li className="hover:text-accent-400 transition-colors cursor-pointer">Roof Inspection</li>
                <li className="hover:text-accent-400 transition-colors cursor-pointer">Gutter Services</li>
              </ul>
            </div>

            {/* Contact Info */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-4">Contact Us</h4>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href={`tel:${COMPANY_INFO.phone}`} className="flex items-center gap-2 hover:text-accent-400 transition-colors">
                    <HiPhone className="text-accent-500" />
                    {COMPANY_INFO.phone}
                  </a>
                </li>
                <li>
                  <a href={`mailto:${COMPANY_INFO.email}`} className="flex items-center gap-2 hover:text-accent-400 transition-colors">
                    <HiMail className="text-accent-500" />
                    {COMPANY_INFO.email}
                  </a>
                </li>
                <li className="text-gray-400">{COMPANY_INFO.address}</li>
                <li className="text-gray-400">{COMPANY_INFO.hours}</li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-gray-800 mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-gray-400">
              © {new Date().getFullYear()} {COMPANY_INFO.name}. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              <a href={SOCIAL_LINKS.facebook} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaFacebook className="text-xl" />
              </a>
              <a href={SOCIAL_LINKS.twitter} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaTwitter className="text-xl" />
              </a>
              <a href={SOCIAL_LINKS.instagram} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaInstagram className="text-xl" />
              </a>
              <a href={SOCIAL_LINKS.linkedin} target="_blank" rel="noopener noreferrer" className="hover:text-accent-400 transition-colors">
                <FaLinkedin className="text-xl" />
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

