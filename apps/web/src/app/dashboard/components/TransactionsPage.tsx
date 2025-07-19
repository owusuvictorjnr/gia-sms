"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge"; // We'll use the Badge component for status

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

  const getStatusVariant = (
    status: string
  ): "default" | "destructive" | "secondary" => {
    switch (status) {
      case "paid":
        return "default"; // Green for paid
      case "unpaid":
        return "destructive"; // Red for unpaid
      case "overdue":
        return "destructive"; // Red for overdue
      default:
        return "secondary";
    }
  };

  if (isLoading) return <div>Loading transactions...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>All Invoices / Transactions</CardTitle>
        <CardDescription>
          A complete log of all invoices generated in the system.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Student</TableHead>
              <TableHead>Invoice For</TableHead>
              <TableHead>Amount (GHS)</TableHead>
              <TableHead>Due Date</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {invoices.map((invoice) => (
              <TableRow key={invoice.id}>
                <TableCell className="font-medium">
                  {invoice.student.firstName} {invoice.student.lastName}
                </TableCell>
                <TableCell>{invoice.feeStructure.name}</TableCell>
                <TableCell>
                  {parseFloat(invoice.feeStructure.amount).toFixed(2)}
                </TableCell>
                <TableCell>
                  {new Date(invoice.dueDate).toLocaleDateString()}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={getStatusVariant(invoice.status)}
                    className="capitalize"
                  >
                    {invoice.status}
                  </Badge>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
}
