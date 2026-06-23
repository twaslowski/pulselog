-- Custom SQL migration file, put your code below! --
-- Backfill profiles
INSERT INTO public.profile (id)
SELECT u.id
FROM auth.users u
         LEFT JOIN public.profile p
                   ON p.id = u.id
WHERE p.id IS NULL;

-- Create trigger for future sign-ups
CREATE OR REPLACE FUNCTION public.handle_new_user()
    RETURNS trigger
    LANGUAGE plpgsql
    SECURITY DEFINER
    SET search_path = public
AS $$
BEGIN
    INSERT INTO public.profile (id)
    VALUES (NEW.id)
    ON CONFLICT (id) DO NOTHING;

    RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
EXECUTE FUNCTION public.handle_new_user();