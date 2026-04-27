import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageCircle, X, Send, Loader2, Bot, User, Mic, MicOff, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { AssistantAction, processUserMessage, SessionContext } from "@/lib/chatbotAssistant";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  actions?: AssistantAction[];
}

const quickActions = [
  { label: "🔧 Plumber", message: "I need a plumber" },
  { label: "⚡ Electrician", message: "Find me an electrician" },
  { label: "🧹 Cleaner", message: "I need a cleaner" },
  { label: "🩺 Doctor", message: "Find a doctor nearby" },
  { label: "🚨 Emergency", message: "I have an emergency" },
];

const AIChatbot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [sessionContext, setSessionContext] = useState<SessionContext>({});
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const [interimTranscript, setInterimTranscript] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  const SpeechRecognition = typeof window !== "undefined"
    ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    : null;

  const startListening = useCallback(async () => {
    if (!SpeechRecognition) {
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Speech recognition is not supported in your browser. Please try Chrome or Edge." }]);
      return;
    }

    // Request microphone permission directly in click handler (required for security)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      // Stop the stream immediately — we just needed the permission grant
      stream.getTracks().forEach(track => track.stop());
    } catch (err: any) {
      console.error("Microphone permission error:", err);
      setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Microphone access denied. Please allow microphone permission in your browser settings and try again." }]);
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-IN";

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event: any) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;
        if (event.results[i].isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (final) {
        setInterimTranscript("");
        setInput(prev => (prev + " " + final).trim());
      } else {
        setInterimTranscript(interim);
      }
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      // Don't stop on no-speech — just keep listening
      if (event.error === "no-speech") return;
      setIsListening(false);
      setInterimTranscript("");
      if (event.error === "not-allowed") {
        setMessages(prev => [...prev, { role: "assistant", content: "⚠️ Microphone access denied. Please allow microphone permission and try again." }]);
      }
    };

    recognition.onend = () => {
      // If still meant to be listening (continuous mode ended unexpectedly), restart
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          setIsListening(false);
          setInterimTranscript("");
        }
      }
    };

    recognitionRef.current = recognition;
    recognition.start();
  }, [SpeechRecognition]);

  const stopListening = useCallback(() => {
    const ref = recognitionRef.current;
    recognitionRef.current = null; // clear ref first so onend doesn't restart
    if (ref) {
      try { ref.stop(); } catch { /* ignore */ }
    }
    setIsListening(false);
    setInterimTranscript("");
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isOpen]);

  const sendMessage = useCallback(async (text: string) => {
    if (!text.trim() || isLoading) return;

    const message = text.trim();
    const userMsg: ChatMessage = { role: "user", content: message };
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setIsLoading(true);

    try {
      const result = await processUserMessage({
        message,
        context: sessionContext,
      });

      setSessionContext(result.context);
      setMessages(prev => [...prev, { role: "assistant", content: result.response, actions: result.actions }]);

      // Auto-run only direct booking action for explicit "book" commands.
      const directBookingAction = result.actions?.find(
        (action) => action.type === "navigate" && action.label === "Book Now",
      );
      if (/\bbook\b|\bhire\b|\bconfirm\b/i.test(message) && directBookingAction) {
        navigate(
          directBookingAction.to || "/services",
          directBookingAction.state ? { state: directBookingAction.state } : undefined,
        );
      }
    } catch {
      setMessages(prev => [
        ...prev,
        {
          role: "assistant",
          content: "Please describe your issue (e.g., water leakage, AC not cooling).",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  }, [isLoading, navigate, sessionContext]);

  const runAssistantAction = useCallback((action: AssistantAction) => {
    if (action.type === "send_message" && action.message) {
      sendMessage(action.message);
      return;
    }

    if (action.type === "navigate" && action.to) {
      navigate(action.to, action.state ? { state: action.state } : undefined);
    }
  }, [navigate, sendMessage]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  };

  return (
    <>
      {/* Floating Button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.9 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-card hover:shadow-card-hover flex items-center justify-center transition-shadow"
          >
            <MessageCircle className="w-6 h-6" />
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] h-[520px] max-h-[calc(100vh-3rem)] bg-card rounded-2xl shadow-card-hover border border-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-primary/5">
              <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-foreground">UrbanSahay Assistant</p>
                <p className="text-xs text-primary">AI-powered help</p>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => setIsOpen(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>

            {/* Messages */}
            <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              {messages.length === 0 && (
                <div className="text-center py-6">
                  <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Bot className="w-7 h-7 text-primary" />
                  </div>
                  <p className="text-sm font-medium text-foreground mb-1">Hi! I'm your UrbanSahay Assistant 👋</p>
                  <p className="text-xs text-muted-foreground mb-4">Ask me about services or describe your problem</p>
                  <div className="flex flex-wrap gap-2 justify-center">
                    {quickActions.map((action) => (
                      <button
                        key={action.label}
                        onClick={() => sendMessage(action.message)}
                        className="text-xs px-3 py-1.5 rounded-full bg-muted text-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                      >
                        {action.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.15 }}
                  className={`flex gap-2 ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  {msg.role === "assistant" && (
                    <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Bot className="w-3.5 h-3.5 text-primary" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-sm ${
                      msg.role === "user"
                        ? "bg-primary text-primary-foreground rounded-br-md"
                        : "bg-muted text-foreground rounded-bl-md"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <div className="prose prose-sm max-w-none [&>p]:m-0 [&>p]:leading-relaxed [&>ul]:my-1 [&>ol]:my-1">
                        <ReactMarkdown>{msg.content}</ReactMarkdown>
                      </div>
                    ) : (
                      <p>{msg.content}</p>
                    )}

                    {msg.role === "assistant" && msg.actions && msg.actions.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {msg.actions.map((action, actionIndex) => (
                          <button
                            key={`${action.label}-${actionIndex}`}
                            type="button"
                            onClick={() => runAssistantAction(action)}
                            className="text-[11px] px-2.5 py-1 rounded-full bg-primary/10 text-primary hover:bg-primary/20 transition-colors border border-primary/20"
                          >
                            {action.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                  {msg.role === "user" && (
                    <div className="w-7 h-7 rounded-full bg-accent/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <User className="w-3.5 h-3.5 text-accent" />
                    </div>
                  )}
                </motion.div>
              ))}

              {isLoading && messages[messages.length - 1]?.role !== "assistant" && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-2 items-start">
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                    <Bot className="w-3.5 h-3.5 text-primary" />
                  </div>
                  <div className="bg-muted rounded-2xl rounded-bl-md px-3.5 py-2.5 flex items-center gap-1.5">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">thinking...</span>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Quick actions when there are messages */}
            {messages.length > 0 && !isLoading && (
              <div className="flex gap-1.5 overflow-x-auto px-4 pb-2 scrollbar-hide">
                {quickActions.slice(0, 3).map((action) => (
                  <button
                    key={action.label}
                    onClick={() => sendMessage(action.message)}
                    className="flex-shrink-0 text-[11px] px-2.5 py-1 rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors border border-border"
                  >
                    {action.label}
                  </button>
                ))}
              </div>
            )}

            {/* Voice listening indicator */}
            {isListening && (
              <div className="flex items-center gap-2 px-4 py-1.5 bg-destructive/10 border-t border-destructive/20">
                <div className="flex items-center gap-1.5">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-destructive opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-destructive"></span>
                  </span>
                  <span className="text-[11px] font-medium text-destructive">Listening...</span>
                </div>
                {interimTranscript && (
                  <span className="text-[11px] text-muted-foreground italic truncate flex-1">"{interimTranscript}"</span>
                )}
              </div>
            )}

            {/* Input */}
            <div className="flex items-center gap-2 px-4 py-3 border-t border-border">
              <Button
                variant={isListening ? "destructive" : "ghost"}
                size="icon"
                className={`h-9 w-9 rounded-full flex-shrink-0 transition-all ${isListening ? "animate-pulse" : ""}`}
                onClick={isListening ? stopListening : startListening}
                disabled={isLoading}
                title={isListening ? "Stop listening" : "Voice input"}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
              </Button>
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={isListening ? "Speak now..." : "Ask about any service..."}
                className="flex-1 rounded-full h-9 text-sm"
                disabled={isLoading}
              />
              <Button
                size="icon"
                className="h-9 w-9 rounded-full flex-shrink-0"
                onClick={() => sendMessage(input)}
                disabled={!input.trim() || isLoading}
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default AIChatbot;
