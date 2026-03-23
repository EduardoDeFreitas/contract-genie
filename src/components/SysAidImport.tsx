import { useState } from "react";
import { Database, Loader2, FileText, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";

interface SysAidContract {
  id: string;
  info?: Array<{ key: string; value: string }>;
  [key: string]: unknown;
}

interface SysAidImportProps {
  onSelectContract: (contractText: string) => void;
  isLoading: boolean;
}

const SysAidImport = ({ onSelectContract, isLoading }: SysAidImportProps) => {
  const [contracts, setContracts] = useState<SysAidContract[]>([]);
  const [isFetching, setIsFetching] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);

  const fetchContracts = async () => {
    setIsFetching(true);
    try {
      const { data, error } = await supabase.functions.invoke("fetch-sysaid-contracts");

      if (error) {
        console.error("SysAid fetch error:", error);
        toast.error("Erro ao conectar ao SysAid. Verifique as credenciais.");
        return;
      }

      if (data?.error) {
        toast.error(data.error);
        return;
      }

      const list = Array.isArray(data) ? data : [];
      setContracts(list);
      setHasFetched(true);

      if (list.length === 0) {
        toast.info("Nenhum contrato encontrado no SysAid.");
      } else {
        toast.success(`${list.length} contrato(s) encontrado(s).`);
      }
    } catch (err) {
      console.error("SysAid error:", err);
      toast.error("Erro inesperado ao buscar contratos.");
    } finally {
      setIsFetching(false);
    }
  };

  const getFieldValue = (contract: SysAidContract, key: string): string => {
    const field = contract.info?.find((f) => f.key === key);
    return field?.value || "";
  };

  const getContractLabel = (contract: SysAidContract): string => {
    const name =
      getFieldValue(contract, "ciName") ||
      getFieldValue(contract, "name") ||
      getFieldValue(contract, "title") ||
      `Contrato #${contract.id}`;
    return name;
  };

  const handleSelect = (contract: SysAidContract) => {
    // Convert all contract fields into a readable text for AI analysis
    const lines: string[] = [`Contrato ID: ${contract.id}`];
    if (contract.info) {
      contract.info.forEach((field) => {
        if (field.value && field.value !== "" && field.value !== "null") {
          lines.push(`${field.key}: ${field.value}`);
        }
      });
    }
    const text = lines.join("\n");
    onSelectContract(text);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      {!hasFetched ? (
        <Card className="border-border/60">
          <CardContent className="flex flex-col items-center gap-4 py-12">
            <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Database className="w-8 h-8 text-primary" />
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-foreground">Importar do SysAid</p>
              <p className="text-sm text-muted-foreground mt-1">
                Busque contratos diretamente do CMDB do SysAid
              </p>
            </div>
            <Button
              onClick={fetchContracts}
              disabled={isFetching}
              className="gap-2 active:scale-[0.97] transition-transform mt-2"
            >
              {isFetching ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Database className="w-4 h-4" />
              )}
              {isFetching ? "Buscando..." : "Buscar Contratos"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium text-muted-foreground">
              {contracts.length} contrato(s) encontrado(s)
            </p>
            <Button variant="outline" size="sm" onClick={fetchContracts} disabled={isFetching}>
              {isFetching ? <Loader2 className="w-3 h-3 animate-spin" /> : "Atualizar"}
            </Button>
          </div>
          <AnimatePresence>
            {contracts.map((contract, i) => (
              <motion.div
                key={contract.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
              >
                <Card
                  className="border-border/60 hover:border-primary/40 hover:shadow-md transition-all duration-200 cursor-pointer group"
                  onClick={() => !isLoading && handleSelect(contract)}
                >
                  <CardContent className="flex items-center gap-4 py-4">
                    <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
                      <FileText className="w-5 h-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-foreground truncate">
                        {getContractLabel(contract)}
                      </p>
                      <p className="text-xs text-muted-foreground">ID: {contract.id}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </motion.div>
  );
};

export default SysAidImport;
