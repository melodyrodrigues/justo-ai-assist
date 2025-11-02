import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, CheckCircle, AlertCircle, Loader2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { User } from "@supabase/supabase-js";

interface DocumentData {
  name: string;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  extractedData?: any;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [requestId, setRequestId] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadRequestId(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      if (session?.user) {
        loadRequestId(session.user.id);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadRequestId = async (userId: string) => {
    const { data } = await supabase
      .from("benefit_requests")
      .select("id")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) {
      setRequestId(data.id);
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files) return;

    if (!user) {
      toast({
        title: "Login necessário",
        description: "Você precisa fazer login para enviar documentos.",
        variant: "destructive",
      });
      return;
    }

    if (!requestId) {
      toast({
        title: "Aviso",
        description: "Inicie uma conversa no chat antes de enviar documentos.",
        variant: "destructive",
      });
      return;
    }

    const newDocuments: DocumentData[] = Array.from(files).map((file) => ({
      name: file.name,
      type: file.type,
      status: "uploading" as const,
    }));

    setDocuments((prev) => [...prev, ...newDocuments]);

    // Process each file
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const docIndex = documents.length + i;

      try {
        // Update status to processing
        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === docIndex ? { ...doc, status: "processing" as const } : doc
          )
        );

        // Read file as base64
        const base64 = await new Promise<string>((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = () => {
            const result = reader.result as string;
            const base64Data = result.split(",")[1];
            resolve(base64Data);
          };
          reader.onerror = reject;
          reader.readAsDataURL(file);
        });

        // Call OCR function
        const { data, error } = await supabase.functions.invoke("ocr-extract", {
          body: {
            image: base64,
            filename: file.name,
          },
        });

        if (error) throw error;

        // Save document analysis to database
        await supabase.from("document_analysis").insert({
          request_id: requestId,
          document_name: file.name,
          analysis_result: data.extracted_data,
        });

        // Update document with extracted data
        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === docIndex
              ? {
                  ...doc,
                  status: "completed" as const,
                  extractedData: data.extracted_data,
                }
              : doc
          )
        );

        toast({
          title: "Documento processado",
          description: `${file.name} foi analisado com sucesso.`,
        });
      } catch (error: any) {
        console.error("Error processing document:", error);
        setDocuments((prev) =>
          prev.map((doc, idx) =>
            idx === docIndex ? { ...doc, status: "error" as const } : doc
          )
        );
        toast({
          title: "Erro ao processar documento",
          description: error.message || "Ocorreu um erro ao analisar o documento.",
          variant: "destructive",
        });
      }
    }
  };

  const getStatusIcon = (status: DocumentData["status"]) => {
    switch (status) {
      case "uploading":
        return <Upload className="w-5 h-5 text-primary" />;
      case "processing":
        return <Loader2 className="w-5 h-5 text-primary animate-spin" />;
      case "completed":
        return <CheckCircle className="w-5 h-5 text-success" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Upload de Documentos</CardTitle>
          <CardDescription>
            Envie seus documentos para análise automática
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="border-2 border-dashed rounded-lg p-8 text-center hover:border-primary transition-colors">
            <input
              type="file"
              multiple
              accept="image/*,.pdf"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium mb-2">
                Clique para selecionar arquivos
              </p>
              <p className="text-sm text-muted-foreground">
                ou arraste e solte aqui
              </p>
            </label>
          </div>

          {documents.length > 0 && (
            <div className="mt-6 space-y-2">
              <h3 className="font-semibold mb-3">Documentos enviados:</h3>
              {documents.map((doc, index) => (
                <div
                  key={index}
                  className="flex items-center gap-3 p-3 bg-muted rounded-lg"
                >
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <span className="flex-1 text-sm truncate">{doc.name}</span>
                  {getStatusIcon(doc.status)}
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Tipos de Documentos Aceitos</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2 text-sm">
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              CPF e RG
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Comprovante de residência
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Laudos e documentos médicos
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Documentos de propriedade
            </li>
            <li className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-primary" />
              Fotos de danos e perdas
            </li>
          </ul>
          <p className="mt-4 text-sm text-muted-foreground">
            Nossa IA irá analisar automaticamente os documentos enviados para
            extrair informações relevantes e acelerar seu atendimento.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
