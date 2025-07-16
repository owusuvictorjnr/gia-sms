import { useState, useEffect, FormEvent } from "react";

// Define data shapes
interface FeeStructure {
  id: string;
  name: string;
  amount: number;
  academicYear: string;
}
interface Student {
  id: string;
  firstName: string;
  lastName: string;
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function FinancePage() {
  const [feeStructures, setFeeStructures] = useState<FeeStructure[]>([]);
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  // State for Create Fee Structure form
  const [fsName, setFsName] = useState("");
  const [fsDescription, setFsDescription] = useState("");
  const [fsAmount, setFsAmount] = useState("");
  const [fsYear, setFsYear] = useState("");

  // State for Create Invoice form
  const [invStudent, setInvStudent] = useState("");
  const [invFeeStructure, setInvFeeStructure] = useState("");
  const [invDueDate, setInvDueDate] = useState("");

  // Fetch initial data (fee structures and students)
  useEffect(() => {
    const fetchData = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const [fsRes, studentsRes] = await Promise.all([
          fetch("http://localhost:3001/finance/fee-structures", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:3001/users/students", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);
        if (!fsRes.ok) throw new Error("Failed to fetch fee structures.");
        if (!studentsRes.ok) throw new Error("Failed to fetch students.");

        const fsData = await fsRes.json();
        const studentsData = await studentsRes.json();

        setFeeStructures(fsData);
        setStudents(studentsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCreateFeeStructure = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const token = getAuthToken();
    try {
      const response = await fetch(
        "http://localhost:3001/finance/fee-structures",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            name: fsName,
            description: fsDescription,
            amount: parseFloat(fsAmount),
            academicYear: fsYear,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to create fee structure.");
      const newFs = await response.json();
      setFeeStructures([...feeStructures, newFs]);
      setMessage("Fee structure created successfully!");
      setFsName("");
      setFsDescription("");
      setFsAmount("");
      setFsYear("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  const handleCreateInvoice = async (e: FormEvent) => {
    e.preventDefault();
    setMessage("");
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:3001/finance/invoices", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          studentId: invStudent,
          feeStructureId: invFeeStructure,
          dueDate: invDueDate,
        }),
      });
      if (!response.ok) throw new Error("Failed to create invoice.");
      setMessage("Invoice created successfully!");
      setInvStudent("");
      setInvFeeStructure("");
      setInvDueDate("");
    } catch (err: any) {
      setMessage(err.message);
    }
  };

  if (isLoading) return <div>Loading finance module...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Create Fee Structure Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Manage Fee Structures
        </h2>
        <form onSubmit={handleCreateFeeStructure} className="space-y-4">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <input
              type="text"
              value={fsName}
              onChange={(e) => setFsName(e.target.value)}
              placeholder="Fee Name (e.g., Term 1 Fees)"
              className="rounded-md border-gray-300"
              required
            />
            <input
              type="text"
              value={fsYear}
              onChange={(e) => setFsYear(e.target.value)}
              placeholder="Academic Year (e.g., 2024/2025)"
              className="rounded-md border-gray-300"
              required
            />
            <textarea
              value={fsDescription}
              onChange={(e) => setFsDescription(e.target.value)}
              placeholder="Description"
              className="rounded-md border-gray-300 md:col-span-2"
              required
            />
            <input
              type="number"
              value={fsAmount}
              onChange={(e) => setFsAmount(e.target.value)}
              placeholder="Amount (GHS)"
              className="rounded-md border-gray-300"
              required
            />
          </div>
          <button
            type="submit"
            className="rounded-md bg-indigo-600 px-4 py-2 font-semibold text-white hover:bg-indigo-700"
          >
            Create Fee Structure
          </button>
        </form>
      </div>

      {/* Create Invoice Section */}
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Generate New Invoice
        </h2>
        <form
          onSubmit={handleCreateInvoice}
          className="grid grid-cols-1 gap-6 md:grid-cols-3"
        >
          <select
            value={invStudent}
            onChange={(e) => setInvStudent(e.target.value)}
            className="rounded-md border-gray-300"
            required
          >
            <option value="">Select Student...</option>
            {students.map((s) => (
              <option key={s.id} value={s.id}>
                {s.firstName} {s.lastName}
              </option>
            ))}
          </select>
          <select
            value={invFeeStructure}
            onChange={(e) => setInvFeeStructure(e.target.value)}
            className="rounded-md border-gray-300"
            required
          >
            <option value="">Select Fee Structure...</option>
            {feeStructures.map((fs) => (
              <option key={fs.id} value={fs.id}>
                {fs.name} (GHS {fs.amount})
              </option>
            ))}
          </select>
          <input
            type="date"
            value={invDueDate}
            onChange={(e) => setInvDueDate(e.target.value)}
            className="rounded-md border-gray-300"
            required
          />
          <div className="md:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-green-600 px-4 py-2 font-semibold text-white hover:bg-green-700"
            >
              Generate Invoice
            </button>
          </div>
        </form>
      </div>
      {message && (
        <p className="mt-4 text-sm font-medium text-center">{message}</p>
      )}
    </div>
  );
}
