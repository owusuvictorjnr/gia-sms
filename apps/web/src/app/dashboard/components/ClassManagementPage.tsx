"use client";

import { useState, useEffect, FormEvent } from "react";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Teacher {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
interface Class {
  id: string;
  name: string;
  academicYear: string;
  homeroomTeacher?: Teacher;
}
interface UserSearchResult {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
  email: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

// --- Edit Class Modal ---
const EditClassModal = ({
  cls,
  isOpen,
  setIsOpen,
  onClassUpdated,
}: {
  cls: Class | null;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onClassUpdated: () => void;
}) => {
  const { toast } = useToast();
  const [name, setName] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  useEffect(() => {
    if (cls) {
      setName(cls.name);
      setAcademicYear(cls.academicYear);
    }
  }, [cls]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!cls) return;
    try {
      const response = await fetch(`http://localhost:3001/classes/${cls.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name, academicYear }),
      });
      if (!response.ok) throw new Error("Failed to update class.");
      onClassUpdated();
      toast({ title: "Success", description: "Class updated successfully." });
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
          <DialogTitle>Edit Class</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="edit-name">Class Name</Label>
            <Input
              id="edit-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="edit-year">Academic Year</Label>
            <Input
              id="edit-year"
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
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

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // State for forms
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] = useState("");
  const [selectedClassForAssign, setSelectedClassForAssign] =
    useState<Class | null>(null);
  const [selectedClassForHomeroom, setSelectedClassForHomeroom] =
    useState<Class | null>(null);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );

  // State for modals
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);

  const fetchClassesAndTeachers = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Authentication error.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const [classesRes, teachersRes] = await Promise.all([
        fetch("http://localhost:3001/classes", {
          headers: { Authorization: `Bearer ${token}` },
        }),
        fetch("http://localhost:3001/admin/search-users?role=teacher&query=", {
          headers: { Authorization: `Bearer ${token}` },
        }),
      ]);
      if (!classesRes.ok) throw new Error("Failed to fetch classes.");
      if (!teachersRes.ok) throw new Error("Failed to fetch teachers.");
      const classesData = await classesRes.json();
      const teachersData = await teachersRes.json();
      setClasses(classesData);
      setTeachers(teachersData);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndTeachers();
  }, []);

  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:3001/classes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ name: className, academicYear }),
      });
      if (!response.ok) throw new Error("Failed to create class.");
      fetchClassesAndTeachers();
      toast({ title: "Success", description: "Class created successfully!" });
      setClassName("");
      setAcademicYear("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleDeleteClass = async () => {
    if (!deletingClass) return;
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:3001/classes/${deletingClass.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await response.json();
      if (!response.ok)
        throw new Error(data.message || "Failed to delete class.");
      fetchClassesAndTeachers();
      toast({ title: "Success", description: "Class deleted successfully." });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setDeletingClass(null);
    }
  };

  const handleSearchUser = async (query: string) => {
    if (query.length < 2) {
      setUserResults([]);
      return;
    }
    const token = getAuthToken();
    try {
      const [teacherRes, studentRes] = await Promise.all([
        fetch(
          `http://localhost:3001/admin/search-users?role=teacher&query=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
        fetch(
          `http://localhost:3001/admin/search-users?role=student&query=${query}`,
          { headers: { Authorization: `Bearer ${token}` } }
        ),
      ]);
      const teacherData = await teacherRes.json();
      const studentData = await studentRes.json();
      setUserResults([...teacherData, ...studentData]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to search for users.",
        variant: "destructive",
      });
    }
  };

  const handleAssignUser = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClassForAssign || !selectedUser) {
      toast({
        title: "Error",
        description: "Please select a class and a user.",
        variant: "destructive",
      });
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(
        "http://localhost:3001/classes/assign-user",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            classId: selectedClassForAssign.id,
            userId: selectedUser.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to assign user.");
      toast({
        title: "Success",
        description: `Assigned ${selectedUser.firstName} to ${selectedClassForAssign.name}!`,
      });
      setUserQuery("");
      setUserResults([]);
      setSelectedUser(null);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSetHomeroomTeacher = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedClassForHomeroom || !selectedTeacherId) {
      toast({
        title: "Error",
        description: "Please select a class and a teacher.",
        variant: "destructive",
      });
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:3001/classes/${selectedClassForHomeroom.id}/homeroom-teacher`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ teacherId: selectedTeacherId }),
        }
      );
      if (!response.ok) throw new Error("Failed to set homeroom teacher.");
      fetchClassesAndTeachers();
      toast({
        title: "Success",
        description: "Homeroom teacher assigned successfully.",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading class management...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <EditClassModal
        cls={editingClass}
        isOpen={!!editingClass}
        setIsOpen={() => setEditingClass(null)}
        onClassUpdated={fetchClassesAndTeachers}
      />
      <AlertDialog
        open={!!deletingClass}
        onOpenChange={() => setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
          </AlertDialogHeader>
          <AlertDialogDescription>
            This will permanently delete the class '{deletingClass?.name}'. This
            action cannot be undone and will fail if any users are still
            assigned to this class.
          </AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteClass}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Card>
        <CardHeader>
          <CardTitle>Create New Class</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateClass}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Input
              value={className}
              onChange={(e) => setClassName(e.target.value)}
              placeholder="Class Name (e.g., Grade 5)"
              required
            />
            <Input
              value={academicYear}
              onChange={(e) => setAcademicYear(e.target.value)}
              placeholder="Academic Year (e.g., 2024/2025)"
              required
            />
            <Button type="submit">Create Class</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Manage Existing Classes</CardTitle>
          <CardDescription>
            View, edit, delete, and assign homeroom teachers to classes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Class Name</TableHead>
                <TableHead>Academic Year</TableHead>
                <TableHead>Homeroom Teacher</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {classes.map((cls) => (
                <TableRow key={cls.id}>
                  <TableCell className="font-medium">{cls.name}</TableCell>
                  <TableCell>{cls.academicYear}</TableCell>
                  <TableCell>
                    {cls.homeroomTeacher
                      ? `${cls.homeroomTeacher.firstName} ${cls.homeroomTeacher.lastName}`
                      : "Not Assigned"}
                  </TableCell>
                  <TableCell className="text-right space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingClass(cls)}
                    >
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => setDeletingClass(cls)}
                    >
                      Delete
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>
            Assign User to Class (Students & Subject Teachers)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleAssignUser} className="space-y-4">
            <div>
              <Label>1. Select a Class</Label>
              <div className="mt-2 flex flex-wrap gap-2">
                {classes.map((cls) => (
                  <Button
                    key={cls.id}
                    variant={
                      selectedClassForAssign?.id === cls.id
                        ? "default"
                        : "outline"
                    }
                    onClick={() => setSelectedClassForAssign(cls)}
                  >
                    {cls.name} ({cls.academicYear})
                  </Button>
                ))}
              </div>
            </div>
            {selectedClassForAssign && (
              <div className="space-y-4 rounded-md border bg-gray-50 p-4">
                <h4 className="font-semibold">
                  Assigning to: {selectedClassForAssign.name}
                </h4>
                <div className="space-y-2">
                  <Label htmlFor="user-search">2. Search for User</Label>
                  <Input
                    id="user-search"
                    value={userQuery}
                    onChange={(e) => {
                      setUserQuery(e.target.value);
                      handleSearchUser(e.target.value);
                    }}
                    placeholder="Search by name or email..."
                  />
                  <div className="h-32 overflow-y-auto rounded-md border bg-white">
                    {userResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => {
                          setSelectedUser(user);
                          setUserResults([]);
                          setUserQuery(`${user.firstName} ${user.lastName}`);
                        }}
                        className="cursor-pointer p-2 hover:bg-gray-100"
                      >
                        {user.firstName}
                        {user.middleName}
                        {user.lastName} ({user.email})
                      </div>
                    ))}
                  </div>
                </div>
                <Button type="submit" disabled={!selectedUser}>
                  Assign User
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Set Homeroom Teacher</CardTitle>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleSetHomeroomTeacher}
            className="flex flex-col gap-4 sm:flex-row"
          >
            <Select
              onValueChange={(id) =>
                setSelectedClassForHomeroom(
                  classes.find((c) => c.id === id) || null
                )
              }
            >
              <SelectTrigger>
                <SelectValue placeholder="Select a class..." />
              </SelectTrigger>
              <SelectContent>
                {classes.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select onValueChange={setSelectedTeacherId}>
              <SelectTrigger>
                <SelectValue placeholder="Select a teacher..." />
              </SelectTrigger>
              <SelectContent>
                {teachers.map((t) => (
                  <SelectItem key={t.id} value={t.id}>
                    {t.firstName} {t.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button type="submit">Assign Homeroom Teacher</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
