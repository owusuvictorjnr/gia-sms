import { useState } from "react";

// In a real app, this would be a more complex type from your shared-types package
interface Student {
  id: number;
  name: string;
  status: "present" | "absent" | "late" | "unmarked";
}

export default function RollCallPage() {
  // Mock data - in a real app, this would be fetched from your API
  const [students, setStudents] = useState<Student[]>([
    { id: 1, name: "Kofi Mensah", status: "unmarked" },
    { id: 2, name: "Adwoa Akoto", status: "unmarked" },
    { id: 3, name: "Yaw Boateng", status: "unmarked" },
    { id: 4, name: "Esi Osei", status: "unmarked" },
    { id: 5, name: "Kwame Annan", status: "unmarked" },
  ]);

  const handleStatusChange = (
    studentId: number,
    newStatus: Student["status"]
  ) => {
    setStudents(
      students.map((student) =>
        student.id === studentId ? { ...student, status: newStatus } : student
      )
    );
  };

  const getStatusButtonClass = (
    studentStatus: Student["status"],
    buttonStatus: Student["status"]
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

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <div className="mb-6 border-b pb-4">
        <h2 className="text-2xl font-bold text-gray-800">
          Roll Call - Grade 5
        </h2>
        <p className="mt-1 text-gray-600">
          Date: <span className="font-semibold">July 10, 2025</span>
        </p>
      </div>

      <div className="space-y-3">
        {students.map((student) => (
          <div
            key={student.id}
            className="flex flex-col items-center justify-between rounded-lg border p-4 sm:flex-row"
          >
            <p className="mb-3 font-medium sm:mb-0">{student.name}</p>
            <div className="flex space-x-2">
              <button
                onClick={() => handleStatusChange(student.id, "present")}
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, "present")}`}
              >
                Present
              </button>
              <button
                onClick={() => handleStatusChange(student.id, "absent")}
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, "absent")}`}
              >
                Absent
              </button>
              <button
                onClick={() => handleStatusChange(student.id, "late")}
                className={`w-24 rounded-md px-3 py-2 text-sm font-semibold transition-colors ${getStatusButtonClass(student.status, "late")}`}
              >
                Late
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 border-t pt-6">
        <button className="w-full rounded-md bg-indigo-600 py-3 font-semibold text-white hover:bg-indigo-700 sm:w-auto sm:px-8">
          Submit Attendance
        </button>
      </div>
    </div>
  );
}
