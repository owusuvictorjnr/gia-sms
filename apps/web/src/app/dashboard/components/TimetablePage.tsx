"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

// Define data shapes
interface TimetableEntry {
  id: string;
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  startTime: string;
  endTime: string;
  subject: string;
  teacher: {
    firstName: string;
    middleName?: string;
    lastName: string;
  };
}

interface ClassDetails {
  id: string;
  name: string;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function TimetablePage() {
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>(
    {}
  );
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetable = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        // First, get the user's class (assuming they are a teacher or student)
        // In a real app, a parent would select a child first.
        const classRes = await fetch("http://localhost:3001/classes/my-class", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!classRes.ok)
          throw new Error("Could not find an assigned class for your profile.");
        const classData: ClassDetails = await classRes.json();
        setClassDetails(classData);

        // Then, fetch the timetable for that class
        const timetableRes = await fetch(
          `http://localhost:3001/timetables/class/${classData.id}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (!timetableRes.ok) throw new Error("Failed to fetch timetable.");

        const data: TimetableEntry[] = await timetableRes.json();

        // Group entries by day of the week
        const groupedByDay = data.reduce(
          (acc, entry) => {
            const day = entry.dayOfWeek;
            if (!acc[day]) {
              acc[day] = [];
            }
            acc[day].push(entry);
            return acc;
          },
          {} as Record<string, TimetableEntry[]>
        );

        setTimetable(groupedByDay);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchTimetable();
  }, []);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  if (isLoading) return <div>Loading timetable...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Weekly Timetable</CardTitle>
        <CardDescription>
          {classDetails
            ? `Showing timetable for ${classDetails.name}`
            : "Your class timetable for the week."}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3 lg:grid-cols-5">
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
                        {entry.teacher.middleName
                          ? `${entry.teacher.middleName} `
                          : ""}
                        {entry.teacher.lastName}
                      </p>
                    </div>
                  ))
                ) : (
                  <p className="text-sm text-gray-500">No classes scheduled.</p>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
