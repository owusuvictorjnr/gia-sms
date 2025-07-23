"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AttendanceStatus } from "shared-types/src/attendance-status.enum";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface StudentAttendanceState extends Student {
  status: AttendanceStatus | "unmarked";
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

const getTodayDateString = () => new Date().toISOString().split("T")[0];

export default function RollCallPage() {
  const [students, setStudents] = useState<StudentAttendanceState[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();
  const todayDate = getTodayDateString();

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        // In a real subject-based system, you'd fetch students for a specific class.
        // For now, we'll assume the teacher is a homeroom teacher for all students returned.
        const [studentsRes, attendanceRes] = await Promise.all([
          fetch("http://localhost:3001/users/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`http://localhost:3001/attendance/${todayDate}`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!studentsRes.ok)
          throw new Error("Failed to fetch students for your class.");
        if (!attendanceRes.ok)
          throw new Error("Failed to fetch today's attendance records.");

        const studentsData: Student[] = await studentsRes.json();
        const attendanceData: {
          studentId: string;
          status: AttendanceStatus;
        }[] = await attendanceRes.json();

        const attendanceMap = new Map(
          attendanceData.map((att) => [att.studentId, att.status])
        );

        const studentListWithStatus: StudentAttendanceState[] =
          studentsData.map((student) => ({
            ...student,
            status:
              (attendanceMap.get(student.id) as AttendanceStatus) || "unmarked",
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
      toast({
        title: "Info",
        description: "Please mark attendance for at least one student.",
      });
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

      if (!response.ok) throw new Error("Failed to submit attendance.");

      toast({
        title: "Success",
        description: "Attendance submitted successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading Roll Call...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Roll Call</CardTitle>
        <p className="text-sm text-gray-500">
          Date:{" "}
          {new Date().toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </CardHeader>
      <CardContent>
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
                <Button
                  onClick={() =>
                    handleStatusChange(student.id, AttendanceStatus.PRESENT)
                  }
                  variant={student.status === "present" ? "default" : "outline"}
                  size="sm"
                >
                  Present
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(student.id, AttendanceStatus.ABSENT)
                  }
                  variant={
                    student.status === "absent" ? "destructive" : "outline"
                  }
                  size="sm"
                >
                  Absent
                </Button>
                <Button
                  onClick={() =>
                    handleStatusChange(student.id, AttendanceStatus.LATE)
                  }
                  variant={student.status === "late" ? "secondary" : "outline"}
                  size="sm"
                >
                  Late
                </Button>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t pt-6">
          <Button onClick={handleSubmit}>Submit Attendance</Button>
        </div>
      </CardContent>
    </Card>
  );
}
