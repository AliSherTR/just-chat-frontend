"use client";
import { Button } from "@/components/ui/button";
import { useUser } from "@/context/user.context";
import { ArrowLeft, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToken } from "@/hooks/use-token";
import { toast } from "sonner";

export default function ProfilePage() {
  const { user, setUser } = useUser();
  const router = useRouter();
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [editName, setEditName] = useState(user?.name || "");
  const [editImage, setEditImage] = useState(user?.image || "");
  const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL;
  const { token } = useToken();

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // Update user context with new values
    if (!user) return;

    try {
      const response = await fetch(`${API_URL}/user/update`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ name: editName, image: editImage }),
      });

      const data = await response.json();
      if (data.status !== "success") {
        throw new Error(data.message);
      }
      setUser({
        ...user,
        name: editName,
        image: editImage,
        updatedAt: new Date().toISOString(),
        email: user.email ?? "",
        createdAt: user.createdAt ?? "",
        id: user.id ?? "",
      });
      setIsEditModalOpen(false);
      toast.success(data.message);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  return (
    <div className="w-full h-full px-4 py-8 bg-white">
      <div className="flex items-center justify-between mb-4">
        <Button
          variant={"outline"}
          className="flex gap-3 items-center"
          onClick={() => router.push("/chats")}
        >
          <ArrowLeft
            className="h-4 w-4 dark:text-black text-white"
            color="black"
          />
          <span>Back to Chats</span>
        </Button>
        <Button variant="default" onClick={() => setIsEditModalOpen(true)}>
          Edit Profile
        </Button>
      </div>
      <div className="mt-4">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className="block mx-auto md:mx-0 w-[200px] h-[200px] rounded-full"
          />
        ) : (
          <div className="w-24 h-24 mx-auto md:mx-0 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">
              {user?.name?.charAt(0).toUpperCase() || "B"}
            </span>
          </div>
        )}
        <div className="grid w-[300px] md:w-full md:grid-cols-2 grid-cols-1 mx-auto md:mx-0 gap-y-2.5 mt-4 text-base text-black">
          <div className="flex items-center md:justify-start justify-center gap-2 mt-4">
            <User />
            <h1 className="capitalize">{user?.name}</h1>
          </div>
          <div className="flex items-center gap-2 mt-4 md:justify-start justify-center">
            <Mail />
            <p className="text-gray-600">{user?.email}</p>
          </div>
          <div className="mt-4 md:items-start items-center flex flex-col">
            <p className="text-gray-700 font-medium">Account Updated At</p>
            <p className="text-gray-600">
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleString()
                : "Not provided"}
            </p>
          </div>
          <div className="mt-4 md:items-start items-center flex flex-col">
            <p className="text-gray-700 font-medium">Account Created At</p>
            <p className="text-gray-600">
              {user?.createdAt
                ? new Date(user.createdAt).toLocaleString()
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditSubmit}>
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Username</Label>
                <Input
                  id="name"
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  placeholder="Enter your username"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="image">Profile Picture URL</Label>
                <Input
                  id="image"
                  value={editImage}
                  onChange={(e) => setEditImage(e.target.value)}
                  placeholder="Enter image URL"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditModalOpen(false)}
              >
                Cancel
              </Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
