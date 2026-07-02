import { MapPin, Mail, Phone, Facebook, Twitter, Instagram, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import SectionReveal from "@/components/SectionReveal";
import { useLanguage } from "@/hooks/useLanguage";

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { t } = useLanguage();

  const footerLinks = {
    services: [
      { label: t('footer.plumbers'), href: "#" },
      { label: t('footer.electricians'), href: "#" },
      { label: t('footer.doctors'), href: "#" },
      { label: t('footer.cleaners'), href: "#" },
      { label: t('footer.painters'), href: "#" },
    ],
    company: [
      { label: t('footer.about'), href: "#about" },
      { label: t('footer.howItWorks'), href: "#how-it-works" },
      { label: t('footer.partner'), href: "#" },
      { label: t('footer.careers'), href: "#" },
      { label: t('footer.contact'), href: "#" },
    ],
    support: [
      { label: t('footer.helpCenter'), href: "#" },
      { label: t('footer.safety'), href: "#" },
      { label: t('footer.terms'), href: "#" },
      { label: t('footer.privacy'), href: "#" },
      { label: t('footer.faqs'), href: "#" },
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
              {t('footer.tagline')}
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
            <h4 className="text-background font-semibold mb-4">{t('footer.services')}</h4>
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
            <h4 className="text-background font-semibold mb-4">{t('footer.company')}</h4>
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
            <h4 className="text-background font-semibold mb-4">{t('footer.support')}</h4>
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
            © {currentYear} Urban Sahay. {t('footer.rights')}
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
