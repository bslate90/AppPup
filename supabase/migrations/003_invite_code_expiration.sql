-- =====================================================
-- SECURITY FIX: Add Invite Code Expiration
-- Run this in Supabase SQL Editor
-- =====================================================

-- Step 1: Add invite_expires_at column to households
ALTER TABLE public.households 
ADD COLUMN IF NOT EXISTS invite_expires_at TIMESTAMPTZ;

-- Step 2: Set default expiration to 30 days from creation for new households
-- Update existing households to expire in 30 days from now
UPDATE public.households 
SET invite_expires_at = NOW() + INTERVAL '30 days'
WHERE invite_expires_at IS NULL;

-- Step 3: Create function to regenerate invite code with new expiration
CREATE OR REPLACE FUNCTION public.regenerate_invite_code(p_household_id UUID)
RETURNS TABLE(invite_code TEXT, invite_expires_at TIMESTAMPTZ) AS $$
DECLARE
    new_code TEXT;
    new_expiry TIMESTAMPTZ;
BEGIN
    -- Only allow owner to regenerate
    IF NOT EXISTS (
        SELECT 1 FROM public.households 
        WHERE id = p_household_id AND owner_id = auth.uid()
    ) THEN
        RAISE EXCEPTION 'Only household owner can regenerate invite code';
    END IF;

    new_code := encode(gen_random_bytes(8), 'hex'); -- 16 chars, stronger
    new_expiry := NOW() + INTERVAL '30 days';

    UPDATE public.households 
    SET invite_code = new_code, 
        invite_expires_at = new_expiry
    WHERE id = p_household_id;

    RETURN QUERY SELECT new_code, new_expiry;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 4: Update join household to check expiration
-- Note: Client code should also check invite_expires_at before joining

-- =====================================================
-- IMPORTANT: Update client code to:
-- 1. Check invite_expires_at before allowing join
-- 2. Show "Invite expired" error if code is expired
-- 3. Add "Regenerate Code" button for household owners
-- =====================================================
