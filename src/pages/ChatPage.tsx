import { useState, useEffect, useRef } from "react";
import { useAuth } from "@/hooks/useAuth";
import { api } from "@/lib/api";
import { io, Socket } from "socket.io-client";
import { useSearchParams, useNavigate } from "react-router-dom";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import BackToDashboard from "@/components/BackToDashboard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Send, Image as ImageIcon, CheckCheck, Check, Clock,
  MapPin, Wrench, MessageCircle, ArrowLeft, Smile
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  content: string | null;
  image_url: string | null;
  message_type: string;
  is_auto: boolean;
  read_at: string | null;
  created_at: string;
}

interface Conversation {
  id: string;
  customer_id: string;
  provider_id: string;
  job_context: string | null;
  created_at: string;
  updated_at: string;
}

function toUiConversation(c: any): Conversation {
  return {
    id: c._id || c.id,
    customer_id: c.customerId || c.customer_id,
    provider_id: c.providerId || c.provider_id,
    job_context: c.jobContext ?? c.job_context ?? null,
    created_at: c.createdAt || c.created_at,
    updated_at: c.updatedAt || c.updated_at,
  };
}

function toUiMessage(m: any): Message {
  return {
    id: m._id || m.id,
    conversation_id: m.conversationId || m.conversation_id,
    sender_id: m.senderId || m.sender_id,
    content: m.content,
    image_url: m.imageUrl ?? m.image_url ?? null,
    message_type: m.messageType || m.message_type || 'text',
    is_auto: m.isAuto ?? m.is_auto ?? false,
    read_at: m.readAt ?? m.read_at ?? null,
    created_at: m.createdAt || m.created_at,
  };
}

const quickActions = [
  { label: "I'm on the way", icon: MapPin, color: "text-blue-500" },
  { label: "I've arrived at your location", icon: MapPin, color: "text-emerald-500" },
  { label: "Starting the work now", icon: Wrench, color: "text-amber-500" },
  { label: "Job completed! Please review", icon: CheckCheck, color: "text-emerald-500" },
  { label: "Need more details about the issue", icon: MessageCircle, color: "text-primary" },
];

const ChatPage = () => {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const conversationId = searchParams.get("conversation");
  const targetUserId = searchParams.get("with");

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(conversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [showQuickActions, setShowQuickActions] = useState(false);
  const [otherUserName, setOtherUserName] = useState("Chat");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const socketRef = useRef<Socket | null>(null);

  // Socket.io connection
  useEffect(() => {
    const socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000');
    socketRef.current = socket;
    return () => { socket.disconnect(); };
  }, []);

  // Fetch or create conversation
  useEffect(() => {
    if (!user) return;

    const init = async () => {
      if (targetUserId && !conversationId) {
        const conv = await api.findOrCreateConversation(targetUserId);
        setActiveConversation(conv._id || (conv as any).id);
      }

      const convs = await api.getConversations();
      setConversations(convs.map(toUiConversation));
      setLoading(false);
    };

    init();
  }, [user, targetUserId, conversationId]);

  // Fetch messages + Socket.io room for active conversation
  useEffect(() => {
    if (!activeConversation || !user) return;

    const fetchMessages = async () => {
      const data = await api.getMessages(activeConversation);
      setMessages(data.map(toUiMessage));
      await api.markMessagesRead(activeConversation);
    };

    fetchMessages();

    // Fetch other user's name
    const fetchOtherUser = async () => {
      const conv = conversations.find(c => c.id === activeConversation);
      if (!conv) return;
      const otherId = conv.customer_id === user.id ? conv.provider_id : conv.customer_id;
      try {
        const res = await api.getUserName(otherId);
        if (res.name) setOtherUserName(res.name);
      } catch { /* ignore */ }
    };

    fetchOtherUser();

    // Join socket room
    socketRef.current?.emit('join_conversation', activeConversation);
    socketRef.current?.on('new_message', (msg: any) => {
      const uiMsg = toUiMessage(msg);
      setMessages(prev => {
        if (prev.some(m => m.id === uiMsg.id)) return prev;
        return [...prev, uiMsg];
      });
    });

    return () => {
      socketRef.current?.emit('leave_conversation', activeConversation);
      socketRef.current?.off('new_message');
    };
  }, [activeConversation, user, conversations]);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (content: string, isAuto = false, imageUrl?: string) => {
    if (!activeConversation || !user || (!content.trim() && !imageUrl)) return;
    setSending(true);

    try {
      const msg = await api.sendMessage(activeConversation, {
        content: content.trim() || undefined,
        imageUrl: imageUrl || undefined,
        messageType: imageUrl ? 'image' : 'text',
        isAuto,
      });
      // Optimistically add own message to the list
      setMessages(prev => {
        const uiMsg = toUiMessage(msg);
        if (prev.some(m => m.id === uiMsg.id)) return prev;
        return [...prev, uiMsg];
      });
    } catch {
      toast.error('Failed to send message');
    }

    setNewMessage("");
    setSending(false);
    setShowQuickActions(false);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !user) return;

    const fileExt = file.name.split(".").pop();
    const filePath = `chat/${user.id}/${Date.now()}.${fileExt}`;

    // For now, create a placeholder URL since we'd need a storage bucket
    toast.info("Image sharing will be available once storage is configured");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage(newMessage);
    }
  };

  const formatTime = (date: string) => {
    return new Date(date).toLocaleTimeString("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getReadStatus = (msg: Message) => {
    if (msg.sender_id !== user?.id) return null;
    if (msg.read_at) return <CheckCheck className="w-3.5 h-3.5 text-blue-500" />;
    return <Check className="w-3.5 h-3.5 text-muted-foreground" />;
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="pt-20 pb-12 container mx-auto px-4">
          <p className="text-center text-muted-foreground mt-20">Please log in to access chat.</p>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header />
      <main className="pt-20 pb-4 flex-1 flex flex-col">
        <div className="container mx-auto px-4 flex-1 flex flex-col max-h-[calc(100vh-6rem)]">
          <BackToDashboard />

          <div className="flex-1 grid grid-cols-1 lg:grid-cols-4 gap-4 mt-3 min-h-0">
            {/* Conversations Sidebar */}
            <Card className="lg:col-span-1 glass-card border-border/30 flex flex-col overflow-hidden">
              <div className="px-4 py-3 border-b border-border/20">
                <h3 className="font-bold text-foreground flex items-center gap-2">
                  <MessageCircle className="w-4 h-4 text-primary" />
                  Conversations
                </h3>
              </div>
              <ScrollArea className="flex-1">
                {loading ? (
                  <div className="p-4 space-y-3">
                    {[1, 2, 3].map(i => (
                      <div key={i} className="h-14 rounded-lg bg-muted/50 animate-pulse" />
                    ))}
                  </div>
                ) : conversations.length === 0 ? (
                  <div className="p-6 text-center text-sm text-muted-foreground">
                    No conversations yet
                  </div>
                ) : (
                  <div className="p-2 space-y-1">
                    {conversations.map(conv => {
                      const isActive = conv.id === activeConversation;
                      return (
                        <button
                          key={conv.id}
                          onClick={() => setActiveConversation(conv.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition-all ${
                            isActive
                              ? "bg-primary/10 border border-primary/20"
                              : "hover:bg-muted/50"
                          }`}
                        >
                          <Avatar className="w-9 h-9 flex-shrink-0">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                              {conv.job_context?.[0] || "C"}
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-foreground truncate">
                              {conv.job_context || "Chat"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                              {new Date(conv.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )}
              </ScrollArea>
            </Card>

            {/* Chat Area */}
            <Card className="lg:col-span-3 glass-card border-border/30 flex flex-col overflow-hidden">
              {!activeConversation ? (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <MessageCircle className="w-12 h-12 text-muted-foreground/30 mx-auto mb-3" />
                    <p className="text-muted-foreground">Select a conversation to start chatting</p>
                  </div>
                </div>
              ) : (
                <>
                  {/* Chat Header */}
                  <div className="px-4 py-3 border-b border-border/20 flex items-center gap-3">
                    <button
                      onClick={() => setActiveConversation(null)}
                      className="lg:hidden p-1 hover:bg-muted/50 rounded-lg"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="bg-primary/10 text-primary text-xs font-bold">
                        {otherUserName[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1">
                      <h3 className="text-sm font-bold text-foreground">{otherUserName}</h3>
                      <p className="text-[10px] text-emerald-500 font-medium">Online</p>
                    </div>
                  </div>

                  {/* Messages */}
                  <ScrollArea className="flex-1 p-4">
                    <div className="space-y-3">
                      <AnimatePresence mode="popLayout">
                        {messages.map((msg) => {
                          const isMine = msg.sender_id === user.id;
                          return (
                            <motion.div
                              key={msg.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                            >
                              <div
                                className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
                                  msg.is_auto
                                    ? "bg-amber-500/10 border border-amber-500/20 text-foreground"
                                    : isMine
                                    ? "bg-primary text-primary-foreground"
                                    : "bg-muted/70 text-foreground"
                                }`}
                              >
                                {msg.is_auto && (
                                  <Badge variant="outline" className="mb-1 text-[9px] border-amber-500/30 text-amber-600">
                                    Auto
                                  </Badge>
                                )}
                                {msg.image_url && (
                                  <img
                                    src={msg.image_url}
                                    alt="Shared"
                                    className="rounded-lg max-w-full mb-2"
                                  />
                                )}
                                {msg.content && (
                                  <p className="text-sm leading-relaxed">{msg.content}</p>
                                )}
                                <div className={`flex items-center gap-1 mt-1 ${isMine ? "justify-end" : ""}`}>
                                  <span className={`text-[10px] ${isMine ? "text-primary-foreground/70" : "text-muted-foreground"}`}>
                                    {formatTime(msg.created_at)}
                                  </span>
                                  {getReadStatus(msg)}
                                </div>
                              </div>
                            </motion.div>
                          );
                        })}
                      </AnimatePresence>
                      <div ref={messagesEndRef} />
                    </div>
                  </ScrollArea>

                  {/* Quick Actions */}
                  <AnimatePresence>
                    {showQuickActions && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="border-t border-border/20 overflow-hidden"
                      >
                        <div className="p-3 grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                          {quickActions.map((action) => {
                            const Icon = action.icon;
                            return (
                              <button
                                key={action.label}
                                onClick={() => sendMessage(action.label, true)}
                                className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-foreground hover:bg-muted/50 transition-colors text-left"
                              >
                                <Icon className={`w-4 h-4 flex-shrink-0 ${action.color}`} />
                                {action.label}
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>

                  {/* Input Area */}
                  <div className="px-4 py-3 border-t border-border/20 flex items-center gap-2">
                    <button
                      onClick={() => setShowQuickActions(!showQuickActions)}
                      className={`p-2 rounded-lg transition-colors ${showQuickActions ? "bg-primary/10 text-primary" : "hover:bg-muted/50 text-muted-foreground"}`}
                      title="Quick actions"
                    >
                      <Smile className="w-5 h-5" />
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageUpload}
                    />
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="p-2 rounded-lg hover:bg-muted/50 text-muted-foreground transition-colors"
                      title="Share image"
                    >
                      <ImageIcon className="w-5 h-5" />
                    </button>
                    <Input
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      onKeyDown={handleKeyPress}
                      placeholder="Type a message..."
                      className="flex-1 border-border/30 bg-muted/30 focus-visible:ring-primary/30"
                    />
                    <Button
                      onClick={() => sendMessage(newMessage)}
                      disabled={sending || !newMessage.trim()}
                      size="icon"
                      className="rounded-lg flex-shrink-0"
                    >
                      <Send className="w-4 h-4" />
                    </Button>
                  </div>
                </>
              )}
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
};

export default ChatPage;
