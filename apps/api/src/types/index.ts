export interface User {
  id: string;
  firstName: string;
  middleName?: string | null;
  lastName: string;
  email: string;
  role: string;
  classId?: string | null;
}

export interface Class {
  id: string;
  name: string;
  academicYear: string;
  homeroomTeacher?: Teacher;
  homeroomTeacherId?: string;
}

export interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}
