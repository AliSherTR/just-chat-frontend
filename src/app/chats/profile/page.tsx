"use client";
import { useUser } from "@/context/user.context";
import { Mail, User } from "lucide-react";
import React from "react";

export default function ProfilePage() {
  const { user } = useUser();
  return (
    <div className=" w-full h-full  px-4 py-8">
      <div className=" mt-4 ">
        {user?.image ? (
          <img
            src={user.image}
            alt={user.name}
            className=" block mx-auto md:mx-0 w-[200px] h-[200px] rounded-full"
          />
        ) : (
          <div className="w-24 h-24 mx-auto md:mx-0 bg-gray-300 rounded-full flex items-center justify-center">
            <span className="text-2xl text-gray-500">B</span>
          </div>
        )}
        <div className=" grid w-[300px] md:w-full  md:grid-cols-2 grid-cols-1 mx-auto md:mx-0 gap-y-2.5 mt-4 text-base">
          <div className=" flex items-center md:justify-start justify-center gap-2 mt-4">
            <User />
            <h1 className="  capitalize "> {user?.name}</h1>
          </div>
          <div className=" flex items-center gap-2 mt-4 md:justify-start justify-center ">
            <Mail />
            <p className="text-gray-600">{user?.email}</p>
          </div>

          <div className="mt-4 md:items-start items-center flex flex-col ">
            <p className="text-gray-700 font-medium">Account Updated At</p>
            <p className="text-gray-600">
              {user?.updatedAt
                ? new Date(user.updatedAt).toLocaleString()
                : "Not provided"}
            </p>
          </div>
          <div className="mt-4 md:items-start items-center flex flex-col ">
            <p className="text-gray-700 font-medium">Account Created At</p>
            <p className="text-gray-600">
              {user?.updatedAt
                ? new Date(user.createdAt).toLocaleString()
                : "Not provided"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
