import React, { useState, useEffect } from "react";

interface AdminDashboardProps {
  setView: (view: string) => void;
}

interface DashboardStats {
  totalStudents: number;
  teachers: number;
  pendingApprovals: number;
  revenueToday: number;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function AdminDashboard({ setView }: AdminDashboardProps) {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch(
          "http://localhost:3001/admin/dashboard-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch dashboard stats.");
        const data = await response.json();
        setStats(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (isLoading) return <div>Loading dashboard stats...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome! Here is the school's real-time overview.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {stats?.totalStudents}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Teachers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {stats?.teachers}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Revenue Today</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            GHS {stats?.revenueToday.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-100 p-6 shadow">
          <h3 className="text-sm font-medium text-yellow-800">
            Pending Approvals
          </h3>
          <p className="mt-2 text-3xl font-bold text-yellow-900">
            {stats?.pendingApprovals}
          </p>
          <button
            onClick={() => setView("approvals")}
            className="mt-2 text-sm font-semibold text-yellow-900"
          >
            Review Now →
          </button>
        </div>
      </div>
    </div>
  );
}
