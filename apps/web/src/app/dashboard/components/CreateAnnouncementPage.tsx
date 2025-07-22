"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface TaughtClass {
  id: string;
  name: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

/**
 * CreateAnnouncementPage allows teachers to create announcements
 * and select the classes that should receive them.
 */
export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [taughtClasses, setTaughtClasses] = useState<TaughtClass[]>([]);
  const [selectedClassIds, setSelectedClassIds] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();


  // Fetch the classes taught by the teacher
  // This is done once when the component mounts
  useEffect(() => {
    const fetchTaughtClasses = async () => {
      const token = getAuthToken();
      try {
        const response = await fetch(
          "http://localhost:3001/classes/my-taught-classes",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok)
          throw new Error("Failed to fetch your assigned classes.");
        const data = await response.json();
        setTaughtClasses(data);
      } catch (err: any) {
        toast({
          title: "Error",
          description: err.message,
          variant: "destructive",
        });
      }
    };
    fetchTaughtClasses();
  }, [toast]);

  const handleClassSelection = (classId: string) => {
    setSelectedClassIds((prev) =>
      prev.includes(classId)
        ? prev.filter((id) => id !== classId)
        : [...prev, classId]
    );
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!title || !content || selectedClassIds.length === 0) {
      toast({
        title: "Error",
        description:
          "Please fill out all fields and select at least one class.",
        variant: "destructive",
      });
      return;
    }
    setIsLoading(true);

    try {
      const response = await fetch("http://localhost:3001/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content, classIds: selectedClassIds }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit announcement.");
      }

      toast({
        title: "Success",
        description: "Announcement submitted successfully for approval!",
      });
      // Reset form
      setTitle("");
      setContent("");
      setSelectedClassIds([]);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create New Announcement</CardTitle>
        <CardDescription>
          Compose a new announcement and select the classes that should receive
          it.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g., Upcoming P.T.A. Meeting"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Content</Label>
            <Textarea
              id="content"
              rows={8}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Enter the full details of the announcement here..."
              required
            />
          </div>

          {/* Class selection section */}
          <div className="space-y-2">
            <Label>Select Classes</Label>
            <div className="rounded-md border p-4 space-y-2">
              {taughtClasses.length > 0 ? (
                taughtClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={cls.id}
                      checked={selectedClassIds.includes(cls.id)}
                      onCheckedChange={() => handleClassSelection(cls.id)}
                    />
                    <Label htmlFor={cls.id} className="font-normal">
                      {cls.name}
                    </Label>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">
                  You are not currently assigned to any classes to make an
                  announcement.
                </p>
              )}
            </div>
          </div>
          <div>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Submitting..." : "Submit for Approval"}
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
