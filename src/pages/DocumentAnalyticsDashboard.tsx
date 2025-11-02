import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, CheckCircle, XCircle, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const DocumentAnalyticsDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["document-analytics"],
    queryFn: async () => {
      const { data: allRequests, error } = await supabase
        .from("benefit_requests")
        .select("*");

      if (error) throw error;

      const pending = allRequests?.filter(r => r.status === "pending").length || 0;
      const approved = allRequests?.filter(r => r.status === "approved").length || 0;
      const rejected = allRequests?.filter(r => r.status === "rejected").length || 0;
      const approvedReconstruction = allRequests?.filter(
        r => r.status === "approved" && r.benefit_type === "auxilio_reconstrucao"
      ).length || 0;

      return { pending, approved, rejected, approvedReconstruction };
    },
  });

  const statCards = [
    {
      title: "Pendentes",
      value: stats?.pending || 0,
      icon: Clock,
      color: "text-yellow-500",
      bgColor: "bg-yellow-500/10",
    },
    {
      title: "Aprovadas",
      value: stats?.approved || 0,
      icon: CheckCircle,
      color: "text-green-500",
      bgColor: "bg-green-500/10",
    },
    {
      title: "Indeferidas",
      value: stats?.rejected || 0,
      icon: XCircle,
      color: "text-red-500",
      bgColor: "bg-red-500/10",
    },
    {
      title: "Aprovadas - Auxílio Reconstrução",
      value: stats?.approvedReconstruction || 0,
      icon: FileText,
      color: "text-blue-500",
      bgColor: "bg-blue-500/10",
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

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader className="pb-3">
                  <div className="h-4 bg-muted rounded w-3/4 mb-2"></div>
                  <div className="h-8 bg-muted rounded w-1/2"></div>
                </CardHeader>
              </Card>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {statCards.map((stat) => (
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
                    {stat.value === 1 ? "solicitação" : "solicitações"}
                  </CardDescription>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

        <Card className="mt-8">
          <CardHeader>
            <CardTitle>Sobre o Dashboard</CardTitle>
            <CardDescription>
              Este dashboard apresenta estatísticas em tempo real sobre as solicitações de benefícios
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-3">
              <Clock className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Pendentes</h3>
                <p className="text-sm text-muted-foreground">
                  Solicitações aguardando análise e decisão
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <CheckCircle className="w-5 h-5 text-green-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Aprovadas</h3>
                <p className="text-sm text-muted-foreground">
                  Solicitações aprovadas para todos os tipos de benefícios
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <XCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Indeferidas</h3>
                <p className="text-sm text-muted-foreground">
                  Solicitações que não foram aprovadas
                </p>
              </div>
            </div>
            <div className="flex gap-3">
              <FileText className="w-5 h-5 text-blue-500 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="font-semibold text-foreground">Aprovadas - Auxílio Reconstrução</h3>
                <p className="text-sm text-muted-foreground">
                  Solicitações aprovadas especificamente para o benefício de Auxílio Reconstrução
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DocumentAnalyticsDashboard;
