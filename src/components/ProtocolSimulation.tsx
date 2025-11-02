import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Download, CheckCircle2 } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";

const ProtocolSimulation = () => {
  const [formData, setFormData] = useState({
    name: "",
    cpf: "",
    address: "",
    affectedArea: "",
  });
  const [protocol, setProtocol] = useState<string | null>(null);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Generate protocol number
    const protocolNumber = `CJ-${Date.now().toString().slice(-8)}`;
    setProtocol(protocolNumber);
    
    toast({
      title: "Protocolo gerado com sucesso!",
      description: `Número do protocolo: ${protocolNumber}`,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const downloadProtocol = () => {
    toast({
      title: "Download iniciado",
      description: "Seu protocolo está sendo baixado.",
    });
  };

  if (protocol) {
    return (
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-secondary text-secondary-foreground">
          <CardTitle className="flex items-center gap-2">
            <CheckCircle2 className="w-6 h-6" />
            Protocolo Gerado
          </CardTitle>
          <CardDescription className="text-secondary-foreground/90">
            Seu protocolo foi criado com sucesso
          </CardDescription>
        </CardHeader>
        <CardContent className="p-8 space-y-6">
          <div className="text-center space-y-4">
            <div className="inline-flex items-center gap-2 bg-muted px-6 py-3 rounded-lg">
              <Shield className="w-5 h-5 text-secondary" />
              <span className="font-mono text-2xl font-bold text-foreground">
                {protocol}
              </span>
            </div>
            <p className="text-muted-foreground">
              Guarde este número para acompanhar seu pedido
            </p>
          </div>

          <div className="bg-muted rounded-lg p-6 space-y-4">
            <h3 className="font-semibold text-foreground">Dados do Protocolo:</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Nome:</span>
                <span className="font-medium">{formData.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">CPF:</span>
                <span className="font-medium">{formData.cpf}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Endereço:</span>
                <span className="font-medium">{formData.address}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Área Afetada:</span>
                <span className="font-medium">{formData.affectedArea}</span>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <Button onClick={downloadProtocol} className="flex-1">
              <Download className="w-4 h-4 mr-2" />
              Baixar Protocolo
            </Button>
            <Button
              variant="outline"
              onClick={() => setProtocol(null)}
              className="flex-1"
            >
              Novo Protocolo
            </Button>
          </div>

          <div className="border-t pt-6">
            <h3 className="font-semibold text-foreground mb-3">Próximos Passos:</h3>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">1</Badge>
                <p className="text-sm text-muted-foreground">
                  Aguarde análise do seu pedido (até 5 dias úteis)
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">2</Badge>
                <p className="text-sm text-muted-foreground">
                  Acompanhe o status pelo número do protocolo
                </p>
              </div>
              <div className="flex items-start gap-3">
                <Badge variant="secondary" className="mt-0.5">3</Badge>
                <p className="text-sm text-muted-foreground">
                  Em caso de aprovação, o benefício será creditado em até 10 dias
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="shadow-lg">
      <CardHeader className="bg-gradient-secondary text-secondary-foreground">
        <CardTitle className="flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Simulação de Protocolo
        </CardTitle>
        <CardDescription className="text-secondary-foreground/90">
          Preencha os dados para gerar seu protocolo de benefício
        </CardDescription>
      </CardHeader>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome Completo</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleInputChange}
                placeholder="Digite seu nome completo"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cpf">CPF</Label>
              <Input
                id="cpf"
                name="cpf"
                value={formData.cpf}
                onChange={handleInputChange}
                placeholder="000.000.000-00"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="address">Endereço Completo</Label>
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                placeholder="Rua, número, bairro, cidade"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="affectedArea">Área Afetada</Label>
              <Input
                id="affectedArea"
                name="affectedArea"
                value={formData.affectedArea}
                onChange={handleInputChange}
                placeholder="Descreva a área afetada"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full">
            <Shield className="w-4 h-4 mr-2" />
            Gerar Protocolo
          </Button>
        </form>

        <div className="mt-6 p-4 bg-muted rounded-lg">
          <h3 className="font-semibold text-sm text-foreground mb-2">
            Informações Importantes
          </h3>
          <ul className="text-xs text-muted-foreground space-y-1">
            <li>• Certifique-se de que todos os dados estão corretos</li>
            <li>• Tenha em mãos seus documentos pessoais</li>
            <li>• O protocolo é válido por 90 dias</li>
            <li>• Você pode acompanhar o status pelo número do protocolo</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
};

export default ProtocolSimulation;
