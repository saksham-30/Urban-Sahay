import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { label: "Plumbers", href: "#" },
      { label: "Electricians", href: "#" },
      { label: "Doctors", href: "#" },
      { label: "Cleaners", href: "#" },
      { label: "Painters", href: "#" },
    ],
    company: [
      { label: "About Us", href: "#about" },
      { label: "How It Works", href: "#how-it-works" },
      { label: "Become a Partner", href: "#" },
      { label: "Careers", href: "#" },
      { label: "Contact", href: "#" },
    ],
    support: [
      { label: "Help Center", href: "#" },
      { label: "Safety", href: "#" },
      { label: "Terms of Service", href: "#" },
      { label: "Privacy Policy", href: "#" },
      { label: "FAQs", href: "#" },
    ],
  };

  const socialLinks = [
    { icon: Facebook, href: "#", label: "Facebook" },
    { icon: Twitter, href: "#", label: "Twitter" },
    { icon: Instagram, href: "#", label: "Instagram" },
    { icon: Linkedin, href: "#", label: "LinkedIn" },
  ];

  return (
    <footer id="about" className="bg-foreground text-background/80">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 lg:grid-cols-5 gap-10">
          {/* Brand */}
          <SectionReveal className="lg:col-span-2" direction="left">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-xl gradient-hero flex items-center justify-center">
                <MapPin className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold text-background">
                Urban<span className="text-primary">Sahay</span>
              </span>
            </div>
            <p className="text-background/60 mb-6 max-w-sm leading-relaxed">
              Connecting you with trusted local service providers. 
              New to the city? We've got your back with verified professionals for all your needs.
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2 group">
                <Mail className="w-4 h-4 text-primary" />
                <span className="group-hover:text-primary transition-colors">support@urbansahay.com</span>
              </div>
              <div className="flex items-center gap-2 group">
                <Phone className="w-4 h-4 text-primary" />
                <span className="group-hover:text-primary transition-colors">+91 1800-123-4567</span>
              </div>
            </div>
          </SectionReveal>

          {/* Services */}
          <SectionReveal delay={0.1}>
            <h4 className="text-background font-semibold mb-4">Services</h4>
            <ul className="space-y-2.5">
              {footerLinks.services.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </SectionReveal>

          {/* Company */}
          <SectionReveal delay={0.2}>
            <h4 className="text-background font-semibold mb-4">Company</h4>
            <ul className="space-y-2.5">
              {footerLinks.company.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </SectionReveal>

          {/* Support */}
          <SectionReveal delay={0.3}>
            <h4 className="text-background font-semibold mb-4">Support</h4>
            <ul className="space-y-2.5">
              {footerLinks.support.map((link) => (
                <li key={link.label}>
                  <a href={link.href} className="hover:text-primary transition-colors text-sm hover:translate-x-1 inline-block transform duration-200">
                    {link.label}
                  </a>
                </li>
              ))}
            </ul>
          </SectionReveal>
        </div>

        {/* Bottom */}
        <div className="mt-12 pt-8 border-t border-background/10 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-sm text-background/50">
            © {currentYear} Urban Sahay. All rights reserved.
          </p>
          <div className="flex items-center gap-3">
            {socialLinks.map((social) => (
              <motion.a
                key={social.label}
                href={social.href}
                whileHover={{ y: -3, scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="w-9 h-9 rounded-lg bg-background/10 flex items-center justify-center hover:bg-primary transition-colors duration-300"
                aria-label={social.label}
              >
                <social.icon className="w-4 h-4" />
              </motion.a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
