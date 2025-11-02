import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, FileText, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface DocumentData {
  name: string;
  type: string;
  status: "uploading" | "processing" | "completed" | "error";
  extractedData?: any;
}

const DocumentUpload = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);
  const { toast } = useToast();

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    
    // Add document to list
    const newDoc: DocumentData = {
      name: file.name,
      type: file.type,
      status: "uploading",
    };
    setDocuments((prev) => [...prev, newDoc]);

    try {
      // Convert file to base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result as string;
        const base64Data = base64.split(",")[1];

        // Update status to processing
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.name === file.name ? { ...doc, status: "processing" } : doc
          )
        );

        // Call OCR function
        const { data, error } = await supabase.functions.invoke("ocr-extract", {
          body: { image: base64Data, filename: file.name },
        });

        if (error) throw error;

        // Update with extracted data
        setDocuments((prev) =>
          prev.map((doc) =>
            doc.name === file.name
              ? { ...doc, status: "completed", extractedData: data }
              : doc
          )
        );

        toast({
          title: "Documento processado",
          description: "Informações extraídas com sucesso!",
        });
      };
      reader.readAsDataURL(file);
    } catch (error) {
      console.error("Error processing document:", error);
      setDocuments((prev) =>
        prev.map((doc) =>
          doc.name === file.name ? { ...doc, status: "error" } : doc
        )
      );
      toast({
        title: "Erro ao processar documento",
        description: "Tente novamente.",
        variant: "destructive",
      });
    }
  };

  const getStatusIcon = (status: DocumentData["status"]) => {
    switch (status) {
      case "uploading":
      case "processing":
        return <Loader2 className="w-5 h-5 animate-spin text-primary" />;
      case "completed":
        return <CheckCircle2 className="w-5 h-5 text-secondary" />;
      case "error":
        return <XCircle className="w-5 h-5 text-destructive" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader className="bg-gradient-primary text-primary-foreground">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Upload de Documentos
          </CardTitle>
          <CardDescription className="text-primary-foreground/90">
            Envie RG, CPF, comprovante de residência e outros documentos
          </CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="border-2 border-dashed border-border rounded-lg p-12 text-center hover:border-primary transition-colors">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept="image/*,.pdf"
              onChange={handleFileUpload}
            />
            <label htmlFor="file-upload" className="cursor-pointer">
              <Upload className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground mb-2">
                Clique para enviar documento
              </p>
              <p className="text-sm text-muted-foreground">
                PDF, JPG, PNG até 10MB
              </p>
            </label>
          </div>
        </CardContent>
      </Card>

      {/* Documents List */}
      {documents.length > 0 && (
        <Card className="shadow-md">
          <CardHeader>
            <CardTitle className="text-lg">Documentos Enviados</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {documents.map((doc, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-4 bg-muted rounded-lg"
              >
                <div className="flex items-center gap-3">
                  <FileText className="w-5 h-5 text-muted-foreground" />
                  <div>
                    <p className="font-medium text-sm">{doc.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {doc.status === "uploading" && "Enviando..."}
                      {doc.status === "processing" && "Processando..."}
                      {doc.status === "completed" && "Processado"}
                      {doc.status === "error" && "Erro ao processar"}
                    </p>
                  </div>
                </div>
                {getStatusIcon(doc.status)}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Info Card */}
      <Card className="bg-card border-primary/20">
        <CardHeader>
          <CardTitle className="text-lg">Documentos Aceitos</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>• RG (Registro Geral)</p>
          <p>• CPF (Cadastro de Pessoa Física)</p>
          <p>• Comprovante de Residência (água, luz, telefone)</p>
          <p>• Documentos relacionados à área afetada</p>
          <p className="pt-2 text-xs">
            Nosso sistema utiliza OCR para extrair automaticamente as informações dos documentos.
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default DocumentUpload;
