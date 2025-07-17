import { useState, useEffect } from "react";

// Define data shapes
interface Invoice {
  id: string;
  status: "unpaid" | "paid" | "overdue";
  dueDate: string;
  issuedAt: string;
  student: {
    firstName: string;
    lastName: string;
  };
  feeStructure: {
    name: string;
    amount: string; // The amount comes from the API as a string
  };
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== "undefined") {
    return localStorage.getItem("access_token");
  }
  return null;
};

export default function TransactionsPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchInvoices = async () => {
      const token = getAuthToken();
      if (!token) {
        setError("Authentication error.");
        setIsLoading(false);
        return;
      }
      try {
        const response = await fetch("http://localhost:3001/finance/invoices", {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!response.ok) throw new Error("Failed to fetch invoices.");

        const data = await response.json();
        setInvoices(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  const getStatusClass = (status: string) => {
    switch (status) {
      case "paid":
        return "bg-green-100 text-green-800";
      case "unpaid":
        return "bg-yellow-100 text-yellow-800";
      case "overdue":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="rounded-lg bg-white p-6 shadow">
      <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
        All Invoices / Transactions
      </h2>
      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold">Student</th>
              <th className="p-4 font-semibold">Invoice For</th>
              <th className="p-4 font-semibold">Amount (GHS)</th>
              <th className="p-4 font-semibold">Due Date</th>
              <th className="p-4 font-semibold">Status</th>
            </tr>
          </thead>
          <tbody>
            {invoices.map((invoice) => (
              <tr key={invoice.id} className="border-b hover:bg-gray-50">
                <td className="p-4">
                  {invoice.student.firstName} {invoice.student.lastName}
                </td>
                <td className="p-4">{invoice.feeStructure.name}</td>
                <td className="p-4 font-medium">
                  {/* FIX: Convert the string to a number before calling toFixed */}
                  {parseFloat(invoice.feeStructure.amount).toFixed(2)}
                </td>
                <td className="p-4">
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </td>
                <td className="p-4">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${getStatusClass(invoice.status)}`}
                  >
                    {invoice.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
