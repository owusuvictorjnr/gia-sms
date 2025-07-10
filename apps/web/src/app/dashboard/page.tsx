"use client";

import { useEffect, useState } from "react";

interface UserProfile {
  userId: string;
  email: string;
  role: string;
}

export default function DashboardPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      const token = localStorage.getItem("access_token");
      if (!token) {
        setError("No access token found.");
        return;
      }

      try {
        const response = await fetch("http://localhost:3001/auth/profile", {
          headers: {
            // Attach the token to the Authorization header
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("Failed to fetch profile. Please log in again.");
        }

        const data: UserProfile = await response.json();
        setProfile(data);
      } catch (err: any) {
        setError(err.message);
      }
    };

    fetchProfile();
  }, []);

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  if (!profile) {
    return <div>Loading profile...</div>;
  }

  return (
    <div>
      <h1 className="text-3xl font-bold">Welcome, {profile.email}!</h1>
      <p className="mt-2 text-gray-600">
        Your role is:{" "}
        <span className="font-semibold capitalize">{profile.role}</span>
      </p>

      <div className="mt-8 rounded-lg bg-gray-100 p-4">
        <h3 className="font-semibold">Your User Details:</h3>
        <pre className="mt-2 text-sm">{JSON.stringify(profile, null, 2)}</pre>
      </div>
    </div>
  );
}
