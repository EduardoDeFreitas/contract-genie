import { motion } from "framer-motion";
import {
  FileText,
  Target,
  CalendarClock,
  AlertTriangle,
  Gauge,
  ClipboardCheck,
  Building2,
  Hash,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export interface ContractData {
  objeto: string;
  partes: { contratante: string; contratada: string };
  numero_contrato: string;
  vigencia: { inicio: string; fim: string; renovacao: string };
  valor: string;
  penalidades: string[];
  sla: string[];
  requisitos: string[];
  observacoes: string;
}

interface ContractResultsProps {
  data: ContractData;
}

const sections = [
  {
    key: "objeto",
    title: "Objetivo do Contrato",
    icon: Target,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "partes",
    title: "Partes Envolvidas",
    icon: Building2,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "numero_contrato",
    title: "Nº do Contrato",
    icon: Hash,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "vigencia",
    title: "Vigência",
    icon: CalendarClock,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "penalidades",
    title: "Penalidades",
    icon: AlertTriangle,
    color: "text-destructive",
    bgColor: "bg-destructive/10",
  },
  {
    key: "sla",
    title: "SLA",
    icon: Gauge,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
  {
    key: "requisitos",
    title: "Requisitos",
    icon: ClipboardCheck,
    color: "text-primary",
    bgColor: "bg-primary/10",
  },
] as const;

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 16, filter: "blur(4px)" },
  show: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] },
  },
};

const ContractResults = ({ data }: ContractResultsProps) => {
  const renderContent = (key: string) => {
    switch (key) {
      case "objeto":
        return <p className="text-foreground/80 leading-relaxed">{data.objeto}</p>;
      case "partes":
        return (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Contratante</Badge>
              <span className="text-sm text-foreground/80">{data.partes.contratante}</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary" className="text-xs">Contratada</Badge>
              <span className="text-sm text-foreground/80">{data.partes.contratada}</span>
            </div>
          </div>
        );
      case "numero_contrato":
        return <p className="text-foreground/80 font-mono text-lg">{data.numero_contrato}</p>;
      case "vigencia":
        return (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {[
              { label: "Início", value: data.vigencia.inicio },
              { label: "Fim", value: data.vigencia.fim },
              { label: "Renovação", value: data.vigencia.renovacao },
            ].map((v) => (
              <div key={v.label} className="rounded-xl bg-muted/60 px-4 py-3">
                <p className="text-xs text-muted-foreground mb-1">{v.label}</p>
                <p className="text-sm font-medium text-foreground">{v.value}</p>
              </div>
            ))}
          </div>
        );
      case "penalidades":
        return (
          <ul className="space-y-2">
            {data.penalidades.map((p, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-destructive shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        );
      case "sla":
        return (
          <ul className="space-y-2">
            {data.sla.map((s, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {s}
              </li>
            ))}
          </ul>
        );
      case "requisitos":
        return (
          <ul className="space-y-2">
            {data.requisitos.map((r, i) => (
              <li key={i} className="flex items-start gap-2 text-sm text-foreground/80">
                <span className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                {r}
              </li>
            ))}
          </ul>
        );
      default:
        return null;
    }
  };

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="w-full max-w-4xl mx-auto space-y-4"
    >
      {/* Header */}
      <motion.div variants={item} className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
          <FileText className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-foreground leading-tight">Análise do Contrato</h2>
          <p className="text-sm text-muted-foreground">Dados extraídos automaticamente por IA</p>
        </div>
      </motion.div>

      {/* Valor destaque */}
      {data.valor && (
        <motion.div variants={item}>
          <div className="rounded-2xl bg-primary px-6 py-5 text-primary-foreground">
            <p className="text-sm opacity-80 mb-1">Valor do Contrato</p>
            <p className="text-2xl font-bold tabular-nums">{data.valor}</p>
          </div>
        </motion.div>
      )}

      {/* Sections grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {sections.map((section) => (
          <motion.div
            key={section.key}
            variants={item}
            className={section.key === "objeto" ? "md:col-span-2" : ""}
          >
            <Card className="h-full border-border/60 shadow-sm hover:shadow-md transition-shadow duration-300">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2.5 text-base font-semibold">
                  <div className={`w-8 h-8 rounded-lg ${section.bgColor} flex items-center justify-center`}>
                    <section.icon className={`w-4 h-4 ${section.color}`} />
                  </div>
                  {section.title}
                </CardTitle>
              </CardHeader>
              <CardContent>{renderContent(section.key)}</CardContent>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Observações */}
      {data.observacoes && (
        <motion.div variants={item}>
          <Card className="border-border/60 shadow-sm">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold text-muted-foreground">
                Observações Adicionais
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-foreground/80 leading-relaxed">{data.observacoes}</p>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </motion.div>
  );
};

export default ContractResults;
