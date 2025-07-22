"use client";

import { useState, useEffect, FormEvent, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface GradeEntry {
  id: string;
  assessment: string;
  score: string;
  subject: string;
  date: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

// --- Edit Grade Modal ---
const EditGradeModal = ({
  grade,
  isOpen,
  setIsOpen,
  onGradeUpdated,
}: {
  grade: GradeEntry | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onGradeUpdated: () => void;
}) => {
  const { toast } = useToast();
  const [assessment, setAssessment] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");

  useEffect(() => {
    if (grade) {
      setAssessment(grade.assessment);
      setSubject(grade.subject);
      setScore(grade.score);
    }
  }, [grade]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!grade) return;
    try {
      const response = await fetch(`http://localhost:3001/grades/${grade.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assessment, subject, score }),
      });
      if (!response.ok) throw new Error("Failed to update grade.");
      onGradeUpdated();
      toast({ title: "Success", description: "Grade updated successfully." });
      setIsOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit Grade</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-subject">Subject</Label>
            <Input
              id="edit-subject"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-assessment">Assessment</Label>
            <Input
              id="edit-assessment"
              value={assessment}
              onChange={(e) => setAssessment(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-score">Score / Grade</Label>
            <Input
              id="edit-score"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Save Changes</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Gradebook Page Component ---
export default function GradebookPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [recentGrades, setRecentGrades] = useState<GradeEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Form state
  const [selectedStudent, setSelectedStudent] = useState<string>("");
  const [assessment, setAssessment] = useState("");
  const [subject, setSubject] = useState("");
  const [score, setScore] = useState("");

  // State for modals
  const [editingGrade, setEditingGrade] = useState<GradeEntry | null>(null);
  const [deletingGrade, setDeletingGrade] = useState<GradeEntry | null>(null);

  const fetchGradesForStudent = useCallback(
    async (studentId: string) => {
      const token = getAuthToken();
      if (!token) return;
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
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    },
    [toast]
  );

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const studentsResponse = await fetch(
          "http://localhost:3001/users/students",
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!studentsResponse.ok) throw new Error("Failed to fetch students.");
        const studentsData: Student[] = await studentsResponse.json();
        setStudents(studentsData);
        if (studentsData.length > 0) {
          setSelectedStudent(studentsData[0].id);
        } else {
          setIsLoading(false);
        }
      } catch (err: any) {
        setError(err.message);
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  useEffect(() => {
    if (selectedStudent) {
      fetchGradesForStudent(selectedStudent);
    }
  }, [selectedStudent, fetchGradesForStudent]);

  const handleSubmitGrade = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!selectedStudent || !assessment || !subject || !score || !token) {
      toast({
        title: "Error",
        description: "Please fill out all fields.",
        variant: "destructive",
      });
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
      if (!response.ok) throw new Error("Failed to save grade.");
      fetchGradesForStudent(selectedStudent);
      toast({ title: "Success", description: "Grade saved successfully!" });
      setAssessment("");
      setSubject("");
      setScore("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteGrade = async () => {
    if (!deletingGrade) return;
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:3001/grades/${deletingGrade.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error("Failed to delete grade.");
      fetchGradesForStudent(selectedStudent);
      toast({ title: "Success", description: "Grade deleted successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingGrade(null);
    }
  };

  const getStudentFullName = (student: Student | undefined) => {
    if (!student) return "";
    return [student.firstName, student.middleName, student.lastName]
      .filter(Boolean)
      .join(" ");
  };

  if (isLoading && !students.length) return <div>Loading Gradebook...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <EditGradeModal
        grade={editingGrade}
        isOpen={!!editingGrade}
        setIsOpen={() => setEditingGrade(null)}
        onGradeUpdated={() => fetchGradesForStudent(selectedStudent)}
      />
      <AlertDialog
        open={!!deletingGrade}
        onOpenChange={() => setDeletingGrade(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            This action cannot be undone. This will permanently delete the grade
            record.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteGrade}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Enter New Grade</CardTitle>
          <CardDescription>
            Select a student and enter their grade for an assessment.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmitGrade} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="student">Student</Label>
                <Select
                  onValueChange={setSelectedStudent}
                  value={selectedStudent}
                >
                  <SelectTrigger id="student">
                    <SelectValue placeholder="Select Student..." />
                  </SelectTrigger>
                  <SelectContent>
                    {students.map((s) => (
                      <SelectItem key={s.id} value={s.id}>
                        {getStudentFullName(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="subject">Subject</Label>
                <Input
                  id="subject"
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Science"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="assessment">Assessment</Label>
                <Input
                  id="assessment"
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                  placeholder="e.g., Quiz 2"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="score">Score / Grade</Label>
                <Input
                  id="score"
                  value={score}
                  onChange={(e) => setScore(e.target.value)}
                  placeholder="e.g., 95% or A+"
                  required
                />
              </div>
            </div>
            <Button type="submit">Save Grade</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Recent Grades for{" "}
            {getStudentFullName(students.find((s) => s.id === selectedStudent))}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Subject</TableHead>
                <TableHead>Assessment</TableHead>
                <TableHead>Score</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {recentGrades.length > 0 ? (
                recentGrades.map((grade) => (
                  <TableRow key={grade.id}>
                    <TableCell>{grade.subject}</TableCell>
                    <TableCell>{grade.assessment}</TableCell>
                    <TableCell className="font-medium">{grade.score}</TableCell>
                    <TableCell>
                      {new Date(grade.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell className="text-right space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setEditingGrade(grade)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => setDeletingGrade(grade)}
                      >
                        Delete
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} className="h-24 text-center">
                    No grades entered for this student yet.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
