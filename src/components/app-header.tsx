"use client";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { User, Settings, Moon, LogOut, Sun } from "lucide-react";
import { DropdownMenuLabel, DropdownMenuSeparator } from "./ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import LogoutModal from "@/features/auth/components/logout-modal";
import { useTheme } from "next-themes";

const AppHeader = () => {
  const { theme, setTheme } = useTheme();
  return (
    <header className="bg-white shadow-md py-4">
      <div className="container mx-auto px-4 pe-8 flex items-center justify-end">
        <DropdownMenu>
          <DropdownMenuTrigger className=" flex items-center gap-2 dark:text-black">
            <div className="rounded-full bg-gray-200 w-8 h-8 flex items-center justify-center">
              <User className="h-4 w-4" />
            </div>
            <span>Ali Sher Khan</span>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[200px] mt-2 mr-2">
            <DropdownMenuLabel>Account</DropdownMenuLabel>
            <DropdownMenuItem className="flex items-center gap-2">
              <User className="h-4 w-4" />
              <span>Profile</span>
            </DropdownMenuItem>

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
      </div>
    </header>
  );
};

export default AppHeader;
