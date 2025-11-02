import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Droplets, AlertTriangle, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MapView = () => {
  // Simulação de dados de áreas alagadas
  const floodedAreas = [
    {
      id: 1,
      name: "Centro",
      severity: "alta",
      affected: 1200,
      status: "Alerta Ativo"
    },
    {
      id: 2,
      name: "Zona Sul",
      severity: "média",
      affected: 650,
      status: "Monitoramento"
    },
    {
      id: 3,
      name: "Zona Norte",
      severity: "baixa",
      affected: 180,
      status: "Estável"
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-4">
            <Button asChild variant="ghost" size="icon">
              <Link to="/dashboard">
                <ArrowLeft className="w-5 h-5" />
              </Link>
            </Button>
            <h1 className="text-3xl font-bold text-foreground">Mapa de Áreas Alagadas</h1>
          </div>
        </div>

        {/* Map Container */}
        <div className="max-w-6xl mx-auto space-y-6">
          <Card className="overflow-hidden shadow-lg">
            <CardHeader className="bg-gradient-primary text-primary-foreground">
              <CardTitle className="flex items-center gap-2">
                <Droplets className="w-5 h-5" />
                Visualização de Áreas Afetadas
              </CardTitle>
              <CardDescription className="text-primary-foreground/90">
                Dados atualizados em tempo real
              </CardDescription>
            </CardHeader>
            <CardContent className="p-0">
              {/* Map Placeholder */}
              <div className="w-full h-96 bg-muted flex items-center justify-center">
                <div className="text-center space-y-2">
                  <Info className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Mapa interativo será carregado aqui
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Integração com Mapbox em desenvolvimento
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Affected Areas List */}
          <div className="grid md:grid-cols-3 gap-4">
            {floodedAreas.map((area) => (
              <Card key={area.id} className="shadow-md hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{area.name}</CardTitle>
                    <Badge
                      variant={
                        area.severity === "alta"
                          ? "destructive"
                          : area.severity === "média"
                          ? "default"
                          : "secondary"
                      }
                    >
                      {area.severity === "alta" ? "Alta" : area.severity === "média" ? "Média" : "Baixa"}
                    </Badge>
                  </div>
                  <CardDescription>{area.status}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <AlertTriangle className="w-4 h-4" />
                    <span className="text-sm">
                      {area.affected} pessoas afetadas
                    </span>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Info Card */}
          <Card className="bg-card border-primary/20">
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Info className="w-5 h-5 text-primary" />
                Como usar o mapa
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>• As áreas em vermelho indicam regiões com maior nível de alagamento</p>
              <p>• Clique nas regiões para ver mais detalhes sobre a situação local</p>
              <p>• Os dados são atualizados a cada 15 minutos com base em sensores e denúncias</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default MapView;
