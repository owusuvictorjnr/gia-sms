"use client";

import React, { useState, useEffect } from "react";

// Define the shape of the student data
interface Student {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface TeacherDashboardProps {
  setView: (view: string) => void;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function TeacherDashboard({ setView }: TeacherDashboardProps) {
  const [roster, setRoster] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchRoster = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:3001/classes/my-roster",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error(
            "Failed to fetch class roster. Please ensure you are assigned to a class."
          );

        const data = await response.json();
        setRoster(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchRoster();
  }, []);

  // Mock data for the schedule
  const schedule = [
    { time: "8:30 AM", subject: "Mathematics", class: "Grade 5" },
    { time: "9:30 AM", subject: "English", class: "Grade 5" },
    { time: "11:00 AM", subject: "Science", class: "Grade 5" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Teacher Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome! Here are your tools and schedule for today.
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
              Today's Schedule
            </h3>
            <ul className="mt-2 space-y-2">
              {schedule.map((item) => (
                <li
                  key={item.time}
                  className="flex items-center justify-between rounded-md p-2 hover:bg-gray-50"
                >
                  <div>
                    <p className="font-medium">{item.subject}</p>
                    <p className="text-sm text-gray-500">{item.class}</p>
                  </div>
                  <span className="font-mono text-sm text-gray-600">
                    {item.time}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Class Roster */}
        <div className="rounded-lg bg-white p-6 shadow lg:col-span-1">
          <h3 className="text-lg font-semibold text-gray-700">Class Roster</h3>
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
