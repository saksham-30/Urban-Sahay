import React from 'react';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import BackToDashboard from '@/components/BackToDashboard';
import EarningsChart from '@/components/provider-dashboard/EarningsChart';
import RatingsChart from '@/components/provider-dashboard/RatingsChart';
import { motion } from 'framer-motion';
import { useLanguage } from '@/hooks/useLanguage';

const ProviderPerformance = () => {
  const { t } = useLanguage();
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { staggerChildren: 0.08 } },
  };
  const itemVariants = { hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="pt-20 pb-12">
        <motion.div className="container mx-auto px-4 max-w-4xl space-y-6" variants={containerVariants} initial="hidden" animate="visible">
          <motion.div variants={itemVariants}>
            <BackToDashboard provider />
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-4">
            <h1 className="text-2xl font-bold">{t('providerPerformance.title')}</h1>
            <p className="text-sm text-muted-foreground">{t('providerPerformance.subtitle')}</p>
          </motion.div>

          <motion.div variants={itemVariants} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <EarningsChart />
            <RatingsChart />
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
};

export default ProviderPerformance;
