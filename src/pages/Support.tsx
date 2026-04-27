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
import { HelpCircle, MessageSquare, Phone, Mail, Send, ChevronDown, ChevronUp } from 'lucide-react';

const faqs = [
  { q: 'How do I book a service?', a: 'Browse service categories, select a provider, and click "Book Now" to start the booking process.' },
  { q: 'How does KYC verification work?', a: 'Go to your profile dropdown → KYC Verification. Complete 4 steps: email, phone, Aadhaar (optional), and selfie.' },
  { q: 'Can I cancel a service request?', a: 'Yes, you can cancel from the "My Service Requests" page before the provider arrives.' },
  { q: 'How are providers verified?', a: 'All providers go through a background check and KYC verification before being listed on the platform.' },
  { q: 'What payment methods are accepted?', a: 'We support cash, UPI, and card payments. Payment is collected after service completion.' },
];

const Support = () => {
  const { user, isLoading } = useAuth();
  const navigate = useNavigate();
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => { if (!isLoading && !user) navigate('/auth'); }, [user, isLoading, navigate]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !message.trim()) { toast.error('Please fill all fields'); return; }
    toast.success('Support request submitted! We\'ll get back to you soon.');
    setSubject(''); setMessage('');
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="container mx-auto px-4 pt-24 pb-16 max-w-2xl">
        <BackToDashboard />
        <h1 className="text-2xl font-bold text-foreground mb-2">Help & Support</h1>
        <p className="text-muted-foreground mb-8">Get help with your account or services</p>

        {/* Contact options */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-8">
          <a href="tel:+911234567890" className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
            <Phone className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Call Us</p>
              <p className="text-xs text-muted-foreground">+91 123 456 7890</p>
            </div>
          </a>
          <a href="mailto:support@urbansahay.com" className="bg-card rounded-xl border border-border p-4 flex items-center gap-3 hover:border-primary/50 transition-colors">
            <Mail className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Email</p>
              <p className="text-xs text-muted-foreground">support@urbansahay.com</p>
            </div>
          </a>
          <div className="bg-card rounded-xl border border-border p-4 flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-primary" />
            <div>
              <p className="text-sm font-medium text-foreground">Live Chat</p>
              <p className="text-xs text-muted-foreground">Use the chatbot</p>
            </div>
          </div>
        </div>

        {/* FAQs */}
        <h2 className="text-lg font-semibold text-foreground mb-4">Frequently Asked Questions</h2>
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
        <h2 className="text-lg font-semibold text-foreground mb-4">Send us a message</h2>
        <form onSubmit={handleSubmit} className="bg-card rounded-xl border border-border p-5 space-y-4">
          <div>
            <Label>Subject</Label>
            <Input value={subject} onChange={e => setSubject(e.target.value)} placeholder="What do you need help with?" className="mt-1" />
          </div>
          <div>
            <Label>Message</Label>
            <Textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your issue..." rows={4} className="mt-1" />
          </div>
          <Button type="submit"><Send className="w-4 h-4 mr-2" /> Send Message</Button>
        </form>
      </main>
      <Footer />
    </div>
  );
};

export default Support;
