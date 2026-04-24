import { DashboardLayout } from "@/components/dashboard/DashboardLayout";
import { useState } from "react";
import { Send, Bot, User, Save, FileDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import { chatWithAI } from "@/components/services/aiApi";

interface Message {
  role: "user" | "bot";
  text: string;
  time: string;
}

const suggestions = [
  "What causes Vitamin D deficiency?",
  "Best foods for B12?",
  "How serious is my deficiency?",
  "Diet plan for recovery",
  "Should I take supplements?",
  "How to improve iron absorption?",
];

const now = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export default function ChatbotPage() {
  const [messages, setMessages] = useState<Message[]>([
    { role: "bot", text: "Hello! 👋 I'm your AI health assistant powered by FLAN-T5. I have access to your latest scan results and can help with:\n\n• **Vitamin deficiency questions**\n• **Dietary recommendations**\n• **Supplement guidance**\n• **Understanding your results**\n\nHow can I help you today?", time: now() },
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const send = async (text: string) => {
    if (!text.trim()) return;
    setMessages((prev) => [...prev, { role: "user", text, time: now() }]);
    setInput("");
    setIsTyping(true);
    try {
      const response = await chatWithAI(text);
      setMessages((prev) => [...prev, { role: "bot", text: response.output, time: now() }]);
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "bot", text: "Sorry, something went wrong. Please try again.", time: now() },
      ]);
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <DashboardLayout
      title="AI Health Assistant"
      headerActions={
        <div className="flex gap-2">
          <Button variant="ghost" size="sm"><Save className="mr-1 h-4 w-4" /> Save</Button>
          <Button variant="outline" size="sm"><FileDown className="mr-1 h-4 w-4" /> Export PDF</Button>
        </div>
      }
    >
      <div className="max-w-3xl mx-auto flex flex-col h-[calc(100vh-8rem)]">
        {/* Messages */}
        <div className="flex-1 overflow-auto space-y-4 pb-4">
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}
            >
              {msg.role === "bot" && (
                <div className="gradient-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0 mt-1">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
              )}
              <div className={`max-w-lg rounded-2xl px-4 py-3 text-sm ${msg.role === "user" ? "gradient-primary text-primary-foreground" : "glass-card"}`}>
                <div className="whitespace-pre-line">{msg.text}</div>
                <p className={`text-[10px] mt-2 ${msg.role === "user" ? "text-primary-foreground/60" : "text-muted-foreground"}`}>{msg.time}</p>
              </div>
              {msg.role === "user" && (
                <div className="bg-muted rounded-full h-8 w-8 flex items-center justify-center shrink-0 mt-1">
                  <User className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
            </motion.div>
          ))}
          {isTyping && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
              <div className="gradient-primary rounded-full h-8 w-8 flex items-center justify-center shrink-0">
                <Bot className="h-4 w-4 text-primary-foreground" />
              </div>
              <div className="glass-card rounded-2xl px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                  <span className="w-2 h-2 bg-muted-foreground/40 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Suggestions */}
        <div className="pb-3 flex flex-wrap gap-2">
          {suggestions.map((s) => (
            <button
              key={s}
              onClick={() => send(s)}
              className="text-xs glass-card rounded-full px-3 py-1.5 hover:bg-primary/10 transition-colors text-muted-foreground hover:text-foreground"
            >
              {s}
            </button>
          ))}
        </div>

        {/* Input */}
        <div className="pb-2 border-t border-border/50 pt-4">
          <form onSubmit={(e) => { e.preventDefault(); send(input); }} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your health..."
              className="flex-1 rounded-xl bg-muted px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <Button variant="gradient" size="icon" type="submit" disabled={isTyping}>
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </div>
    </DashboardLayout>
  );
}
