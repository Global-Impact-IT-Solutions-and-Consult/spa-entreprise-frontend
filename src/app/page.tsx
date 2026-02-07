"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md text-center">
        <h1 className="mb-6 text-4xl font-bold text-gray-900">Welcome to ServiceHub</h1>
        <p className="mb-8 text-lg text-gray-600">
          Your tailored solution for managing your service business.
        </p>

        <div className="flex flex-col gap-4 sm:flex-row sm:justify-center">
          <Link href="/auth/login">
            <Button size="lg" className="w-full sm:w-auto bg-[#2D5B5E] hover:bg-[#254E50]">
              Log In
            </Button>
          </Link>
          <Link href="/auth/register">
            <Button size="lg" variant="outline" className="w-full sm:w-auto">
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
