-- Create subjects table
CREATE TABLE IF NOT EXISTS subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create classes table
CREATE TABLE IF NOT EXISTS classes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  grade_level INTEGER NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teachers table (extends auth.users)
CREATE TABLE IF NOT EXISTS teachers (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create teacher_subjects junction table (many-to-many)
CREATE TABLE IF NOT EXISTS teacher_subjects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(teacher_id, subject_id)
);

-- Create students table
CREATE TABLE IF NOT EXISTS students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  student_number TEXT NOT NULL UNIQUE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create attendance table
CREATE TABLE IF NOT EXISTS attendance (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('hadir', 'tidak_hadir', 'izin', 'sakit')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, date)
);

-- Create knowledge_grades table (Pengetahuan)
CREATE TABLE IF NOT EXISTS knowledge_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  uh1 DECIMAL(5,2),
  uh2 DECIMAL(5,2),
  uh3 DECIMAL(5,2),
  uts DECIMAL(5,2),
  uas DECIMAL(5,2),
  average DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN uh1 IS NOT NULL AND uh2 IS NOT NULL AND uh3 IS NOT NULL AND uts IS NOT NULL AND uas IS NOT NULL
      THEN (uh1 + uh2 + uh3 + uts + uas) / 5
      ELSE NULL
    END
  ) STORED,
  predicate TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (uh1 + uh2 + uh3 + uts + uas) / 5 >= 90 THEN 'A'
      WHEN (uh1 + uh2 + uh3 + uts + uas) / 5 >= 80 THEN 'B'
      WHEN (uh1 + uh2 + uh3 + uts + uas) / 5 >= 70 THEN 'C'
      WHEN (uh1 + uh2 + uh3 + uts + uas) / 5 >= 60 THEN 'D'
      ELSE 'E'
    END
  ) STORED,
  semester INTEGER NOT NULL DEFAULT 1,
  academic_year TEXT NOT NULL DEFAULT '2024/2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, semester, academic_year)
);

-- Create practice_grades table (Praktek)
CREATE TABLE IF NOT EXISTS practice_grades (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID NOT NULL REFERENCES students(id) ON DELETE CASCADE,
  teacher_id UUID NOT NULL REFERENCES teachers(id) ON DELETE CASCADE,
  subject_id UUID NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
  class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
  practice1 DECIMAL(5,2),
  practice2 DECIMAL(5,2),
  average DECIMAL(5,2) GENERATED ALWAYS AS (
    CASE 
      WHEN practice1 IS NOT NULL AND practice2 IS NOT NULL
      THEN (practice1 + practice2) / 2
      ELSE NULL
    END
  ) STORED,
  predicate TEXT GENERATED ALWAYS AS (
    CASE 
      WHEN (practice1 + practice2) / 2 >= 90 THEN 'A'
      WHEN (practice1 + practice2) / 2 >= 80 THEN 'B'
      WHEN (practice1 + practice2) / 2 >= 70 THEN 'C'
      WHEN (practice1 + practice2) / 2 >= 60 THEN 'D'
      ELSE 'E'
    END
  ) STORED,
  semester INTEGER NOT NULL DEFAULT 1,
  academic_year TEXT NOT NULL DEFAULT '2024/2025',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(student_id, subject_id, semester, academic_year)
);

-- Enable Row Level Security
ALTER TABLE teachers ENABLE ROW LEVEL SECURITY;
ALTER TABLE teacher_subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE students ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_grades ENABLE ROW LEVEL SECURITY;
ALTER TABLE practice_grades ENABLE ROW LEVEL SECURITY;

-- RLS Policies for teachers table
CREATE POLICY "Teachers can view their own data" ON teachers FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Teachers can update their own data" ON teachers FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Teachers can insert their own data" ON teachers FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for teacher_subjects table
CREATE POLICY "Teachers can view their own subjects" ON teacher_subjects FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can manage their own subjects" ON teacher_subjects FOR ALL USING (teacher_id = auth.uid());

-- RLS Policies for students table (teachers can view all students)
CREATE POLICY "Teachers can view all students" ON students FOR SELECT TO authenticated USING (true);
CREATE POLICY "Teachers can manage students" ON students FOR ALL TO authenticated USING (true);

-- RLS Policies for attendance table
CREATE POLICY "Teachers can view attendance for their subjects" ON attendance FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can manage attendance for their subjects" ON attendance FOR ALL USING (teacher_id = auth.uid());

-- RLS Policies for knowledge_grades table
CREATE POLICY "Teachers can view grades for their subjects" ON knowledge_grades FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can manage grades for their subjects" ON knowledge_grades FOR ALL USING (teacher_id = auth.uid());

-- RLS Policies for practice_grades table
CREATE POLICY "Teachers can view practice grades for their subjects" ON practice_grades FOR SELECT USING (teacher_id = auth.uid());
CREATE POLICY "Teachers can manage practice grades for their subjects" ON practice_grades FOR ALL USING (teacher_id = auth.uid());

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_attendance_date ON attendance(date);
CREATE INDEX IF NOT EXISTS idx_attendance_student_subject ON attendance(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_knowledge_grades_student_subject ON knowledge_grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_practice_grades_student_subject ON practice_grades(student_id, subject_id);
CREATE INDEX IF NOT EXISTS idx_students_class ON students(class_id);
CREATE INDEX IF NOT EXISTS idx_teacher_subjects_teacher ON teacher_subjects(teacher_id);
