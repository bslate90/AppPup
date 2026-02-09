-- =====================================================
-- FIX: Infinite Recursion in household_members RLS
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Create a SECURITY DEFINER function to check household ownership
-- This bypasses RLS to prevent infinite recursion
CREATE OR REPLACE FUNCTION public.is_household_owner(p_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.households 
        WHERE id = p_household_id AND owner_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 2: Create a SECURITY DEFINER function to check if user is admin/owner member
CREATE OR REPLACE FUNCTION public.is_household_admin(p_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.household_members 
        WHERE household_id = p_household_id 
        AND user_id = auth.uid() 
        AND role IN ('owner', 'admin')
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 3: Create a function to check if user is a member of a household
CREATE OR REPLACE FUNCTION public.is_household_member(p_household_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.household_members 
        WHERE household_id = p_household_id 
        AND user_id = auth.uid()
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Step 4: Drop existing problematic policies
DROP POLICY IF EXISTS "Users can view members of their households" ON public.household_members;
DROP POLICY IF EXISTS "Admins can add members" ON public.household_members;
DROP POLICY IF EXISTS "Admins can manage members" ON public.household_members;
DROP POLICY IF EXISTS "Admins can remove members" ON public.household_members;

-- Step 5: Recreate policies using the helper functions (no recursion!)

-- SELECT: Users can view members if they're in the same household
CREATE POLICY "Users can view members of their households"
ON public.household_members FOR SELECT
USING (
    public.is_household_member(household_id)
    OR public.is_household_owner(household_id)
);

-- INSERT: Allow if user is household owner, is an admin, or is adding themselves
CREATE POLICY "Users can add members"
ON public.household_members FOR INSERT
WITH CHECK (
    public.is_household_owner(household_id)
    OR public.is_household_admin(household_id)
    OR user_id = auth.uid()  -- Allow users to add themselves (joining via invite code)
);

-- UPDATE: Only owners and admins can update member roles
CREATE POLICY "Admins can manage members"
ON public.household_members FOR UPDATE
USING (
    public.is_household_owner(household_id)
    OR public.is_household_admin(household_id)
);

-- DELETE: Owners, admins can remove anyone; users can remove themselves
CREATE POLICY "Admins can remove members"
ON public.household_members FOR DELETE
USING (
    public.is_household_owner(household_id)
    OR public.is_household_admin(household_id)
    OR user_id = auth.uid()  -- Users can leave a household
);

-- =====================================================
-- DONE! The infinite recursion is fixed.
-- =====================================================
