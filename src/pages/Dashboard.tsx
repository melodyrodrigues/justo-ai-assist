import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { MessageSquare, FileText, Shield, Map } from "lucide-react";
import ChatInterface from "@/components/ChatInterface";
import DocumentUpload from "@/components/DocumentUpload";
import ProtocolSimulation from "@/components/ProtocolSimulation";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";

const Dashboard = () => {
  const [activeTab, setActiveTab] = useState("chat");

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Link to="/">
            <h1 className="text-3xl font-bold text-foreground">Clima Justo</h1>
          </Link>
          <Button asChild variant="outline">
            <Link to="/mapa">
              <Map className="w-4 h-4 mr-2" />
              Ver Mapa
            </Link>
          </Button>
        </div>

        {/* Main Content */}
        <div className="max-w-5xl mx-auto">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-8 h-auto p-1">
              <TabsTrigger value="chat" className="flex items-center gap-2 py-3">
                <MessageSquare className="w-4 h-4" />
                <span className="hidden sm:inline">Atendimento</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="flex items-center gap-2 py-3">
                <FileText className="w-4 h-4" />
                <span className="hidden sm:inline">Documentos</span>
              </TabsTrigger>
              <TabsTrigger value="protocol" className="flex items-center gap-2 py-3">
                <Shield className="w-4 h-4" />
                <span className="hidden sm:inline">Protocolo</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="chat" className="mt-0">
              <ChatInterface />
            </TabsContent>

            <TabsContent value="documents" className="mt-0">
              <DocumentUpload />
            </TabsContent>

            <TabsContent value="protocol" className="mt-0">
              <ProtocolSimulation />
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
