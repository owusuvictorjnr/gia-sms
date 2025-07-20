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
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface CalendarEvent {
  id: string;
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  type: "holiday" | "meeting" | "exam" | "sports" | "other";
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

export default function CalendarManagementPage() {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const { toast } = useToast();

  // Form state for new event
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [type, setType] = useState("other");

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

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleCreateEvent = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:3001/calendar", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, description, startDate, endDate, type }),
      });
      if (!response.ok) throw new Error("Failed to create event.");

      fetchEvents(); // Re-fetch events to update the list
      toast({
        title: "Success",
        description: "Calendar event created successfully!",
      });
      // Reset form
      setTitle("");
      setDescription("");
      setStartDate("");
      setEndDate("");
      setType("other");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const formatDate = (dateString: string) =>
    new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      timeZone: "UTC",
    });

  if (isLoading) return <div>Loading calendar management...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle>Create New Calendar Event</CardTitle>
          <CardDescription>
            Add a new school-wide event, holiday, or meeting to the calendar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateEvent} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="event-title">Event Title</Label>
                <Input
                  id="event-title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Mid-Term Break"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="event-type">Event Type</Label>
                <Select onValueChange={setType} value={type}>
                  <SelectTrigger id="event-type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="holiday">Holiday</SelectItem>
                    <SelectItem value="meeting">Meeting</SelectItem>
                    <SelectItem value="exam">Exam</SelectItem>
                    <SelectItem value="sports">Sports Event</SelectItem>
                    <SelectItem value="other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="start-date">Start Date</Label>
                <Input
                  id="start-date"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="end-date">End Date</Label>
                <Input
                  id="end-date"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="event-desc">Description (Optional)</Label>
              <Textarea
                id="event-desc"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Add any extra details..."
              />
            </div>
            <Button type="submit">Add Event to Calendar</Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Existing Calendar Events</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="flex items-start space-x-4 rounded-lg border p-4"
              >
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-gray-800">{event.title}</h3>
                    <Badge variant="secondary" className="capitalize">
                      {event.type}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium text-gray-500">
                    {formatDate(event.startDate)}
                    {event.startDate !== event.endDate &&
                      ` - ${formatDate(event.endDate)}`}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
