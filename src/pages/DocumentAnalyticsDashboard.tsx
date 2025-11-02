import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileCheck, AlertCircle, TrendingUp, Clock, Search, MapPin, FileText, CheckCircle, XCircle } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const DocumentAnalyticsDashboard = () => {
  const [searchLocality, setSearchLocality] = useState("");
  const [searchDocument, setSearchDocument] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async () => {
    if (!searchLocality && !searchDocument) {
      toast.error("Preencha ao menos um campo para pesquisar");
      return;
    }

    setIsSearching(true);
    try {
      let query = supabase.from("benefit_requests").select("*");

      if (searchDocument) {
        // Assumindo que o CPF está nas mensagens do chat ou em user_name
        query = query.or(`user_name.ilike.%${searchDocument}%,chat_messages::text.ilike.%${searchDocument}%`);
      }

      if (searchLocality) {
        query = query.ilike("chat_messages::text", `%${searchLocality}%`);
      }

      const { data, error } = await query.order("created_at", { ascending: false }).limit(10);

      if (error) throw error;

      setSearchResults(data || []);
      
      if (!data || data.length === 0) {
        toast.info("Nenhum resultado encontrado");
      }
    } catch (error) {
      console.error("Erro ao buscar:", error);
      toast.error("Erro ao realizar a pesquisa");
    } finally {
      setIsSearching(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return { label: "Deferido", icon: CheckCircle, color: "text-green-500", bgColor: "bg-green-500/10" };
      case "rejected":
        return { label: "Indeferido", icon: XCircle, color: "text-red-500", bgColor: "bg-red-500/10" };
      default:
        return { label: "Pendente", icon: Clock, color: "text-yellow-500", bgColor: "bg-yellow-500/10" };
    }
  };

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
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Consultar Status do Benefício
            </CardTitle>
            <CardDescription>
              Pesquise por localidade ou documento para verificar o status da solicitação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="locality" className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  Localidade (Município)
                </Label>
                <Input
                  id="locality"
                  placeholder="Ex: Porto Alegre, Canoas..."
                  value={searchLocality}
                  onChange={(e) => setSearchLocality(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="document" className="flex items-center gap-2">
                  <FileText className="w-4 h-4" />
                  CPF ou Nome
                </Label>
                <Input
                  id="document"
                  placeholder="Digite o CPF ou nome completo"
                  value={searchDocument}
                  onChange={(e) => setSearchDocument(e.target.value)}
                />
              </div>
            </div>
            <Button 
              onClick={handleSearch} 
              disabled={isSearching}
              className="w-full md:w-auto"
            >
              <Search className="w-4 h-4 mr-2" />
              {isSearching ? "Pesquisando..." : "Pesquisar"}
            </Button>

            {searchResults.length > 0 && (
              <div className="mt-6 space-y-3">
                <h3 className="font-semibold text-foreground">Resultados da Pesquisa</h3>
                {searchResults.map((result) => {
                  const statusInfo = getStatusBadge(result.status);
                  const StatusIcon = statusInfo.icon;
                  
                  return (
                    <Card key={result.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between">
                          <div className="space-y-1 flex-1">
                            <p className="font-semibold text-foreground">{result.user_name}</p>
                            <p className="text-sm text-muted-foreground">
                              Tipo: {result.benefit_type === "auxilio_reconstrucao" ? "Auxílio Reconstrução" : result.benefit_type}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Data: {new Date(result.created_at).toLocaleDateString('pt-BR')}
                            </p>
                          </div>
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${statusInfo.bgColor}`}>
                            <StatusIcon className={`w-4 h-4 ${statusInfo.color}`} />
                            <span className={`font-semibold ${statusInfo.color}`}>
                              {statusInfo.label}
                            </span>
                          </div>
                        </div>
                        {result.decision_notes && (
                          <p className="mt-3 text-sm text-muted-foreground border-t pt-3">
                            <strong>Observações:</strong> {result.decision_notes}
                          </p>
                        )}
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

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
