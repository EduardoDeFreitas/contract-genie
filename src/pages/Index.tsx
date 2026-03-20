import { useState } from "react";
import { FileText, Zap, Shield, Brain } from "lucide-react";
import { motion } from "framer-motion";
import ContractUpload from "@/components/ContractUpload";
import ContractResults, { type ContractData } from "@/components/ContractResults";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const features = [
  {
    icon: Brain,
    title: "Extração Inteligente",
    desc: "IA identifica cláusulas, valores e prazos automaticamente",
  },
  {
    icon: Zap,
    title: "Análise Instantânea",
    desc: "Resultados estruturados em segundos, não horas",
  },
  {
    icon: Shield,
    title: "Dados Seguros",
    desc: "Seus contratos nunca são armazenados ou compartilhados",
  },
];

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ContractData | null>(null);

  const handleAnalyze = async (file: File) => {
    setIsLoading(true);
    try {
      // Read file as text
      const text = await file.text();

      if (text.trim().length < 50) {
        toast.error("O arquivo parece estar vazio ou com pouco conteúdo.");
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.functions.invoke("analyze-contract", {
        body: { contractText: text },
      });

      if (error) {
        console.error("Edge function error:", error);
        toast.error("Erro ao analisar contrato. Tente novamente.");
        setIsLoading(false);
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        setIsLoading(false);
        return;
      }

      setResult(data as ContractData);
      toast.success("Contrato analisado com sucesso!");
    } catch (err) {
      console.error("Analyze error:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background dark">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              ContratoIA
            </span>
          </div>
          {result && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleReset}
              className="active:scale-[0.97] transition-transform"
            >
              Nova análise
            </Button>
          )}
        </div>
      </nav>

      <main className="max-w-6xl mx-auto px-6 py-12">
        {!result ? (
          <div className="space-y-16">
            {/* Hero */}
            <motion.div
              initial={{ opacity: 0, y: 24, filter: "blur(4px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="text-center max-w-2xl mx-auto"
            >
              <h1
                className="text-4xl sm:text-5xl font-bold text-foreground tracking-tight"
                style={{ lineHeight: "1.1", textWrap: "balance" }}
              >
                Analise contratos com inteligência artificial
              </h1>
              <p
                className="mt-5 text-lg text-muted-foreground max-w-lg mx-auto"
                style={{ textWrap: "pretty" }}
              >
                Faça upload de um contrato já firmado e extraia automaticamente
                dados, prazos, penalidades, SLA e requisitos.
              </p>
            </motion.div>

            {/* Upload */}
            <ContractUpload onAnalyze={handleAnalyze} isLoading={isLoading} />

            {/* Features */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3, duration: 0.6 }}
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-3xl mx-auto"
            >
              {features.map((f, i) => (
                <motion.div
                  key={f.title}
                  initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                  animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                  transition={{
                    delay: 0.4 + i * 0.1,
                    duration: 0.5,
                    ease: [0.16, 1, 0.3, 1],
                  }}
                  className="text-center"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <f.icon className="w-5 h-5 text-primary" />
                  </div>
                  <h3 className="text-sm font-semibold text-foreground mb-1">{f.title}</h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">{f.desc}</p>
                </motion.div>
              ))}
            </motion.div>
          </div>
        ) : (
          <ContractResults data={result} />
        )}
      </main>
    </div>
  );
};

export default Index;
