"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import AdminDashboard from "./components/AdminDashboard";
import TeacherDashboard from "./components/TeacherDashboard";
import ParentDashboard from "./components/ParentDashboard";
import AccountantDashboard from "./components/AccountantDashboard";
import RollCallPage from "./components/RollCallPage";
import GradebookPage from "./components/GradebookPage";
import ApprovalsPage from "./components/ApprovalsPage";
import LinkParentChildPage from "./components/LinkParentChildPage";
import CreateAnnouncementPage from "./components/CreateAnnouncementPage";
import FinancePage from "./components/FinancePage";
import TransactionsPage from "./components/TransactionsPage";
import AnnouncementsPage from "./components/AnnouncementsPage";
import UserManagementPage from "./components/UserManagementPage";
import ClassManagementPage from "./components/ClassManagementPage";
import TimetablePage from "./components/TimetablePage";
import TimetableManagementPage from "./components/TimetableManagementPage"; // Import the new admin page
import CalendarPage from "./components/CalendarPage";
import CalendarManagementPage from "./components/CalendarManagementPage";
import HealthRecordPage from "./components/HealthRecordPage";
import { Toaster } from "@/components/ui/toaster";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
  firstName?: string;
  lastName?: string;
}

export default function DashboardLayout() {
  const router = useRouter();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isVerifying, setIsVerifying] = useState(true);
  const [activeView, setActiveView] = useState("dashboard");

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.replace("/login");
      return;
    }

    const fetchProfile = async () => {
      try {
        const response = await fetch("http://localhost:3001/auth/profile", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Session expired");
        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (error) {
        router.replace("/login");
      } finally {
        setIsVerifying(false);
      }
    };

    fetchProfile();
  }, [router]);

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  const renderActiveView = () => {
    if (!profile) return null;
    switch (activeView) {
      case "dashboard":
        switch (profile.role) {
          case "admin":
            return <AdminDashboard setView={setActiveView} />;
          case "teacher":
            return (
              <TeacherDashboard setView={setActiveView} profile={profile} />
            );
          case "parent":
            return <ParentDashboard />;
          case "accountant":
            return <AccountantDashboard setView={setActiveView} />;
          default:
            return <p>No dashboard for your role.</p>;
        }
      case "roll-call":
        return <RollCallPage />;
      case "gradebook":
        return <GradebookPage />;
      case "approvals":
        return <ApprovalsPage />;
      case "link-users":
        return <LinkParentChildPage />;
      case "create-announcement":
        return <CreateAnnouncementPage />;
      case "finance":
        return <FinancePage />;
      case "transactions":
        return <TransactionsPage />;
      case "announcements":
        return <AnnouncementsPage />;
      case "user-management":
        return <UserManagementPage />;
      case "class-management":
        return <ClassManagementPage />;
      case "timetable":
        // Show the correct timetable page based on the user's role
        if (profile.role === "admin" || profile.role === "accountant") {
          return <TimetableManagementPage />;
        }
        return <TimetablePage />;
      case "calendar":
        if (profile.role === "admin") {
          return <CalendarManagementPage />;
        }
        return <CalendarPage />;
      case "health-records":
        return <HealthRecordPage />;
      default:
        return <p>Page not found.</p>;
    }
  };

  if (isVerifying) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden w-64 flex-col bg-gray-800 text-white md:flex">
        <div className="p-6">
          <h1 className="text-2xl font-bold">EduConnect+</h1>
        </div>
        <nav className="mt-6 flex-1">
          <a
            href="#"
            onClick={() => setActiveView("dashboard")}
            className={`block px-6 py-3 ${activeView === "dashboard" ? "bg-gray-900" : ""}`}
          >
            Dashboard
          </a>
          <a
            href="#"
            onClick={() => setActiveView("announcements")}
            className={`block px-6 py-3 ${activeView === "announcements" ? "bg-gray-900" : ""}`}
          >
            Announcements
          </a>
          <a
            href="#"
            onClick={() => setActiveView("timetable")}
            className={`block px-6 py-3 ${activeView === "timetable" ? "bg-gray-900" : ""}`}
          >
            Timetable
          </a>
          <a
            href="#"
            onClick={() => setActiveView("calendar")}
            className={`block px-6 py-3 ${activeView === "calendar" ? "bg-gray-900" : ""}`}
          >
            Calendar
          </a>

          {profile?.role === "teacher" && (
            <>
              <a
                href="#"
                onClick={() => setActiveView("roll-call")}
                className={`block px-6 py-3 ${activeView === "roll-call" ? "bg-gray-900" : ""}`}
              >
                Roll Call
              </a>
              <a
                href="#"
                onClick={() => setActiveView("gradebook")}
                className={`block px-6 py-3 ${activeView === "gradebook" ? "bg-gray-900" : ""}`}
              >
                Gradebook
              </a>
              <a
                href="#"
                onClick={() => setActiveView("create-announcement")}
                className={`block px-6 py-3 ${activeView === "create-announcement" ? "bg-gray-900" : ""}`}
              >
                New Announcement
              </a>
            </>
          )}
          {profile?.role === "admin" && (
            <>
              <a
                href="#"
                onClick={() => setActiveView("health-records")}
                className={`block px-6 py-3 ${activeView === "health-records" ? "bg-gray-900" : ""}`}
              >
                Health Records
              </a>
              <a
                href="#"
                onClick={() => setActiveView("class-management")}
                className={`block px-6 py-3 ${activeView === "class-management" ? "bg-gray-900" : ""}`}
              >
                Class Management
              </a>
              <a
                href="#"
                onClick={() => setActiveView("user-management")}
                className={`block px-6 py-3 ${activeView === "user-management" ? "bg-gray-900" : ""}`}
              >
                User Management
              </a>
              <a
                href="#"
                onClick={() => setActiveView("finance")}
                className={`block px-6 py-3 ${activeView === "finance" ? "bg-gray-900" : ""}`}
              >
                Finance
              </a>
              <a
                href="#"
                onClick={() => setActiveView("transactions")}
                className={`block px-6 py-3 ${activeView === "transactions" ? "bg-gray-900" : ""}`}
              >
                Transactions
              </a>
              <a
                href="#"
                onClick={() => setActiveView("link-users")}
                className={`block px-6 py-3 ${activeView === "link-users" ? "bg-gray-900" : ""}`}
              >
                Link Users
              </a>
              <a
                href="#"
                onClick={() => setActiveView("approvals")}
                className={`block px-6 py-3 ${activeView === "approvals" ? "bg-gray-900" : ""}`}
              >
                Approvals
              </a>
            </>
          )}
          {profile?.role === "accountant" && (
            <>
              <a
                href="#"
                onClick={() => setActiveView("finance")}
                className={`block px-6 py-3 ${activeView === "finance" ? "bg-gray-900" : ""}`}
              >
                Finance
              </a>
              <a
                href="#"
                onClick={() => setActiveView("transactions")}
                className={`block px-6 py-3 ${activeView === "transactions" ? "bg-gray-900" : ""}`}
              >
                Transactions
              </a>
            </>
          )}
        </nav>
        <div className="p-6">
          <p className="text-sm">{profile?.email}</p>
          <button
            onClick={handleLogout}
            className="mt-2 w-full rounded-md bg-red-600 px-4 py-2 text-sm font-medium hover:bg-red-700"
          >
            Log Out
          </button>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">{renderActiveView()}</main>
      <Toaster />
    </div>
  );
}
