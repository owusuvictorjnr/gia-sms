import React, { useState, useEffect } from "react";

interface AccountantDashboardProps {
  setView: (view: string) => void;
}

interface AccountantStats {
  outstandingInvoices: number;
  revenueToday: number;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function AccountantDashboard({
  setView,
}: AccountantDashboardProps) {
  const [stats, setStats] = useState<AccountantStats | null>(null);
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
          "http://localhost:3001/admin/accountant-stats",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch accountant stats.");
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

  if (isLoading) return <div>Loading dashboard...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">
          Accountant Dashboard
        </h2>
        <p className="mt-1 text-gray-600">
          Welcome! Manage all financial operations from here.
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Revenue Today</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            GHS {stats?.revenueToday.toFixed(2)}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">
            Outstanding Invoices
          </h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            {stats?.outstandingInvoices}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
        <button
          onClick={() => setView("finance")}
          className="rounded-lg bg-indigo-500 p-6 text-left text-white shadow transition-transform hover:scale-105"
        >
          <h3 className="text-lg font-semibold">Manage Fees & Invoices</h3>
          <p className="mt-1 text-sm opacity-80">
            Create new fee structures and generate invoices for students.
          </p>
        </button>
        <button
          onClick={() => setView("transactions")}
          className="rounded-lg bg-blue-500 p-6 text-left text-white shadow transition-transform hover:scale-105"
        >
          <h3 className="text-lg font-semibold">View All Transactions</h3>
          <p className="mt-1 text-sm opacity-80">
            See a complete log of all invoices and their payment status.
          </p>
        </button>
      </div>
    </div>
  );
}
