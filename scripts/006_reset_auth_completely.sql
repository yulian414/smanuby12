-- Script untuk reset complete auth jika diperlukan
-- HATI-HATI: Script ini akan menghapus SEMUA user dan data terkait

-- Hapus semua data dari tabel yang terkait dengan teachers
DELETE FROM public.teacher_subjects;
DELETE FROM public.attendance;
DELETE FROM public.knowledge_grades;
DELETE FROM public.practice_grades;
DELETE FROM public.teachers;

-- Hapus semua user dari auth.users
-- HATI-HATI: Ini akan menghapus semua user yang terdaftar
DELETE FROM auth.users;

-- Reset sequences jika ada
-- ALTER SEQUENCE jika diperlukan

-- Pesan konfirmasi
DO $$
BEGIN
    RAISE NOTICE 'All auth users and related data have been deleted. You can now register fresh users.';
END;
$$;
