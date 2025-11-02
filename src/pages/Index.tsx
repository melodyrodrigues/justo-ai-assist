import { Button } from "@/components/ui/button";
import { MessageSquare, FileText, Shield } from "lucide-react";
import { Link } from "react-router-dom";

const Index = () => {
  return (
    <div className="min-h-screen bg-gradient-hero">
      {/* Hero Section */}
      <header className="container mx-auto px-4 py-16 md:py-24">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <div className="inline-flex items-center gap-2 bg-card px-4 py-2 rounded-full shadow-sm mb-4">
            <Shield className="w-4 h-4 text-secondary" />
            <span className="text-sm font-medium text-foreground">Assistência social e concessão de benefícios</span>
          </div>
          
          <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight">
            IAcolhe
          </h1>
          
          <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl mx-auto">
            Assistência social para pessoas afetadas por enchentes e alagamentos
          </p>
          
          <div className="flex justify-center pt-4">
            <Button asChild size="lg" className="text-lg h-14 shadow-primary">
              <Link to="/dashboard">Começar Atendimento</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Features Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-2 gap-6 max-w-3xl mx-auto">
          <FeatureCard
            icon={<MessageSquare className="w-6 h-6" />}
            title="Acesso Governo"
            description="Acesso de Agentes Públicos"
          />
          <FeatureCard
            icon={<FileText className="w-6 h-6" />}
            title="Analise Documental IA"
            description="Análise inteligente de documentos e comprovantes com IA"
          />
        </div>
      </section>

      {/* Info Section */}
      <section className="container mx-auto px-4 py-16">
        <div className="max-w-3xl mx-auto bg-card rounded-2xl p-8 md:p-12 shadow-lg">
          <h2 className="text-3xl font-bold text-foreground mb-6">
            Como Funciona
          </h2>
          <div className="space-y-6 text-muted-foreground">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                1
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Converse com nosso Assistente</h3>
                <p>Explique sua situação e receba orientação imediata sobre direitos e benefícios disponíveis</p>
              </div>
            </div>
            
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                2
              </div>
              <div>
                <h3 className="font-semibold text-foreground mb-2">Envie seus Documentos</h3>
                <p>Faça upload de RG, CPF e comprovantes - nossa IA extrai as informações automaticamente</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

const FeatureCard = ({ icon, title, description }: { icon: React.ReactNode; title: string; description: string }) => (
  <div className="bg-card rounded-xl p-6 shadow-md hover:shadow-lg transition-all duration-300 hover:-translate-y-1">
    <div className="w-12 h-12 rounded-lg bg-gradient-primary flex items-center justify-center text-primary-foreground mb-4">
      {icon}
    </div>
    <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
    <p className="text-muted-foreground text-sm">{description}</p>
  </div>
);

export default Index;
