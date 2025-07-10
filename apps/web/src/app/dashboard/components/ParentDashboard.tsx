export default function ParentDashboard() {
  // In a real application, this data would come from API calls.
  const outstandingBalance = "1,500.00";
  const dueDate = "July 15, 2025";

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-800">Parent Dashboard</h2>
        <p className="mt-1 text-gray-600">
          Welcome! Here is a summary of your child's progress and account
          status.
        </p>
      </div>

      {/* Main Widgets Grid */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Financial Overview Widget */}
        <div className="transform rounded-lg border-l-4 border-red-500 bg-white p-6 shadow transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700">
            Outstanding Balance
          </h3>
          <p className="mt-2 text-3xl font-bold text-gray-800">
            GHS {outstandingBalance}
          </p>
          <p className="text-sm text-gray-500">Due: {dueDate}</p>
          <button className="mt-4 w-full rounded-md bg-red-500 py-2 font-semibold text-white hover:bg-red-600">
            Pay Now
          </button>
        </div>

        {/* Recent Grades Widget */}
        <div className="transform rounded-lg bg-white p-6 shadow transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700">Recent Grades</h3>
          <ul className="mt-2 space-y-2">
            <li className="flex justify-between">
              <span>Mathematics Test</span>
              <span className="font-bold text-green-600">85%</span>
            </li>
            <li className="flex justify-between">
              <span>English Essay</span>
              <span className="font-bold text-blue-600">A</span>
            </li>
            <li className="flex justify-between">
              <span>Science Project</span>
              <span className="font-bold text-red-500">65%</span>
            </li>
          </ul>
        </div>

        {/* Attendance Summary Widget */}
        <div className="transform rounded-lg bg-white p-6 shadow transition-transform hover:scale-105">
          <h3 className="text-lg font-semibold text-gray-700">
            Attendance (Term)
          </h3>
          <div className="mt-2 flex justify-around text-center">
            <div>
              <p className="text-3xl font-bold text-green-600">58</p>
              <p className="text-sm text-gray-500">Present</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-red-600">2</p>
              <p className="text-sm text-gray-500">Absent</p>
            </div>
            <div>
              <p className="text-3xl font-bold text-yellow-500">1</p>
              <p className="text-sm text-gray-500">Late</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
