import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { Shield, Eye, UserCheck, LogOut, Ban } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const points = [
  { icon: Eye, text: "No recordings — video and audio are live-only, never stored" },
  { icon: Shield, text: "Mutual consent reveal — identity hidden unless both Spark" },
  { icon: UserCheck, text: "18+ verification required before joining any Drop" },
  { icon: LogOut, text: "One-tap exit and report — always accessible, zero friction" },
  { icon: Ban, text: "Zero tolerance — harassment results in immediate suspension" },
];

const TrustSection = () => {
  return (
    <section className="py-24 md:py-32 border-t border-border/30">
      <div className="container max-w-5xl mx-auto px-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="text-center mb-12"
        >
          <span className="text-xs tracking-luxury uppercase text-primary/60 mb-4 block">
            Trust & Safety
          </span>
          <h2 className="font-serif text-3xl md:text-4xl lg:text-5xl text-foreground">
            Built for safety — not virality.
          </h2>
        </motion.div>

        <div className="max-w-2xl mx-auto space-y-4 mb-12">
          {points.map((p, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="flex items-center gap-4"
            >
              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <p.icon className="w-4 h-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{p.text}</span>
            </motion.div>
          ))}
        </div>

        <motion.div
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="text-center"
        >
          <Link to="/safety">
            <Button variant="gold-outline" size="lg" className="group">
              Read the Safety Promise
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </motion.div>
      </div>
    </section>
  );
};

export default TrustSection;
