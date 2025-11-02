import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, LogOut } from "lucide-react";

interface BenefitRequest {
  id: string;
  user_name: string;
  chat_messages: any;
  status: string;
  created_at: string;
  decision_notes?: string;
}

interface DocumentAnalysis {
  id: string;
  document_name: string;
  analysis_result: any;
  created_at: string;
}

const AgentPanel = () => {
  const [requests, setRequests] = useState<BenefitRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BenefitRequest | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis[]>([]);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    checkAuthAndRole();
    loadRequests();
  }, []);

  const checkAuthAndRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      navigate("/auth");
      return;
    }

    const { data } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", session.user.id)
      .eq("role", "agent")
      .maybeSingle();

    if (!data) {
      toast({
        title: "Acesso negado",
        description: "Você não tem permissão para acessar este painel.",
        variant: "destructive",
      });
      navigate("/dashboard");
    }
  };

  const loadRequests = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("benefit_requests")
      .select("*")
      .order("created_at", { ascending: false });

    if (error) {
      toast({
        title: "Erro ao carregar solicitações",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setRequests(data || []);
    }
    setLoading(false);
  };

  const loadDocumentAnalysis = async (requestId: string) => {
    const { data, error } = await supabase
      .from("document_analysis")
      .select("*")
      .eq("request_id", requestId);

    if (error) {
      toast({
        title: "Erro ao carregar análise de documentos",
        description: error.message,
        variant: "destructive",
      });
    } else {
      setDocumentAnalysis(data || []);
    }
  };

  const handleRequestClick = async (request: BenefitRequest) => {
    setSelectedRequest(request);
    setDecisionNotes(request.decision_notes || "");
    await loadDocumentAnalysis(request.id);
  };

  const handleDecision = async (status: "approved" | "rejected") => {
    if (!selectedRequest) return;

    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { error } = await supabase
      .from("benefit_requests")
      .update({
        status,
        agent_id: session.user.id,
        decision_notes: decisionNotes,
        decision_date: new Date().toISOString(),
      })
      .eq("id", selectedRequest.id);

    if (error) {
      toast({
        title: "Erro ao processar decisão",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({
        title: status === "approved" ? "Benefício aprovado" : "Benefício rejeitado",
        description: "O usuário será notificado da decisão.",
      });
      setSelectedRequest(null);
      loadRequests();
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500">Aprovado</Badge>;
      case "rejected":
        return <Badge className="bg-red-500">Rejeitado</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel de Agentes Públicos</h1>
          <Button onClick={handleLogout} variant="outline">
            <LogOut className="w-4 h-4 mr-2" />
            Sair
          </Button>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Benefícios</CardTitle>
            <CardDescription>
              Analise e decida sobre as solicitações de benefícios dos usuários
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome do Solicitante</TableHead>
                    <TableHead>Data da Solicitação</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell>{request.user_name}</TableCell>
                      <TableCell>
                        {new Date(request.created_at).toLocaleDateString("pt-BR")}
                      </TableCell>
                      <TableCell>{getStatusBadge(request.status)}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          onClick={() => handleRequestClick(request)}
                        >
                          <FileText className="w-4 h-4 mr-2" />
                          Ver Detalhes
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Solicitação</DialogTitle>
            <DialogDescription>
              Analise as informações e tome uma decisão
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2">Informações do Solicitante</h3>
                <p>Nome: {selectedRequest.user_name}</p>
                <p>Data: {new Date(selectedRequest.created_at).toLocaleString("pt-BR")}</p>
                <p>Status: {getStatusBadge(selectedRequest.status)}</p>
              </div>

              <div>
                <h3 className="font-semibold mb-2">Histórico de Conversa</h3>
                <Card>
                  <CardContent className="pt-6">
                    <div className="space-y-4 max-h-60 overflow-y-auto">
                      {Array.isArray(selectedRequest.chat_messages) &&
                        selectedRequest.chat_messages.map((msg: any, idx: number) => (
                          <div
                            key={idx}
                            className={`p-3 rounded-lg ${
                              msg.role === "user"
                                ? "bg-primary/10 ml-8"
                                : "bg-muted mr-8"
                            }`}
                          >
                            <p className="text-sm font-medium mb-1">
                              {msg.role === "user" ? "Usuário" : "Assistente"}
                            </p>
                            <p className="text-sm">{msg.content}</p>
                          </div>
                        ))}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {documentAnalysis.length > 0 && (
                <div>
                  <h3 className="font-semibold mb-2">Análise de Documentos (IA)</h3>
                  {documentAnalysis.map((doc) => (
                    <Card key={doc.id} className="mb-4">
                      <CardHeader>
                        <CardTitle className="text-sm">{doc.document_name}</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <pre className="text-sm whitespace-pre-wrap">
                          {JSON.stringify(doc.analysis_result, null, 2)}
                        </pre>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}

              <div>
                <h3 className="font-semibold mb-2">Notas da Decisão</h3>
                <Textarea
                  placeholder="Adicione notas sobre sua decisão..."
                  value={decisionNotes}
                  onChange={(e) => setDecisionNotes(e.target.value)}
                  rows={4}
                />
              </div>

              {selectedRequest.status === "pending" && (
                <div className="flex gap-4">
                  <Button
                    onClick={() => handleDecision("approved")}
                    className="flex-1"
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Aprovar
                  </Button>
                  <Button
                    onClick={() => handleDecision("rejected")}
                    variant="destructive"
                    className="flex-1"
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeitar
                  </Button>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AgentPanel;
