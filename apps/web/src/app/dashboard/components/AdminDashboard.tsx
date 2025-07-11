import React from "react";

interface AdminDashboardProps {
  setView: (view: string) => void;
}

export default function AdminDashboard({ setView }: AdminDashboardProps) {
  // In a real app, this data would come from API calls.
  const schoolStats = {
    totalStudents: 485,
    teachers: 32,
    pendingApprovals: 3,
  };
  const revenueToday = "4,500.00";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome! Here is the school's high-level overview.
        </p>
      </div>

      {/* Main Stats Grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Total Students</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {schoolStats.totalStudents}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Teachers</h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            {schoolStats.teachers}
          </p>
        </div>
        <div className="rounded-lg bg-white p-6 shadow">
          <h3 className="text-sm font-medium text-gray-500">Revenue Today</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            GHS {revenueToday}
          </p>
        </div>
        <div className="rounded-lg bg-yellow-100 p-6 shadow">
          <h3 className="text-sm font-medium text-yellow-800">
            Pending Approvals
          </h3>
          <p className="mt-2 text-3xl font-bold text-yellow-900">
            {schoolStats.pendingApprovals}
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
