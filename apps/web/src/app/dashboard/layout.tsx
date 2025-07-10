"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

// This is a basic layout for the authenticated part of the app.
// It includes a sidebar and a main content area.
// Most importantly, it protects the routes wrapped by it.

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isVerifying, setIsVerifying] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("access_token");
    if (!token) {
      // If no token is found, redirect to the login page.
      router.replace("/login");
    } else {
      // If a token is found, we can stop the loading state.
      // In a real app, you might want to verify the token with the backend here.
      setIsVerifying(false);
    }
  }, [router]);

  if (isVerifying) {
    // You can show a loading spinner here while the token is being verified.
    return (
      <div className="flex h-screen items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  const handleLogout = () => {
    localStorage.removeItem("access_token");
    router.replace("/login");
  };

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="hidden w-64 bg-gray-800 text-white md:block">
        <div className="p-6">
          <h1 className="text-2xl font-bold">EduConnect+</h1>
        </div>
        <nav className="mt-6">
          <a href="#" className="block bg-gray-900 px-6 py-3">
            Dashboard
          </a>
          {/* Add other navigation links here */}
        </nav>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between bg-white p-4 shadow-md">
          <h2 className="text-xl font-semibold">Dashboard</h2>
          <button
            onClick={handleLogout}
            className="rounded-md bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700"
          >
            Log Out
          </button>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
