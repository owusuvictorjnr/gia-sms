import { useState, useEffect } from "react";
import { AttendanceStatus } from "shared-types/src/attendance-status.enum"; // Import from shared package


// RollCallPage component for managing student attendance
// Define the shapes of our data
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface StudentAttendanceState extends Student {
  status: AttendanceStatus | "unmarked";
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

// Helper function to get today's date in YYYY-MM-DD format
const getTodayDateString = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

export default function RollCallPage() {
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const todayDate = getTodayDateString();

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        // Fetch students and today's attendance records simultaneously
        const [studentsRes, attendanceRes] = await Promise.all([
          fetch("http://localhost:3001/users/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/attendance/${todayDate}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!studentsRes.ok) throw new Error("Failed to fetch students.");
        if (!attendanceRes.ok)
          throw new Error("Failed to fetch attendance records.");

        const studentsData: Student[] = await studentsRes.json();
        const attendanceData: {
          studentId: string;
          status: AttendanceStatus;
        }[] = await attendanceRes.json();

        const attendanceMap = new Map(
          attendanceData.map((att) => [att.studentId, att.status])
        );

        const studentListWithStatus = studentsData.map((student) => ({
          ...student,
          // FIX: Explicitly cast the status to the correct type
          status: (attendanceMap.get(student.id) ||
            "unmarked") as StudentAttendanceState["status"],
        }));

        setStudents(studentListWithStatus);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [todayDate]);

  const handleStatusChange = (
    studentId: string,
    newStatus: AttendanceStatus
  ) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const handleSubmit = async () => {
    const token = getAuthToken();
    const recordsToSubmit = students
      .filter((s) => s.status !== "unmarked")
      .map((s) => ({ studentId: s.id, status: s.status as AttendanceStatus }));

    if (recordsToSubmit.length === 0) {
      alert("Please mark attendance for at least one student.");
      return;
    }

    try {
      const response = await fetch("http://localhost:3001/attendance", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ date: todayDate, records: recordsToSubmit }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit attendance.");
      }

      alert("Attendance submitted successfully!");
    } catch (err: any) {
      setError(err.message);
    }
  };

  const getStatusButtonClass = (
    studentStatus: StudentAttendanceState["status"],
    buttonStatus: AttendanceStatus
  ) => {
    if (studentStatus === buttonStatus) {
      switch (buttonStatus) {
        case "present":
          return "bg-green-500 text-white";
        case "absent":
          return "bg-red-500 text-white";
        case "late":
          return "bg-yellow-500 text-white";
      }
    }
    return "bg-gray-200 text-gray-700 hover:bg-gray-300";
  };

  if (isLoading) return <div>Loading Roll Call...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Roll Call - Grade 5
        </h2>
        <p className="mt-1 text-gray-600">
          Date:{" "}
          <span className="font-semibold">
            {new Date().toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </p>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex flex-col items-center justify-between rounded-lg border p-4 sm:flex-row"
          >
            <p className="mb-3 font-medium sm:mb-0">
              {[student.firstName, student.middleName, student.lastName]
                .filter(Boolean)
                .join(" ")}
            </p>
            <div className="flex space-x-2">
              <button
                onClick={() =>
                  handleStatusChange(student.id, AttendanceStatus.PRESENT)
                }
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, AttendanceStatus.PRESENT)}`}
              >
                Present
              </button>
              <button
                onClick={() =>
                  handleStatusChange(student.id, AttendanceStatus.ABSENT)
                }
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, AttendanceStatus.ABSENT)}`}
              >
                Absent
              </button>
              <button
                onClick={() =>
                  handleStatusChange(student.id, AttendanceStatus.LATE)
                }
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, AttendanceStatus.LATE)}`}
              >
                Late
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <button
          onClick={handleSubmit}
          className="w-full rounded-md bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 sm:w-auto sm:px-8"
        >
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
