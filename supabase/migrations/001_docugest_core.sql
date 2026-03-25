-- DocuGest Ivoire - Core schema
-- Tables: users, documents

create extension if not exists pgcrypto;

-- =========================
-- USERS
-- =========================
create table if not exists public.users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20) NOT NULL,
  whatsapp VARCHAR(20),
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company_name VARCHAR(255),
  company_logo_url TEXT,
  company_address TEXT,
  company_ncc VARCHAR(50),
  company_rccm VARCHAR(50),
  company_dfe VARCHAR(50),
  company_regime VARCHAR(20) DEFAULT 'informal', -- 'formal' | 'informal'
  created_at TIMESTAMP DEFAULT NOW(),
  last_login TIMESTAMP
);

-- =========================
-- DOCUMENTS
-- =========================
create table if not exists public.documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE,
  type VARCHAR(20) NOT NULL, -- 'invoice' | 'proforma' | 'devis' | 'payslip'
  doc_number VARCHAR(50),
  client_name VARCHAR(255),
  total_amount DECIMAL(15,2),
  currency VARCHAR(5) DEFAULT 'FCFA',
  status VARCHAR(20) DEFAULT 'draft', -- 'draft' | 'sent' | 'paid' | 'cancelled'
  doc_data JSONB NOT NULL,
  pdf_url TEXT,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
create index if not exists idx_documents_user_id on public.documents(user_id);
create index if not exists idx_documents_user_type_created on public.documents(user_id, type, created_at desc);

-- updated_at trigger
create or replace function public.fn_set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists trg_documents_updated_at on public.documents;
create trigger trg_documents_updated_at
before update on public.documents
for each row execute function public.fn_set_updated_at();

