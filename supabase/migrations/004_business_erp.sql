-- DocuGest Ivoire - Business ERP & Hatchery Schema
-- Migration 004 : Contacts, Couvaisons, Products, Sales

-- 1. CONTACTS (Clients & Fournisseurs)
CREATE TABLE IF NOT EXISTS public.contacts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name VARCHAR(255) NOT NULL,
  phone VARCHAR(20),
  whatsapp VARCHAR(20),
  email VARCHAR(255),
  address TEXT,
  type VARCHAR(20) DEFAULT 'client', -- 'client' | 'supplier' | 'hybrid'
  balance DECIMAL(15,2) DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Backfill from legacy clients table if exists
DO $$
BEGIN
  IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'clients') THEN
    INSERT INTO public.contacts (id, full_name, phone, created_at)
    SELECT id, nom, telephone, created_at FROM public.clients
    ON CONFLICT (id) DO NOTHING;
  END IF;
END $$;

-- 2. COUVAISONS (Updated Hatchery Schema)
-- We rename the old table if it exists to avoid conflicts or just add columns.
-- Here we create it if not exists, or we could use ALTER TABLE.
-- Given the significant change in logic, we'll ensure these columns exist.

CREATE TABLE IF NOT EXISTS public.couvaisons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id) ON DELETE SET NULL,
  egg_type VARCHAR(64) NOT NULL,
  quantity_initial INTEGER NOT NULL,
  total_price DECIMAL(15,2) DEFAULT 0,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'ongoing', -- 'ongoing', 'mirage_done', 'completed', 'cancelled'
  date_start TIMESTAMPTZ DEFAULT NOW(),
  date_mirage TIMESTAMPTZ,
  date_eclosion TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. MIRAGE & ECLOSION RESULTS
CREATE TABLE IF NOT EXISTS public.mirage_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couvaison_id UUID REFERENCES public.couvaisons(id) ON DELETE CASCADE,
  quantity_removed INTEGER NOT NULL,
  quantity_remaining INTEGER NOT NULL,
  checked_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.eclosion_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  couvaison_id UUID REFERENCES public.couvaisons(id) ON DELETE CASCADE,
  poussins_vif INTEGER NOT NULL,
  poussins_mort INTEGER NOT NULL,
  oeufs_non_eclos INTEGER NOT NULL,
  taux_reussite DECIMAL(5,2),
  checked_by UUID REFERENCES public.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PRODUCTS & SALES
CREATE TABLE IF NOT EXISTS public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  category VARCHAR(64),
  price DECIMAL(15,2) NOT NULL,
  stock INTEGER DEFAULT 0,
  stock_alert INTEGER DEFAULT 5,
  unit VARCHAR(20) DEFAULT 'unité',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sales (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  contact_id UUID REFERENCES public.contacts(id),
  total_amount DECIMAL(15,2) NOT NULL,
  amount_paid DECIMAL(15,2) DEFAULT 0,
  status VARCHAR(20) DEFAULT 'paid', -- 'paid', 'partial', 'pending'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.sale_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  sale_id UUID REFERENCES public.sales(id) ON DELETE CASCADE,
  product_id UUID REFERENCES public.products(id),
  quantity INTEGER NOT NULL,
  unit_price DECIMAL(15,2) NOT NULL
);

-- 5. UPDATED AT TRIGGERS
DROP TRIGGER IF EXISTS trg_contacts_updated_at ON public.contacts;
CREATE TRIGGER trg_contacts_updated_at BEFORE UPDATE ON public.contacts FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_couvaisons_updated_at ON public.couvaisons;
CREATE TRIGGER trg_couvaisons_updated_at BEFORE UPDATE ON public.couvaisons FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();

DROP TRIGGER IF EXISTS trg_products_updated_at ON public.products;
CREATE TRIGGER trg_products_updated_at BEFORE UPDATE ON public.products FOR EACH ROW EXECUTE FUNCTION public.fn_set_updated_at();
