import { useState } from "react";

// Define the shape of the user data for this component
interface UserSearchResult {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

/**
 * LinkParentChildPage component allows admins to link a parent to a child.
 * It provides search functionality for both parents and students,
 * and allows linking them together.
 */
export default function LinkParentChildPage() {
  const [parentQuery, setParentQuery] = useState("");
  const [studentQuery, setStudentQuery] = useState("");

  const [parentResults, setParentResults] = useState<UserSearchResult[]>([]);
  const [studentResults, setStudentResults] = useState<UserSearchResult[]>([]);

  const [selectedParent, setSelectedParent] = useState<UserSearchResult | null>(
    null
  );
  const [selectedStudent, setSelectedStudent] =
    useState<UserSearchResult | null>(null);

  const [message, setMessage] = useState("");

  const handleSearch = async (role: "parent" | "student", query: string) => {
    if (query.length < 2) return; // Don't search for less than 2 characters
    const token = getAuthToken();
    try {
      const response = await fetch(
        `http://localhost:3001/admin/search-users?role=${role}&query=${query}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      if (!response.ok) throw new Error(`Failed to search for ${role}s.`);
      const data = await response.json();
      if (role === "parent") {
        setParentResults(data);
      } else {
        setStudentResults(data);
      }
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const handleLink = async () => {
    if (!selectedParent || !selectedStudent) {
      setMessage("Please select both a parent and a student.");
      return;
    }
    const token = getAuthToken();
    setMessage("Linking...");
    try {
      const response = await fetch(
        "http://localhost:3001/admin/link-parent-child",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            parentId: selectedParent.id,
            childId: selectedStudent.id,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to link users.");

      setMessage(
        `Successfully linked ${selectedParent.firstName} to ${selectedStudent.firstName}!`
      );
      // Clear selections after successful linking
      setSelectedParent(null);
      setSelectedStudent(null);
      setParentQuery("");
      setStudentQuery("");
      setParentResults([]);
      setStudentResults([]);
    } catch (error: any) {
      setMessage(error.message);
    }
  };

  const renderUser = (user: UserSearchResult) =>
    `${user.firstName} ${user.lastName} (${user.email})`;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
        Link Parent to Child
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        {/* Parent Search */}
        <div>
          <h3 className="font-semibold">1. Find Parent</h3>
          <input
            type="text"
            value={parentQuery}
            onChange={(e) => {
              setParentQuery(e.target.value);
              handleSearch("parent", e.target.value);
            }}
            placeholder="Search by parent name or email..."
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <ul className="mt-2 h-32 overflow-y-auto rounded-md border">
            {parentResults.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  setSelectedParent(user);
                  setParentResults([]);
                }}
                className="cursor-pointer p-2 hover:bg-indigo-100"
              >
                {renderUser(user)}
              </li>
            ))}
          </ul>
        </div>

        {/* Student Search */}
        <div>
          <h3 className="font-semibold">2. Find Student</h3>
          <input
            type="text"
            value={studentQuery}
            onChange={(e) => {
              setStudentQuery(e.target.value);
              handleSearch("student", e.target.value);
            }}
            placeholder="Search by student name or email..."
            className="mt-2 w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
          />
          <ul className="mt-2 h-32 overflow-y-auto rounded-md border">
            {studentResults.map((user) => (
              <li
                key={user.id}
                onClick={() => {
                  setSelectedStudent(user);
                  setStudentResults([]);
                }}
                className="cursor-pointer p-2 hover:bg-indigo-100"
              >
                {renderUser(user)}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Selections and Link Button */}
      <div className="mt-6 border-t pt-6">
        <div className="mb-4">
          <p>
            <span className="font-semibold">Selected Parent:</span>{" "}
            {selectedParent ? renderUser(selectedParent) : "None"}
          </p>
          <p>
            <span className="font-semibold">Selected Student:</span>{" "}
            {selectedStudent ? renderUser(selectedStudent) : "None"}
          </p>
        </div>
        <button
          onClick={handleLink}
          disabled={!selectedParent || !selectedStudent}
          className="w-full rounded-md bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700 disabled:bg-gray-400 sm:w-auto sm:px-8"
        >
          Link Parent to Child
        </button>
        {message && (
          <p className="mt-4 text-sm font-medium text-gray-700">{message}</p>
        )}
      </div>
    </div>
  );
}
