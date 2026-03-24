import { FileText } from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";

interface ContractTextPanelProps {
  text: string;
}

const ContractTextPanel = ({ text }: ContractTextPanelProps) => {
  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden">
      <div className="flex items-center gap-2.5 px-5 py-4 border-b border-border/40 bg-muted/30">
        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
          <FileText className="w-4 h-4 text-primary" />
        </div>
        <div>
          <h3 className="text-sm font-semibold text-foreground">Contrato Original</h3>
          <p className="text-xs text-muted-foreground">Texto completo do contrato</p>
        </div>
      </div>
      <ScrollArea className="flex-1 p-5">
        <pre className="text-sm text-foreground/80 whitespace-pre-wrap font-mono leading-relaxed break-words">
          {text}
        </pre>
      </ScrollArea>
    </div>
  );
};

export default ContractTextPanel;
