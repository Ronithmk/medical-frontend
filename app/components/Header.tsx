"use client";

import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function Header() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  const user =
    typeof window !== "undefined"
      ? JSON.parse(localStorage.getItem("user") || "{}")
      : {};

  return (
    <div className="sticky top-0 z-50 bg-white shadow-md px-8 py-4 flex justify-between items-center">

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3">
        <Image
          src="/Protoncode.png"
          alt="ProtonCode"
          width={40}
          height={40}
        />
        <span className="text-xl font-bold text-green-700">
          ProtonCode Solutions
        </span>
      </Link>

      {/* Right Side */}
      <div className="relative">

        <button
          onClick={() => setOpen(!open)}
          className="bg-green-100 text-green-700 px-4 py-2 rounded-lg font-medium hover:bg-green-200 transition"
        >
          {user.company || "Account"}
        </button>

        {open && (
          <div className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-lg p-2">
            <button
              onClick={logout}
              className="w-full text-left px-4 py-2 hover:bg-red-100 rounded"
            >
              Logout
            </button>
          </div>
        )}

      </div>

    </div>
  );
}