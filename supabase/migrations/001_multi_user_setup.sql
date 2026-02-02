-- =====================================================
-- AppPup Multi-User & Multi-Pup Database Migration
-- Run this in Supabase SQL Editor
-- 
-- IMPORTANT: Run this script in its entirety in one go.
-- It creates tables first, then adds policies after.
-- =====================================================

-- Enable UUID extension if not already
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- STEP 1: CREATE ALL TABLES FIRST (NO POLICIES YET)
-- =====================================================

-- 1. USER PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'family', 'trainer', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. HOUSEHOLDS TABLE
CREATE TABLE IF NOT EXISTS public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. HOUSEHOLD MEMBERS TABLE
CREATE TABLE IF NOT EXISTS public.household_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- 4. TRAINER CLIENTS TABLE
CREATE TABLE IF NOT EXISTS public.trainer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pup_ids UUID[] DEFAULT '{}',
    access_level TEXT DEFAULT 'read' CHECK (access_level IN ('read', 'read_write')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(trainer_id, client_user_id)
);

-- =====================================================
-- STEP 2: UPDATE EXISTING puppy_profiles TABLE
-- =====================================================

-- Add columns if they don't exist
DO $$ 
BEGIN
    -- Add owner_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'puppy_profiles' AND column_name = 'owner_id'
    ) THEN
        ALTER TABLE public.puppy_profiles 
        ADD COLUMN owner_id UUID REFERENCES auth.users(id);
    END IF;

    -- Add household_id column
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = 'puppy_profiles' AND column_name = 'household_id'
    ) THEN
        ALTER TABLE public.puppy_profiles 
        ADD COLUMN household_id UUID REFERENCES public.households(id);
    END IF;
END $$;

-- =====================================================
-- STEP 3: CREATE INDEXES FOR PERFORMANCE
-- =====================================================
CREATE INDEX IF NOT EXISTS idx_puppy_profiles_owner ON public.puppy_profiles(owner_id);
CREATE INDEX IF NOT EXISTS idx_puppy_profiles_household ON public.puppy_profiles(household_id);
CREATE INDEX IF NOT EXISTS idx_household_members_user ON public.household_members(user_id);
CREATE INDEX IF NOT EXISTS idx_household_members_household ON public.household_members(household_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_trainer ON public.trainer_clients(trainer_id);
CREATE INDEX IF NOT EXISTS idx_trainer_clients_client ON public.trainer_clients(client_user_id);

-- =====================================================
-- STEP 4: ENABLE RLS ON ALL TABLES
-- =====================================================
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trainer_clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.puppy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_log ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- STEP 5: CREATE RLS POLICIES (ALL TABLES EXIST NOW)
-- =====================================================

-- ============ USER PROFILES POLICIES ============
DROP POLICY IF EXISTS "Users can view their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.user_profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.user_profiles;

CREATE POLICY "Users can view their own profile"
ON public.user_profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can insert their own profile"
ON public.user_profiles FOR INSERT
WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
ON public.user_profiles FOR UPDATE
USING (auth.uid() = id);

-- ============ HOUSEHOLDS POLICIES ============
DROP POLICY IF EXISTS "Users can view their households" ON public.households;
DROP POLICY IF EXISTS "Users can create households" ON public.households;
DROP POLICY IF EXISTS "Owners can update households" ON public.households;
DROP POLICY IF EXISTS "Owners can delete households" ON public.households;

CREATE POLICY "Users can view their households"
ON public.households FOR SELECT
USING (
    owner_id = auth.uid()
    OR id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Users can create households"
ON public.households FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update households"
ON public.households FOR UPDATE
USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete households"
ON public.households FOR DELETE
USING (owner_id = auth.uid());

-- ============ HOUSEHOLD MEMBERS POLICIES ============
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.household_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.household_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.household_members;

CREATE POLICY "Users can view members of their households"
ON public.household_members FOR SELECT
USING (
    household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid()
    )
);

CREATE POLICY "Admins can add members"
ON public.household_members FOR INSERT
WITH CHECK (
    (SELECT owner_id FROM public.households WHERE id = household_id) = auth.uid()
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR user_id = auth.uid()
);

CREATE POLICY "Admins can manage members"
ON public.household_members FOR UPDATE
USING (
    (SELECT owner_id FROM public.households WHERE id = household_id) = auth.uid()
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
);

CREATE POLICY "Admins can remove members"
ON public.household_members FOR DELETE
USING (
    (SELECT owner_id FROM public.households WHERE id = household_id) = auth.uid()
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    )
    OR user_id = auth.uid()
);

-- ============ TRAINER CLIENTS POLICIES ============
DROP POLICY IF EXISTS "Trainers can view their clients" ON public.trainer_clients;
DROP POLICY IF EXISTS "Clients can add trainers" ON public.trainer_clients;
DROP POLICY IF EXISTS "Trainer or client can update" ON public.trainer_clients;
DROP POLICY IF EXISTS "Trainer or client can remove" ON public.trainer_clients;

CREATE POLICY "Trainers can view their clients"
ON public.trainer_clients FOR SELECT
USING (trainer_id = auth.uid() OR client_user_id = auth.uid());

CREATE POLICY "Clients can add trainers"
ON public.trainer_clients FOR INSERT
WITH CHECK (client_user_id = auth.uid());

CREATE POLICY "Trainer or client can update"
ON public.trainer_clients FOR UPDATE
USING (trainer_id = auth.uid() OR client_user_id = auth.uid());

CREATE POLICY "Trainer or client can remove"
ON public.trainer_clients FOR DELETE
USING (trainer_id = auth.uid() OR client_user_id = auth.uid());

-- ============ PUPPY PROFILES POLICIES ============
DROP POLICY IF EXISTS "Users can view their pups" ON public.puppy_profiles;
DROP POLICY IF EXISTS "Users can insert their own pups" ON public.puppy_profiles;
DROP POLICY IF EXISTS "Users can update their pups" ON public.puppy_profiles;
DROP POLICY IF EXISTS "Users can delete their pups" ON public.puppy_profiles;

CREATE POLICY "Users can view their pups"
ON public.puppy_profiles FOR SELECT
USING (
    owner_id = auth.uid()
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid()
    )
    OR id = ANY(
        SELECT unnest(pup_ids) FROM public.trainer_clients 
        WHERE trainer_id = auth.uid() 
        AND (expires_at IS NULL OR expires_at > NOW())
    )
    OR owner_id IS NULL
);

CREATE POLICY "Users can insert their own pups"
ON public.puppy_profiles FOR INSERT
WITH CHECK (owner_id = auth.uid() OR owner_id IS NULL);

CREATE POLICY "Users can update their pups"
ON public.puppy_profiles FOR UPDATE
USING (
    owner_id = auth.uid()
    OR owner_id IS NULL
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin', 'member')
    )
);

CREATE POLICY "Users can delete their pups"
ON public.puppy_profiles FOR DELETE
USING (owner_id = auth.uid() OR owner_id IS NULL);

-- ============ CHILD TABLES POLICIES ============
-- All use profile_id, so access is based on puppy_profiles

-- FOOD_SETTINGS
DROP POLICY IF EXISTS "Users can access food settings" ON public.food_settings;
CREATE POLICY "Users can access food settings"
ON public.food_settings FOR ALL
USING (
    profile_id IN (
        SELECT id FROM public.puppy_profiles 
        WHERE owner_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM public.household_members 
            WHERE user_id = auth.uid()
        )
        OR owner_id IS NULL
    )
);

-- HEALTH_SCHEDULE
DROP POLICY IF EXISTS "Users can access health schedule" ON public.health_schedule;
CREATE POLICY "Users can access health schedule"
ON public.health_schedule FOR ALL
USING (
    profile_id IN (
        SELECT id FROM public.puppy_profiles 
        WHERE owner_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM public.household_members 
            WHERE user_id = auth.uid()
        )
        OR owner_id IS NULL
    )
);

-- WEIGHT_LOG
DROP POLICY IF EXISTS "Users can access weight log" ON public.weight_log;
CREATE POLICY "Users can access weight log"
ON public.weight_log FOR ALL
USING (
    profile_id IN (
        SELECT id FROM public.puppy_profiles 
        WHERE owner_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM public.household_members 
            WHERE user_id = auth.uid()
        )
        OR owner_id IS NULL
    )
);

-- VITALS_LOG
DROP POLICY IF EXISTS "Users can access vitals log" ON public.vitals_log;
CREATE POLICY "Users can access vitals log"
ON public.vitals_log FOR ALL
USING (
    profile_id IN (
        SELECT id FROM public.puppy_profiles 
        WHERE owner_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM public.household_members 
            WHERE user_id = auth.uid()
        )
        OR owner_id IS NULL
    )
);

-- FEEDING_LOG
DROP POLICY IF EXISTS "Users can access feeding log" ON public.feeding_log;
CREATE POLICY "Users can access feeding log"
ON public.feeding_log FOR ALL
USING (
    profile_id IN (
        SELECT id FROM public.puppy_profiles 
        WHERE owner_id = auth.uid()
        OR household_id IN (
            SELECT household_id FROM public.household_members 
            WHERE user_id = auth.uid()
        )
        OR owner_id IS NULL
    )
);

-- =====================================================
-- STEP 6: AUTO-CREATE USER PROFILE TRIGGER
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_profiles (id, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(
            NEW.raw_user_meta_data->>'display_name', 
            NEW.raw_user_meta_data->>'full_name', 
            split_part(NEW.email, '@', 1)
        ),
        'owner'
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- MIGRATION COMPLETE!
-- =====================================================

-- Optional: If you have existing data with no owner, 
-- assign it after you log in by running:
-- UPDATE public.puppy_profiles SET owner_id = 'YOUR_USER_UUID' WHERE owner_id IS NULL;
