-- Script untuk membersihkan user yang terdaftar di Auth tapi tidak ada di tabel teachers
-- Dan membuat profil guru untuk user yang sudah ada di Auth

-- Pertama, buat function untuk membersihkan user orphaned
CREATE OR REPLACE FUNCTION cleanup_orphaned_auth_users()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user RECORD;
BEGIN
    -- Loop through all auth users yang tidak ada di tabel teachers
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.teachers t ON t.id = au.id
        WHERE t.id IS NULL
    LOOP
        -- Hapus user dari auth.users
        DELETE FROM auth.users WHERE id = auth_user.id;
        
        RAISE NOTICE 'Deleted orphaned user: % (%)', auth_user.email, auth_user.id;
    END LOOP;
END;
$$;

-- Jalankan function untuk membersihkan user orphaned
SELECT cleanup_orphaned_auth_users();

-- Hapus function setelah digunakan
DROP FUNCTION cleanup_orphaned_auth_users();

-- Buat function untuk sinkronisasi user Auth dengan tabel teachers
CREATE OR REPLACE FUNCTION sync_auth_users_to_teachers()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    auth_user RECORD;
    user_name TEXT;
BEGIN
    -- Loop through all auth users yang belum ada di tabel teachers
    FOR auth_user IN 
        SELECT au.id, au.email, au.raw_user_meta_data
        FROM auth.users au
        LEFT JOIN public.teachers t ON t.id = au.id
        WHERE t.id IS NULL
    LOOP
        -- Extract name from metadata atau gunakan email sebagai fallback
        user_name := COALESCE(
            auth_user.raw_user_meta_data->>'name',
            auth_user.raw_user_meta_data->>'full_name',
            split_part(auth_user.email, '@', 1)
        );
        
        -- Insert ke tabel teachers
        INSERT INTO public.teachers (id, name, email, created_at)
        VALUES (
            auth_user.id,
            user_name,
            auth_user.email,
            NOW()
        );
        
        RAISE NOTICE 'Created teacher profile for: % (%)', auth_user.email, auth_user.id;
    END LOOP;
END;
$$;

-- Uncomment baris berikut jika ingin sinkronisasi daripada hapus
-- SELECT sync_auth_users_to_teachers();

-- Hapus function setelah digunakan
-- DROP FUNCTION sync_auth_users_to_teachers();
