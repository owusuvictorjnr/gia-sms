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
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface StudentSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface HealthRecord {
  id: string;
  studentId: string;
  bloodGroup?: string;
  allergies?: string;
  medicalConditions?: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelationship: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function HealthRecordPage() {
  const [studentQuery, setStudentQuery] = useState("");
  const [studentResults, setStudentResults] = useState<StudentSearchResult[]>(
    []
  );
  const [selectedStudent, setSelectedStudent] =
    useState<StudentSearchResult | null>(null);
  const [healthRecord, setHealthRecord] = useState<Partial<HealthRecord>>({});
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setStudentQuery(query);
    if (query.length < 2) {
      setStudentResults([]);
      return;
    }
    const token = getAuthToken();
    try {
      const res = await fetch(
        `http://localhost:3001/admin/search-users?role=student&query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to search for students.");
      const data = await res.json();
      setStudentResults(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  useEffect(() => {
    if (!selectedStudent) {
      setHealthRecord({});
      return;
    }
    const fetchHealthRecord = async () => {
      const token = getAuthToken();
      try {
        const res = await fetch(
          `http://localhost:3001/health-records/student/${selectedStudent.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok) throw new Error("Failed to fetch health record.");
        const data = await res.json();
        setHealthRecord(data || { studentId: selectedStudent.id });
      } catch (err: any) {
        setHealthRecord({ studentId: selectedStudent.id });
      }
    };
    fetchHealthRecord();
  }, [selectedStudent, toast]);

  const handleSaveRecord = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedStudent) return;
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:3001/health-records", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...healthRecord,
          studentId: selectedStudent.id,
        }),
      });
      if (!response.ok) throw new Error("Failed to save health record.");

      // FIX: Add a success toast notification
      toast({
        title: "Success",
        description: "Health record saved successfully!",
      });
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setHealthRecord((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Student Health Records</CardTitle>
        <CardDescription>
          Search for a student to view or manage their health information.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="student-search">Search for a Student</Label>
          <Input
            id="student-search"
            value={studentQuery}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search by name or email..."
          />
          {studentResults.length > 0 && (
            <div className="max-h-40 overflow-y-auto rounded-md border">
              {studentResults.map((user) => (
                <div
                  key={user.id}
                  onClick={() => {
                    setSelectedStudent(user);
                    setStudentResults([]);
                    setStudentQuery(`${user.firstName} ${user.lastName}`);
                  }}
                  className="cursor-pointer p-2 hover:bg-gray-100"
                >
                  {user.firstName} {user.lastName} ({user.email})
                </div>
              ))}
            </div>
          )}
        </div>

        {selectedStudent && (
          <form
            onSubmit={handleSaveRecord}
            className="space-y-4 rounded-lg border bg-gray-50 p-4 animate-in fade-in-50"
          >
            <h3 className="font-semibold text-lg">
              Editing Record for: {selectedStudent.firstName}{" "}
              {selectedStudent.lastName}
            </h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="bloodGroup">Blood Group</Label>
                <Input
                  id="bloodGroup"
                  name="bloodGroup"
                  value={healthRecord.bloodGroup || ""}
                  onChange={handleInputChange}
                  placeholder="e.g., O+"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea
                id="allergies"
                name="allergies"
                value={healthRecord.allergies || ""}
                onChange={handleInputChange}
                placeholder="List any known allergies..."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="medicalConditions">
                Existing Medical Conditions
              </Label>
              <Textarea
                id="medicalConditions"
                name="medicalConditions"
                value={healthRecord.medicalConditions || ""}
                onChange={handleInputChange}
                placeholder="List any existing conditions..."
              />
            </div>
            <div className="border-t pt-4">
              <h4 className="font-semibold mb-2">Emergency Contact</h4>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactName">Full Name</Label>
                  <Input
                    id="emergencyContactName"
                    name="emergencyContactName"
                    value={healthRecord.emergencyContactName || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactPhone">Phone Number</Label>
                  <Input
                    id="emergencyContactPhone"
                    name="emergencyContactPhone"
                    value={healthRecord.emergencyContactPhone || ""}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="emergencyContactRelationship">
                    Relationship
                  </Label>
                  <Input
                    id="emergencyContactRelationship"
                    name="emergencyContactRelationship"
                    value={healthRecord.emergencyContactRelationship || ""}
                    onChange={handleInputChange}
                    placeholder="e.g., Mother"
                    required
                  />
                </div>
              </div>
            </div>
            <Button type="submit">Save Health Record</Button>
          </form>
        )}
      </CardContent>
    </Card>
  );
}
