import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Loader2, Wrench, CheckCheck, MessageCircle, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";

interface Message {
  id: string;
  text: string;
  sender: "provider" | "customer";
  timestamp: Date;
  type?: "text" | "location" | "auto";
}

interface JobChatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  customerName: string;
  customerAvatar: string;
  service: string;
  jobStep: string;
}

const quickReplies = [
  { label: "I'm on the way", icon: MapPin },
  { label: "I've arrived at your location", icon: MapPin },
  { label: "Starting the work now", icon: Wrench },
  { label: "Need more details about the issue", icon: MessageCircle },
  { label: "Job completed! Please review", icon: CheckCheck },
];

const customerReplies = [
  "Okay, I'll be waiting!",
  "Thanks for the update.",
  "How long will it take?",
  "Sure, let me know if you need anything.",
  "Great, I'm at home right now.",
  "Please come soon, it's urgent.",
];

const JobChatDialog = ({ open, onOpenChange, customerName, customerAvatar, service, jobStep }: JobChatDialogProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi ${customerName.split(" ")[0]}, I've accepted your ${service.toLowerCase()} request. I'll be there soon!`,
      sender: "provider",
      timestamp: new Date(Date.now() - 60000),
      type: "auto",
    },
    {
      id: "2",
      text: "Great! Thanks for accepting. How long will it take?",
      sender: "customer",
      timestamp: new Date(Date.now() - 30000),
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (text: string, type: "text" | "location" | "auto" = "text") => {
    const msg: Message = {
      id: Date.now().toString(),
      text,
      sender: "provider",
      timestamp: new Date(),
      type,
    };
    setMessages(prev => [...prev, msg]);
    setInput("");

    // Simulate customer reply
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: customerReplies[Math.floor(Math.random() * customerReplies.length)],
        sender: "customer",
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, reply]);
      setIsTyping(false);
    }, 1200 + Math.random() * 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(input.trim());
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 gap-0 overflow-hidden max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-border/30 bg-secondary/30">
          <Avatar className="w-9 h-9 border border-primary/20">
            <AvatarFallback className="bg-primary/10 text-primary font-bold text-sm">
              {customerAvatar}
            </AvatarFallback>
          </Avatar>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-foreground truncate">{customerName}</p>
            <p className="text-[11px] text-primary font-medium">{service}</p>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            <span className="text-[10px] text-muted-foreground font-medium">Online</span>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3 min-h-[280px] max-h-[400px]">
          <AnimatePresence initial={false}>
            {messages.map((msg) => (
              <motion.div
                key={msg.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                className={`flex ${msg.sender === "provider" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                    msg.sender === "provider"
                      ? "bg-primary text-primary-foreground rounded-br-md"
                      : "bg-muted text-foreground rounded-bl-md"
                  }`}
                >
                  {msg.type === "auto" && (
                    <span className="inline-flex items-center gap-1 text-[9px] opacity-70 mb-1">
                      <Clock className="w-2.5 h-2.5" /> Auto
                    </span>
                  )}
                  {msg.type === "location" ? (
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 flex-shrink-0" />
                      <span className="text-sm">{msg.text}</span>
                    </div>
                  ) : (
                    <p className="text-sm">{msg.text}</p>
                  )}
                  <p className={`text-[10px] mt-1 ${
                    msg.sender === "provider" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}>
                    {formatTime(msg.timestamp)}
                  </p>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
              <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                <span className="text-xs text-muted-foreground">typing...</span>
              </div>
            </motion.div>
          )}
        </div>

        {/* Quick replies */}
        <div className="flex gap-2 overflow-x-auto px-4 py-2 border-t border-border/20 scrollbar-hide">
          {quickReplies.map((qr) => {
            const Icon = qr.icon;
            return (
              <button
                key={qr.label}
                onClick={() => addMessage(qr.label, "auto")}
                className="flex-shrink-0 flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border/40"
              >
                <Icon className="w-3 h-3" />
                {qr.label}
              </button>
            );
          })}
        </div>

        {/* Input */}
        <div className="flex items-center gap-2 px-4 py-3 border-t border-border/30">
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 flex-shrink-0"
            onClick={() => addMessage("📍 Sharing my live location", "location")}
            title="Share location"
          >
            <MapPin className="w-4 h-4 text-primary" />
          </Button>
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            className="flex-1 rounded-full h-9 text-sm"
          />
          <Button
            size="icon"
            className="h-9 w-9 rounded-full flex-shrink-0"
            onClick={handleSend}
            disabled={!input.trim()}
          >
            <Send className="w-4 h-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default JobChatDialog;
