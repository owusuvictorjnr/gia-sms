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
  DialogDescription,
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

interface ClassUsers {
  teachers: UserSearchResult[];
  students: UserSearchResult[];
}

const ClassDeletionModal = ({
  classToDelete,
  isOpen,
  setIsOpen,
  onSuccess,
  allClasses,
}: {
  classToDelete: Class | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
  allClasses: Class[];
}) => {
  const { toast } = useToast();
  const [classUsers, setClassUsers] = useState<ClassUsers>({
    teachers: [],
    students: [],
  });
  const [targetClassId, setTargetClassId] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"check" | "resolve" | "delete">("check");

  useEffect(() => {
    if (isOpen && classToDelete) {
      checkClassDeletion();
    }
  }, [isOpen, classToDelete]);

  const checkClassDeletion = async () => {
    if (!classToDelete) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:3001/classes/${classToDelete.id}/users`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (!response.ok) throw new Error("Failed to check class assignments");

      const data = await response.json();
      setClassUsers(data);
      setStep(
        data.teachers.length > 0 || data.students.length > 0
          ? "resolve"
          : "delete"
      );
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleUnassignTeachers = async () => {
    if (!classToDelete) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      await Promise.all(
        classUsers.teachers.map((teacher) =>
          fetch(
            `http://localhost:3001/classes/teachers/${teacher.id}/unassign`,
            {
              method: "PATCH",
              headers: { Authorization: `Bearer ${token}` },
            }
          )
        )
      );

      toast({
        title: "Success",
        description: "Teachers unassigned successfully",
      });
      await checkClassDeletion();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMoveStudents = async () => {
    if (!classToDelete || !targetClassId) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:3001/classes/${classToDelete.id}/move-students/${targetClassId}`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) throw new Error("Failed to move students");

      toast({ title: "Success", description: "Students moved successfully" });
      await checkClassDeletion();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteClass = async () => {
    if (!classToDelete) return;

    setIsLoading(true);
    try {
      const token = localStorage.getItem("access_token");
      const response = await fetch(
        `http://localhost:3001/classes/${classToDelete.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete class");
      }

      toast({ title: "Success", description: "Class deleted successfully" });
      onSuccess();
      setIsOpen(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {classToDelete?.name}</DialogTitle>
          <DialogDescription>
            {step === "check" && "Checking for assigned users..."}
            {step === "resolve" && "Please resolve assignments before deletion"}
            {step === "delete" && "Confirm permanent deletion"}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-4 text-center">Loading...</div>
        ) : step === "resolve" ? (
          <div className="space-y-6">
            {classUsers.teachers.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">
                  Assigned Teachers ({classUsers.teachers.length})
                </h4>
                <ul className="max-h-40 overflow-y-auto rounded border p-2">
                  {classUsers.teachers.map((teacher) => (
                    <li key={teacher.id} className="py-1">
                      {teacher.firstName} {teacher.lastName}
                    </li>
                  ))}
                </ul>
                <Button
                  variant="outline"
                  onClick={handleUnassignTeachers}
                  disabled={isLoading}
                >
                  Unassign All Teachers
                </Button>
              </div>
            )}

            {classUsers.students.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">
                  Assigned Students ({classUsers.students.length})
                </h4>
                <div className="flex gap-2">
                  <Select
                    value={targetClassId}
                    onValueChange={setTargetClassId}
                    disabled={isLoading}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select target class" />
                    </SelectTrigger>
                    <SelectContent>
                      {allClasses
                        .filter((c) => c.id !== classToDelete?.id)
                        .map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name} ({c.academicYear})
                          </SelectItem>
                        ))}
                    </SelectContent>
                  </Select>
                  <Button
                    variant="outline"
                    onClick={handleMoveStudents}
                    disabled={!targetClassId || isLoading}
                  >
                    Move Students
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            <p>Are you sure you want to permanently delete this class?</p>
            <p className="text-sm text-muted-foreground">
              This action cannot be undone.
            </p>
          </div>
        )}

        <DialogFooter>
          {step === "delete" && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleDeleteClass}
                disabled={isLoading}
              >
                Confirm Deletion
              </Button>
            </>
          )}
          {step === "resolve" && (
            <Button
              onClick={() => {
                setStep("check");
                checkClassDeletion();
              }}
              disabled={isLoading}
            >
              Check Again
            </Button>
          )}
        </DialogFooter>
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

  // Form states
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

  // Modal states
  const [editingClass, setEditingClass] = useState<Class | null>(null);
  const [deletingClass, setDeletingClass] = useState<Class | null>(null);
  const [showComplexDelete, setShowComplexDelete] = useState(false);

  const fetchClassesAndTeachers = async () => {
    const token = localStorage.getItem("access_token");
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

      setClasses(await classesRes.json());
      setTeachers(await teachersRes.json());
    } catch (err: any) {
      setError(err.message);
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClassesAndTeachers();
  }, []);

  const handleCreateClass = async (e: FormEvent) => {
    e.preventDefault();
    const token = localStorage.getItem("access_token");
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

      await fetchClassesAndTeachers();
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

  const handleSimpleDelete = async () => {
    if (!deletingClass) return;
    const token = localStorage.getItem("access_token");
    try {
      const response = await fetch(
        `http://localhost:3001/classes/${deletingClass.id}`,
        {
          method: "DELETE",
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        if (errorData.message.includes("re-assign")) {
          setShowComplexDelete(true);
          return;
        }
        throw new Error(errorData.message || "Failed to delete class.");
      }

      await fetchClassesAndTeachers();
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

    const token = localStorage.getItem("access_token");
    try {
      const [teacherRes, studentRes] = await Promise.all([
        fetch(
          `http://localhost:3001/admin/search-users?role=teacher&query=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
        fetch(
          `http://localhost:3001/admin/search-users?role=student&query=${query}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        ),
      ]);

      setUserResults([
        ...(await teacherRes.json()),
        ...(await studentRes.json()),
      ]);
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

    const token = localStorage.getItem("access_token");
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

    const token = localStorage.getItem("access_token");
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

      await fetchClassesAndTeachers();
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
      {/* Edit Class Modal */}
      <Dialog
        open={!!editingClass}
        onOpenChange={(open) => !open && setEditingClass(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Class</DialogTitle>
          </DialogHeader>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (editingClass) {
                handleCreateClass(e); // Reusing the create handler for update
              }
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="edit-name">Class Name</Label>
              <Input
                id="edit-name"
                value={editingClass?.name || ""}
                onChange={(e) =>
                  editingClass &&
                  setEditingClass({
                    ...editingClass,
                    name: e.target.value,
                  })
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-year">Academic Year</Label>
              <Input
                id="edit-year"
                value={editingClass?.academicYear || ""}
                onChange={(e) =>
                  editingClass &&
                  setEditingClass({
                    ...editingClass,
                    academicYear: e.target.value,
                  })
                }
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

      {/* Simple Delete Confirmation */}
      <AlertDialog
        open={!!deletingClass && !showComplexDelete}
        onOpenChange={(open) => !open && setDeletingClass(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the class '{deletingClass?.name}'.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleSimpleDelete}>
              Confirm Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Advanced Delete Modal */}
      <ClassDeletionModal
        classToDelete={deletingClass}
        isOpen={!!deletingClass}
        setIsOpen={(open) => !open && setDeletingClass(null)}
        onSuccess={() => {
          fetchClassesAndTeachers(); // Refresh data after deletion
          setDeletingClass(null); // Reset deletion state
        }}
        allClasses={classes.filter((c) => c.id !== deletingClass?.id)}
      />

      {/* Create Class Card */}
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

      {/* Class Management Table */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Classes</CardTitle>
          <CardDescription>
            View, edit, and delete classes. Assign homeroom teachers.
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
                      onClick={() => {
                        setDeletingClass(cls);
                        setShowComplexDelete(false);
                      }}
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

      {/* Assign User to Class */}
      <Card>
        <CardHeader>
          <CardTitle>Assign User to Class</CardTitle>
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
                    type="button"
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
                  {userResults.length > 0 && (
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
                          {user.firstName} {user.lastName} ({user.email})
                        </div>
                      ))}
                    </div>
                  )}
                </div>
                <Button type="submit" disabled={!selectedUser}>
                  Assign User
                </Button>
              </div>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Set Homeroom Teacher */}
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
