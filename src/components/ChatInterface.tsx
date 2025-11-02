import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { Send, Mic, MicOff, Loader2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface Message {
  role: "user" | "assistant";
  content: string;
}

const ChatInterface = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Olá! Sou o assistente virtual do Clima Justo. Como posso ajudá-lo hoje? Estou aqui para orientar sobre direitos, benefícios e procedimentos relacionados a situações de enchentes e alagamentos.",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Get current user
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    // Check for existing benefit request
    if (user) {
      loadExistingRequest();
    }
  }, [user]);

  const loadExistingRequest = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("benefit_requests")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setRequestId(data.id);
      if (data.chat_messages && Array.isArray(data.chat_messages)) {
        const messages = data.chat_messages as any[];
        setMessages(messages.filter(m => m.role && m.content) as Message[]);
      }

      // Check status and show notification if decided
      if (data.status === "approved") {
        toast({
          title: "Benefício Aprovado! ✅",
          description: data.decision_notes || "Seu benefício foi aprovado pelos agentes públicos.",
          duration: 10000,
        });
      } else if (data.status === "rejected") {
        toast({
          title: "Benefício Não Aprovado ❌",
          description: data.decision_notes || "Seu benefício não foi aprovado. Entre em contato para mais informações.",
          duration: 10000,
          variant: "destructive",
        });
      }
    }
  };

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para usar o chat.",
        variant: "destructive",
      });
      return;
    }

    const userMessage: Message = { role: "user", content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput("");
    setIsLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke("chat", {
        body: { messages: updatedMessages },
      });

      if (error) throw error;

      const assistantMessage: Message = {
        role: "assistant",
        content: data.response,
      };
      const finalMessages = [...updatedMessages, assistantMessage];
      setMessages(finalMessages);

      // Save or update benefit request
      await saveBenefitRequest(finalMessages);
    } catch (error) {
      console.error("Error sending message:", error);
      toast({
        title: "Erro ao enviar mensagem",
        description: "Tente novamente em instantes.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const saveBenefitRequest = async (chatMessages: Message[]) => {
    if (!user) return;

    const userName = user.email?.split("@")[0] || "Usuário";
    const messagesJson = chatMessages as any;

    if (requestId) {
      // Update existing request
      await supabase
        .from("benefit_requests")
        .update({ chat_messages: messagesJson })
        .eq("id", requestId);
    } else {
      // Create new request
      const { data } = await supabase
        .from("benefit_requests")
        .insert([{
          user_id: user.id,
          user_name: userName,
          chat_messages: messagesJson,
          status: "pending",
        }])
        .select()
        .single();

      if (data) {
        setRequestId(data.id);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const toggleRecording = async () => {
    if (isRecording) {
      setIsRecording(false);
      toast({
        title: "Gravação de voz",
        description: "Funcionalidade em desenvolvimento",
      });
    } else {
      setIsRecording(true);
      toast({
        title: "Gravação de voz",
        description: "Funcionalidade em desenvolvimento",
      });
    }
  };

  return (
    <Card className="flex flex-col h-[70vh] shadow-lg">
      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === "user" ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === "user"
                  ? "bg-gradient-primary text-primary-foreground"
                  : "bg-muted text-foreground"
              }`}
            >
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-2xl px-4 py-3">
              <Loader2 className="w-5 h-5 animate-spin text-primary" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="border-t p-4">
        <div className="flex gap-2">
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            className="min-h-[60px] resize-none"
            disabled={isLoading}
          />
          <div className="flex flex-col gap-2">
            <Button
              onClick={toggleRecording}
              variant="outline"
              size="icon"
              className="flex-shrink-0"
            >
              {isRecording ? (
                <MicOff className="w-5 h-5 text-destructive" />
              ) : (
                <Mic className="w-5 h-5" />
              )}
            </Button>
            <Button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              size="icon"
              className="flex-shrink-0"
            >
              {isLoading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatInterface;
