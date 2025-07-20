"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

// Define data shapes
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: "holiday" | "meeting" | "exam" | "sports" | "other";
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function CalendarPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchEvents = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/calendar", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch calendar events.");

        const data = await response.json();
        setEvents(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchEvents();
  }, []);

  const getEventTypeVariant = (
    type: string
  ): "default" | "destructive" | "secondary" | "outline" => {
    switch (type) {
      case "holiday":
        return "destructive";
      case "exam":
        return "secondary";
      case "meeting":
        return "default";
      default:
        return "outline";
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC", // Ensure date is not affected by local timezone
    });
  };

  if (isLoading) return <div>Loading calendar...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>School Calendar</CardTitle>
        <CardDescription>
          Upcoming events, holidays, and important dates for the academic year.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {events.length > 0 ? (
            events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                <div className="flex-shrink-0 text-center">
                  <p className="text-lg font-bold text-indigo-600">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      month: "short",
                      timeZone: "UTC",
                    })}
                  </p>
                  <p className="text-2xl font-bold">
                    {new Date(event.startDate).toLocaleDateString("en-US", {
                      day: "2-digit",
                      timeZone: "UTC",
                    })}
                  </p>
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <Badge
                      variant={getEventTypeVariant(event.type)}
                      className="capitalize"
                    >
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {formatDate(event.startDate)}{" "}
                    {event.startDate !== event.endDate &&
                      ` - ${formatDate(event.endDate)}`}
                  </p>
                  {event.description && (
                    <p className="mt-2 text-sm text-gray-600">
                      {event.description}
                    </p>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-center text-gray-500">
              No events found on the calendar.
            </p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
