-- Add benefit_type column to benefit_requests
ALTER TABLE public.benefit_requests 
ADD COLUMN benefit_type TEXT DEFAULT 'auxilio_reconstrucao';

-- Add document_validation status
ALTER TABLE public.document_analysis
ADD COLUMN is_valid BOOLEAN DEFAULT true;