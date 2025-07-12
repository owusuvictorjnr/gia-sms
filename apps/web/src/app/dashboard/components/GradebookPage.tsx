import { useState, useEffect, FormEvent } from "react";

// Define the shapes of our data, matching the backend entities
interface Student {
  id: string;
  firstName: string;
  middleName?: string; // middleName is now an optional property
  lastName: string;
}

interface GradeEntry {
  id: string;
  assessment: string;
  score: string;
  subject: string;
  date: string;
  student?: Student; // Student might not be included in all responses
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function GradebookPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentGrades, setRecentGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [assessment, setAssessment] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");

  // Fetch initial data (students and grades for the first student)
  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch the list of all students
        const studentsResponse = await fetch(
          "http://localhost:3001/users/students",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!studentsResponse.ok) throw new Error("Failed to fetch students.");

        const studentsData: Student[] = await studentsResponse.json();
        setStudents(studentsData);

        // If there are students, select the first one and fetch their grades
        if (studentsData.length > 0) {
          const firstStudentId = studentsData[0].id;
          setSelectedStudent(firstStudentId);
          fetchGradesForStudent(firstStudentId, token);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []); // Empty dependency array means this runs once on mount

  // Function to fetch grades for a specific student
  const fetchGradesForStudent = async (studentId: string, token: string) => {
    try {
      const gradesResponse = await fetch(
        `http://localhost:3001/grades/student/${studentId}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!gradesResponse.ok) throw new Error("Failed to fetch grades.");

      const gradesData: GradeEntry[] = await gradesResponse.json();
      setRecentGrades(gradesData);
    } catch (err: any) {
      setError(err.message);
    }
  };

  // Handle student selection change
  useEffect(() => {
    const token = getAuthToken();
    if (selectedStudent && token) {
      fetchGradesForStudent(selectedStudent, token);
    }
  }, [selectedStudent]);

  const handleSubmitGrade = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!selectedStudent || !assessment || !subject || !score || !token) {
      alert("Please fill out all fields.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/grades", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: selectedStudent,
          assessment,
          subject,
          score,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save grade.");
      }

      // Refresh the grades list to show the new entry
      fetchGradesForStudent(selectedStudent, token);

      // Reset form
      setAssessment("");
      setSubject("");
      setScore("");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStudentFullName = (student: Student | undefined) => {
    if (!student) return "";
    return [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ");
  };

  if (isLoading) {
    return <div>Loading Gradebook...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Enter New Grade
        </h2>
        <form
          onSubmit={handleSubmitGrade}
          className="grid grid-cols-1 gap-6 md:grid-cols-4"
        >
          <div className="md:col-span-2">
            <label
              htmlFor="student"
              className="block text-sm font-medium text-gray-700"
            >
              Student
            </label>
            <select
              id="student"
              value={selectedStudent}
              onChange={(e) => setSelectedStudent(e.target.value)}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            >
              {students.map((student) => (
                <option key={student.id} value={student.id}>
                  {getStudentFullName(student)}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label
              htmlFor="subject"
              className="block text-sm font-medium text-gray-700"
            >
              Subject
            </label>
            <input
              type="text"
              id="subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="e.g., Science"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="assessment"
              className="block text-sm font-medium text-gray-700"
            >
              Assessment
            </label>
            <input
              type="text"
              id="assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              placeholder="e.g., Quiz 2"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label
              htmlFor="score"
              className="block text-sm font-medium text-gray-700"
            >
              Score / Grade
            </label>
            <input
              type="text"
              id="score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              placeholder="e.g., 95% or A+"
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div className="md:col-span-4">
            <button
              type="submit"
              className="w-full rounded-md bg-green-600 py-2 font-semibold text-white hover:bg-green-700 sm:w-auto sm:px-8"
            >
              Save Grade
            </button>
          </div>
        </form>
      </div>

      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Grades for{" "}
          {getStudentFullName(students.find((s) => s.id === selectedStudent))}
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Subject</th>
                <th className="p-4 font-semibold">Assessment</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentGrades.length > 0 ? (
                recentGrades.map((grade) => (
                  <tr key={grade.id} className="border-b hover:bg-gray-50">
                    <td className="p-4">{grade.subject}</td>
                    <td className="p-4">{grade.assessment}</td>
                    <td className="p-4 font-medium">{grade.score}</td>
                    <td className="p-4 text-gray-500">
                      {new Date(grade.date).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-gray-500">
                    No grades entered for this student yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
