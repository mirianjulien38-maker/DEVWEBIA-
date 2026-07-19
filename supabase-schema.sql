-- Supabase Schema for DEVWEB IA Multi-Tenant SaaS Websites
-- This can be executed in the Supabase SQL editor to bootstrap the database.

-- Create websites table
CREATE TABLE IF NOT EXISTS public.websites (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id VARCHAR(255) NOT NULL,
    user_email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    prompt TEXT NOT NULL,
    code TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.websites ENABLE ROW LEVEL SECURITY;

-- Create policies so that users can only see their own websites
CREATE POLICY "Users can view their own websites" 
    ON public.websites 
    FOR SELECT 
    USING (auth.uid()::text = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can insert their own websites" 
    ON public.websites 
    FOR INSERT 
    WITH CHECK (auth.uid()::text = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can update their own websites" 
    ON public.websites 
    FOR UPDATE 
    USING (auth.uid()::text = user_id OR user_email = auth.jwt() ->> 'email');

CREATE POLICY "Users can delete their own websites" 
    ON public.websites 
    FOR DELETE 
    USING (auth.uid()::text = user_id OR user_email = auth.jwt() ->> 'email');
