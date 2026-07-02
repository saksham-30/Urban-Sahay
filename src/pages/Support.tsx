import BackToDashboard from '@/components/BackToDashboard';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { MessageSquare, Phone, Mail, Send, ChevronDown, ChevronUp } from 'lucide-react';
import { useLanguage } from '@/hooks/useLanguage';

const Support = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  const faqs = [
    { q: t('support.faq.book.q'), a: t('support.faq.book.a') },
    { q: t('support.faq.kyc.q'), a: t('support.faq.kyc.a') },
    { q: t('support.faq.cancel.q'), a: t('support.faq.cancel.a') },
    { q: t('support.faq.verify.q'), a: t('support.faq.verify.a') },
    { q: t('support.faq.payment.q'), a: t('support.faq.payment.a') },
  ];

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) { toast.error(t('support.fillAllFields')); return; }
    toast.success(t('support.submitted'));
    setSubject(''); setMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-2">{t('support.title')}</h1>
        <p className="text-muted-foreground mb-8">{t('support.subtitle')}</p>

        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <a href="tel:+911234567890" className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('support.callUs')}</p>
              <p className="text-xs text-muted-foreground">+91 123 456 7890</p>
            </div>
          </a>
          <a href="mailto:support@urbansahay.com" className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('support.email')}</p>
              <p className="text-xs text-muted-foreground">support@urbansahay.com</p>
            </div>
          </a>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">{t('support.liveChat')}</p>
              <p className="text-xs text-muted-foreground">{t('support.useChatbot')}</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('support.faqTitle')}</h2>
        <div className="space-y-2 mb-8">
          {faqs.map((f, i) => (
            <div key={i} className="bg-card rounded-xl border border-border overflow-hidden">
              <button onClick={() => setOpenFaq(openFaq === i ? null : i)} className="w-full flex items-center justify-between p-4 text-left">
                <span className="text-sm font-medium text-foreground">{f.q}</span>
                {openFaq === i ? <ChevronUp className="w-4 h-4 text-muted-foreground" /> : <ChevronDown className="w-4 h-4 text-muted-foreground" />}
              </button>
              {openFaq === i && <div className="px-4 pb-4 text-sm text-muted-foreground">{f.a}</div>}
            </div>
          ))}
        </div>

        {/* Contact form */}
        <h2 className="text-lg font-semibold text-foreground mb-4">{t('support.sendMessageTitle')}</h2>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <Label>{t('support.subject')}</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder={t('support.subjectPlaceholder')} className="mt-1" />
          </div>
          <div>
            <Label>{t('support.message')}</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder={t('support.messagePlaceholder')} rows={4} className="mt-1" />
          </div>
          <Button type="submit"><Send className="w-4 h-4 mr-2" /> {t('support.sendMessage')}</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
