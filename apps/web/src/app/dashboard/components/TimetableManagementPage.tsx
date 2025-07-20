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
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Class {
  id: string;
  name: string;
  academicYear: string;
}
interface Teacher {
  id: string;
  firstName: string;
  lastName: string;
}
interface TimetableEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
  teacher: Teacher;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function TimetableManagementPage() {
  const [classes, setClasses] = useState<Class[]>([]);
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [selectedClassId, setSelectedClassId] = useState<string>("");
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>(
    {}
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Form state for new entry
  const [dayOfWeek, setDayOfWeek] = useState("monday");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [subject, setSubject] = useState("");
  const [teacherId, setTeacherId] = useState("");

  // Fetch initial data (classes and teachers)
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const [classesRes, teachersRes] = await Promise.all([
          fetch("http://localhost:3001/classes", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(
            "http://localhost:3001/admin/search-users?role=teacher&query=",
            { headers: { Authorization: `Bearer ${token}` } }
          ),
        ]);
        if (!classesRes.ok) throw new Error("Failed to fetch classes.");
        if (!teachersRes.ok) throw new Error("Failed to fetch teachers.");

        const classesData = await classesRes.json();
        const teachersData = await teachersRes.json();

        setClasses(classesData);
        setTeachers(teachersData);
        if (classesData.length > 0) {
          setSelectedClassId(classesData[0].id);
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  // Fetch timetable when a class is selected
  useEffect(() => {
    if (!selectedClassId) {
      setTimetable({}); // Clear timetable if no class is selected
      return;
    }
    const fetchTimetable = async () => {
      const token = getAuthToken();
      try {
        const res = await fetch(
          `http://localhost:3001/timetables/class/${selectedClassId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!res.ok)
          throw new Error("Failed to fetch timetable for this class.");
        const data: TimetableEntry[] = await res.json();
        const grouped = data.reduce(
          (acc: Record<string, TimetableEntry[]>, entry) => {
            (acc[entry.dayOfWeek] = acc[entry.dayOfWeek] || []).push(entry);
            return acc;
          },
          {}
        );
        setTimetable(grouped);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };
    fetchTimetable();
  }, [selectedClassId, toast]);

  const handleAddEntry = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (
      !selectedClassId ||
      !teacherId ||
      !dayOfWeek ||
      !startTime ||
      !endTime ||
      !subject
    ) {
      toast({
        title: "Error",
        description: "Please fill out all fields to add an entry.",
        variant: "destructive",
      });
      return;
    }
    try {
      const response = await fetch("http://localhost:3001/timetables", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          classId: selectedClassId,
          teacherId,
          dayOfWeek,
          startTime,
          endTime,
          subject,
        }),
      });
      if (!response.ok) throw new Error("Failed to add timetable entry.");
      toast({
        title: "Success",
        description: "Timetable entry added successfully!",
      });

      // Refetch timetable to show the new entry
      const res = await fetch(
        `http://localhost:3001/timetables/class/${selectedClassId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      const data = await res.json();
      const grouped = data.reduce(
        (acc: Record<string, TimetableEntry[]>, entry: TimetableEntry) => {
          (acc[entry.dayOfWeek] = acc[entry.dayOfWeek] || []).push(entry);
          return acc;
        },
        {}
      );
      setTimetable(grouped);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  if (isLoading) return <div>Loading timetable management...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Timetable Management</CardTitle>
          <CardDescription>
            Create and manage the weekly schedule for each class.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="class-select">Select a Class to Manage</Label>
            <Select onValueChange={setSelectedClassId} value={selectedClassId}>
              <SelectTrigger id="class-select">
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
          {selectedClassId && (
            <form
              onSubmit={handleAddEntry}
              className="grid grid-cols-2 gap-4 rounded-md border bg-gray-50 p-4 lg:grid-cols-6"
            >
              <div className="space-y-2">
                <Label>Day</Label>
                <Select onValueChange={setDayOfWeek} defaultValue={dayOfWeek}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {days.map((d) => (
                      <SelectItem key={d} value={d} className="capitalize">
                        {d}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Start Time</Label>
                <Input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>End Time</Label>
                <Input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Subject</Label>
                <Input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="e.g., Mathematics"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label>Teacher</Label>
                <Select onValueChange={setTeacherId} value={teacherId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select..." />
                  </SelectTrigger>
                  <SelectContent>
                    {teachers.map((t) => (
                      <SelectItem key={t.id} value={t.id}>
                        {t.firstName} {t.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="col-span-2 flex items-end lg:col-span-1">
                <Button type="submit" className="w-full">
                  Add Entry
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>

      {selectedClassId && (
        <Card>
          <CardHeader>
            <CardTitle>
              Weekly Timetable for{" "}
              {classes.find((c) => c.id === selectedClassId)?.name}
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {days.map((day) => (
              <div key={day} className="rounded-lg bg-gray-50 p-4">
                <h3 className="font-bold capitalize text-gray-800">{day}</h3>
                <div className="mt-4 space-y-3">
                  {timetable[day] && timetable[day].length > 0 ? (
                    timetable[day].map((entry) => (
                      <div
                        key={entry.id}
                        className="rounded-md border bg-white p-3"
                      >
                        <p className="font-semibold">{entry.subject}</p>
                        <p className="text-sm text-gray-600">
                          {entry.startTime.substring(0, 5)} -{" "}
                          {entry.endTime.substring(0, 5)}
                        </p>
                        <p className="mt-1 text-xs text-gray-500">
                          Teacher: {entry.teacher.firstName}{" "}
                          {entry.teacher.lastName}
                        </p>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">
                      No classes scheduled.
                    </p>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
