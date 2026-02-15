"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function Sidebar() {
  const [open, setOpen] = useState(false);
  const router = useRouter();

  const logout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <>
      {/* Mobile Top Bar */}
      <div className="md:hidden flex justify-between items-center bg-green-700 text-white px-4 py-3">
        <span className="text-lg font-bold">ProtonCode</span>
        <button
          onClick={() => setOpen(!open)}
          className="text-2xl"
        >
          ☰
        </button>
      </div>

      {/* Sidebar */}
      <div
        className={`
          fixed md:static top-0 left-0 h-full w-64 bg-green-700 text-white p-6
          transform transition-transform duration-300
          ${open ? "translate-x-0" : "-translate-x-full"}
          md:translate-x-0
        `}
      >
        <h1 className="text-2xl font-bold mb-10 hidden md:block">
          ProtonCode
        </h1>

        <nav className="space-y-4">

          <Link
            href="/dashboard"
            className="block hover:bg-green-600 p-3 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Dashboard
          </Link>

          <Link
            href="/inventory"
            className="block hover:bg-green-600 p-3 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Inventory
          </Link>

          <Link
            href="/sales"
            className="block hover:bg-green-600 p-3 rounded-lg"
            onClick={() => setOpen(false)}
          >
            Sales
          </Link>
  <Link
    href="/pos"
    className="block hover:bg-green-600 p-3 rounded-lg"
    onClick={() => setOpen(false)}
  >
    POS Billing
  </Link>
          <button
            onClick={logout}
            className="block text-left w-full hover:bg-red-600 p-3 rounded-lg"
          >
            
            Logout
          </button>

        </nav>
      </div>

      {/* Overlay (Mobile Only) */}
      {open && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 md:hidden"
          onClick={() => setOpen(false)}
        />
      )}
    </>
  );
}