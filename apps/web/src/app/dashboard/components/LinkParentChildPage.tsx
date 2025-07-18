"use client";

import { useState } from "react";
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

// Define the shape of the user data for this component
interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function LinkParentChildPage() {
  const [parentQuery, setParentQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");

  const [parentResults, setParentResults] = useState<UserSearchResult[]>([]);
  const [studentResults, setStudentResults] = useState<UserSearchResult[]>([]);

  const [selectedParent, setSelectedParent] = useState<UserSearchResult | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] =
    useState<UserSearchResult | null>(null);

  const { toast } = useToast();

  const handleSearch = async (role: "parent" | "student", query: string) => {
    if (query.length < 2) {
      // Clear results if query is too short
      role === "parent" ? setParentResults([]) : setStudentResults([]);
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:3001/admin/search-users?role=${role}&query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`Failed to search for ${role}s.`);
      const data = await response.json();
      if (role === "parent") {
        setParentResults(data);
      } else {
        setStudentResults(data);
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const handleLink = async () => {
    if (!selectedParent || !selectedStudent) {
      toast({
        title: "Error",
        description: "Please select both a parent and a student.",
        variant: "destructive",
      });
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(
        "http://localhost:3001/admin/link-parent-child",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            parentId: selectedParent.id,
            childId: selectedStudent.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to link users.");

      toast({
        title: "Success",
        description: `Successfully linked ${selectedParent.firstName} to ${selectedStudent.firstName}!`,
      });
      // Clear selections after successful linking
      setSelectedParent(null);
      setSelectedStudent(null);
      setParentQuery("");
      setStudentQuery("");
      setParentResults([]);
      setStudentResults([]);
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    }
  };

  const renderUser = (user: UserSearchResult) =>
    `${user.firstName} ${user.lastName} (${user.email})`;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Link Parent to Child</CardTitle>
        <CardDescription>
          Use this tool to associate a parent account with a student account.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Parent Search */}
          <div className="space-y-2">
            <Label htmlFor="parent-search">1. Find Parent</Label>
            <Input
              id="parent-search"
              type="text"
              value={parentQuery}
              onChange={(e) => {
                setParentQuery(e.target.value);
                handleSearch("parent", e.target.value);
              }}
              placeholder="Search by parent name or email..."
            />
            <div className="h-32 overflow-y-auto rounded-md border">
              {parentResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedParent(user);
                    setParentResults([]);
                    setParentQuery(renderUser(user));
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  {renderUser(user)}
                </div>
              ))}
            </div>
          </div>

          {/* Student Search */}
          <div className="space-y-2">
            <Label htmlFor="student-search">2. Find Student</Label>
            <Input
              id="student-search"
              type="text"
              value={studentQuery}
              onChange={(e) => {
                setStudentQuery(e.target.value);
                handleSearch("student", e.target.value);
              }}
              placeholder="Search by student name or email..."
            />
            <div className="mt-2 h-32 overflow-y-auto rounded-md border">
              {studentResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedStudent(user);
                    setStudentResults([]);
                    setStudentQuery(renderUser(user));
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  {renderUser(user)}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Selections and Link Button */}
        <div className="border-t pt-6">
          <div className="mb-4 space-y-2 rounded-md border bg-gray-50 p-4">
            <p>
              <span className="font-semibold text-gray-600">
                Selected Parent:
              </span>{" "}
              {selectedParent ? (
                renderUser(selectedParent)
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </p>
            <p>
              <span className="font-semibold text-gray-600">
                Selected Student:
              </span>{" "}
              {selectedStudent ? (
                renderUser(selectedStudent)
              ) : (
                <span className="text-gray-500">None</span>
              )}
            </p>
          </div>
          <Button
            onClick={handleLink}
            disabled={!selectedParent || !selectedStudent}
          >
            Link Parent to Child
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
