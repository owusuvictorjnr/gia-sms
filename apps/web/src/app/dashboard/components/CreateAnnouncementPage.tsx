import { useState, FormEvent } from "react";

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};


// Main component for creating a new announcement
// This component allows teachers to create announcements that will be submitted for admin approval
// It includes a form with fields for title and content, and handles submission to the API
// The component manages loading states and error messages
// After submission, it resets the form and displays a success message
// The announcement is sent to the backend where it will be stored with a status of PENDING
// The announcement will later be approved or rejected by an admin
export default function CreateAnnouncementPage() {
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [message, setMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    const token = getAuthToken();
    if (!title || !content || !token) {
      setMessage("Please fill out all fields.");
      return;
    }
    setIsLoading(true);
    setMessage("");

    try {
      const response = await fetch("http://localhost:3001/announcements", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title, content }),
      });

      if (!response.ok) {
        throw new Error("Failed to submit announcement.");
      }

      setMessage("Announcement submitted successfully for approval!");
      // Reset form
      setTitle("");
      setContent("");
    } catch (err: any) {
      setMessage(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
        Create New Announcement
      </h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="title"
            className="block text-sm font-medium text-gray-700"
          >
            Title
          </label>
          <input
            type="text"
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Upcoming P.T.A. Meeting"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <label
            htmlFor="content"
            className="block text-sm font-medium text-gray-700"
          >
            Content
          </label>
          <textarea
            id="content"
            rows={6}
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Enter the full details of the announcement here..."
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
        </div>
        <div>
          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400 sm:w-auto sm:px-8"
          >
            {isLoading ? "Submitting..." : "Submit for Approval"}
          </button>
        </div>
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
      </form>
    </div>
  );
}
