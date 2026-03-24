import { useState } from "react";
import { FileText, Zap, Shield, Brain, Upload, Database, Plus } from "lucide-react";
import { motion } from "framer-motion";
import ContractUpload from "@/components/ContractUpload";
import SysAidImport from "@/components/SysAidImport";
import ContractTextPanel from "@/components/ContractTextPanel";
import ContractFormPanel from "@/components/ContractFormPanel";
import { type ContractData } from "@/components/ContractResults";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ResizablePanelGroup,
  ResizablePanel,
  ResizableHandle,
} from "@/components/ui/resizable";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

interface AnalyzedContract {
  id: number;
  fileName: string;
  text: string;
  data: ContractData;
}

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

const fileToBase64 = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      resolve(result.split(",")[1]);
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });

const readFileAsText = async (file: File): Promise<string> => {
  const textTypes = ["text/plain", "text/csv", "text/rtf"];
  if (textTypes.includes(file.type) || file.name.endsWith(".txt") || file.name.endsWith(".csv") || file.name.endsWith(".rtf")) {
    return file.text();
  }
  return "";
};

const Index = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [contracts, setContracts] = useState<AnalyzedContract[]>([]);
  const [activeContractId, setActiveContractId] = useState<number | null>(null);
  const [showUpload, setShowUpload] = useState(false);
  let nextId = contracts.length > 0 ? Math.max(...contracts.map((c) => c.id)) + 1 : 1;

  const activeContract = contracts.find((c) => c.id === activeContractId) || null;

  const analyzeContract = async (text: string, fileName: string, fileBase64?: string, fileMimeType?: string) => {
    setIsLoading(true);
    try {
      const body: Record<string, string> = {};

      // For PDFs and images, send as base64 for multimodal analysis
      const multimodalTypes = ["application/pdf", "image/png", "image/jpeg", "image/webp", "image/gif"];
      if (fileBase64 && fileMimeType && multimodalTypes.includes(fileMimeType)) {
        body.fileBase64 = fileBase64;
        body.fileName = fileName;
        body.fileMimeType = fileMimeType;
      } else {
        if (text.trim().length < 20) {
          toast.error("O conteúdo parece estar vazio ou com pouco conteúdo.");
          setIsLoading(false);
          return;
        }
        body.contractText = text;
        body.fileName = fileName;
      }

      const { data, error } = await supabase.functions.invoke("analyze-contract", { body });

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

      const newContract: AnalyzedContract = {
        id: nextId,
        fileName,
        text: text || `[Arquivo: ${fileName}]`,
        data: data as ContractData,
      };

      setContracts((prev) => [...prev, newContract]);
      setActiveContractId(newContract.id);
      setShowUpload(false);
      toast.success("Contrato analisado com sucesso!");
    } catch (err) {
      console.error("Analyze error:", err);
      toast.error("Erro inesperado. Tente novamente.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnalyze = async (file: File) => {
    const textContent = await readFileAsText(file);
    const base64 = await fileToBase64(file);
    analyzeContract(textContent, file.name, base64, file.type);
  };

  const handleSysAidSelect = (contractText: string) => {
    analyzeContract(contractText, "SysAid CMDB");
  };

  const handleReset = () => {
    setContracts([]);
    setActiveContractId(null);
    setShowUpload(false);
  };

  const handleAddContract = () => {
    setShowUpload(true);
  };

  const hasResults = contracts.length > 0 && !showUpload;

  return (
    <div className="h-screen flex flex-col bg-background dark">
      {/* Nav */}
      <nav className="sticky top-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-md shrink-0">
        <div className="max-w-[1800px] mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              <FileText className="w-4 h-4 text-primary-foreground" />
            </div>
            <span className="text-lg font-bold text-foreground tracking-tight">
              ContratoIA
            </span>
          </div>
          <div className="flex items-center gap-2">
            {hasResults && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddContract}
                  className="gap-1.5 active:scale-[0.97] transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Adicionar contrato
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleReset}
                  className="active:scale-[0.97] transition-transform text-muted-foreground"
                >
                  Limpar tudo
                </Button>
              </>
            )}
            {showUpload && contracts.length > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowUpload(false)}
                className="active:scale-[0.97] transition-transform"
              >
                Voltar aos resultados
              </Button>
            )}
          </div>
        </div>
      </nav>

      {/* Contract tabs when multiple contracts */}
      {hasResults && contracts.length > 1 && (
        <div className="border-b border-border/40 bg-muted/20 shrink-0">
          <div className="max-w-[1800px] mx-auto px-6 flex items-center gap-1 overflow-x-auto py-1.5">
            {contracts.map((c) => (
              <Button
                key={c.id}
                variant={c.id === activeContractId ? "secondary" : "ghost"}
                size="sm"
                onClick={() => setActiveContractId(c.id)}
                className="gap-1.5 shrink-0 text-xs"
              >
                <FileText className="w-3 h-3" />
                {c.fileName.length > 25 ? c.fileName.substring(0, 25) + "..." : c.fileName}
              </Button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      {!hasResults ? (
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto px-6 py-12 space-y-16">
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

            {/* Upload / SysAid Tabs */}
            <Tabs defaultValue="sysaid" className="w-full max-w-2xl mx-auto">
              <TabsList className="grid w-full grid-cols-2 mb-6">
                <TabsTrigger value="sysaid" className="gap-2">
                  <Database className="w-4 h-4" />
                  Importar do SysAid
                </TabsTrigger>
                <TabsTrigger value="upload" className="gap-2">
                  <Upload className="w-4 h-4" />
                  Upload de Arquivo
                </TabsTrigger>
              </TabsList>
              <TabsContent value="sysaid">
                <SysAidImport onSelectContract={handleSysAidSelect} isLoading={isLoading} />
              </TabsContent>
              <TabsContent value="upload">
                <ContractUpload onAnalyze={handleAnalyze} isLoading={isLoading} />
              </TabsContent>
            </Tabs>

            {/* Features */}
            {contracts.length === 0 && (
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
            )}
          </div>
        </main>
      ) : activeContract ? (
        <main className="flex-1 min-h-0 p-4">
          <ResizablePanelGroup direction="horizontal" className="h-full rounded-2xl">
            <ResizablePanel defaultSize={45} minSize={25}>
              <ContractTextPanel text={activeContract.text} />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={55} minSize={30}>
              <ContractFormPanel data={activeContract.data} />
            </ResizablePanel>
          </ResizablePanelGroup>
        </main>
      ) : null}
    </div>
  );
};

export default Index;
