'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AnnouncementStatus } from 'shared-types/src/announcement-status.enum';
import { useToast } from '@/hooks/use-toast';

// Define the shape of the data from the API
interface ApprovalItem {
  id: string;
  title: string;
  content: string;
  author: {
    firstName: string;
    lastName: string;
  };
}

// Helper function to get the auth token
const getAuthToken = (): string | null => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('access_token');
  }
  return null;
};

// Main component for the Approvals page
// This component fetches pending announcements and allows admins to approve or reject them
// It displays a list of announcements with options to approve or reject each one
// The component handles loading states and error messages
// It uses the shared AnnouncementStatus enum for consistency with the backend
// The approval items are displayed in a card-like format with action buttons
// After an action is taken, the item is removed from the list
// If there are no pending items, a message is displayed indicating that everything is up to date
export default function ApprovalsPage() {
  const [approvalItems, setApprovalItems] = useState<ApprovalItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const { toast } = useToast();

  const fetchPendingAnnouncements = async () => {
    const token = getAuthToken();
    if (!token) {
      setError('Authentication error. Please log in again.');
      setIsLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/announcements/pending', {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!response.ok) {
        throw new Error('Failed to fetch pending announcements.');
      }

      const data = await response.json();
      setApprovalItems(data);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPendingAnnouncements();
  }, []);

  const handleDecision = async (itemId: string, decision: 'approved' | 'rejected') => {
    const token = getAuthToken();
    const newStatus = decision === 'approved' ? AnnouncementStatus.APPROVED : AnnouncementStatus.REJECTED;

    try {
      const response = await fetch(`http://localhost:3001/announcements/${itemId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error(`Failed to ${decision} the item.`);
      }

      setApprovalItems(prevItems => prevItems.filter(item => item.id !== itemId));
      toast({ title: "Success", description: `Announcement has been ${decision}.` });
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  if (isLoading) return <div>Loading approvals...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Content Approvals</CardTitle>
        <CardDescription>Review and approve or reject content submitted by teachers.</CardDescription>
      </CardHeader>
      <CardContent>
        {approvalItems.length > 0 ? (
          <div className="space-y-4">
            {approvalItems.map((item) => (
              <div key={item.id} className="rounded-lg border p-4">
                <div className="flex flex-col justify-between gap-4 sm:flex-row">
                  <div className="flex-1">
                    <Badge variant="secondary">Announcement</Badge>
                    <h3 className="mt-2 text-lg font-bold">{item.title}</h3>
                    <p className="mt-1 text-sm text-gray-600">{item.content}</p>
                    <p className="mt-2 text-xs text-gray-500">Submitted by: {item.author.firstName} {item.author.lastName}</p>
                  </div>
                  <div className="flex flex-shrink-0 items-center space-x-3">
                    <Button onClick={() => handleDecision(item.id, 'approved')} size="sm">Approve</Button>
                    <Button onClick={() => handleDecision(item.id, 'rejected')} variant="destructive" size="sm">Reject</Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex h-48 flex-col items-center justify-center rounded-lg bg-gray-50 text-center">
            <h3 className="text-lg font-semibold text-gray-700">All Caught Up!</h3>
            <p className="mt-1 text-gray-500">There are no pending items that require your approval.</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
