import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { CheckCircle, XCircle, FileText, CheckCheck, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface BenefitRequest {
  id: string;
  user_name: string;
  chat_messages: any;
  status: string;
  benefit_type: string;
  created_at: string;
  decision_notes?: string;
}

interface DocumentAnalysis {
  id: string;
  document_name: string;
  analysis_result: any;
  is_valid: boolean;
  created_at: string;
}

const AgentPanel = () => {
  const [requests, setRequests] = useState<BenefitRequest[]>([]);
  const [selectedRequest, setSelectedRequest] = useState<BenefitRequest | null>(null);
  const [documentAnalysis, setDocumentAnalysis] = useState<DocumentAnalysis[]>([]);
  const [decisionNotes, setDecisionNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

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

    const { error } = await supabase
      .from("benefit_requests")
      .update({
        status,
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
        title: status === "approved" ? "Benefício Deferido" : "Benefício Indeferido",
        description: "O usuário será notificado da decisão.",
      });
      setSelectedRequest(null);
      loadRequests();
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-500"><CheckCheck className="w-3 h-3 mr-1" />Deferido</Badge>;
      case "rejected":
        return <Badge className="bg-red-500"><XCircle className="w-3 h-3 mr-1" />Indeferido</Badge>;
      default:
        return <Badge variant="secondary">Pendente</Badge>;
    }
  };

  const getValidDocuments = () => {
    return documentAnalysis.filter(doc => doc.is_valid);
  };

  const getInvalidDocuments = () => {
    return documentAnalysis.filter(doc => !doc.is_valid);
  };

  return (
    <div className="min-h-screen bg-gradient-hero">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground">Painel de Análise - Agentes Públicos</h1>
          <p className="text-muted-foreground mt-2">Sistema de análise e concessão de benefícios</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Solicitações de Auxílio Reconstrução</CardTitle>
            <CardDescription>
              Analise documentos e defira ou indefira os benefícios solicitados
            </CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <p>Carregando...</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Solicitante</TableHead>
                    <TableHead>Tipo de Benefício</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {requests.map((request) => (
                    <TableRow key={request.id}>
                      <TableCell className="font-medium">{request.user_name}</TableCell>
                      <TableCell>
                        <Badge variant="outline">
                          {request.benefit_type === 'auxilio_reconstrucao' ? 'Auxílio Reconstrução' : request.benefit_type}
                        </Badge>
                      </TableCell>
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
                          Analisar
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
        <DialogContent className="max-w-5xl max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Análise de Solicitação de Benefício</DialogTitle>
            <DialogDescription>
              Revise os documentos e análise da IA antes de tomar a decisão
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-6">
              {/* Informações da Solicitação */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Informações do Solicitante</CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-muted-foreground">Nome</p>
                    <p className="font-semibold">{selectedRequest.user_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Tipo de Benefício</p>
                    <Badge variant="outline" className="mt-1">
                      {selectedRequest.benefit_type === 'auxilio_reconstrucao' ? 'Auxílio Reconstrução' : selectedRequest.benefit_type}
                    </Badge>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Data da Solicitação</p>
                    <p className="font-semibold">{new Date(selectedRequest.created_at).toLocaleString("pt-BR")}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Status Atual</p>
                    <div className="mt-1">{getStatusBadge(selectedRequest.status)}</div>
                  </div>
                </CardContent>
              </Card>

              {/* Análise de Documentos */}
              <div className="grid md:grid-cols-2 gap-4">
                {/* Documentos Válidos */}
                <Card className="border-green-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <CheckCircle className="w-5 h-5 text-green-500" />
                      Documentos Válidos ({getValidDocuments().length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getValidDocuments().length === 0 ? (
                      <p className="text-sm text-muted-foreground">Nenhum documento válido</p>
                    ) : (
                      <div className="space-y-3">
                        {getValidDocuments().map((doc) => (
                          <div key={doc.id} className="bg-green-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-green-600" />
                              <p className="font-medium text-sm">{doc.document_name}</p>
                            </div>
                            <div className="text-xs bg-white p-2 rounded">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(doc.analysis_result, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>

                {/* Documentos com Problemas */}
                <Card className="border-red-200">
                  <CardHeader>
                    <CardTitle className="text-lg flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-500" />
                      Documentos com Problemas ({getInvalidDocuments().length})
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {getInvalidDocuments().length === 0 ? (
                      <p className="text-sm text-muted-foreground">Todos os documentos estão válidos</p>
                    ) : (
                      <div className="space-y-3">
                        {getInvalidDocuments().map((doc) => (
                          <div key={doc.id} className="bg-red-50 p-3 rounded-lg">
                            <div className="flex items-center gap-2 mb-2">
                              <FileText className="w-4 h-4 text-red-600" />
                              <p className="font-medium text-sm">{doc.document_name}</p>
                            </div>
                            <div className="text-xs bg-white p-2 rounded">
                              <pre className="whitespace-pre-wrap">
                                {JSON.stringify(doc.analysis_result, null, 2)}
                              </pre>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Histórico de Conversa */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Histórico de Atendimento</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3 max-h-64 overflow-y-auto">
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
                          <p className="text-xs font-medium mb-1 text-muted-foreground">
                            {msg.role === "user" ? "Solicitante" : "Assistente"}
                          </p>
                          <p className="text-sm">{msg.content}</p>
                        </div>
                      ))}
                  </div>
                </CardContent>
              </Card>

              {/* Notas da Decisão */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Notas e Justificativa da Decisão</CardTitle>
                </CardHeader>
                <CardContent>
                  <Textarea
                    placeholder="Adicione observações e justificativa para a decisão..."
                    value={decisionNotes}
                    onChange={(e) => setDecisionNotes(e.target.value)}
                    rows={4}
                    className="mb-4"
                  />
                </CardContent>
              </Card>

              {/* Botões de Decisão */}
              {selectedRequest.status === "pending" && (
                <div className="flex gap-4 pt-4">
                  <Button
                    onClick={() => handleDecision("approved")}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                    size="lg"
                  >
                    <CheckCheck className="w-5 h-5 mr-2" />
                    Deferir Benefício
                  </Button>
                  <Button
                    onClick={() => handleDecision("rejected")}
                    variant="destructive"
                    className="flex-1"
                    size="lg"
                  >
                    <XCircle className="w-5 h-5 mr-2" />
                    Indeferir Benefício
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
