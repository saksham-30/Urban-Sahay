import BackToDashboard from '@/components/BackToDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { Star } from 'lucide-react';

const MyReviews = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const reviews = [
    { id: 1, provider: 'Anil Verma', service: 'Plumber', rating: 4.5, comment: 'Great work, fixed the issue quickly!', date: '2026-02-28' },
    { id: 2, provider: 'Vikram Singh', service: 'Electrician', rating: 5, comment: 'Very professional and punctual. Highly recommend.', date: '2026-02-20' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-2">My Reviews</h1>
        <p className="text-muted-foreground mb-6">Reviews you've given to service providers</p>
        <div className="space-y-4">
          {reviews.map(r => (
            <div key={r.id} className="bg-card rounded-xl border border-border p-5">
              <div className="flex items-start justify-between mb-2">
                <div>
                  <h3 className="font-semibold text-foreground">{r.provider}</h3>
                  <p className="text-xs text-muted-foreground">{r.service} • {r.date}</p>
                </div>
                <div className="flex items-center gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star key={i} className={`w-4 h-4 ${i < Math.floor(r.rating) ? 'text-accent fill-accent' : 'text-border'}`} />
                  ))}
                </div>
              </div>
              <p className="text-sm text-muted-foreground">{r.comment}</p>
            </div>
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default MyReviews;
