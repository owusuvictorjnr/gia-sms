import { useState, useEffect } from "react";

// ParentDashboard component displays a parent's dashboard with their children's information, grades, and attendance summary.
// It fetches data from the API and allows parents to view their children's progress.
// This component assumes the parent is authenticated and has access to their children's data.

// Define the shapes of our data
interface Child {
  id: string;
  firstName: string;
  lastName: string;
  middleName?: string;
}

interface Grade {
  id: string;
  assessment: string;
  score: string;
  subject: string;
}

interface AttendanceSummary {
  present: number;
  absent: number;
  late: number;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function ParentDashboard() {
  const [children, setChildren] = useState<Child[]>([]);
  const [selectedChildId, setSelectedChildId] = useState<string | null>(null);

  const [grades, setGrades] = useState<Grade[]>([]);
  const [attendance, setAttendance] = useState<AttendanceSummary | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  // Fetch the parent's children when the component first loads
  useEffect(() => {
    const fetchChildren = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error. Please log in again.");
        setIsLoading(false);
        return;
      }

      try {
        const response = await fetch(
          "http://localhost:3001/parent/my-children",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        if (!response.ok)
          throw new Error("Failed to fetch your children's data.");

        const data: Child[] = await response.json();
        setChildren(data);

        if (data.length > 0) {
          setSelectedChildId(data[0].id); // Select the first child by default
        }
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchChildren();
  }, []);

  // Fetch data for the selected child whenever the selection changes
  useEffect(() => {
    if (!selectedChildId) return;

    const fetchChildData = async () => {
      const token = getAuthToken();
      if (!token) return;

      try {
        // Fetch grades and attendance summary in parallel
        const [gradesRes, attendanceRes] = await Promise.all([
          fetch(
            `http://localhost:3001/parent/child/${selectedChildId}/grades`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
          fetch(
            `http://localhost:3001/parent/child/${selectedChildId}/attendance-summary`,
            {
              headers: { Authorization: `Bearer ${token}` },
            }
          ),
        ]);

        if (!gradesRes.ok) throw new Error("Failed to fetch grades.");
        if (!attendanceRes.ok)
          throw new Error("Failed to fetch attendance summary.");

        const gradesData = await gradesRes.json();
        const attendanceData = await attendanceRes.json();

        setGrades(gradesData);
        setAttendance(attendanceData);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchChildData();
  }, [selectedChildId]);

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Parent Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome! Here is a summary of your child's progress and account
          status.
        </p>
      </div>

      {children.length > 0 ? (
        <div>
          <label
            htmlFor="child-selector"
            className="block text-sm font-medium text-gray-700"
          >
            Viewing profile for:
          </label>
          <select
            id="child-selector"
            className="mt-1 block w-full rounded-md border-gray-300 py-2 pl-3 pr-10 text-base focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm md:w-1/3"
            value={selectedChildId || ""}
            onChange={(e) => setSelectedChildId(e.target.value)}
          >
            {children.map((child) => (
              <option key={child.id} value={child.id}>
                {[child.firstName, child.middleName, child.lastName]
                  .filter(Boolean)
                  .join(" ")}
              </option>
            ))}
          </select>
        </div>
      ) : (
        <div className="rounded-md bg-blue-50 p-4 text-center">
          <p className="text-sm text-blue-700">
            No children have been linked to your account yet. Please contact the
            school administration.
          </p>
        </div>
      )}

      {selectedChildId && (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="transform rounded-lg border-l-4 border-red-500 bg-white p-6 shadow transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-700">
              Outstanding Balance
            </h3>
            <p className="mt-2 text-3xl font-bold text-gray-800">
              GHS 1,500.00
            </p>
            <p className="text-sm text-gray-500">Due: July 15, 2025</p>
            <button className="mt-4 w-full rounded-md bg-red-500 py-2 font-semibold text-white hover:bg-red-600">
              Pay Now
            </button>
          </div>

          <div className="transform rounded-lg bg-white p-6 shadow transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-700">
              Recent Grades
            </h3>
            {grades.length > 0 ? (
              <ul className="mt-2 space-y-2">
                {grades.map((grade) => (
                  <li key={grade.id} className="flex justify-between">
                    <span>{grade.assessment}</span>
                    <span className="font-bold">{grade.score}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-2 text-sm text-gray-500">No grades found.</p>
            )}
          </div>

          <div className="transform rounded-lg bg-white p-6 shadow transition-transform hover:scale-105">
            <h3 className="text-lg font-semibold text-gray-700">
              Attendance (Term)
            </h3>
            {attendance ? (
              <div className="mt-2 flex justify-around text-center">
                <div>
                  <p className="text-3xl font-bold text-green-600">
                    {attendance.present}
                  </p>
                  <p className="text-sm text-gray-500">Present</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-red-600">
                    {attendance.absent}
                  </p>
                  <p className="text-sm text-gray-500">Absent</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-yellow-500">
                    {attendance.late}
                  </p>
                  <p className="text-sm text-gray-500">Late</p>
                </div>
              </div>
            ) : (
              <p className="mt-2 text-sm text-gray-500">
                No attendance data found.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
