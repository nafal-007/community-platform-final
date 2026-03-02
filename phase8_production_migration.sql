-- Phase 8 Production Migration Script
-- Run this directly in the Supabase SQL Editor
-- This adds the necessary columns for Community Avatars and Username cooldowns without dropping data.

-- 1. Add avatarUrl to Community (if it doesn't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='Community' AND column_name='avatarUrl') THEN
    ALTER TABLE "Community" ADD COLUMN "avatarUrl" TEXT;
  END IF;
END $$;

-- 2. Add lastUsernameChange to User (if it doesn't exist)
DO $$ 
BEGIN 
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema='public' AND table_name='User' AND column_name='lastUsernameChange') THEN
    ALTER TABLE "User" ADD COLUMN "lastUsernameChange" TIMESTAMP(3);
  END IF;
END $$;
