import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Send, MapPin, Image, ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
  id: string;
  text: string;
  sender: "user" | "provider";
  timestamp: Date;
  type?: "text" | "location";
}

interface ProviderChatProps {
  providerName: string;
  serviceType: string;
  onBack: () => void;
}

const quickMessages = [
  "Hi, I need help with my issue",
  "What's your availability today?",
  "Can you come sooner?",
  "I'll share my location",
];

const providerReplies = [
  "Sure, I'll be there soon!",
  "Can you describe the issue in more detail?",
  "I'm on my way, please share your location.",
  "No problem, I can handle that.",
  "I'll bring the necessary tools.",
  "Please keep the area accessible for me.",
];

const ProviderChat = ({ providerName, serviceType, onBack }: ProviderChatProps) => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      text: `Hi! I'm ${providerName}. How can I help you with your ${serviceType.toLowerCase()} issue?`,
      sender: "provider",
      timestamp: new Date(),
      type: "text",
    },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isTyping]);

  const addMessage = (text: string, type: "text" | "location" = "text") => {
    const userMsg: Message = {
      id: Date.now().toString(),
      text,
      sender: "user",
      timestamp: new Date(),
      type,
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    // Simulate provider reply
    setIsTyping(true);
    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        text: providerReplies[Math.floor(Math.random() * providerReplies.length)],
        sender: "provider",
        timestamp: new Date(),
        type: "text",
      };
      setMessages((prev) => [...prev, reply]);
      setIsTyping(false);
    }, 1500 + Math.random() * 1500);
  };

  const handleSend = () => {
    if (!input.trim()) return;
    addMessage(input.trim());
  };

  const handleShareLocation = () => {
    addMessage("📍 Shared my live location", "location");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleSend();
  };

  const formatTime = (date: Date) =>
    date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  return (
    <div className="flex flex-col h-[60vh] max-h-[500px]">
      {/* Chat header */}
      <div className="flex items-center gap-3 pb-3 border-b border-border">
        <Button variant="ghost" size="icon" className="h-8 w-8" onClick={onBack}>
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
          {providerName.charAt(0)}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{providerName}</p>
          <p className="text-xs text-primary">Online</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto py-3 space-y-3">
        <AnimatePresence initial={false}>
          {messages.map((msg) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
              className={`flex ${msg.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 ${
                  msg.sender === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "bg-muted text-foreground rounded-bl-md"
                }`}
              >
                {msg.type === "location" ? (
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm">{msg.text}</span>
                  </div>
                ) : (
                  <p className="text-sm">{msg.text}</p>
                )}
                <p
                  className={`text-[10px] mt-1 ${
                    msg.sender === "user" ? "text-primary-foreground/70" : "text-muted-foreground"
                  }`}
                >
                  {formatTime(msg.timestamp)}
                </p>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {isTyping && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex justify-start"
          >
            <div className="bg-muted rounded-2xl rounded-bl-md px-4 py-3 flex items-center gap-1.5">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
              <span className="text-xs text-muted-foreground">typing...</span>
            </div>
          </motion.div>
        )}
      </div>

      {/* Quick replies */}
      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {quickMessages.map((msg) => (
          <button
            key={msg}
            onClick={() => addMessage(msg)}
            className="flex-shrink-0 text-xs px-3 py-1.5 rounded-full bg-muted text-foreground hover:bg-muted/80 transition-colors border border-border"
          >
            {msg}
          </button>
        ))}
      </div>

      {/* Input area */}
      <div className="flex items-center gap-2 pt-2 border-t border-border">
        <Button
          variant="ghost"
          size="icon"
          className="h-9 w-9 flex-shrink-0"
          onClick={handleShareLocation}
          title="Share live location"
        >
          <MapPin className="w-4 h-4 text-primary" />
        </Button>
        <Input
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Describe your problem..."
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
    </div>
  );
};

export default ProviderChat;
