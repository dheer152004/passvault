-- Function to create default categories for new users
-- CREATE OR REPLACE FUNCTION public.create_default_categories()
-- RETURNS TRIGGER
-- LANGUAGE plpgsql
-- SECURITY DEFINER
-- SET search_path = public
-- AS $$
-- BEGIN
--   -- Insert default categories
--   INSERT INTO public.categories (user_id, name, icon, color)
--   VALUES 
--     (NEW.id, 'Social Media', '👥', '#3b82f6'),
--     (NEW.id, 'Banking', '🏦', '#10b981'),
--     (NEW.id, 'Email', '📧', '#ef4444'),
--     (NEW.id, 'Work', '💼', '#8b5cf6'),
--     (NEW.id, 'Shopping', '🛍️', '#f59e0b')
--   ON CONFLICT DO NOTHING;
  
--   RETURN NEW;
-- END;
-- $$;

-- Trigger to auto-create categories when a profile is created
-- DROP TRIGGER IF EXISTS on_profile_created ON public.profiles;

-- CREATE TRIGGER on_profile_created
--   AFTER INSERT ON public.profiles
--   FOR EACH ROW
--   EXECUTE FUNCTION public.create_default_categories();

-- Users will now create their own custom categories from scratch
-- The trigger that auto-created categories on profile creation has been removed
