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
  class: {
    // The class the subject is for
    name: string;
  };
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
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTeacherSchedule = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        // Call the new endpoint to get only the teacher's schedule
        const response = await fetch(
          "http://localhost:3001/timetables/my-schedule",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error(
            "Could not fetch your personal timetable. Please ensure you have been assigned subjects by an administrator."
          );

        const data: TimetableEntry[] = await response.json();

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
    fetchTeacherSchedule();
  }, []);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  if (isLoading) return <div>Loading timetable...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>My Weekly Timetable</CardTitle>
        <CardDescription>
          Your personal teaching schedule for the week.
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
                      <p className="mt-1 text-xs font-semibold text-indigo-600">
                        Class: {entry.class.name}
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
