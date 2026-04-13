-- DocuGest Ivoire - Full Schema Migration
-- Unified migration for InsForge / PostgreSQL

CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- =========================
-- USERS
-- =========================
CREATE TABLE IF NOT EXISTS public.users (
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
  role VARCHAR(20) DEFAULT 'user',               -- 'user' | 'admin' | 'super_admin'
  permission_level VARCHAR(20) DEFAULT 'write',   -- 'read' | 'write'
  gender VARCHAR(10),                             -- 'M' | 'F'
  user_typology TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_login TIMESTAMPTZ
);

-- =========================
-- DOCUMENTS
-- =========================
CREATE TABLE IF NOT EXISTS public.documents (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_documents_user_id ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_user_type_created ON public.documents(user_id, type, created_at DESC);

-- =========================
-- BLOG POSTS
-- =========================
CREATE TABLE IF NOT EXISTS public.blog_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT DEFAULT '',
  content TEXT DEFAULT '',
  cover_image_url TEXT DEFAULT '',
  category TEXT DEFAULT 'general',
  author_name TEXT DEFAULT 'DocuGestIvoire',
  published BOOLEAN DEFAULT false,
  published_at TIMESTAMPTZ,
  meta_title TEXT DEFAULT '',
  meta_description TEXT DEFAULT '',
  reading_time_min INTEGER DEFAULT 3,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- ADMIN AUDIT LOGS
-- =========================
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  target_type TEXT,
  target_id TEXT,
  metadata JSONB DEFAULT '{}',
  ip TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- AD ANALYTICS EVENTS
-- =========================
CREATE TABLE IF NOT EXISTS public.ad_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(20) NOT NULL, -- 'view' | 'click'
  zone VARCHAR(64) NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================
-- FUNCTIONS & TRIGGERS
-- =========================
CREATE OR REPLACE FUNCTION public.fn_set_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_documents_updated_at ON public.documents;
CREATE TRIGGER trg_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_blog_posts_updated_at ON public.blog_posts;
CREATE TRIGGER trg_blog_posts_updated_at
BEFORE UPDATE ON public.blog_posts
FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
