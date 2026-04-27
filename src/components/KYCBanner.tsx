import { useEffect, useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { ShieldAlert, BadgeCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const KYCBanner = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [status, setStatus] = useState<'loading' | 'verified' | 'incomplete' | 'none'>('loading');

  useEffect(() => {
    if (!user) { setStatus('none'); return; }
    // Always show banner so user can demo/re-verify
    setStatus('incomplete');
  }, [user]);

  if (status === 'loading' || status === 'none') return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-accent/10 border border-accent/30 rounded-lg p-3 flex items-center gap-3 cursor-pointer hover:bg-accent/15 transition-colors"
        onClick={() => navigate('/kyc-verification')}
      >
        <ShieldAlert className="w-5 h-5 text-accent shrink-0" />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-foreground">Complete your e-KYC verification</p>
          <p className="text-xs text-muted-foreground">Verify your identity to access all services</p>
        </div>
        <span className="text-xs font-medium text-accent whitespace-nowrap">Verify Now →</span>
      </motion.div>
    </AnimatePresence>
  );
};

export default KYCBanner;
