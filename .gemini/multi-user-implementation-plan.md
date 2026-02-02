# Multi-User & Multi-Pup Implementation Plan

## Overview
Transform AppPup from a single-user, single-dog app into a secure multi-user platform with:
- User authentication via Supabase Auth
- Multi-pup support (one user can manage multiple dogs)
- Row Level Security (RLS) for data isolation
- Family sharing (invite family members to access your pups)
- Trainer Dashboard for multi-pup analytics

---

## Phase 1: Database Schema & RLS

### New Tables

```sql
-- Users table (extends Supabase auth.users)
CREATE TABLE public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    avatar_url TEXT,
    role TEXT DEFAULT 'owner' CHECK (role IN ('owner', 'family', 'trainer', 'viewer')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Households/Families (grouping for shared access)
CREATE TABLE public.households (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    invite_code TEXT UNIQUE DEFAULT encode(gen_random_bytes(6), 'hex'),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Household members (many-to-many)
CREATE TABLE public.household_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    household_id UUID REFERENCES public.households(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member', 'viewer')),
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(household_id, user_id)
);

-- Trainer relationships
CREATE TABLE public.trainer_clients (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trainer_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    client_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    pup_ids UUID[] DEFAULT '{}', -- Specific pups the trainer can access
    access_level TEXT DEFAULT 'read' CHECK (access_level IN ('read', 'read_write')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    UNIQUE(trainer_id, client_user_id)
);
```

### Modified Tables

```sql
-- Update puppy_profiles to include owner and household
ALTER TABLE public.puppy_profiles 
    ADD COLUMN owner_id UUID REFERENCES auth.users(id),
    ADD COLUMN household_id UUID REFERENCES public.households(id);

-- All child tables already have profile_id, so they inherit access via RLS
```

### Row Level Security Policies

```sql
-- Enable RLS on all tables
ALTER TABLE public.puppy_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.food_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.health_schedule ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weight_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.vitals_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.feeding_log ENABLE ROW LEVEL SECURITY;

-- Puppy Profiles: Owner or household member or trainer can access
CREATE POLICY "Users can view their own or household pups"
ON public.puppy_profiles FOR SELECT
USING (
    owner_id = auth.uid()
    OR household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid()
    )
    OR id = ANY(
        SELECT unnest(pup_ids) FROM public.trainer_clients 
        WHERE trainer_id = auth.uid() AND (expires_at IS NULL OR expires_at > NOW())
    )
);

CREATE POLICY "Users can insert their own pups"
ON public.puppy_profiles FOR INSERT
WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners and admins can update pups"
ON public.puppy_profiles FOR UPDATE
USING (
    owner_id = auth.uid()
    OR (household_id IN (
        SELECT household_id FROM public.household_members 
        WHERE user_id = auth.uid() AND role IN ('owner', 'admin')
    ))
);

-- Similar policies for child tables (access via profile_id join)
-- ... (detailed policies for each table)
```

---

## Phase 2: Authentication Components

### Files to Create

1. **`src/contexts/AuthContext.tsx`** - Auth state management
2. **`src/components/auth/LoginPage.tsx`** - Beautiful login screen
3. **`src/components/auth/SignUpPage.tsx`** - Registration
4. **`src/components/auth/ForgotPassword.tsx`** - Password reset
5. **`src/components/auth/AuthGuard.tsx`** - Route protection

### Login Page Design (Premium UI)

- Glassmorphic card design
- Dark mode support
- Social logins (Google, Apple if configured)
- Email/password with magic link option
- Animated dog illustration or logo
- Smooth transitions

---

## Phase 3: Multi-Pup Support

### UI Changes

1. **Pup Selector Component** - Dropdown/carousel to switch between pups
2. **Add New Pup Flow** - Guided setup for additional pups
3. **Pup Grid View** - See all pups at a glance on Dashboard
4. **Quick Switch** - Persistent header showing current pup with switcher

### Data Hook Changes

- `useSupabaseData` → becomes pup-specific
- New `usePups()` hook to list all user's pups
- New `useActivePup()` hook to track selected pup

---

## Phase 4: Family Access

### Features

1. **Generate Invite Code** - Create shareable code
2. **Join Family** - Enter invite code to join household
3. **Manage Members** - View/remove family members
4. **Role Assignment** - Set permissions (admin, member, viewer)

### UI Components

1. **`src/components/family/FamilySettings.tsx`** - Manage household
2. **`src/components/family/InviteModal.tsx`** - Share invite code
3. **`src/components/family/MembersList.tsx`** - Show members with roles

---

## Phase 5: Trainer Dashboard

### Trainer Features

1. **Client Management** - Add/remove training clients
2. **Multi-Pup Analytics** - Aggregated views across all client pups
3. **Training Notes** - Add training logs per pup
4. **Reports** - Generate progress reports

### UI Components

1. **`src/components/trainer/TrainerDashboard.tsx`** - Overview
2. **`src/components/trainer/ClientList.tsx`** - Client management
3. **`src/components/trainer/PupAnalytics.tsx`** - Charts & metrics
4. **`src/components/trainer/TrainingLog.tsx`** - Session notes

### Analytics Features

- Weight trend comparisons
- Vaccine compliance rates
- Feeding consistency
- Vitals tracking over time
- Training milestone progress

---

## Implementation Order

### Step 1: Database Setup (Supabase Console)
1. Create new tables
2. Update existing tables
3. Apply RLS policies
4. Test with Supabase client

### Step 2: Auth Infrastructure
1. Create AuthContext
2. Update supabase client with auth
3. Build LoginPage component
4. Add AuthGuard wrapper

### Step 3: Multi-Pup Support
1. Create usePups hook
2. Add pup selector to header
3. Update useSupabaseData for current pup
4. Add "Add Pup" flow

### Step 4: Family Features
1. Create household management
2. Add invite/join flow
3. Add member management UI

### Step 5: Trainer Dashboard
1. Create trainer role handling
2. Build trainer dashboard
3. Add analytics components
4. Generate reports feature

---

## Migration Strategy

For existing users with data:
1. Create household automatically on first login
2. Link existing pups to user's account
3. Set owner_id on all existing data
4. Prompt for display name if missing

---

## Estimated Effort

| Phase | Complexity | Est. Time |
|-------|------------|-----------|
| Phase 1: Database | Medium | 30 min |
| Phase 2: Auth | High | 2 hours |
| Phase 3: Multi-Pup | Medium | 1.5 hours |
| Phase 4: Family | Medium | 1 hour |
| Phase 5: Trainer | High | 2 hours |

**Total: ~7 hours**

---

## Security Considerations

1. **RLS is mandatory** - All tables must have policies
2. **Never trust client** - Validate all operations server-side
3. **Audit logging** - Consider adding audit trail for sensitive operations
4. **Invite code expiry** - Auto-expire unused invite codes
5. **Trainer access limits** - Time-bound and pup-specific access

