import { useState } from "react";
import {
  Target, Building2, Hash, CalendarClock, DollarSign,
  AlertTriangle, Gauge, ClipboardCheck, StickyNote, Save,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { type ContractData } from "@/components/ContractResults";
import { toast } from "sonner";

interface ContractFormPanelProps {
  data: ContractData;
}

const SectionHeader = ({ icon: Icon, title, color = "text-primary", bgColor = "bg-primary/10" }: {
  icon: React.ElementType; title: string; color?: string; bgColor?: string;
}) => (
  <div className="flex items-center gap-2.5 mb-4">
    <div className={`w-8 h-8 rounded-lg ${bgColor} flex items-center justify-center`}>
      <Icon className={`w-4 h-4 ${color}`} />
    </div>
    <h3 className="text-sm font-semibold text-foreground">{title}</h3>
  </div>
);

const ContractFormPanel = ({ data }: ContractFormPanelProps) => {
  const [form, setForm] = useState<ContractData>({ ...data });

  const updateField = (path: string, value: string) => {
    setForm((prev) => {
      const updated = { ...prev };
      const keys = path.split(".");
      let obj: any = updated;
      for (let i = 0; i < keys.length - 1; i++) {
        obj = obj[keys[i]];
      }
      obj[keys[keys.length - 1]] = value;
      return { ...updated };
    });
  };

  const updateArrayItem = (field: "penalidades" | "sla" | "requisitos", index: number, value: string) => {
    setForm((prev) => {
      const arr = [...prev[field]];
      arr[index] = value;
      return { ...prev, [field]: arr };
    });
  };

  const handleSave = () => {
    toast.success("Dados salvos com sucesso!");
    console.log("Contract form data:", form);
  };

  return (
    <div className="h-full flex flex-col bg-card rounded-2xl border border-border/60 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border/40 bg-muted/30">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <ClipboardCheck className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-foreground">Dados Extraídos</h3>
            <p className="text-xs text-muted-foreground">Formulário preenchido pela IA</p>
          </div>
        </div>
        <Button size="sm" onClick={handleSave} className="gap-1.5">
          <Save className="w-3.5 h-3.5" />
          Salvar
        </Button>
      </div>

      <ScrollArea className="flex-1">
        <div className="p-5 space-y-6">
          {/* Valor destaque */}
          <div className="rounded-2xl bg-primary px-5 py-4 text-primary-foreground">
            <Label className="text-xs opacity-80 text-primary-foreground">Valor do Contrato</Label>
            <Input
              value={form.valor}
              onChange={(e) => updateField("valor", e.target.value)}
              className="mt-1.5 bg-primary-foreground/10 border-primary-foreground/20 text-primary-foreground text-xl font-bold placeholder:text-primary-foreground/40"
            />
          </div>

          {/* Nº do Contrato */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={Hash} title="Nº do Contrato" />
              <Input
                value={form.numero_contrato}
                onChange={(e) => updateField("numero_contrato", e.target.value)}
                className="font-mono text-lg"
              />
            </CardContent>
          </Card>

          {/* Objetivo */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={Target} title="Objetivo do Contrato" />
              <Textarea
                value={form.objeto}
                onChange={(e) => updateField("objeto", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>

          {/* Partes */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={Building2} title="Partes Envolvidas" />
              <div className="space-y-3">
                <div>
                  <Label className="text-xs text-muted-foreground">Contratante</Label>
                  <Input
                    value={form.partes.contratante}
                    onChange={(e) => updateField("partes.contratante", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Contratada</Label>
                  <Input
                    value={form.partes.contratada}
                    onChange={(e) => updateField("partes.contratada", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Vigência */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={CalendarClock} title="Vigência" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {(["inicio", "fim", "renovacao"] as const).map((key) => (
                  <div key={key}>
                    <Label className="text-xs text-muted-foreground capitalize">
                      {key === "renovacao" ? "Renovação" : key === "inicio" ? "Início" : "Fim"}
                    </Label>
                    <Input
                      value={form.vigencia[key]}
                      onChange={(e) => updateField(`vigencia.${key}`, e.target.value)}
                      className="mt-1"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Penalidades */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={AlertTriangle} title="Penalidades" color="text-destructive" bgColor="bg-destructive/10" />
              <div className="space-y-2">
                {form.penalidades.map((p, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1.5 shrink-0 text-xs text-destructive border-destructive/30">
                      {i + 1}
                    </Badge>
                    <Textarea
                      value={p}
                      onChange={(e) => updateArrayItem("penalidades", i, e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* SLA */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={Gauge} title="SLA" />
              <div className="space-y-2">
                {form.sla.map((s, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1.5 shrink-0 text-xs">
                      {i + 1}
                    </Badge>
                    <Textarea
                      value={s}
                      onChange={(e) => updateArrayItem("sla", i, e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Requisitos */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={ClipboardCheck} title="Requisitos" />
              <div className="space-y-2">
                {form.requisitos.map((r, i) => (
                  <div key={i} className="flex items-start gap-2">
                    <Badge variant="outline" className="mt-1.5 shrink-0 text-xs">
                      {i + 1}
                    </Badge>
                    <Textarea
                      value={r}
                      onChange={(e) => updateArrayItem("requisitos", i, e.target.value)}
                      rows={2}
                      className="resize-none text-sm"
                    />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Observações */}
          <Card className="border-border/40">
            <CardContent className="pt-5">
              <SectionHeader icon={StickyNote} title="Observações" />
              <Textarea
                value={form.observacoes}
                onChange={(e) => updateField("observacoes", e.target.value)}
                rows={4}
                className="resize-none"
              />
            </CardContent>
          </Card>
        </div>
      </ScrollArea>
    </div>
  );
};

export default ContractFormPanel;
