import { useState, useEffect } from "react";

// Define the shape of the announcement data
interface Announcement {
  id: string;
  title: string;
  content: string;
  createdAt: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchAnnouncements = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:3001/announcements/approved",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch announcements.");

        const data = await response.json();
        setAnnouncements(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAnnouncements();
  }, []);

  if (isLoading) return <div>Loading announcements...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          School Announcements
        </h2>
        {announcements.length > 0 ? (
          <div className="space-y-6">
            {announcements.map((item) => (
              <div key={item.id} className="rounded-lg border bg-gray-50 p-4">
                <h3 className="text-lg font-bold text-gray-900">
                  {item.title}
                </h3>
                <p className="mt-2 text-sm text-gray-700">{item.content}</p>
                <div className="mt-4 text-xs text-gray-500">
                  <span>
                    Posted by: {item.author.firstName} {item.author.lastName}
                  </span>
                  <span className="mx-2">|</span>
                  <span>
                    Date: {new Date(item.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              No Announcements
            </h3>
            <p className="mt-1 text-gray-500">
              There are currently no school-wide announcements.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
