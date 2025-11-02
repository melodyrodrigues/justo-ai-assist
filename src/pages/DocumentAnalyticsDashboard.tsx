import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, AlertCircle, TrendingUp, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DocumentAnalyticsDashboard = () => {
  const aiAnalyticsCards = [
    {
      title: "Documentos Processados",
      value: 1247,
      icon: FileCheck,
      color: "text-purple-500",
      bgColor: "bg-purple-500/10",
      description: "Total analisados por IA",
    },
    {
      title: "Taxa de Validação",
      value: "94.2%",
      icon: TrendingUp,
      color: "text-emerald-500",
      bgColor: "bg-emerald-500/10",
      description: "Documentos válidos",
    },
    {
      title: "Documentos com Problemas",
      value: 73,
      icon: AlertCircle,
      color: "text-orange-500",
      bgColor: "bg-orange-500/10",
      description: "Requerem revisão manual",
    },
    {
      title: "Tempo Médio de Análise",
      value: "3.8s",
      icon: Clock,
      color: "text-cyan-500",
      bgColor: "bg-cyan-500/10",
      description: "Por documento",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero p-4 md:p-8">
      <div className="container mx-auto max-w-6xl">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-2">
              Dashboard de Análise Documental
            </h1>
            <p className="text-muted-foreground">
              Análise inteligente de documentos e comprovantes com IA
            </p>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Voltar</Link>
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {aiAnalyticsCards.map((stat) => (
            <Card key={stat.title} className="hover:shadow-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                    <stat.icon className={`w-5 h-5 ${stat.color}`} />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className={`text-3xl font-bold ${stat.color}`}>
                  {stat.value}
                </div>
                <CardDescription className="mt-1">
                  {stat.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Análise Documental com IA</CardTitle>
            <CardDescription>
              Sistema inteligente de validação de documentos e comprovantes
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-foreground mb-2">Documentos Processados</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Comprovantes de residência (contas de água, luz, telefone)</li>
                <li>• Documentos de identificação (RG, CNH, CPF)</li>
                <li>• Fotos de danos à moradia (fachada, interior, close-up)</li>
                <li>• Boletins de ocorrência e laudos técnicos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Verificações Automáticas</h3>
              <ul className="text-sm text-muted-foreground space-y-1">
                <li>• Validação de autenticidade dos documentos</li>
                <li>• Extração de dados pessoais (nome, CPF, endereço)</li>
                <li>• Análise de conformidade de endereço</li>
                <li>• Detecção de qualidade e legibilidade</li>
                <li>• Verificação de consistência entre documentos</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-2">Benefícios do Sistema</h3>
              <p className="text-sm text-muted-foreground">
                A análise automatizada reduz o tempo de processamento e aumenta a precisão 
                na validação de documentos, permitindo decisões mais rápidas e consistentes.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAnalyticsDashboard;
