"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export default function UnauthorizedPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent p-6 sm:p-10">
      <Card className="w-full max-w-md overflow-hidden border-destructive/30 bg-destructive/5">
        <CardHeader className="border-b border-destructive/20 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-7 w-7 text-destructive"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
              />
            </svg>
          </div>
          <CardTitle className="text-xl text-destructive">
            Unauthorized Access
          </CardTitle>
          <CardDescription className="mt-1 text-destructive/80">
            You don&apos;t have permission to access this queue. Please check
            your QR code or contact support if you believe this is an error.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="rounded-lg border border-destructive/25 bg-destructive/10 p-4 text-sm text-destructive/80">
            Tip: Make sure you scanned the right QR code for this location.
          </div>

          <div className="mt-5 flex justify-center">
            <Button onClick={() => router.push("/")} variant="destructive">
              Go Back
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
