"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";

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
  const { toast } = useToast();

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
      toast({
        title: "Success",
        description: "Fee structure created successfully!",
      });
      setFsName("");
      setFsDescription("");
      setFsAmount("");
      setFsYear("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleCreateInvoice = async (e: FormEvent) => {
    e.preventDefault();
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
      toast({ title: "Success", description: "Invoice created successfully!" });
      setInvStudent("");
      setInvFeeStructure("");
      setInvDueDate("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  if (isLoading) return <div>Loading finance module...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="space-y-8">
      {/* Create Fee Structure Section */}
      <Card>
        <CardHeader>
          <CardTitle>Manage Fee Structures</CardTitle>
          <CardDescription>
            Create reusable fee items that can be assigned to students.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleCreateFeeStructure} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fs-name">Fee Name</Label>
                <Input
                  id="fs-name"
                  value={fsName}
                  onChange={(e) => setFsName(e.target.value)}
                  placeholder="e.g., Term 1 Fees"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fs-year">Academic Year</Label>
                <Input
                  id="fs-year"
                  value={fsYear}
                  onChange={(e) => setFsYear(e.target.value)}
                  placeholder="e.g., 2024/2025"
                  required
                />
              </div>
              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="fs-desc">Description</Label>
                <Textarea
                  id="fs-desc"
                  value={fsDescription}
                  onChange={(e) => setFsDescription(e.target.value)}
                  placeholder="Description"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fs-amount">Amount (GHS)</Label>
                <Input
                  id="fs-amount"
                  type="number"
                  value={fsAmount}
                  onChange={(e) => setFsAmount(e.target.value)}
                  placeholder="e.g., 1500.00"
                  required
                />
              </div>
            </div>
            <Button type="submit">Create Fee Structure</Button>
          </form>
        </CardContent>
      </Card>

      {/* Create Invoice Section */}
      <Card>
        <CardHeader>
          <CardTitle>Generate New Invoice</CardTitle>
          <CardDescription>
            Assign a fee structure to a student to create an invoice.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={handleCreateInvoice}
            className="grid grid-cols-1 gap-4 md:grid-cols-3"
          >
            <div className="space-y-2">
              <Label htmlFor="inv-student">Student</Label>
              <Select onValueChange={setInvStudent} value={invStudent}>
                <SelectTrigger id="inv-student">
                  <SelectValue placeholder="Select Student..." />
                </SelectTrigger>
                <SelectContent>
                  {students.map((s) => (
                    <SelectItem key={s.id} value={s.id}>
                      {s.firstName} {s.lastName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-fs">Fee Structure</Label>
              <Select
                onValueChange={setInvFeeStructure}
                value={invFeeStructure}
              >
                <SelectTrigger id="inv-fs">
                  <SelectValue placeholder="Select Fee..." />
                </SelectTrigger>
                <SelectContent>
                  {feeStructures.map((fs) => (
                    <SelectItem key={fs.id} value={fs.id}>
                      {fs.name} (GHS {fs.amount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="inv-due">Due Date</Label>
              <Input
                id="inv-due"
                type="date"
                value={invDueDate}
                onChange={(e) => setInvDueDate(e.target.value)}
                required
              />
            </div>
            <div className="md:col-span-3">
              <Button type="submit">Generate Invoice</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
