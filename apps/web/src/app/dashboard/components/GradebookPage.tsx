import { useState } from "react";

// In a real app, these types would come from your shared-types package
interface Student {
  id: number;
  name: string;
}

interface GradeEntry {
  id: number;
  studentName: string;
  assessment: string;
  score: string;
  date: string;
}

export default function GradebookPage() {
  // Mock data - this would be fetched from your API
  const students: Student[] = [
    { id: 1, name: "Kofi Mensah" },
    { id: 2, name: "Adwoa Akoto" },
    { id: 3, name: "Yaw Boateng" },
  ];

  const [recentGrades, setRecentGrades] = useState<GradeEntry[]>([
    {
      id: 1,
      studentName: "Kofi Mensah",
      assessment: "Math Test 1",
      score: "85%",
      date: "July 8, 2025",
    },
    {
      id: 2,
      studentName: "Adwoa Akoto",
      assessment: "Math Test 1",
      score: "92%",
      date: "July 8, 2025",
    },
    {
      id: 3,
      studentName: "Yaw Boateng",
      assessment: "English Essay",
      score: "A-",
      date: "July 5, 2025",
    },
  ]);

  const [selectedStudent, setSelectedStudent] = useState<string>(
    students[0].id.toString()
  );
  const [assessment, setAssessment] = useState("");
  const [score, setScore] = useState("");

  const handleSubmitGrade = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudent || !assessment || !score) {
      alert("Please fill out all fields.");
      return;
    }

    // In a real app, you would send this data to your backend API
    const newGrade: GradeEntry = {
      id: recentGrades.length + 1,
      studentName:
        students.find((s) => s.id.toString() === selectedStudent)?.name ||
        "Unknown",
      assessment,
      score,
      date: new Date().toLocaleDateString("en-US", {
        month: "long",
        day: "numeric",
        year: "numeric",
      }),
    };

    setRecentGrades([newGrade, ...recentGrades]);

    // Reset form
    setAssessment("");
    setScore("");
  };

  return (
    <div className="space-y-6">
      {/* Grade Entry Form */}
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
                  {student.name}
                </option>
              ))}
            </select>
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
              placeholder="e.g., Science Quiz 2"
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

      {/* Recent Grades Table */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Recently Entered Grades
        </h2>
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="p-4 font-semibold">Student</th>
                <th className="p-4 font-semibold">Assessment</th>
                <th className="p-4 font-semibold">Score</th>
                <th className="p-4 font-semibold">Date</th>
              </tr>
            </thead>
            <tbody>
              {recentGrades.map((grade) => (
                <tr key={grade.id} className="border-b hover:bg-gray-50">
                  <td className="p-4">{grade.studentName}</td>
                  <td className="p-4">{grade.assessment}</td>
                  <td className="p-4 font-medium">{grade.score}</td>
                  <td className="p-4 text-gray-500">{grade.date}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
