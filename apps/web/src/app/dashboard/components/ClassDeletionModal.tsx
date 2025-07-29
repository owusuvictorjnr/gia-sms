// components/ClassDeletionModal.tsx
"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface ClassAssignments {
  teacherIds: string[];
  studentIds: string[];
  timetableEntriesCount: number;
}

interface ClassDeletionModalProps {
  classToDelete: { id: string; name: string } | null;
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
  onSuccess: () => void;
  allClasses?: { id: string; name: string }[]; // For student transfer
}

export const ClassDeletionModal = ({
  classToDelete,
  isOpen,
  setIsOpen,
  onSuccess,
  allClasses = [],
}: ClassDeletionModalProps) => {
  const { toast } = useToast();
  const [assignments, setAssignments] = useState<ClassAssignments | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [step, setStep] = useState<"check" | "confirm" | "resolve">("check");
  const [targetClassId, setTargetClassId] = useState("");

  useEffect(() => {
    if (isOpen && classToDelete) {
      checkAssignments();
    }
  }, [isOpen, classToDelete]);

  const checkAssignments = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        `/api/classes/${classToDelete?.id}/assignments`
      );
      const data = await response.json();
      setAssignments(data);

      if (
        data.teacherIds.length > 0 ||
        data.studentIds.length > 0 ||
        data.timetableEntriesCount > 0
      ) {
        setStep("resolve");
      } else {
        setStep("confirm");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to check class assignments",
        variant: "destructive",
      });
      setIsOpen(false);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForceDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes/${classToDelete?.id}`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          force: true,
          moveStudentsTo: targetClassId || null,
          unassignTeachers: true,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Deletion failed");
      }

      toast({
        title: "Success",
        description: `Class ${classToDelete?.name} deleted successfully`,
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegularDelete = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/classes/${classToDelete?.id}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Deletion failed");
      }

      toast({
        title: "Success",
        description: `Class ${classToDelete?.name} deleted`,
      });
      onSuccess();
      setIsOpen(false);
    } catch (error) {
      toast({
        title: "Error",
        description:
          typeof error === "object" && error !== null && "message" in error
            ? (error as { message: string }).message
            : String(error),
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Delete {classToDelete?.name}</DialogTitle>
          <DialogDescription>
            {step === "check" && "Checking for assigned users..."}
            {step === "confirm" && "Confirm permanent deletion"}
            {step === "resolve" && "Resolve assignments before deletion"}
          </DialogDescription>
        </DialogHeader>

        {isLoading && <div className="py-4 text-center">Loading...</div>}

        {!isLoading && step === "resolve" && assignments && (
          <div className="space-y-6">
            {assignments.teacherIds.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">
                  Assigned Teachers ({assignments.teacherIds.length})
                </h4>
                <p className="text-sm text-muted-foreground">
                  All teachers will be unassigned automatically
                </p>
              </div>
            )}

            {assignments.studentIds.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">
                  Assigned Students ({assignments.studentIds.length})
                </h4>
                <div className="flex items-center gap-2">
                  <select
                    value={targetClassId}
                    onChange={(e) => setTargetClassId(e.target.value)}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  >
                    <option value="">Select target class (optional)</option>
                    {allClasses
                      .filter((c) => c.id !== classToDelete?.id)
                      .map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                  </select>
                </div>
                <p className="text-sm text-muted-foreground">
                  {targetClassId
                    ? `Students will be moved to selected class`
                    : "Students will be unassigned if no class is selected"}
                </p>
              </div>
            )}

            {assignments.timetableEntriesCount > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium">Timetable Entries</h4>
                <p className="text-sm text-muted-foreground">
                  {assignments.timetableEntriesCount} entries will be deleted
                </p>
              </div>
            )}

            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <p className="font-medium">
                Warning: This action cannot be undone
              </p>
              <p className="text-sm">
                All assignments and timetable entries will be permanently
                removed
              </p>
            </div>
          </div>
        )}

        {!isLoading && step === "confirm" && (
          <div className="space-y-4">
            <p>Are you sure you want to permanently delete this class?</p>
            <div className="rounded-lg bg-yellow-50 p-4 text-yellow-800">
              <p className="text-sm">This action cannot be undone</p>
            </div>
          </div>
        )}

        <DialogFooter>
          {step === "confirm" && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleRegularDelete}
                disabled={isLoading}
              >
                Confirm Delete
              </Button>
            </>
          )}
          {step === "resolve" && (
            <>
              <Button variant="outline" onClick={() => setIsOpen(false)}>
                Cancel
              </Button>
              <Button
                variant="destructive"
                onClick={handleForceDelete}
                disabled={isLoading}
              >
                Force Delete
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
