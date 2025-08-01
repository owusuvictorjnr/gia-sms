"use client";

import React, { useState, useEffect } from "react";

// Define the shape of the data
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface ClassDetails {
  id: string;
  name: string;
  academicYear: string;
}

interface TimetableEntry {
  id: string;
  dayOfWeek: string;
  startTime: string;
  endTime: string;
  subject: string;
}

interface UserProfile {
  firstName?: string;
  lastName?: string;
}

interface TeacherDashboardProps {
  setView: (view: string) => void;
  profile: UserProfile; // Accept the profile as a prop
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function TeacherDashboard({
  setView,
  profile,
}: TeacherDashboardProps) {
  const [roster, setRoster] = useState<Student[]>([]);
  const [classDetails, setClassDetails] = useState<ClassDetails | null>(null);
  const [schedule, setSchedule] = useState<TimetableEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        // Fetch roster, class details, and full schedule in parallel
        const [rosterRes, classRes, scheduleRes] = await Promise.all([
          fetch("http://localhost:3001/classes/my-roster", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/classes/my-class", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/timetables/my-schedule", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        if (!rosterRes.ok || !classRes.ok)
          throw new Error(
            "Failed to fetch class data. Please ensure you are assigned to a class."
          );
        if (!scheduleRes.ok) throw new Error("Failed to fetch schedule.");

        const rosterData = await rosterRes.json();
        const classData = await classRes.json();
        const scheduleData = await scheduleRes.json();

        setRoster(rosterData);
        setClassDetails(classData);

        // Filter schedule for today
        const today = new Date()
          .toLocaleString("en-US", { weekday: "long" })
          .toLowerCase();
        const todaysSchedule = scheduleData.filter(
          (entry: TimetableEntry) => entry.dayOfWeek === today
        );
        setSchedule(todaysSchedule);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome, {profile.firstName}! Here are your tools and schedule for
          today.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Quick Actions & Schedule */}
        <div className="space-y-6 lg:col-span-2">
          {/* Quick Actions */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="transform rounded-lg bg-indigo-500 p-6 text-white shadow transition-transform hover:scale-105">
              <h3 className="text-lg font-semibold">Take Attendance</h3>
              <p className="mt-1 text-sm opacity-80">
                Quickly mark today's attendance for your class.
              </p>
              <button
                onClick={() => setView("roll-call")}
                className="mt-4 rounded-md bg-white px-4 py-2 font-semibold text-indigo-600"
              >
                Go to Roll Call
              </button>
            </div>
            <div className="transform rounded-lg bg-green-500 p-6 text-white shadow transition-transform hover:scale-105">
              <h3 className="text-lg font-semibold">Enter Grades</h3>
              <p className="mt-1 text-sm opacity-80">
                Input recent test scores or assignment grades.
              </p>
              <button
                onClick={() => setView("gradebook")}
                className="mt-4 rounded-md bg-white px-4 py-2 font-semibold text-green-600"
              >
                Open Gradebook
              </button>
            </div>
          </div>

          {/* Today's Schedule */}
          <div className="rounded-lg bg-white p-6 shadow">
            <h3 className="text-lg font-semibold text-gray-700">
              Today's Schedule {classDetails && `- ${classDetails.name}`}
            </h3>
            <ul className="mt-2 space-y-2">
              {schedule.length > 0 ? (
                schedule.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                  >
                    <div>
                      <p className="font-medium">{item.subject}</p>
                    </div>
                    <span className="font-mono text-sm text-gray-600">
                      {item.startTime.substring(0, 5)}
                    </span>
                  </li>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  No classes scheduled for today.
                </p>
              )}
            </ul>
          </div>
        </div>

        {/* Class Roster */}
        <div className="rounded-lg bg-white p-6 shadow lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-700">
            Class Roster {classDetails && `(${classDetails.name})`}
          </h3>
          {isLoading ? (
            <p className="mt-2 text-sm text-gray-500">Loading roster...</p>
          ) : error ? (
            <p className="mt-2 text-sm text-red-500">{error}</p>
          ) : roster.length > 0 ? (
            <ul className="mt-2 space-y-2">
              {roster.map((student) => (
                <li
                  key={student.id}
                  className="rounded-md p-2 hover:bg-gray-50"
                >
                  {[student.firstName, student.middleName, student.lastName]
                    .filter(Boolean)
                    .join(" ")}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm text-gray-500">
              No students are currently assigned to your class. Please contact
              an administrator.
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
