import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Send, Mic } from "lucide-react";

interface ChatComposerProps {
  onSend: (text: string) => void;
  onTyping?: () => void;
}

const MAX_CHARS = 1000;

const ChatComposer = ({ onSend, onTyping }: ChatComposerProps) => {
  const [text, setText] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = text.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setText("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Auto-grow textarea
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 120)}px`;
  }, [text]);

  const hasText = text.trim().length > 0;
  const remaining = MAX_CHARS - text.length;
  const showCounter = remaining <= 100;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.4 }}
      className="border-t border-border bg-background/90 backdrop-blur-xl px-4 py-3"
    >
      <div className="flex items-end gap-2">
        <div className="flex-1 bg-secondary/50 border border-border rounded-2xl px-4 py-2.5">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={(e) => {
              if (e.target.value.length <= MAX_CHARS) {
                setText(e.target.value);
                onTyping?.();
              }
            }}
            onKeyDown={handleKeyDown}
            placeholder="Write a message…"
            rows={1}
            maxLength={MAX_CHARS}
            className="w-full bg-transparent text-sm text-foreground placeholder:text-muted-foreground/40 resize-none focus:outline-none leading-relaxed max-h-[120px]"
          />
          {showCounter && (
            <p className={`text-[10px] text-right ${remaining <= 20 ? "text-destructive" : "text-muted-foreground/50"}`}>
              {remaining}
            </p>
          )}
        </div>

        {hasText ? (
          <button
            onClick={handleSend}
            className="w-10 h-10 rounded-full bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors"
          >
            <Send className="w-4 h-4 text-primary-foreground" />
          </button>
        ) : (
          <button className="w-10 h-10 rounded-full bg-secondary/60 flex items-center justify-center flex-shrink-0 hover:bg-secondary transition-colors">
            <Mic className="w-4 h-4 text-muted-foreground" />
          </button>
        )}
      </div>
    </motion.div>
  );
};

export default ChatComposer;
