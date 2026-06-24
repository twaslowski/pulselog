-- Function to insert default tracking entries for a new user
CREATE OR REPLACE FUNCTION insert_default_tracking_for_user()
    RETURNS TRIGGER AS $$
BEGIN
    -- Insert default tracking entries for the new user
    INSERT INTO public.metric_tracking (user_id, metric_id, baseline, tracked_at)
    SELECT
        NEW.id,
        metric_id,
        baseline,
        NOW()
    FROM public.tracking_default;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger on auth.users table to automatically set up tracking for new users
CREATE TRIGGER setup_default_tracking_on_user_creation
    AFTER INSERT ON profile
    FOR EACH ROW
EXECUTE FUNCTION insert_default_tracking_for_user();
