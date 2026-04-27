import BackToDashboard from '@/components/BackToDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { History, CheckCircle2, Clock, MapPin, Star } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { motion } from 'framer-motion';
import { Separator } from '@/components/ui/separator';

const ServiceHistory = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const history = [
    { id: 1, service: 'Plumber', provider: 'Anil Verma', status: 'Completed', date: '2026-02-28', rating: 4.5, cost: '₹450' },
    { id: 2, service: 'Electrician', provider: 'Vikram Singh', status: 'Completed', date: '2026-02-20', rating: 5, cost: '₹600' },
    { id: 3, service: 'Cleaner', provider: 'Meena Devi', status: 'Cancelled', date: '2026-02-15', rating: null, cost: '₹0' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-2xl font-bold text-foreground mb-2 flex items-center gap-2">
            <History className="w-6 h-6 text-primary" />
            Service History
          </h1>
          <p className="text-muted-foreground mb-6">Your past completed services</p>
        </motion.div>
        <div className="space-y-4">
          {history.map((h, i) => (
            <motion.div
              key={h.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-card rounded-xl border border-border p-5 hover:shadow-card transition-shadow duration-300 group"
            >
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors">{h.service}</h3>
                  <p className="text-sm text-muted-foreground">{h.provider}</p>
                </div>
                <Badge variant="outline" className={h.status === 'Completed' ? 'bg-primary/10 text-primary border-primary/30' : 'bg-destructive/10 text-destructive border-destructive/30'}>
                  {h.status === 'Completed' && <CheckCircle2 className="w-3 h-3 mr-1" />}{h.status}
                </Badge>
              </div>
              <Separator className="my-2" />
              <div className="flex items-center gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{h.date}</span>
                <span className="font-medium text-foreground">{h.cost}</span>
                {h.rating && <span className="flex items-center gap-1"><Star className="w-3 h-3 text-accent fill-accent" />{h.rating}</span>}
              </div>
            </motion.div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default ServiceHistory;
