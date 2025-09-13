-- Insert subjects
INSERT INTO subjects (name) VALUES 
  ('Teknologi Informasi'),
  ('Alqur''an'),
  ('Aqidah Akhlak'),
  ('Fiqih'),
  ('Bahasa Arab'),
  ('Kimia'),
  ('Sejarah'),
  ('Bahasa Inggris'),
  ('Biologi')
ON CONFLICT (name) DO NOTHING;

-- Insert classes
INSERT INTO classes (name, grade_level) VALUES 
  ('X.1', 10),
  ('X.2', 10),
  ('X.3', 10),
  ('XI.1', 11),
  ('XI.2', 11),
  ('XI.3', 11),
  ('XII.1', 12),
  ('XII.2', 12),
  ('XII.3', 12)
ON CONFLICT (name) DO NOTHING;

-- Insert sample students for each class
DO $$
DECLARE
    class_record RECORD;
    student_counter INTEGER;
BEGIN
    FOR class_record IN SELECT id, name FROM classes LOOP
        FOR student_counter IN 1..30 LOOP
            INSERT INTO students (name, student_number, class_id) 
            VALUES (
                'Siswa ' || student_counter || ' ' || class_record.name,
                class_record.name || '-' || LPAD(student_counter::TEXT, 3, '0'),
                class_record.id
            );
        END LOOP;
    END LOOP;
END $$;
