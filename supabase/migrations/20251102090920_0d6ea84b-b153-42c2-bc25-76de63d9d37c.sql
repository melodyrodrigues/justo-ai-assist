-- Add benefit_type column to benefit_requests table
ALTER TABLE public.benefit_requests 
ADD COLUMN IF NOT EXISTS benefit_type TEXT DEFAULT 'auxilio_reconstrucao';