import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useSubmitFeedback } from "@/hooks/use-feedback";
import { useToast } from "@/hooks/use-toast";
import { Smile, Meh, Frown, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

// Types
type Rating = 'very_satisfied' | 'satisfied' | 'unsatisfied';

interface EmotionButtonProps {
  rating: Rating;
  label: string;
  icon: React.ReactNode;
  colorClass: string;
  onClick: () => void;
  disabled: boolean;
}

function EmotionButton({ rating, label, icon, colorClass, onClick, disabled }: EmotionButtonProps) {
  return (
    <motion.button
      whileHover={!disabled ? { scale: 1.05, y: -5 } : {}}
      whileTap={!disabled ? { scale: 0.95 } : {}}
      onClick={onClick}
      disabled={disabled}
      className={cn(
        "flex flex-col items-center justify-center p-8 md:p-12 rounded-3xl transition-all duration-300 w-full aspect-square md:aspect-auto md:h-80 shadow-xl",
        disabled ? "opacity-50 cursor-not-allowed grayscale" : colorClass
      )}
    >
      <div className="mb-6 transform scale-150 md:scale-[2.5]">
        {icon}
      </div>
      <span className="text-xl md:text-3xl font-bold tracking-tight text-white text-shadow">
        {label}
      </span>
    </motion.button>
  );
}

export default function Kiosk() {
  const [showThankYou, setShowThankYou] = useState(false);
  const { mutate: submitFeedback } = useSubmitFeedback();
  const { toast } = useToast();

  const handleVote = (rating: Rating) => {
    if (showThankYou) return; // Prevent double clicks

    // Optimistic UI update
    setShowThankYou(true);

    // Submit in background
    submitFeedback(
      { rating },
      {
        onError: () => {
          toast({
            variant: "destructive",
            title: "Erro ao salvar",
            description: "Não foi possível salvar sua avaliação. Tente novamente.",
          });
          // Optionally hide thank you screen if error is critical, 
          // but better UX is to assume success for kiosk unless persistent failure
        }
      }
    );

    // Reset after 3 seconds
    setTimeout(() => {
      setShowThankYou(false);
    }, 3000);
  };

  return (
    <div className="relative min-h-screen bg-slate-50 overflow-hidden font-display flex flex-col">
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-blue-100 via-slate-50 to-slate-50 -z-10" />
      
      {/* Header */}
      <header className="py-8 md:py-12 text-center relative z-10 px-4">
        <motion.div 
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-block"
        >
          <h1 className="text-4xl md:text-6xl font-extrabold text-slate-900 mb-4 tracking-tight">
            Como foi seu atendimento?
          </h1>
          <p className="text-lg md:text-2xl text-slate-500 max-w-2xl mx-auto">
            Sua opinião é muito importante para melhorarmos nossos serviços.
          </p>
        </motion.div>
      </header>

      {/* Buttons Grid */}
      <main className="flex-1 flex items-center justify-center p-4 md:p-8 max-w-7xl mx-auto w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 w-full">
          <EmotionButton
            rating="very_satisfied"
            label="Muito Satisfeito"
            icon={<Smile className="w-16 h-16 md:w-20 md:h-20 text-white" />}
            colorClass="bg-gradient-to-br from-green-400 to-green-600 hover:shadow-green-300/50"
            onClick={() => handleVote('very_satisfied')}
            disabled={showThankYou}
          />
          <EmotionButton
            rating="satisfied"
            label="Satisfeito"
            icon={<Meh className="w-16 h-16 md:w-20 md:h-20 text-white" />}
            colorClass="bg-gradient-to-br from-yellow-400 to-amber-500 hover:shadow-yellow-300/50"
            onClick={() => handleVote('satisfied')}
            disabled={showThankYou}
          />
          <EmotionButton
            rating="unsatisfied"
            label="Insatisfeito"
            icon={<Frown className="w-16 h-16 md:w-20 md:h-20 text-white" />}
            colorClass="bg-gradient-to-br from-red-400 to-red-600 hover:shadow-red-300/50"
            onClick={() => handleVote('unsatisfied')}
            disabled={showThankYou}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="py-6 text-center text-slate-400 text-sm md:text-base">
        <p>© 2024 Pesquisa de Satisfação</p>
      </footer>

      {/* Fullscreen Thank You Overlay */}
      <AnimatePresence>
        {showThankYou && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.1 }}
            className="fixed inset-0 z-50 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center p-4 text-center"
          >
            <motion.div
              initial={{ y: 20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.1 }}
            >
              <div className="w-32 h-32 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                <Sparkles className="w-16 h-16 text-green-600" />
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-slate-900 mb-6">
                Obrigado!
              </h2>
              <p className="text-xl md:text-3xl text-slate-600 max-w-2xl mx-auto">
                Agradecemos sua participação. Sua opinião faz a diferença!
              </p>
              
              <motion.div 
                className="mt-12 h-2 bg-slate-100 rounded-full max-w-xs mx-auto overflow-hidden"
              >
                <motion.div 
                  className="h-full bg-primary"
                  initial={{ width: "0%" }}
                  animate={{ width: "100%" }}
                  transition={{ duration: 3, ease: "linear" }}
                />
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
