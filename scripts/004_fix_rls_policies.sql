-- Fix RLS policies to allow registration process

-- Drop existing policies for teacher_subjects
DROP POLICY IF EXISTS "Teachers can view their own subjects" ON teacher_subjects;
DROP POLICY IF EXISTS "Teachers can manage their own subjects" ON teacher_subjects;

-- Create more permissive policies for teacher_subjects during registration
CREATE POLICY "Teachers can view their own subjects" ON teacher_subjects 
  FOR SELECT USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can insert their own subjects" ON teacher_subjects 
  FOR INSERT WITH CHECK (teacher_id = auth.uid());

CREATE POLICY "Teachers can update their own subjects" ON teacher_subjects 
  FOR UPDATE USING (teacher_id = auth.uid());

CREATE POLICY "Teachers can delete their own subjects" ON teacher_subjects 
  FOR DELETE USING (teacher_id = auth.uid());

-- Update teachers table policies to allow upsert during registration
DROP POLICY IF EXISTS "Teachers can insert their own data" ON teachers;
CREATE POLICY "Teachers can insert their own data" ON teachers 
  FOR INSERT WITH CHECK (auth.uid() = id);

-- Add upsert capability for teachers
CREATE POLICY "Teachers can upsert their own data" ON teachers 
  FOR UPDATE USING (auth.uid() = id);
