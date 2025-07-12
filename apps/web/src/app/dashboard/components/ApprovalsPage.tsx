import { useState } from "react";

// In a real app, this would be a more complex type
interface ApprovalItem {
  id: number;
  type: "Announcement" | "Gallery";
  submittedBy: string;
  title: string;
  content: string;
  status: "pending" | "approved" | "rejected";
}

export default function ApprovalsPage() {
  // Mock data - this would be fetched from your API
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([
    {
      id: 1,
      type: "Announcement",
      submittedBy: "Mr. David Annan",
      title: "Field Trip Reminder",
      content:
        "Dear Parents, a quick reminder about the upcoming field trip to the Kakum National Park on July 15th. Please ensure your child brings a packed lunch...",
      status: "pending",
    },
    {
      id: 2,
      type: "Announcement",
      submittedBy: "Mrs. Jane Doe",
      title: "Homework Update",
      content:
        "Please note that the math homework scheduled for this Friday has been postponed to next Monday to give students more time to prepare.",
      status: "pending",
    },
    {
      id: 3,
      type: "Gallery",
      submittedBy: "Mr. David Annan",
      title: "Sports Day Photos",
      content:
        "5 new photos have been uploaded from our annual Sports Day event.",
      status: "pending",
    },
  ]);

  const handleDecision = (
    itemId: number,
    decision: "approved" | "rejected"
  ) => {
    // In a real app, this would send an API request to the backend.
    // Here, we'll just filter the item out of the list for demonstration.
    setApprovalItems(approvalItems.filter((item) => item.id !== itemId));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-lg bg-white p-6 shadow">
        <h2 className="mb-4 border-b pb-4 text-2xl font-bold text-gray-800">
          Content Approvals
        </h2>
        {approvalItems.length > 0 ? (
          <div className="space-y-4">
            {approvalItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  {/* Content Details */}
                  <div className="flex-1">
                    <span
                      className={`text-xs font-semibold uppercase ${item.type === "Announcement" ? "text-blue-600" : "text-purple-600"}`}
                    >
                      {item.type}
                    </span>
                    <h3 className="text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.content}</p>
                    <p className="mt-2 text-xs text-gray-500">
                      Submitted by: {item.submittedBy}
                    </p>
                  </div>
                  {/* Action Buttons */}
                  <div className="flex flex-shrink-0 items-center space-x-3">
                    <button
                      onClick={() => handleDecision(item.id, "approved")}
                      className="rounded-md bg-green-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-green-600"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleDecision(item.id, "rejected")}
                      className="rounded-md bg-red-500 px-4 py-2 font-semibold text-white transition-colors hover:bg-red-600"
                    >
                      Reject
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg bg-gray-50 text-center">
            <h3 className="text-lg font-semibold text-gray-700">
              All Caught Up!
            </h3>
            <p className="mt-1 text-gray-500">
              There are no pending items that require your approval.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
