import { useState, useCallback } from "react";
import { Upload, FileText, Loader2, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { motion, AnimatePresence } from "framer-motion";

const ACCEPTED_TYPES = [
  ".pdf", ".doc", ".docx", ".xls", ".xlsx", ".csv", ".txt", ".rtf",
  ".odt", ".ods", ".ppt", ".pptx", ".png", ".jpg", ".jpeg", ".webp", ".gif",
];

const ACCEPTED_MIME = ACCEPTED_TYPES.join(",");

interface ContractUploadProps {
  onAnalyze: (file: File) => void;
  isLoading: boolean;
}

const ContractUpload = ({ onAnalyze, isLoading }: ContractUploadProps) => {
  const [dragActive, setDragActive] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    const file = e.dataTransfer.files?.[0];
    if (file) setSelectedFile(file);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setSelectedFile(file);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, filter: "blur(4px)" }}
      animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="w-full max-w-2xl mx-auto"
    >
      <div
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`
          relative rounded-2xl border-2 border-dashed p-12 text-center transition-all duration-300
          ${dragActive
            ? "border-primary bg-primary/5 scale-[1.02]"
            : selectedFile
              ? "border-primary/40 bg-card"
              : "border-border bg-card hover:border-muted-foreground/30"
          }
        `}
        style={{ boxShadow: "0 4px 24px -4px hsla(220,25%,10%,0.08), 0 1px 3px hsla(220,25%,10%,0.04)" }}
      >
        <AnimatePresence mode="wait">
          {selectedFile ? (
            <motion.div
              key="file"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4"
            >
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <FileText className="w-8 h-8 text-primary" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">{selectedFile.name}</p>
                <p className="text-sm text-muted-foreground mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
              <div className="flex gap-3 mt-2">
                <Button
                  variant="outline"
                  onClick={() => setSelectedFile(null)}
                  disabled={isLoading}
                  className="active:scale-[0.97] transition-transform"
                >
                  Trocar arquivo
                </Button>
                <Button
                  onClick={() => onAnalyze(selectedFile)}
                  disabled={isLoading}
                  className="gap-2 active:scale-[0.97] transition-transform"
                >
                  {isLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Sparkles className="w-4 h-4" />
                  )}
                  {isLoading ? "Analisando..." : "Analisar Contrato"}
                </Button>
              </div>
            </motion.div>
          ) : (
            <motion.label
              key="upload"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="flex flex-col items-center gap-4 cursor-pointer"
            >
              <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center transition-colors group-hover:bg-primary/10">
                <Upload className="w-8 h-8 text-muted-foreground" />
              </div>
              <div>
                <p className="text-lg font-semibold text-foreground">
                  Arraste o contrato aqui
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  PDF, Word, Excel, imagens e outros formatos
                </p>
              </div>
              <input
                type="file"
                className="hidden"
                accept={ACCEPTED_MIME}
                onChange={handleFileSelect}
              />
            </motion.label>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
};

export default ContractUpload;
