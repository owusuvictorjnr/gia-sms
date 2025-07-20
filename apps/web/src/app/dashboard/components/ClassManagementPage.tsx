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
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Class {
  id: string;
  name: string;
  academicYear: string;
}
interface UserSearchResult {
  id: string;
  firstName: string;
  middleName: string;
  lastName: string;
  email: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function ClassManagementPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // State for Create Class form
  const [className, setClassName] = useState("");
  const [academicYear, setAcademicYear] = useState("");

  // State for User Assignment
  const [selectedClass, setSelectedClass] = useState<Class | null>(null);
  const [userQuery, setUserQuery] = useState("");
  const [userResults, setUserResults] = useState<UserSearchResult[]>([]);
  const [selectedUser, setSelectedUser] = useState<UserSearchResult | null>(
    null
  );

  const fetchClasses = async () => {
    const token = getAuthToken();
    if (!token) return;
    try {
      const response = await fetch("http://localhost:3001/classes", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (!response.ok) throw new Error("Failed to fetch classes.");
      const data = await response.json();
      setClasses(data);
    } catch (err: any) {
      setError(err.message);
    }
  };

  useEffect(() => {
    setIsLoading(true);
    fetchClasses().finally(() => setIsLoading(false));
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

      fetchClasses(); // Re-fetch classes to update the list

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

  const handleAssignUser = async () => {
    if (!selectedClass || !selectedUser) {
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
            classId: selectedClass.id, 
            userId: selectedUser.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to assign user.");
      toast({
        title: "Success",
        description: `Assigned ${selectedUser.firstName} to ${selectedClass.name}!`,
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

  if (isLoading) return <div>Loading class management...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
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
          <CardTitle>Assign Users to a Class</CardTitle>
          <CardDescription>
            Select a class, then search for a student or teacher to assign them
            to it.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label>1. Select a Class</Label>
            <div className="mt-2 flex flex-wrap gap-2">
              {classes.map((cls) => (
                <Button
                  key={cls.id}
                  variant={selectedClass?.id === cls.id ? "default" : "outline"}
                  onClick={() => setSelectedClass(cls)}
                >
                  {cls.name} ({cls.academicYear})
                </Button>
              ))}
            </div>
          </div>
          {selectedClass && (
            <div className="space-y-4 rounded-md border bg-gray-50 p-4">
              <h4 className="font-semibold">
                Assigning to: {selectedClass.name}
              </h4>
              <div className="space-y-2">
                <Label htmlFor="user-search">
                  2. Search for User (Student or Teacher)
                </Label>
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
                      {user.firstName} {user.lastName} ({user.email})
                    </div>
                  ))}
                </div>
              </div>
              <Button onClick={handleAssignUser} disabled={!selectedUser}>
                Assign User
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
