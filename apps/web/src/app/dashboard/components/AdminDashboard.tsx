export default function AdminDashboard() {
  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="text-2xl font-bold text-gray-800">Admin Dashboard</h2>
      <p className="mt-2 text-gray-600">
        Welcome, Administrator. Here you can manage users, approve content, and
        view school-wide analytics.
      </p>
      {/* We will add admin-specific widgets here later */}
    </div>
  );
}
