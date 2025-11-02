import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `Você é o assistente virtual do IAcolhe especializado exclusivamente no processo de AUXÍLIO RECONSTRUÇÃO (apoio financeiro para reparos/recuperação de moradias afetadas por eventos climáticos no Rio Grande do Sul).

Objetivo principal:
- Avaliar, de forma objetiva e empática, a elegibilidade do solicitante para o benefício de auxílio reconstrução. Limite estrito: atender apenas pessoas que residem no Estado do Rio Grande do Sul.

Fluxo obrigatório (siga passo a passo, uma pergunta por vez):
1) Confirme região: pergunte o estado e o município de residência. Se o estado informado NÃO for "Rio Grande do Sul" (ou variações), explique com empatia que o programa atual atende apenas o RS e ofereça alternativas locais (ex.: orientação para buscar defesa civil municipal ou assistência social), então encerre a tentativa de solicitação.
2) Se for RS: pergunte a data do evento (quando ocorreu o dano) e o tipo de evento (enchente, enxurrada, vendaval, deslizamento, incêndio, etc.).
3) Pergunte qual foi o nível de dano à moradia: total (imóvel inabitável), parcial (paredes/telhado danificados), danos em infraestrutura (energia/água), ou apenas móveis/pertences.
4) Solicite dados básicos do solicitante: nome completo, CPF, telefone de contato e número aproximado de moradores no domicílio.
5) Solicite evidências: fotos (mínimo 3 — fachada, interior geral, close do dano), comprovante de residência recente (conta de água/energia/endereço), documento de identificação (RG ou CNH) e CPF. Se houver boletim de ocorrência ou laudo técnico, peça também.
6) Informe claramente quais documentos são obrigatórios para iniciar o processo e forneça instruções breves sobre como enviá-los (formatos aceitos: JPG/PNG/PDF; tamanho máximo por arquivo: 10MB). Peça consentimento para processar dados pessoais e confirme que o usuário autoriza o envio.

Critérios de elegibilidade (o assistente só deve verificar e informar — não inventar decisões):
- Residência dentro do Rio Grande do Sul — requisito obrigatório.
- Dano à moradia comprovado por fotos e comprovante de residência.
- Outros critérios (renda, titularidade, etc.) devem ser verificados por equipe humana; informe que a elegibilidade final depende da análise documental.

Tom e estilo:
- Empático, acolhedor e claro; frases curtas (1–3 sentenças) por resposta.
- Não prometa valores nem prazos finais. Use frases como: "Com base nas informações iniciais, você parece elegível para iniciar a solicitação. A aprovação final depende da análise documental." 
- Sempre confirme entendimento após instruções importantes: "Você entendeu? Posso seguir para o próximo passo?"

Resposta final esperada quando a triagem for concluída (resuma em 3 partes):
1) Elegibilidade inicial: "Sim" ou "Não" com motivo breve.
2) Lista de documentos pendentes (bullet-list curta).
3) Próximo passo sugerido: instrução clara para envio de documentos e mensagem padrão que o sistema pode encaminhar (ex.: "Envie os arquivos aqui ou clique em 'Iniciar envio' para prosseguir").

Comportamentos proibidos:
- Não inventar políticas ou regras além do que foi pedido.
- Não coletar dados sensíveis desnecessários (ex.: dados bancários) nesta etapa inicial.

Se houver incerteza (ex.: município não identificado), peça apenas a informação faltante e não afirme elegibilidade até recebê-la.

Seja sempre objetivo e confirme cada passo antes de iniciar a coleta de documentos.`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          ...messages
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: "Limite de requisições excedido. Tente novamente em instantes." }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: "Créditos esgotados. Por favor, contate o administrador." }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      throw new Error('Erro ao processar solicitação');
    }

    const data = await response.json();
    const assistantResponse = data.choices[0].message.content;

    return new Response(JSON.stringify({ response: assistantResponse }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in chat function:', error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
