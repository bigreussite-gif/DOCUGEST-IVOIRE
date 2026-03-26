-- Back-office : rôles, audit, analytics publicitaires, profil étendu

-- Rôles : super_admin | admin | manager | operator | user
ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS role VARCHAR(32) NOT NULL DEFAULT 'user';

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS permission_level VARCHAR(20) NOT NULL DEFAULT 'write';
-- read | write | admin

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS gender VARCHAR(20);
-- male | female | other | unknown

ALTER TABLE public.users
  ADD COLUMN IF NOT EXISTS user_typology VARCHAR(64);
-- entrepreneur | pme | auto_entrepreneur | association | other

CREATE INDEX IF NOT EXISTS idx_users_role ON public.users(role);
CREATE INDEX IF NOT EXISTS idx_users_last_login ON public.users(last_login DESC NULLS LAST);

-- Journal d’audit (actions back-office)
CREATE TABLE IF NOT EXISTS public.admin_audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  actor_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  action VARCHAR(64) NOT NULL,
  target_type VARCHAR(32),
  target_id VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  ip VARCHAR(64),
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_audit_created ON public.admin_audit_logs(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_audit_actor ON public.admin_audit_logs(actor_id);

-- Événements publicitaires (vues / clics)
CREATE TABLE IF NOT EXISTS public.ad_analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type VARCHAR(16) NOT NULL,
  zone VARCHAR(64) NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  session_id VARCHAR(64),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_ad_events_created ON public.ad_analytics_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ad_events_zone_type ON public.ad_analytics_events(zone, event_type);
