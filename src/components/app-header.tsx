"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, Settings, Moon, LogOut, Sun, Loader } from "lucide-react";
import { DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LogoutModal from "@/features/auth/components/logout-modal";
import { useTheme } from "next-themes";
import { useUser } from "@/context/user.context";
import { SidebarTrigger } from "./ui/sidebar";
import Link from "next/link";
import { use } from "react";

const AppHeader = () => {
  const { theme, setTheme } = useTheme();
  const { user, loading } = useUser();
  return (
    <header className="bg-white shadow-md border-b py-4">
      <div className="container mx-auto px-4 pe-8 flex items-center">
        <div className=" justify-self-start md:hidden">
          <SidebarTrigger className="" />
        </div>
        {loading ? (
          <Loader color="black" className=" ms-auto" />
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger className=" flex items-center gap-2 dark:text-black ms-auto">
              <div className="rounded-full bg-gray-200 w-10 h-10 overflow-hidden flex items-center justify-center">
                {user?.image ? (
                  <img
                    src={user.image}
                    alt=""
                    className=" rounded-full h-10 w-10"
                  />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <span>{user?.name}</span>
            </DropdownMenuTrigger>

            <DropdownMenuContent className="w-[200px] mt-2 mr-2">
              <DropdownMenuLabel>Account</DropdownMenuLabel>
              <Link href="/chats/profile">
                <DropdownMenuItem className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
              </Link>

              <DropdownMenuSeparator />
              <DropdownMenuLabel>Preferences</DropdownMenuLabel>
              <DropdownMenuItem className="flex items-center gap-2">
                <Settings className="h-4 w-4" />
                <span>Settings</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="flex items-center gap-2"
                onClick={() => setTheme(theme === "light" ? "dark" : "light")}
              >
                {theme === "light" ? (
                  <>
                    <Moon className="h-4 w-4" />
                    <span>Dark Mode</span>
                  </>
                ) : (
                  <>
                    <Sun className="h-4 w-4" />
                    <span>Light Mode</span>
                  </>
                )}
              </DropdownMenuItem>

              <DropdownMenuSeparator />

              <AlertDialog>
                <AlertDialogTrigger className=" text-sm px-2.5 flex items-center gap-2 py-1">
                  <LogOut className=" h-4 w-4" />
                  Logout
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <LogoutModal />
                </AlertDialogContent>
              </AlertDialog>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>
    </header>
  );
};

export default AppHeader;
