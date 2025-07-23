"use client";

import { useState, useEffect } from "react";
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

// Define data shapes
interface TimetableEntry {
  id: string;
  dayOfWeek: "monday" | "tuesday" | "wednesday" | "thursday" | "friday";
  startTime: string;
  endTime: string;
  subject: string;
  teacher: { firstName: string; middleName: string; lastName: string };
  class?: { name: string };
}
interface Child {
  id: string;
  firstName: string;
  middleName?: string;
  lastName: string;
}
interface UserProfile {
  role: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function TimetablePage({
  profile,
}: {
  profile: UserProfile | null;
}) {
  const [timetable, setTimetable] = useState<Record<string, TimetableEntry[]>>(
    {}
  );
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string>("");
  const [title, setTitle] = useState("Weekly Timetable");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchTimetableData = async () => {
      const token = getAuthToken();
      if (!token || !profile) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }

      try {
        let timetableData: TimetableEntry[] = [];
        if (profile.role === "teacher" || profile.role === "student") {
          const response = await fetch(
            "http://localhost:3001/timetables/my-schedule",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!response.ok)
            throw new Error("Could not fetch your personal timetable.");
          timetableData = await response.json();
          setTitle("My Weekly Teaching Schedule");
        } else if (profile.role === "parent") {
          const childrenRes = await fetch(
            "http://localhost:3001/parent/my-children",
            { headers: { Authorization: `Bearer ${token}` } }
          );
          if (!childrenRes.ok)
            throw new Error("Failed to fetch your children's data.");
          const childrenData = await childrenRes.json();
          setChildren(childrenData);

          if (childrenData.length > 0) {
            const childId = selectedChildId || childrenData[0].id;
            if (!selectedChildId) setSelectedChildId(childId);

            const timetableRes = await fetch(
              `http://localhost:3001/parent/child/${childId}/timetable`,
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (!timetableRes.ok)
              throw new Error("Failed to fetch timetable for this child.");
            timetableData = await timetableRes.json();
            const selectedChild = childrenData.find(
              (c: Child) => c.id === childId
            );
            setTitle(`Weekly Timetable for ${selectedChild?.firstName}`);
          }
        }

        const groupedByDay = timetableData.reduce(
          (acc, entry) => {
            (acc[entry.dayOfWeek] = acc[entry.dayOfWeek] || []).push(entry);
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
    fetchTimetableData();
  }, [profile, selectedChildId]);

  const days = ["monday", "tuesday", "wednesday", "thursday", "friday"];

  if (isLoading) return <div>Loading timetable...</div>;
  if (error) return <div className="text-red-500">{error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        {profile?.role === "parent" && children.length > 0 && (
          <div className="pt-4">
            <Label htmlFor="child-select">Select Child:</Label>
            <Select onValueChange={setSelectedChildId} value={selectedChildId}>
              <SelectTrigger id="child-select" className="w-[280px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {children.map((child) => (
                  <SelectItem key={child.id} value={child.id}>
                    {child.firstName} {child.lastName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
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
                          ? entry.teacher.middleName + " "
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
