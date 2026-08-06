"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Menu, X, Sparkles, Calendar } from "lucide-react";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 20) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { name: "About", href: "#about" },
    { name: "Services", href: "#services" },
    { name: "Gallery", href: "#gallery" },
    { name: "Reviews", href: "#reviews" },
    { name: "FAQ", href: "#faq" },
    { name: "Contact", href: "#contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? "bg-cream/85 dark:bg-cream/85 backdrop-blur-md border-b border-primary-pink/15 shadow-sm py-4"
          : "bg-transparent py-6"
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 group">
            <Sparkles className="h-5 w-5 text-primary-pink group-hover:rotate-12 transition-transform duration-300" />
            <span className="text-xl font-bold tracking-widest text-charcoal font-sans">
              DENAILSS
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <a
                key={link.name}
                href={link.href}
                className="text-sm font-medium text-charcoal/70 hover:text-primary-pink transition-colors duration-300 relative group"
              >
                {link.name}
                <span className="absolute -bottom-1 left-0 w-0 h-[1.5px] bg-primary-pink transition-all duration-300 group-hover:w-full" />
              </a>
            ))}
          </div>

          {/* CTA Button */}
          <div className="hidden md:block">
            <a
              href="#booking-cta"
              className="inline-flex items-center gap-2 px-6 py-2.5 bg-primary-pink hover:bg-primary-pink-dark text-white rounded-full text-sm font-semibold transition-all duration-300 hover:shadow-lg hover:shadow-primary-pink/20"
            >
              <Calendar className="h-4 w-4" />
              Book Appointment
            </a>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="text-charcoal p-1.5 focus:outline-none"
              aria-label="Toggle menu"
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <div
        className={`fixed inset-0 top-[73px] z-40 bg-cream/98 dark:bg-cream/98 border-t border-primary-pink/15 md:hidden transition-all duration-300 ease-in-out ${
          isOpen ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        <div className="flex flex-col p-8 gap-6">
          {navLinks.map((link) => (
            <a
              key={link.name}
              href={link.href}
              onClick={() => setIsOpen(false)}
              className="text-lg font-medium text-charcoal/80 hover:text-primary-pink transition-colors duration-300 py-2 border-b border-primary-pink/5"
            >
              {link.name}
            </a>
          ))}
          <a
            href="#booking-cta"
            onClick={() => setIsOpen(false)}
            className="flex items-center justify-center gap-2 px-6 py-3.5 bg-primary-pink hover:bg-primary-pink-dark text-white rounded-full text-base font-semibold transition-all duration-300 shadow-md"
          >
            <Calendar className="h-5 w-5" />
            Book Appointment
          </a>
        </div>
      </div>
    </nav>
  );
}
