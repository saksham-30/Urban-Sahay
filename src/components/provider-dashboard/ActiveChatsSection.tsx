import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { MessageCircle, ChevronRight, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import { formatDistanceToNow } from "date-fns";

interface ChatPreview {
  conversationId: string;
  otherUserId: string;
  otherUserName: string;
  lastMessage: string | null;
  lastMessageTime: string;
  unreadCount: number;
  jobContext: string | null;
}

const ActiveChatsSection = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [chats, setChats] = useState<ChatPreview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchChats = async () => {
      // Get conversations where provider is the current user
      const { data: conversations } = await supabase
        .from("conversations")
        .select("*")
        .or(`customer_id.eq.${user.id},provider_id.eq.${user.id}`)
        .order("updated_at", { ascending: false })
        .limit(5);

      if (!conversations || conversations.length === 0) {
        setLoading(false);
        return;
      }

      const chatPreviews: ChatPreview[] = [];

      for (const conv of conversations) {
        const otherUserId = conv.customer_id === user.id ? conv.provider_id : conv.customer_id;

        // Get other user's name
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name")
          .eq("user_id", otherUserId)
          .maybeSingle();

        // Get last message
        const { data: messages } = await supabase
          .from("messages")
          .select("content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: false })
          .limit(1);

        // Get unread count
        const { count } = await supabase
          .from("messages")
          .select("*", { count: "exact", head: true })
          .eq("conversation_id", conv.id)
          .neq("sender_id", user.id)
          .is("read_at", null);

        chatPreviews.push({
          conversationId: conv.id,
          otherUserId,
          otherUserName: profile?.full_name || "Customer",
          lastMessage: messages?.[0]?.content || null,
          lastMessageTime: messages?.[0]?.created_at || conv.updated_at,
          unreadCount: count || 0,
          jobContext: conv.job_context,
        });
      }

      setChats(chatPreviews);
      setLoading(false);
    };

    fetchChats();
  }, [user]);

  return (
    <div className="glass-card rounded-xl p-5 border border-border/30">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg gradient-blue flex items-center justify-center">
            <MessageCircle className="w-4 h-4 text-primary-foreground" />
          </div>
          <h3 className="text-base font-bold text-foreground">Active Chats</h3>
          {chats.some(c => c.unreadCount > 0) && (
            <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
              {chats.reduce((sum, c) => sum + c.unreadCount, 0)} new
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="sm"
          className="text-xs text-muted-foreground hover:text-primary"
          onClick={() => navigate("/chat")}
        >
          View All <ChevronRight className="w-3 h-3 ml-1" />
        </Button>
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="w-10 h-10 rounded-full bg-muted" />
              <div className="flex-1 space-y-1.5">
                <div className="h-3 w-24 bg-muted rounded" />
                <div className="h-2.5 w-40 bg-muted rounded" />
              </div>
            </div>
          ))}
        </div>
      ) : chats.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">No active conversations</p>
          <p className="text-xs text-muted-foreground/60 mt-1">
            Chats will appear here when customers message you
          </p>
        </div>
      ) : (
        <div className="space-y-1">
          {chats.map((chat, i) => (
            <motion.button
              key={chat.conversationId}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-secondary/50 transition-colors text-left group"
              onClick={() => navigate("/chat")}
            >
              <div className="relative">
                <Avatar className="w-10 h-10 border border-border/50">
                  <AvatarFallback className="bg-primary/10 text-primary text-sm font-semibold">
                    {chat.otherUserName.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                {chat.unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 rounded-full bg-destructive text-destructive-foreground text-[9px] font-bold flex items-center justify-center">
                    {chat.unreadCount}
                  </span>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-foreground truncate">
                    {chat.otherUserName}
                  </p>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-0.5 flex-shrink-0">
                    <Clock className="w-2.5 h-2.5" />
                    {formatDistanceToNow(new Date(chat.lastMessageTime), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-xs text-muted-foreground truncate">
                  {chat.lastMessage || "No messages yet"}
                </p>
                {chat.jobContext && (
                  <Badge variant="outline" className="text-[9px] mt-1 px-1.5 py-0 border-primary/20 text-primary/70">
                    {chat.jobContext}
                  </Badge>
                )}
              </div>
              <ChevronRight className="w-4 h-4 text-muted-foreground/40 group-hover:text-primary transition-colors flex-shrink-0" />
            </motion.button>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActiveChatsSection;
