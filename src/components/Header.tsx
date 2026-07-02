import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { useAppMode } from "@/hooks/useAppMode";
import { Menu, X, ClipboardList, Briefcase, ShieldCheck } from "lucide-react";
import NotificationBell from "@/components/provider-dashboard/NotificationBell";
import KYCBanner from "@/components/KYCBanner";
import ProfileDropdown from "@/components/ProfileDropdown";
import { motion, AnimatePresence } from "framer-motion";
import ModeToggle from "@/components/ModeToggle";
import { useLanguage } from "@/hooks/useLanguage";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { user, isLoading } = useAuth();
  const { mode } = useAppMode();
  const { t } = useLanguage();
  const isHome = location.pathname === "/";

  const navLinks = [
    { label: t("header.services"), href: isHome ? "#services" : "/services", isRoute: !isHome },
    { label: t("header.howItWorks"), href: isHome ? "#how-it-works" : "/#how-it-works", isRoute: !isHome },
  ];

  const handleNavClick = (link: { href: string; isRoute: boolean }, closeMobile?: boolean) => {
    if (closeMobile) setIsMenuOpen(false);
    if (link.isRoute) {
      navigate(link.href);
    }
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card/80 backdrop-blur-md border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-2 flex-shrink-0">
            <img src="/urban-sahay-logo.png" alt="Urban Sahay" className="w-9 h-9 rounded-xl object-cover" />
            <span className="text-lg font-bold text-foreground">
              Urban<span className="text-primary">Sahay</span>
            </span>
          </a>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((link) =>
              link.isRoute ? (
                <button
                  key={link.label}
                  onClick={() => handleNavClick(link)}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </button>
              ) : (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-sm text-muted-foreground hover:text-primary transition-colors font-medium"
                >
                  {link.label}
                </a>
              )
            )}
          </nav>

          {/* Desktop CTA */}
          <div className="hidden md:flex items-center gap-2">
            <ModeToggle />
            {user && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm font-medium"
                onClick={() => navigate("/kyc-verification")}
              >
                <ShieldCheck className="w-4 h-4" />
                {t("header.ekyc")}
              </Button>
            )}
            {user && mode === "customer" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm font-medium"
                onClick={() => navigate("/my-requests")}
              >
                <ClipboardList className="w-4 h-4" />
                {t("header.myRequests")}
              </Button>
            )}
            {user && mode === "provider" && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1.5 text-sm font-medium"
                onClick={() => navigate("/provider-jobs")}
              >
                <Briefcase className="w-4 h-4" />
                {t("header.myJobs")}
              </Button>
            )}
            {user && <NotificationBell />}
            {isLoading ? (
              <div className="h-9 w-20 bg-muted animate-pulse rounded-lg" />
            ) : user ? (
              <ProfileDropdown variant="desktop" />
            ) : (
              <>
                <Button variant="ghost" size="sm" onClick={() => navigate("/auth")}>
                  {t("header.signIn")}
                </Button>
                <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
                  {t("header.getStarted")}
                </Button>
              </>
            )}
          </div>

          {/* Mobile Actions */}
          <div className="md:hidden flex items-center gap-1">
            <ModeToggle />
            {user && (
              <button
                className="p-2 text-primary relative"
                onClick={() => navigate("/kyc-verification")}
                title={t("header.ekycVerification")}
              >
                <ShieldCheck className="w-5 h-5" />
              </button>
            )}
            {user && mode === "customer" && (
              <button
                className="p-2 text-primary relative"
                onClick={() => navigate("/my-requests")}
              >
                <ClipboardList className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-card" />
              </button>
            )}
            {user && mode === "provider" && (
              <button
                className="p-2 text-primary relative"
                onClick={() => navigate("/provider-jobs")}
              >
                <Briefcase className="w-5 h-5" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-primary rounded-full border-2 border-card" />
              </button>
            )}
            {user && <NotificationBell />}
            {user && <ProfileDropdown variant="mobile" />}
            <button
              className="p-2 text-foreground"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
            >
              {isMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      <AnimatePresence>
        {isMenuOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-card border-b border-border overflow-hidden"
          >
            <nav className="container mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map((link) =>
                link.isRoute ? (
                  <button
                    key={link.label}
                    onClick={() => handleNavClick(link, true)}
                    className="text-left text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors font-medium py-2.5 px-3 rounded-lg"
                  >
                    {link.label}
                  </button>
                ) : (
                  <a
                    key={link.label}
                    href={link.href}
                    className="text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors font-medium py-2.5 px-3 rounded-lg"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {link.label}
                  </a>
                )
              )}
              {user && mode === "customer" && (
                <div className="pt-2">
                  <KYCBanner />
                </div>
              )}
              {!user && (
                <div className="flex flex-col gap-2 pt-3 mt-1 border-t border-border">
                  <Button variant="ghost" className="w-full justify-start" onClick={() => { setIsMenuOpen(false); navigate("/auth"); }}>
                    {t("header.signIn")}
                  </Button>
                  <Button variant="default" className="w-full" onClick={() => { setIsMenuOpen(false); navigate("/auth"); }}>
                    {t("header.getStarted")}
                  </Button>
                </div>
              )}
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Header;
