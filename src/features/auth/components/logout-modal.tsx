"use client";
import React from "react";
import {
  AlertDialogCancel,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useAuth } from "../api/useAuth";
import { Button } from "@/components/ui/button";

export default function LogoutModal() {
  const { logout, logginOut } = useAuth();
  return (
    <>
      <AlertDialogHeader>
        <AlertDialogTitle className=" font-normal text-sm">
          Are you sure you want to logout?
        </AlertDialogTitle>
        <AlertDialogDescription></AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel>Cancel</AlertDialogCancel>
        <Button onClick={() => logout()}>
          {logginOut ? "Logging Out......." : "Logout"}
        </Button>
      </AlertDialogFooter>
    </>
  );
}
