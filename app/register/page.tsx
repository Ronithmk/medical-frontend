"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Register() {
  const router = useRouter();

  const [company, setCompany] = useState("ProtonCode Solutions");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");

  const handleRegister = async () => {
    setError("");

    if (!company || !email || !password || !confirm) {
      setError("All fields required");
      return;
    }

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters");
      return;
    }

    try {
      const res = await fetch("http://127.0.0.1:8000/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: company,   // backend expects name
          email,
          password,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.detail || "Registration failed");
        return;
      }

      // Keep your localStorage feature
      const user = { company, email };
      localStorage.setItem("user", JSON.stringify(user));

      router.push("/login");

    } catch (err) {
      setError("Server error. Make sure backend is running.");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-green-100 to-green-200 px-4">

      <div className="bg-white shadow-2xl rounded-2xl p-10 w-full max-w-md">

        <h2 className="text-3xl font-bold text-green-700 text-center mb-8">
          Create Your Store Account
        </h2>

        {error && (
          <div className="bg-red-100 text-red-600 p-3 rounded mb-4 text-sm">
            {error}
          </div>
        )}

        <div className="space-y-5">

          <input
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Company Name"
          />

          <input
            onChange={(e) => setEmail(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Email"
          />

          <input
            type="password"
            onChange={(e) => setPassword(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Password"
          />

          <input
            type="password"
            onChange={(e) => setConfirm(e.target.value)}
            className="w-full border p-3 rounded-lg focus:ring-2 focus:ring-green-500"
            placeholder="Confirm Password"
          />

          <button
            onClick={handleRegister}
            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition"
          >
            Register
          </button>

        </div>

        <p className="text-center text-sm text-gray-500 mt-6">
          Already registered?{" "}
          <Link href="/login" className="text-green-600 font-semibold">
            Login
          </Link>
        </p>

      </div>
    </div>
  );
}