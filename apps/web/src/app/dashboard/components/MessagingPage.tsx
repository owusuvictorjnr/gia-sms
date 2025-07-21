"use client";

import { useState, useEffect, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";

// Define data shapes
interface Participant {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}
interface Message {
  id: string;
  content: string;
  createdAt: string;
  sender: Participant;
}
interface Conversation {
  id: string;
  participants: Participant[];
  messages: Message[];
}
interface UserProfile {
  userId: string;
}

const getAuthToken = (): string | null => {
  if (typeof window !== "undefined")
    return localStorage.getItem("access_token");
  return null;
};

// --- New Conversation Modal ---
const NewConversationModal = ({
  isOpen,
  setIsOpen,
  onConversationCreated,
}: {
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
  onConversationCreated: () => void;
}) => {
  const [recipientQuery, setRecipientQuery] = useState("");
  const [recipientResults, setRecipientResults] = useState<Participant[]>([]);
  const [selectedRecipient, setSelectedRecipient] =
    useState<Participant | null>(null);
  const [initialMessage, setInitialMessage] = useState("");
  const { toast } = useToast();

  const handleSearch = async (query: string) => {
    setRecipientQuery(query);
    if (query.length < 2) {
      setRecipientResults([]);
      return;
    }
    const token = getAuthToken();
    try {
      // FIX: Call the new, correct search endpoint
      const res = await fetch(
        `http://localhost:3001/users/search?query=${query}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!res.ok) throw new Error("Failed to search for users.");
      const data = await res.json();
      setRecipientResults(data);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedRecipient || !initialMessage.trim()) {
      toast({
        title: "Error",
        description: "Please select a recipient and write a message.",
        variant: "destructive",
      });
      return;
    }
    const token = getAuthToken();
    try {
      const response = await fetch(
        "http://localhost:3001/messaging/conversations",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            participantIds: [selectedRecipient.id],
            initialMessage,
          }),
        }
      );
      if (!response.ok) throw new Error("Failed to start conversation.");
      toast({
        title: "Success",
        description: "Conversation started successfully!",
      });
      onConversationCreated();
      setIsOpen(false);
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Start a New Conversation</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="recipient-search">To:</Label>
            <Input
              id="recipient-search"
              value={recipientQuery}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="Search for a user..."
            />
            {recipientResults.length > 0 && (
              <div className="mt-2 max-h-40 overflow-y-auto rounded-md border">
                {recipientResults.map((user) => (
                  <div
                    key={user.id}
                    onClick={() => {
                      setSelectedRecipient(user);
                      setRecipientResults([]);
                      setRecipientQuery(`${user.firstName} ${user.lastName}`);
                    }}
                    className="cursor-pointer p-2 hover:bg-gray-100"
                  >
                    {user.firstName} {user.lastName} ({user.email})
                  </div>
                ))}
              </div>
            )}
          </div>
          <div>
            <Label htmlFor="initial-message">Message:</Label>
            <Textarea
              id="initial-message"
              value={initialMessage}
              onChange={(e) => setInitialMessage(e.target.value)}
              placeholder="Type your message..."
              required
            />
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </DialogClose>
            <Button type="submit">Send Message</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};

// --- Main Messaging Page Component ---
export default function MessagingPage({
  profile,
}: {
  profile: UserProfile | null;
}) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [newMessage, setNewMessage] = useState("");
  const [isNewConvoModalOpen, setIsNewConvoModalOpen] = useState(false);
  const { toast } = useToast();

  const fetchConversations = async () => {
    const token = getAuthToken();
    if (!token) {
      setError("Authentication error.");
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const response = await fetch(
        "http://localhost:3001/messaging/my-conversations",
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (!response.ok) throw new Error("Failed to fetch conversations.");
      const data = await response.json();
      setConversations(data);
      if (data.length > 0 && !selectedConversation) {
        setSelectedConversation(data[0]);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchConversations();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;
    const token = getAuthToken();
    try {
      const response = await fetch("http://localhost:3001/messaging/messages", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          conversationId: selectedConversation.id,
          content: newMessage,
        }),
      });
      if (!response.ok) throw new Error("Failed to send message.");
      const sentMessage = await response.json();

      setSelectedConversation((prev) =>
        prev ? { ...prev, messages: [sentMessage, ...prev.messages] } : null
      );
      setNewMessage("");
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
  };

  const getConversationTitle = (conv: Conversation) => {
    if (!profile) return "Conversation";
    const otherParticipants = conv.participants.filter(
      (p) => p.id !== profile.userId
    );
    if (otherParticipants.length === 0) return "Self Conversation";
    return otherParticipants
      .map((p) => `${p.firstName} ${p.lastName}`)
      .join(", ");
  };

  if (isLoading) return <div>Loading messages...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <>
      <NewConversationModal
        isOpen={isNewConvoModalOpen}
        setIsOpen={setIsNewConvoModalOpen}
        onConversationCreated={fetchConversations}
      />
      <Card className="h-[80vh]">
        <CardContent className="grid h-full grid-cols-1 md:grid-cols-3 p-0">
          {/* Conversation List */}
          <div className="flex h-full flex-col border-r">
            <div className="p-4 border-b flex justify-between items-center">
              <h3 className="font-semibold">Conversations</h3>
              <Button size="sm" onClick={() => setIsNewConvoModalOpen(true)}>
                New Message
              </Button>
            </div>
            <div className="flex-1 overflow-y-auto">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`cursor-pointer p-4 border-b ${selectedConversation?.id === conv.id ? "bg-gray-100" : "hover:bg-gray-50"}`}
                >
                  <p className="font-semibold">{getConversationTitle(conv)}</p>
                  <p className="text-sm text-gray-500 truncate">
                    {conv.messages[0]?.content}
                  </p>
                </div>
              ))}
            </div>
          </div>

          {/* Message View */}
          <div className="md:col-span-2 flex h-full flex-col">
            {selectedConversation ? (
              <>
                <div className="p-4 border-b">
                  <h3 className="font-semibold">
                    {getConversationTitle(selectedConversation)}
                  </h3>
                </div>
                <div className="flex-1 space-y-4 overflow-y-auto p-4 flex flex-col-reverse">
                  {selectedConversation.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender.id === profile?.userId ? "justify-end" : "justify-start"}`}
                    >
                      <div
                        className={`max-w-xs rounded-lg p-3 lg:max-w-md ${msg.sender.id === profile?.userId ? "bg-indigo-500 text-white" : "bg-gray-200"}`}
                      >
                        <p className="text-sm">{msg.content}</p>
                        <p
                          className={`text-xs mt-1 text-right ${msg.sender.id === profile?.userId ? "text-indigo-200" : "text-gray-500"}`}
                        >
                          {new Date(msg.createdAt).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="p-4 border-t bg-gray-50">
                  <form onSubmit={handleSendMessage} className="flex space-x-2">
                    <Textarea
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1"
                    />
                    <Button type="submit">Send</Button>
                  </form>
                </div>
              </>
            ) : (
              <div className="flex h-full items-center justify-center text-gray-500">
                Select a conversation to start chatting.
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </>
  );
}
