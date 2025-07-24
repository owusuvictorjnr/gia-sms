"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Class {
  id: string;
  name: string;
  academicYear: string;
}
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function PromotionsPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [studentsInClass, setStudentsInClass] = useState<Student[]>([]);
  const [selectedStudentIds, setSelectedStudentIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  const [fromClassId, setFromClassId] = useState<string>("");
  const [toClassId, setToClassId] = useState<string>("");

  useEffect(() => {
    const fetchClasses = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/classes", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch classes.");
        const data = await response.json();
        setClasses(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchClasses();
  }, []);

  useEffect(() => {
    if (!fromClassId) {
      setStudentsInClass([]);
      return;
    }
    const fetchStudents = async () => {
      const token = getAuthToken();
      // This is a simplified approach. A dedicated endpoint would be better in a large-scale app.
      const response = await fetch(`http://localhost:3001/admin/users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const allUsers = await response.json();
      const classStudents = allUsers.filter(
        (user: any) => user.classId === fromClassId && user.role === "student"
      );
      setStudentsInClass(classStudents);
      setSelectedStudentIds([]); // Reset selection when class changes
    };
    fetchStudents();
  }, [fromClassId]);

  const handlePromote = async (e: FormEvent) => {
    e.preventDefault();
    if (!fromClassId || !toClassId || selectedStudentIds.length === 0) {
      toast({
        title: "Error",
        description:
          "Please select a 'from' class, a 'to' class, and at least one student.",
        variant: "destructive",
      });
      return;
    }

    const token = getAuthToken();
    try {
      // In a real app, we would have a dedicated endpoint that accepts an array of student IDs.
      // For now, we will call the assign user endpoint for each selected student.
      for (const studentId of selectedStudentIds) {
        await fetch("http://localhost:3001/classes/assign-user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ classId: toClassId, userId: studentId }),
        });
      }

      toast({
        title: "Success",
        description: `${selectedStudentIds.length} student(s) promoted successfully!`,
      });
      setFromClassId("");
      setToClassId("");
      setSelectedStudentIds([]);
      setStudentsInClass([]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: "An error occurred during promotion.",
        variant: "destructive",
      });
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedStudentIds(studentsInClass.map((s) => s.id));
    } else {
      setSelectedStudentIds([]);
    }
  };

  if (isLoading) return <div>Loading promotions tool...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Promotions & Transfers</CardTitle>
        <CardDescription>
          Use this tool to move specific students from one class to another.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handlePromote} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="from-class">1. Select "From" Class:</Label>
              <Select onValueChange={setFromClassId} value={fromClassId}>
                <SelectTrigger id="from-class">
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="to-class">3. Select "To" Class:</Label>
              <Select onValueChange={setToClassId} value={toClassId}>
                <SelectTrigger id="to-class">
                  <SelectValue placeholder="Select a class..." />
                </SelectTrigger>
                <SelectContent>
                  {classes.map((cls) => (
                    <SelectItem key={cls.id} value={cls.id}>
                      {cls.name} ({cls.academicYear})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {fromClassId && (
            <div className="space-y-2">
              <Label>2. Select Students to Promote</Label>
              <div className="max-h-60 overflow-y-auto rounded-md border p-4 space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="select-all"
                    onCheckedChange={handleSelectAll}
                    checked={
                      selectedStudentIds.length === studentsInClass.length &&
                      studentsInClass.length > 0
                    }
                  />
                  <Label htmlFor="select-all" className="font-semibold">
                    Select All
                  </Label>
                </div>
                {studentsInClass.map((student) => (
                  <div key={student.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={student.id}
                      checked={selectedStudentIds.includes(student.id)}
                      onCheckedChange={() => {
                        setSelectedStudentIds((prev) =>
                          prev.includes(student.id)
                            ? prev.filter((id) => id !== student.id)
                            : [...prev, student.id]
                        );
                      }}
                    />
                    <Label htmlFor={student.id} className="font-normal">
                      {[student.firstName, student.middleName, student.lastName]
                        .filter(Boolean)
                        .join(" ")}
                    </Label>
                  </div>
                ))}
              </div>
            </div>
          )}

          <Button
            type="submit"
            disabled={
              !fromClassId || !toClassId || selectedStudentIds.length === 0
            }
          >
            Promote Selected Students
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
