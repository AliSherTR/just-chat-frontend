import Link from "next/link";
import React from "react";

export default function layout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      {/* Branding Column */}
      <div className="md:flex flex-col justify-between bg-primary p-6 text-primary-foreground hidden md:w-1/2 md:p-10">
        <div className=" hidden md:block">
          <Link href="/" className="inline-block">
            <h1>Just Chat</h1>
          </Link>
        </div>
        <div className="my-auto py-10">
          <h1 className="mb-6 text-3xl font-bold md:text-5xl">
            Welcome to our platform
          </h1>
          <p className="mb-6 text-lg md:text-xl">
            Streamline your workflow, collaborate with your team, and achieve
            more together.
          </p>
          <div className="mt-8 flex flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Secure authentication</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Real-time collaboration</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="rounded-full bg-primary-foreground/20 p-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="h-4 w-4"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
              </div>
              <span className="text-sm">Advanced analytics</span>
            </div>
          </div>
        </div>
        <div className="text-sm">
          <p>© {new Date().getFullYear()} Your Company. All rights reserved.</p>
        </div>
      </div>

      {/* Form Column */}
      <div className="flex flex-1 items-center justify-center p-6 md:w-1/2 md:p-10 bg-white text-black">
        <div className="w-full max-w-md">{children}</div>
      </div>
    </div>
  );
}
